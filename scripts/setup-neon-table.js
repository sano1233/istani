// Setup script for Neon database table
const { neon } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function setupTable() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`CREATE TABLE IF NOT EXISTS comments (comment TEXT)`;
    console.log('✅ Comments table created successfully!');

    // Verify the table exists
    const result = await sql`SELECT COUNT(*) FROM comments`;
    console.log(`📊 Current comments count: ${result[0].count}`);
  } catch (error) {
    console.error('❌ Error setting up table:', error);
    process.exit(1);
  }
}

setupTable();
