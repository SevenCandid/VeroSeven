const db = require('./db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

async function run() {
  console.log('Fetching applicants without a password...');
  try {
    const res = await db.query('SELECT * FROM applicants WHERE password_hash IS NULL');
    const applicants = res.rows;
    
    console.log(`Found ${applicants.length} applicants to invite.`);

    for (const applicant of applicants) {
      if (!applicant.email) continue;
      
      const tempPassword = Math.random().toString(36).slice(-8); // Generate 8 char password
      const hash = await bcrypt.hash(tempPassword, 10);
      
      await db.query('UPDATE applicants SET password_hash = $1 WHERE id = $2', [hash, applicant.id]);
      
      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: applicant.email,
        subject: 'Welcome to the VeroSeven Applicant Portal',
        text: `Hello ${applicant.full_name},\n\nWe have created a dedicated Applicant Portal for you to track your application status.\n\nYou can log in here: http://localhost:5173/login.html\n\nYour temporary credentials are:\nEmail: ${applicant.email}\nPassword: ${tempPassword}\n\nWe recommend you keep these safe. We will be adding a feature to change your password soon.\n\nBest,\nThe VeroSeven Team`
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`Sent invite to ${applicant.email}`);
    }
    
    console.log('Finished sending invites.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
