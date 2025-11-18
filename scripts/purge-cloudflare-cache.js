#!/usr/bin/env node

/**
 * Cloudflare Cache Purging Script
 * Usage:
 *   node scripts/purge-cloudflare-cache.js [--all] [--files file1,file2] [--verify]
 */

require('dotenv').config({ path: '.env.production' });

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

// Parse command line arguments
const args = process.argv.slice(2);
const purgeAll = args.includes('--all');
const verifyOnly = args.includes('--verify');
const filesIndex = args.indexOf('--files');
const specificFiles = filesIndex !== -1 ? args[filesIndex + 1]?.split(',') : null;

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Verify Cloudflare configuration
 */
function verifyConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const missing = [];
  if (!apiToken) missing.push('CLOUDFLARE_API_TOKEN');
  if (!zoneId) missing.push('CLOUDFLARE_ZONE_ID');
  if (!accountId) missing.push('CLOUDFLARE_ACCOUNT_ID');
  if (!siteUrl) missing.push('NEXT_PUBLIC_SITE_URL');

  if (missing.length > 0) {
    log(`❌ Missing environment variables: ${missing.join(', ')}`, 'red');
    log('\nPlease set these in your .env.production file or Vercel dashboard', 'yellow');
    process.exit(1);
  }

  return { apiToken, zoneId, accountId, siteUrl };
}

/**
 * Make a request to Cloudflare API
 */
async function cloudflareRequest(endpoint, options = {}) {
  const { apiToken } = verifyConfig();

  const response = await fetch(`${CLOUDFLARE_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!data.success) {
    const error = data.errors?.[0];
    throw new Error(`Cloudflare API Error (${error?.code}): ${error?.message}`);
  }

  return data.result;
}

/**
 * Verify API token
 */
async function verifyToken() {
  try {
    log('\n🔐 Verifying Cloudflare API token...', 'blue');
    const { accountId } = verifyConfig();

    const result = await cloudflareRequest(`/accounts/${accountId}/tokens/verify`);

    log(`✅ Token verified successfully!`, 'green');
    log(`   Token ID: ${result.id}`, 'blue');
    log(`   Status: ${result.status}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Token verification failed: ${error.message}`, 'red');
    log('\nPossible issues:', 'yellow');
    log('  1. Token is invalid or expired', 'yellow');
    log('  2. Token lacks required permissions', 'yellow');
    log('  3. Account ID is incorrect', 'yellow');
    log('\nRequired token permissions:', 'yellow');
    log('  - Zone:Cache Purge (Edit)', 'yellow');
    log('  - Zone:Zone (Read)', 'yellow');
    log('  - Zone:Zone Settings (Read)', 'yellow');
    return false;
  }
}

/**
 * Get zone details
 */
async function getZoneDetails() {
  try {
    const { zoneId } = verifyConfig();
    log('\n📊 Fetching zone details...', 'blue');

    const result = await cloudflareRequest(`/zones/${zoneId}`);

    log(`✅ Zone found!`, 'green');
    log(`   Domain: ${result.name}`, 'blue');
    log(`   Status: ${result.status}`, 'blue');
    log(`   Name Servers: ${result.name_servers.join(', ')}`, 'blue');
    return result;
  } catch (error) {
    log(`❌ Failed to fetch zone details: ${error.message}`, 'red');
    log('\nPlease verify your CLOUDFLARE_ZONE_ID is correct', 'yellow');
    return null;
  }
}

/**
 * Purge cache
 */
async function purgeCache() {
  try {
    const { zoneId, siteUrl } = verifyConfig();

    let body;
    let description;

    if (purgeAll) {
      body = { purge_everything: true };
      description = 'Purging ALL cached files';
    } else if (specificFiles) {
      body = { files: specificFiles };
      description = `Purging ${specificFiles.length} specific files`;
    } else {
      // Default: purge main pages
      const pagesToPurge = [
        `${siteUrl}`,
        `${siteUrl}/`,
        `${siteUrl}/login`,
        `${siteUrl}/register`,
        `${siteUrl}/dashboard`,
        `${siteUrl}/products`,
        `${siteUrl}/meal-plan`,
        `${siteUrl}/workout`,
        `${siteUrl}/progress`,
      ];

      body = { files: pagesToPurge };
      description = `Purging ${pagesToPurge.length} main pages`;
    }

    log(`\n🧹 ${description}...`, 'blue');

    const result = await cloudflareRequest(`/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    log(`✅ Cache purged successfully!`, 'green');
    if (result.id) {
      log(`   Purge ID: ${result.id}`, 'blue');
    }

    return true;
  } catch (error) {
    log(`❌ Failed to purge cache: ${error.message}`, 'red');
    log('\nPossible issues:', 'yellow');
    log('  1. Token lacks Cache Purge permissions', 'yellow');
    log('  2. Zone ID is incorrect', 'yellow');
    log('  3. File URLs are invalid', 'yellow');
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  log('╔════════════════════════════════════════════╗', 'blue');
  log('║   Cloudflare Cache Purging Tool           ║', 'blue');
  log('╚════════════════════════════════════════════╝', 'blue');

  // Step 1: Verify configuration
  log('\n📋 Step 1: Verifying configuration...', 'blue');
  const config = verifyConfig();
  log(`✅ Configuration loaded`, 'green');

  // Step 2: Verify token
  log('\n📋 Step 2: Verifying API token...', 'blue');
  const tokenValid = await verifyToken();
  if (!tokenValid) {
    process.exit(1);
  }

  // Step 3: Get zone details
  log('\n📋 Step 3: Fetching zone details...', 'blue');
  const zoneDetails = await getZoneDetails();
  if (!zoneDetails) {
    process.exit(1);
  }

  // If verify-only mode, stop here
  if (verifyOnly) {
    log('\n✅ Verification complete! All checks passed.', 'green');
    process.exit(0);
  }

  // Step 4: Purge cache
  log('\n📋 Step 4: Purging cache...', 'blue');
  const purgeSuccess = await purgeCache();

  if (purgeSuccess) {
    log('\n╔════════════════════════════════════════════╗', 'green');
    log('║   ✅ Cache Purge Complete!                ║', 'green');
    log('╚════════════════════════════════════════════╝', 'green');
    log('\n💡 Tip: Changes may take a few seconds to propagate globally', 'yellow');
  } else {
    log('\n❌ Cache purge failed. See errors above.', 'red');
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
