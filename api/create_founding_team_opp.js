const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Inserting Founding Team Opportunity...');
    
    const insertQuery = `
      INSERT INTO opportunities (
        title, 
        summary, 
        description, 
        type, 
        location, 
        location_type,
        status, 
        categories,
        skills,
        responsibilities,
        requirements,
        benefits,
        featured,
        show_on_website,
        form_fields
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING id;
    `;
    
    const values = [
      'Founding Team', // title
      'Join the VeroSeven Founding Team and help build authentic, impactful technology. This is a private application for the VeroSeven Digital Challenge.', // summary
      'VeroSeven is looking for passionate individuals to join our founding team. As a member of the founding team, you will be at the forefront of building our ecosystem, including Nexra, VeroSeven AI, Omnivote, Smart Queue, and Device Health AI. We are looking for individuals who are driven, innovative, and ready to make a significant impact.', // description
      JSON.stringify(['Founding Team', 'Open Source', 'Volunteer']), // type
      'Remote', // location
      'Remote', // location_type
      'active', // status
      JSON.stringify(['Founding Team', 'Digital Challenge']), // categories
      JSON.stringify(['Leadership', 'Software Engineering', 'Product Design', 'Strategy', 'Open Source']), // skills
      JSON.stringify([
        'Contribute to the core architecture and development of VeroSeven products.',
        'Collaborate closely with other founding members to shape product vision and strategy.',
        'Drive innovation and maintain high standards of code quality and design.'
      ]), // responsibilities
      JSON.stringify([
        'Strong passion for technology and building impactful solutions.',
        'Ability to work independently and collaboratively in a remote environment.',
        'Proven track record of relevant skills (technical or non-technical).'
      ]), // requirements
      JSON.stringify([
        'Be part of a visionary team building the future of technology.',
        'Flexible hours and remote work.',
        'Opportunity for significant impact and growth within the ecosystem.'
      ]), // benefits
      true, // featured
      true, // show_on_website
      JSON.stringify([
        {
          "name": "background",
          "label": "Brief Background",
          "type": "textarea",
          "required": true,
          "placeholder": "Tell us a little about yourself"
        }
      ]) // form_fields
    ];

    const res = await pool.query(insertQuery, values);
    console.log('Successfully inserted Founding Team Opportunity with ID:', res.rows[0].id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error inserting opportunity:', error);
    process.exit(1);
  }
}

run();
