const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Adding applicant_config column to opportunities table...');
    await pool.query(`
      ALTER TABLE opportunities 
      ADD COLUMN IF NOT EXISTS applicant_config JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('Successfully added applicant_config column.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

run();
