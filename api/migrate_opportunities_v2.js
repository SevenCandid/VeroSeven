const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('Adding new columns to opportunities table...');
    const alterQueries = [
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS summary VARCHAR(200)`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS category VARCHAR(100)`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS location_type VARCHAR(50) DEFAULT 'Remote'`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS duration VARCHAR(100)`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS weekly_commitment VARCHAR(50)`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS positions INTEGER`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS deadline DATE`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS start_date DATE`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS responsibilities JSONB DEFAULT '[]'::jsonb`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]'::jsonb`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS publish_immediately BOOLEAN DEFAULT false`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS accept_applications BOOLEAN DEFAULT true`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS show_on_website BOOLEAN DEFAULT true`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS featured_on_homepage BOOLEAN DEFAULT false`,
      `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
    ];

    for (const q of alterQueries) {
      await pool.query(q);
      console.log('OK:', q.substring(0, 70));
    }

    console.log('\nMigration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
