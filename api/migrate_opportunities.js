const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('Creating opportunities table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          requirements TEXT,
          type VARCHAR(50) DEFAULT 'Full-time',
          location VARCHAR(255) DEFAULT 'Remote',
          status VARCHAR(50) DEFAULT 'active',
          form_fields JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Altering applications table...');
    await pool.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}'::jsonb;
    `);
    
    // Also, we need to alter full_name and email to be nullable, because dynamic forms might use form_data instead
    // But since the Digital Challenge form required it, we can just leave it or relax the constraint.
    // Relaxing constraints:
    await pool.query(`
      ALTER TABLE applications ALTER COLUMN full_name DROP NOT NULL;
      ALTER TABLE applications ALTER COLUMN email DROP NOT NULL;
    `);

    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
