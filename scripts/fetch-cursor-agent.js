#!/usr/bin/env node

/**
 * Cursor Agent Data Fetcher
 * 
 * Fetches and processes Cursor agent data from the Cursor agents page.
 * 
 * Usage:
 *   node fetch-cursor-agent.js <agent-id>
 *   node fetch-cursor-agent.js bc-371b6b86-5cff-40fb-922b-af0f42218c24
 */

const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

const AGENT_ID = process.argv[2] || 'bc-371b6b86-5cff-40fb-922b-af0f42218c24';
const CURSOR_AGENTS_URL = `https://cursor.com/agents?selectedBcId=${AGENT_ID}`;

console.log(`🔍 Fetching Cursor Agent: ${AGENT_ID}`);
console.log(`📍 URL: ${CURSOR_AGENTS_URL}\n`);

/**
 * Fetch the page and extract agent data
 */
async function fetchAgentData() {
  try {
    // Check if puppeteer is available
    let usePuppeteer = false;
    try {
      require.resolve('puppeteer');
      usePuppeteer = true;
    } catch (e) {
      console.log('ℹ️  Puppeteer not installed. Using curl fallback...\n');
    }

    if (usePuppeteer) {
      return await fetchWithPuppeteer();
    } else {
      return await fetchWithCurl();
    }
  } catch (error) {
    console.error('❌ Error fetching agent data:', error.message);
    process.exit(1);
  }
}

/**
 * Fetch using Puppeteer (headless browser)
 */
async function fetchWithPuppeteer() {
  const puppeteer = require('puppeteer');
  
  console.log('🌐 Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('📄 Loading page...');
  await page.goto(CURSOR_AGENTS_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('🔎 Extracting agent data...');
  
  // Extract all useful data from the page
  const agentData = await page.evaluate(() => {
    const data = {
      title: document.title,
      url: window.location.href,
      metadata: {},
      content: []
    };
    
    // Extract meta tags
    document.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        data.metadata[name] = content;
      }
    });
    
    // Extract visible text content
    const mainContent = document.body.innerText;
    data.content.push(mainContent);
    
    // Try to find agent-specific data
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent);
    const agentDataScript = scripts.find(s => s.includes('bc-') || s.includes('agent'));
    if (agentDataScript) {
      data.scriptData = agentDataScript;
    }
    
    return data;
  });
  
  await browser.close();
  return agentData;
}

/**
 * Fetch using curl (fallback method)
 */
async function fetchWithCurl() {
  console.log('📡 Fetching with curl...');
  
  const { stdout } = await execPromise(
    `curl -s "${CURSOR_AGENTS_URL}" -H "User-Agent: Mozilla/5.0" -H "Accept: text/html"`
  );
  
  // Parse basic info from HTML
  const titleMatch = stdout.match(/<title>(.*?)<\/title>/);
  const descMatch = stdout.match(/<meta name="description" content="(.*?)"/);
  
  return {
    title: titleMatch ? titleMatch[1] : 'Unknown',
    description: descMatch ? descMatch[1] : 'No description',
    url: CURSOR_AGENTS_URL,
    agentId: AGENT_ID,
    html: stdout.substring(0, 5000), // First 5000 chars
    note: 'Limited data - install puppeteer for full extraction (npm install puppeteer)'
  };
}

/**
 * Process and display agent data
 */
function displayAgentData(data) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 CURSOR AGENT DATA');
  console.log('='.repeat(60) + '\n');
  
  console.log('🆔 Agent ID:', AGENT_ID);
  console.log('📌 URL:', CURSOR_AGENTS_URL);
  console.log('📄 Title:', data.title || 'N/A');
  
  if (data.metadata) {
    console.log('\n📋 Metadata:');
    Object.entries(data.metadata).forEach(([key, value]) => {
      if (key.includes('description') || key.includes('title') || key.includes('image')) {
        console.log(`  ${key}: ${value}`);
      }
    });
  }
  
  if (data.description) {
    console.log('\n📝 Description:', data.description);
  }
  
  if (data.note) {
    console.log('\n⚠️  Note:', data.note);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Save to file
  const fs = require('fs');
  const outputPath = `/workspace/data/cursor-agent-${AGENT_ID}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`💾 Data saved to: ${outputPath}\n`);
  
  return data;
}

/**
 * Main execution
 */
async function main() {
  const data = await fetchAgentData();
  displayAgentData(data);
  
  console.log('✅ Agent data fetched successfully!\n');
  console.log('💡 Next steps:');
  console.log('   - Review the saved JSON file');
  console.log('   - Install puppeteer for better data extraction: npm install puppeteer');
  console.log('   - Integrate with your AI agent system\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { fetchAgentData, displayAgentData };
