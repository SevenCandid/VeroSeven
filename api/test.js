require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()').then(r => {
  console.log('Database connected successfully:', r.rows[0]);
  pool.end();
}).catch(err => {
  console.error('Database connection error:', err);
  pool.end();
});