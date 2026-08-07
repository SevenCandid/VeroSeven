const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Adding areas_of_contribution column to opportunities...');
    await pool.query(`
      ALTER TABLE opportunities 
      ADD COLUMN IF NOT EXISTS areas_of_contribution JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('Successfully added areas_of_contribution column!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  }
}

run();
