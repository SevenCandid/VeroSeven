const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Adding docs_url to projects...');
    await client.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS docs_url TEXT;
    `);

    console.log('Dropping team_members from projects...');
    await client.query(`
      ALTER TABLE projects 
      DROP COLUMN IF EXISTS team_members;
    `);

    console.log('Creating team_members table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        email VARCHAR(255),
        project_group VARCHAR(255) DEFAULT 'VeroSeven Core',
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Optionally update NEXRA if it exists to have these urls
    console.log('Attempting to update NEXRA urls...');
    await client.query(`
      UPDATE projects
      SET admin_url = 'https://nexrasms.netlify.app/app/admin.html#/',
          docs_url = 'https://nexra-api.onrender.com/docs#/',
          website_url = 'https://nexrasms.netlify.app/'
      WHERE name ILIKE '%nexra%';
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
