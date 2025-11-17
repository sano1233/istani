#!/usr/bin/env node

/**
 * Authenticated Cursor Agent Data Fetcher
 * 
 * Fetches Cursor agent data with authentication support.
 * 
 * Usage:
 *   # With environment variable
 *   export CURSOR_AUTH_TOKEN="your-token"
 *   node fetch-cursor-agent-authenticated.js bc-371b6b86-5cff-40fb-922b-af0f42218c24
 * 
 *   # With command line argument
 *   node fetch-cursor-agent-authenticated.js bc-371b6b86-5cff-40fb-922b-af0f42218c24 --token="your-token"
 * 
 *   # With cookies (extracted from browser)
 *   node fetch-cursor-agent-authenticated.js bc-371b6b86-5cff-40fb-922b-af0f42218c24 --cookies="cookie-string"
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const AGENT_ID = process.argv[2] || 'bc-371b6b86-5cff-40fb-922b-af0f42218c24';
const AUTH_TOKEN = process.env.CURSOR_AUTH_TOKEN || getArgValue('--token');
const COOKIES = process.env.CURSOR_COOKIES || getArgValue('--cookies');
const CURSOR_AGENTS_URL = `https://cursor.com/agents?selectedBcId=${AGENT_ID}`;

function getArgValue(arg) {
  const found = process.argv.find(a => a.startsWith(arg));
  return found ? found.split('=')[1] : null;
}

console.log(`🔍 Authenticated Cursor Agent Fetcher`);
console.log(`📋 Agent ID: ${AGENT_ID}`);
console.log(`🔐 Auth Token: ${AUTH_TOKEN ? '✓ Provided' : '✗ Not provided'}`);
console.log(`🍪 Cookies: ${COOKIES ? '✓ Provided' : '✗ Not provided'}`);
console.log(`📍 URL: ${CURSOR_AGENTS_URL}\n`);

/**
 * Fetch agent data with authentication
 */
async function fetchAuthenticatedAgentData() {
  let usePuppeteer = false;
  
  try {
    require.resolve('puppeteer');
    usePuppeteer = true;
  } catch (e) {
    console.log('⚠️  Puppeteer not installed. Please install: npm install puppeteer\n');
    return null;
  }

  if (!usePuppeteer) {
    console.error('❌ Puppeteer is required for authenticated access');
    process.exit(1);
  }

  const puppeteer = require('puppeteer');
  
  console.log('🌐 Launching authenticated browser session...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set authentication if provided
    if (AUTH_TOKEN) {
      console.log('🔑 Setting authentication token...');
      await page.setExtraHTTPHeaders({
        'Authorization': `Bearer ${AUTH_TOKEN}`
      });
    }
    
    // Set cookies if provided
    if (COOKIES) {
      console.log('🍪 Setting cookies...');
      const cookies = parseCookies(COOKIES);
      await page.setCookie(...cookies);
    }
    
    console.log('📄 Loading agent page...');
    await page.goto(CURSOR_AGENTS_URL, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take a screenshot for debugging
    const screenshotPath = `/workspace/data/cursor-agent-${AGENT_ID}-screenshot.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    console.log('🔎 Extracting agent data...');
    
    // Extract comprehensive data
    const agentData = await page.evaluate(() => {
      const data = {
        title: document.title,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        authenticated: !document.body.innerText.includes('Sign in'),
        metadata: {},
        content: {},
        rawText: document.body.innerText.substring(0, 10000)
      };
      
      // Extract meta tags
      document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          data.metadata[name] = content;
        }
      });
      
      // Look for agent-specific data in the DOM
      const agentElements = document.querySelectorAll('[data-agent], [data-testid*="agent"], .agent-');
      data.content.agentElements = Array.from(agentElements).map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.innerText?.substring(0, 200)
      }));
      
      // Try to find React/Next.js data
      const scripts = Array.from(document.querySelectorAll('script'))
        .map(s => s.textContent)
        .filter(s => s && (s.includes('__NEXT_DATA__') || s.includes('agent') || s.includes('bc-')));
      
      if (scripts.length > 0) {
        data.content.relevantScripts = scripts.map(s => s.substring(0, 1000));
      }
      
      return data;
    });
    
    await browser.close();
    return agentData;
    
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * Parse cookie string into Puppeteer cookie format
 */
function parseCookies(cookieString) {
  return cookieString.split(';').map(cookie => {
    const [name, value] = cookie.trim().split('=');
    return {
      name: name.trim(),
      value: value ? value.trim() : '',
      domain: '.cursor.com',
      path: '/',
      httpOnly: false,
      secure: true
    };
  });
}

/**
 * Display and save agent data
 */
function displayAgentData(data) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 AUTHENTICATED CURSOR AGENT DATA');
  console.log('='.repeat(70) + '\n');
  
  console.log('🆔 Agent ID:', AGENT_ID);
  console.log('📌 URL:', data.url);
  console.log('📄 Title:', data.title);
  console.log('🔐 Authenticated:', data.authenticated ? '✅ YES' : '❌ NO (redirected to sign-in)');
  console.log('🕐 Timestamp:', data.timestamp);
  
  if (data.metadata && Object.keys(data.metadata).length > 0) {
    console.log('\n📋 Metadata:');
    Object.entries(data.metadata).slice(0, 5).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.substring(0, 80)}${value.length > 80 ? '...' : ''}`);
    });
  }
  
  if (!data.authenticated) {
    console.log('\n⚠️  Authentication Required!');
    console.log('\n📝 How to authenticate:');
    console.log('   1. Sign in to Cursor in your browser');
    console.log('   2. Open browser DevTools (F12)');
    console.log('   3. Go to Application > Cookies > cursor.com');
    console.log('   4. Copy the cookie values');
    console.log('   5. Run: export CURSOR_COOKIES="your-cookies-here"');
    console.log('   6. Re-run this script\n');
  } else {
    console.log('\n✅ Successfully authenticated and fetched agent data!');
    
    if (data.content.agentElements && data.content.agentElements.length > 0) {
      console.log(`\n🎯 Found ${data.content.agentElements.length} agent-related elements`);
    }
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Save to file
  const outputPath = `/workspace/data/cursor-agent-${AGENT_ID}-authenticated.json`;
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`💾 Data saved to: ${outputPath}\n`);
  
  return data;
}

/**
 * Main execution
 */
async function main() {
  if (!AUTH_TOKEN && !COOKIES) {
    console.log('⚠️  WARNING: No authentication provided!');
    console.log('   The page may redirect to sign-in.');
    console.log('   Provide auth token or cookies for best results.\n');
    console.log('   Usage examples:');
    console.log('     export CURSOR_AUTH_TOKEN="your-token"');
    console.log('     export CURSOR_COOKIES="your-cookies"');
    console.log('     node fetch-cursor-agent-authenticated.js <agent-id>\n');
    
    // Give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  try {
    const data = await fetchAuthenticatedAgentData();
    
    if (!data) {
      console.error('❌ Failed to fetch agent data');
      process.exit(1);
    }
    
    displayAgentData(data);
    
    if (data.authenticated) {
      console.log('🎉 Success! Agent data retrieved with authentication.\n');
    } else {
      console.log('⚠️  Authentication failed or was not provided.\n');
      console.log('   See the authentication guide above for instructions.\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { fetchAuthenticatedAgentData, displayAgentData };
