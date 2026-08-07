const { Pool } = require('pg');
require('dotenv').config();

const isSsl = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('render.com') || process.env.DATABASE_URL.includes('sslmode=require'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSsl ? { rejectUnauthorized: false } : false
});

async function migrate() {
  try {
    console.log('Adding categories JSONB column to opportunities table...');
    
    // 1. Add categories column if it doesn't exist
    await pool.query(`
      ALTER TABLE opportunities 
      ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb
    `);
    console.log('OK: Added categories column');

    // 2. Populate categories from existing category column if categories is empty
    await pool.query(`
      UPDATE opportunities
      SET categories = jsonb_build_array(category)
      WHERE (categories IS NULL OR categories = '[]'::jsonb)
        AND category IS NOT NULL
        AND category != ''
    `);
    console.log('OK: Populated existing categories from category column');

    console.log('\nMigration for multi-categories successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
