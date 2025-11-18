/**
 * SEO Optimization
 * Meta tags, structured data, and social media optimization
 */

import type { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export class SEO {
  private static readonly BASE_URL = 'https://istani.org';
  private static readonly BRAND_NAME = 'ISTANI';
  private static readonly DEFAULT_IMAGE = '/og-image.jpg';

  /**
   * Generate metadata for Next.js pages
   */
  static generateMetadata(config: SEOConfig): Metadata {
    const {
      title,
      description,
      keywords = [],
      canonical,
      ogImage = this.DEFAULT_IMAGE,
      type = 'website',
      author,
      publishedTime,
      modifiedTime,
    } = config;

    const fullTitle = title.includes(this.BRAND_NAME) ? title : `${title} | ${this.BRAND_NAME}`;
    const url = canonical || this.BASE_URL;

    return {
      title: fullTitle,
      description,
      keywords: keywords.join(', '),
      authors: author ? [{ name: author }] : undefined,
      openGraph: {
        title: fullTitle,
        description,
        url,
        siteName: this.BRAND_NAME,
        images: [
          {
            url: ogImage.startsWith('http') ? ogImage : `${this.BASE_URL}${ogImage}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        type: type === 'product' ? 'website' : type,
        publishedTime,
        modifiedTime,
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description,
        images: [ogImage.startsWith('http') ? ogImage : `${this.BASE_URL}${ogImage}`],
        creator: '@istanifit',
        site: '@istanifit',
      },
      alternates: {
        canonical: url,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  /**
   * Generate structured data (JSON-LD)
   */
  static generateStructuredData(type: string, data: any): string {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    };

    return JSON.stringify(structuredData);
  }

  /**
   * Organization structured data
   */
  static getOrganizationSchema(): string {
    return this.generateStructuredData('Organization', {
      name: this.BRAND_NAME,
      url: this.BASE_URL,
      logo: `${this.BASE_URL}/logo.png`,
      sameAs: [
        'https://twitter.com/istanifit',
        'https://facebook.com/istanifit',
        'https://instagram.com/istanifit',
        'https://linkedin.com/company/istani',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
        email: 'support@istani.org',
      },
    });
  }

  /**
   * Product structured data
   */
  static getProductSchema(product: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    availability: string;
    rating?: number;
    reviewCount?: number;
  }): string {
    return this.generateStructuredData('Product', {
      name: product.name,
      description: product.description,
      image: product.image.startsWith('http') ? product.image : `${this.BASE_URL}${product.image}`,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: `https://schema.org/${product.availability}`,
        url: this.BASE_URL,
      },
      aggregateRating: product.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount || 0,
          }
        : undefined,
    });
  }

  /**
   * Article structured data
   */
  static getArticleSchema(article: {
    headline: string;
    description: string;
    image: string;
    author: string;
    datePublished: string;
    dateModified?: string;
  }): string {
    return this.generateStructuredData('Article', {
      headline: article.headline,
      description: article.description,
      image: article.image.startsWith('http') ? article.image : `${this.BASE_URL}${article.image}`,
      author: {
        '@type': 'Person',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: this.BRAND_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${this.BASE_URL}/logo.png`,
        },
      },
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
    });
  }

  /**
   * Breadcrumb structured data
   */
  static getBreadcrumbSchema(items: Array<{ name: string; url: string }>): string {
    return this.generateStructuredData('BreadcrumbList', {
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${this.BASE_URL}${item.url}`,
      })),
    });
  }

  /**
   * FAQ structured data
   */
  static getFAQSchema(faqs: Array<{ question: string; answer: string }>): string {
    return this.generateStructuredData('FAQPage', {
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  /**
   * Website search action
   */
  static getWebsiteSchema(): string {
    return this.generateStructuredData('WebSite', {
      name: this.BRAND_NAME,
      url: this.BASE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.BASE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    });
  }

  /**
   * Generate sitemap XML
   */
  static generateSitemap(
    urls: Array<{
      loc: string;
      lastmod?: string;
      changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
      priority?: number;
    }>
  ): string {
    const urlEntries = urls
      .map(
        (url) => `
      <url>
        <loc>${url.loc.startsWith('http') ? url.loc : `${this.BASE_URL}${url.loc}`}</loc>
        ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
        ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
        ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
      </url>
    `
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urlEntries}
    </urlset>`;
  }

  /**
   * Generate robots.txt
   */
  static generateRobotsTxt(options?: {
    disallow?: string[];
    allow?: string[];
    crawlDelay?: number;
  }): string {
    const { disallow = ['/admin', '/api'], allow = [], crawlDelay } = options || {};

    return `User-agent: *
${disallow.map((path) => `Disallow: ${path}`).join('\n')}
${allow.map((path) => `Allow: ${path}`).join('\n')}
${crawlDelay ? `Crawl-delay: ${crawlDelay}` : ''}

Sitemap: ${this.BASE_URL}/sitemap.xml`;
  }
}

export default SEO;
