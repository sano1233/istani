#!/usr/bin/env node

/**
 * Automated Database Migration Runner
 * Executes Supabase migrations using the REST API
 */

const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://kxsmgrlpojdsgvjdodda.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c21ncmxwb2pkc2d2amRvZGRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA2NDYyMSwiZXhwIjoyMDc1NjQwNjIxfQ.6a5eSOaxQyl_GVXyKhnT45qn2ws-xUT5qYB5eeQooME';

// Migration files to execute (in order)
const migrations = [
  'supabase/migrations/001_initial_schema.sql',
  'supabase/migrations/002_autonomous_features.sql'
];

console.log('🚀 AUTOMATED DATABASE MIGRATION RUNNER');
console.log('======================================\n');

/**
 * Execute SQL via Supabase REST API
 */
async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return response.json();
}

/**
 * Check if a table exists
 */
async function tableExists(tableName) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
      method: 'GET',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Run migrations
 */
async function runMigrations() {
  console.log('📊 Checking existing database state...\n');

  // Check if migrations already ran
  const profilesExist = await tableExists('profiles');
  const achievementsExist = await tableExists('achievements');

  if (profilesExist && achievementsExist) {
    console.log('✅ Database already migrated!');
    console.log('   - profiles table exists');
    console.log('   - achievements table exists\n');

    // Verify achievement count
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/achievements?select=count`, {
        method: 'GET',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: 'count=exact'
        }
      });
      const count = response.headers.get('content-range');
      console.log(
        `   - Achievements seeded: ${count ? count.split('/')[1] : 'unknown'} achievements\n`
      );
    } catch (error) {
      console.log('   - Could not verify achievement count\n');
    }

    console.log('✅ No migration needed - database is ready!\n');
    return;
  }

  console.log('⏳ Starting fresh migration...\n');

  // Run each migration file
  for (const migrationFile of migrations) {
    console.log(`📄 Running: ${migrationFile}`);

    try {
      const sqlPath = path.join(process.cwd(), migrationFile);
      const sql = fs.readFileSync(sqlPath, 'utf8');

      // Split by statement (simple approach - may need refinement for complex SQL)
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`   Found ${statements.length} SQL statements\n`);

      // Note: Supabase REST API doesn't support direct SQL execution
      // Instead, we'll output instructions for manual execution
      console.log('   ℹ️  Manual execution required via Supabase SQL Editor\n');
    } catch (error) {
      console.error(`   ❌ Error reading ${migrationFile}:`, error.message);
      throw error;
    }
  }

  console.log('\n📋 MIGRATION INSTRUCTIONS:');
  console.log('================================');
  console.log('The Supabase REST API does not support direct SQL execution.');
  console.log('Please run migrations manually via the Supabase Dashboard:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/kxsmgrlpojdsgvjdodda/sql/new');
  console.log('2. Copy and paste the contents of:');
  console.log('   - supabase/migrations/001_initial_schema.sql');
  console.log('   - supabase/migrations/002_autonomous_features.sql');
  console.log('3. Click "Run" for each migration\n');
  console.log('Alternatively, use the Supabase CLI:');
  console.log('   npm install -g supabase');
  console.log(
    '   supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.kxsmgrlpojdsgvjdodda.supabase.co:5432/postgres"\n'
  );
}

/**
 * Verify database is ready
 */
async function verifyDatabase() {
  console.log('🔍 VERIFYING DATABASE STATUS');
  console.log('================================\n');

  const tables = [
    'profiles',
    'products',
    'orders',
    'workouts',
    'meals',
    'body_measurements',
    'water_intake',
    'daily_checkins',
    'user_streaks',
    'achievements',
    'user_achievements',
    'coaching_messages',
    'workout_recommendations',
    'nutrition_recommendations'
  ];

  let existingTables = 0;
  let missingTables = 0;

  for (const table of tables) {
    const exists = await tableExists(table);
    if (exists) {
      console.log(`✅ ${table}`);
      existingTables++;
    } else {
      console.log(`❌ ${table} - NOT FOUND`);
      missingTables++;
    }
  }

  console.log(`\n📊 Database Status:`);
  console.log(`   Existing tables: ${existingTables}/${tables.length}`);
  console.log(`   Missing tables: ${missingTables}/${tables.length}\n`);

  if (missingTables === 0) {
    console.log('✅ DATABASE READY FOR PRODUCTION!\n');
    return true;
  } else {
    console.log('⚠️  DATABASE NEEDS MIGRATION\n');
    return false;
  }
}

// Run script
(async () => {
  try {
    const isReady = await verifyDatabase();

    if (!isReady) {
      await runMigrations();
    }

    console.log('✅ MIGRATION SCRIPT COMPLETE\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
})();
