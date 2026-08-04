const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

async function seedAdmin() {
  try {
    const email = 'frankbediako38@gmail.com';
    const password = '5381@SEvEN';

    // Check if user already exists
    const checkUser = await db.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      console.log(`Admin user ${email} already exists.`);
      process.exit(0);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await db.query(
      'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)',
      [email, passwordHash]
    );

    console.log(`Successfully created admin user: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Please change this password after your first login if needed.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
