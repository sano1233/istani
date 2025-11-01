import 'server-only';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

interface PubMedSearchResult {
  count: number;
  ids: string[];
}

interface PubMedArticle {
  uid: string;
  title: string;
  authors: string[];
  journal: string;
  pubdate: string;
  abstract?: string;
}

/**
 * PubMed E-utilities API for research search
 * Rate limits: 3 req/sec without API key, 10 req/sec with key
 */
class PubMedClient {
  private lastRequestTime: number = 0;
  private requestsPerSecond: number;

  constructor() {
    this.requestsPerSecond = process.env.NCBI_API_KEY ? 10 : 3;
  }

  /**
   * Rate limiting wrapper
   */
  private async rateLimit(): Promise<void> {
    const minInterval = 1000 / this.requestsPerSecond;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < minInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, minInterval - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Build URL with common parameters
   */
  private buildUrl(endpoint: string, params: Record<string, string>): string {
    const url = new URL(`${BASE_URL}/${endpoint}`);

    // Add common parameters
    if (process.env.NCBI_API_KEY) {
      url.searchParams.append('api_key', process.env.NCBI_API_KEY);
    }
    url.searchParams.append('tool', process.env.NCBI_TOOL || 'istani-platform');
    url.searchParams.append(
      'email',
      process.env.NCBI_EMAIL || 'research@istani.org'
    );

    // Add custom parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  }

  /**
   * Search PubMed for articles
   */
  async search(
    searchTerm: string,
    maxResults: number = 20
  ): Promise<PubMedSearchResult> {
    await this.rateLimit();

    const url = this.buildUrl('esearch.fcgi', {
      db: 'pubmed',
      term: searchTerm,
      retmax: maxResults.toString(),
      retmode: 'json',
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PubMed search failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      count: parseInt(data.esearchresult.count),
      ids: data.esearchresult.idlist,
    };
  }

  /**
   * Fetch article summaries by IDs
   */
  async fetchSummaries(ids: string[]): Promise<PubMedArticle[]> {
    if (ids.length === 0) return [];

    await this.rateLimit();

    const url = this.buildUrl('esummary.fcgi', {
      db: 'pubmed',
      id: ids.join(','),
      retmode: 'json',
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PubMed fetch summaries failed: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.result;

    return ids
      .filter((id) => result[id])
      .map((id) => {
        const article = result[id];
        return {
          uid: id,
          title: article.title || 'No title',
          authors: article.authors?.map((a: any) => a.name) || [],
          journal: article.fulljournalname || article.source || 'Unknown',
          pubdate: article.pubdate || 'Unknown date',
        };
      });
  }

  /**
   * Fetch full article details including abstract
   */
  async fetchDetails(ids: string[]): Promise<PubMedArticle[]> {
    if (ids.length === 0) return [];

    await this.rateLimit();

    const url = this.buildUrl('efetch.fcgi', {
      db: 'pubmed',
      id: ids.join(','),
      retmode: 'xml',
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PubMed fetch details failed: ${response.statusText}`);
    }

    const xmlText = await response.text();
    return this.parseXML(xmlText);
  }

  /**
   * Simple XML parser for PubMed data
   */
  private parseXML(xml: string): PubMedArticle[] {
    const articles: PubMedArticle[] = [];

    // Very basic XML parsing - in production, use a proper XML parser
    const articleRegex = /<PubmedArticle>(.*?)<\/PubmedArticle>/gs;
    const matches = xml.matchAll(articleRegex);

    for (const match of matches) {
      const articleXml = match[1];

      const getTag = (tag: string): string => {
        const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's');
        const match = articleXml.match(regex);
        return match ? match[1].replace(/<[^>]*>/g, '') : '';
      };

      articles.push({
        uid: getTag('PMID'),
        title: getTag('ArticleTitle'),
        authors: [], // Simplified
        journal: getTag('Title'),
        pubdate: getTag('PubDate'),
        abstract: getTag('AbstractText'),
      });
    }

    return articles;
  }

  /**
   * Search and fetch articles in one call
   */
  async searchAndFetch(
    searchTerm: string,
    maxResults: number = 20
  ): Promise<PubMedArticle[]> {
    const searchResult = await this.search(searchTerm, maxResults);
    return this.fetchSummaries(searchResult.ids);
  }

  /**
   * Get related articles
   */
  async getRelated(pmid: string, maxResults: number = 10): Promise<string[]> {
    await this.rateLimit();

    const url = this.buildUrl('elink.fcgi', {
      dbfrom: 'pubmed',
      db: 'pubmed',
      id: pmid,
      retmode: 'json',
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PubMed get related failed: ${response.statusText}`);
    }

    const data = await response.json();
    const linksets = data.linksets?.[0]?.linksetdbs || [];
    const relatedIds = linksets.find((ls: any) => ls.linkname === 'pubmed_pubmed')
      ?.links || [];

    return relatedIds.slice(0, maxResults);
  }
}

// Export singleton
export const pubmed = new PubMedClient();
