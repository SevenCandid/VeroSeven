const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auto-migration on startup: ensure categories, status, status_history, etc. exist
(async () => {
  const migrations = [
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS show_on_website BOOLEAN DEFAULT true`,
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft'`,
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`,
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS responsibilities JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS form_fields JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS whatsapp_group_link TEXT`,
    `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS whatsapp_channel_link TEXT`,
    `UPDATE opportunities
     SET categories = jsonb_build_array(category)
     WHERE (categories IS NULL OR categories = '[]'::jsonb)
       AND category IS NOT NULL
       AND category != ''`,
    `CREATE TABLE IF NOT EXISTS applicants (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      phone_number VARCHAR(100),
      location VARCHAR(255),
      occupation VARCHAR(255),
      portfolio_url TEXT,
      resume_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_id INT`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'submitted'`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS internal_notes TEXT DEFAULT ''`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS portfolio_url TEXT`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_url TEXT`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS experience_level VARCHAR(100)`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS availability VARCHAR(100)`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS education VARCHAR(255)`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS "current_role" VARCHAR(255)`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS institution VARCHAR(255)`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}'::jsonb`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `CREATE TABLE IF NOT EXISTS application_responses (
      id SERIAL PRIMARY KEY,
      application_id VARCHAR(255),
      field_name VARCHAR(255),
      field_label VARCHAR(255),
      field_type VARCHAR(100),
      field_value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS application_files (
      id SERIAL PRIMARY KEY,
      application_id VARCHAR(255),
      file_name VARCHAR(255),
      file_url TEXT,
      file_size INT,
      file_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(255),
      details JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`,
    `UPDATE applications 
     SET status = 'submitted' 
     WHERE status IS NULL OR status = '' OR status = 'pending'`,
    `UPDATE applications
     SET status_history = jsonb_build_array(
       jsonb_build_object(
         'status', COALESCE(status, 'submitted'),
         'timestamp', COALESCE(created_at, CURRENT_TIMESTAMP),
         'note', 'Application received'
       )
     )
     WHERE status_history IS NULL OR status_history = '[]'::jsonb`,
    `CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE team_members ADD COLUMN IF NOT EXISTS team_id INT`
  ];

  for (const sql of migrations) {
    try {
      await db.query(sql);
    } catch (err) {
      console.log('Database auto-migration step notice:', err.message);
    }
  }
  console.log('Database auto-migrations processed.');
})();

// Activity Logger Helper
const logActivity = async (action, entity_type, entity_id = null, details = {}) => {
  try {
    await db.query(
      'INSERT INTO activity_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)',
      [action, entity_type, entity_id, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// API Route for submitting a public / private opportunity application
app.post('/api/applications', async (req, res) => {
  try {
    const {
      full_name,
      phone_number,
      email,
      location,
      occupation,
      background,
      skills,
      areas_of_contribution,
      availability,
      experience_level,
      education,
      current_role,
      institution,
      portfolio_url,
      resume_url,
      motivation,
      opportunity_id,
      form_data,
      uploaded_files
    } = req.body;

    const applicantName = (full_name || form_data?.name || form_data?.full_name || 'Applicant').trim();
    const applicantEmail = (email || form_data?.email || '').trim().toLowerCase();
    const applicantPhone = (phone_number || form_data?.phone || form_data?.phone_number || '').trim();
    const applicantLocation = (location || form_data?.location || '').trim();
    const applicantOccupation = (occupation || current_role || form_data?.occupation || form_data?.role || '').trim();
    const applicantPortfolio = (portfolio_url || form_data?.portfolio || form_data?.portfolio_url || form_data?.github || form_data?.linkedin || '').trim();
    const applicantResume = (resume_url || form_data?.resume || form_data?.resume_url || form_data?.cv || '').trim();

    // Upsert or register applicant profile
    let applicantId = null;
    if (applicantEmail) {
      try {
        const applicantRes = await db.query(
          `INSERT INTO applicants (full_name, email, phone_number, location, occupation, portfolio_url, resume_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (email) DO UPDATE 
           SET full_name = EXCLUDED.full_name,
               phone_number = COALESCE(NULLIF(EXCLUDED.phone_number, ''), applicants.phone_number),
               location = COALESCE(NULLIF(EXCLUDED.location, ''), applicants.location),
               occupation = COALESCE(NULLIF(EXCLUDED.occupation, ''), applicants.occupation),
               portfolio_url = COALESCE(NULLIF(EXCLUDED.portfolio_url, ''), applicants.portfolio_url),
               resume_url = COALESCE(NULLIF(EXCLUDED.resume_url, ''), applicants.resume_url)
           RETURNING id`,
          [applicantName, applicantEmail, applicantPhone, applicantLocation, applicantOccupation, applicantPortfolio, applicantResume]
        );
        if (applicantRes.rows.length > 0) {
          applicantId = applicantRes.rows[0].id;
        }
      } catch (appErr) {
        console.warn('Applicant profile sync notice:', appErr.message);
      }
    }

    const initialHistory = [
      {
        status: 'submitted',
        timestamp: new Date().toISOString(),
        note: 'Application submitted successfully by candidate.'
      }
    ];

    const insertQuery = `
      INSERT INTO applications (
        full_name, phone_number, email, location, occupation, 
        background, skills, areas_of_contribution, availability, experience_level,
        education, "current_role", institution,
        portfolio_url, resume_url, motivation,
        opportunity_id, applicant_id, form_data, status, status_history
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'submitted', $20)
      RETURNING *;
    `;
    
    const values = [
      applicantName,
      applicantPhone,
      applicantEmail,
      applicantLocation,
      applicantOccupation,
      background || form_data?.background || form_data?.experience || '',
      skills || form_data?.skills || '',
      areas_of_contribution || form_data?.areas_of_contribution || form_data?.interests || '',
      availability || form_data?.availability || '',
      experience_level || form_data?.experience_level || form_data?.experience || '',
      education || form_data?.education || '',
      current_role || form_data?.current_role || applicantOccupation || '',
      institution || form_data?.institution || form_data?.university || '',
      applicantPortfolio,
      applicantResume,
      motivation || form_data?.motivation || form_data?.statement || '',
      opportunity_id || null,
      applicantId,
      form_data || {},
      JSON.stringify(initialHistory)
    ];

    const result = await db.query(insertQuery, values);
    const createdApp = result.rows[0];

    // Store custom question responses into application_responses table
    if (form_data && typeof form_data === 'object') {
      const ignoredKeys = [
        'name', 'full_name', 'email', 'phone', 'phone_number', 'location', 
        'education', 'current_role', 'institution', 'skills', 'areas_of_contribution', 
        'availability', 'experience_level', 'portfolio_url', 'resume_url', 
        'motivation', 'agreement_confirmed', 'portfolio', 'resume', 'cv', 'github', 'linkedin'
      ];
      for (const [key, val] of Object.entries(form_data)) {
        if (!ignoredKeys.includes(key) && val !== null && val !== undefined && val !== '') {
          const valString = typeof val === 'object' ? JSON.stringify(val) : String(val);
          await db.query(
            `INSERT INTO application_responses (application_id, field_name, field_label, field_value)
             VALUES ($1, $2, $3, $4)`,
            [createdApp.id, key, key.replace(/_/g, ' '), valString]
          ).catch(e => console.warn('Response item insert note:', e.message));
        }
      }
    }

    // Store attached files if present
    if (Array.isArray(uploaded_files)) {
      for (const fileObj of uploaded_files) {
        if (fileObj && fileObj.file_url) {
          await db.query(
            `INSERT INTO application_files (application_id, file_name, file_url, file_size, file_type)
             VALUES ($1, $2, $3, $4, $5)`,
            [createdApp.id, fileObj.file_name || 'Document', fileObj.file_url, fileObj.file_size || 0, fileObj.file_type || '']
          ).catch(e => console.warn('File record insert note:', e.message));
        }
      }
    } else if (applicantResume && applicantResume.startsWith('http')) {
      await db.query(
        `INSERT INTO application_files (application_id, file_name, file_url, file_type)
         VALUES ($1, 'Resume / CV', $2, 'link')`,
        [createdApp.id, applicantResume]
      ).catch(() => {});
    }

    await logActivity('Submitted Application', 'Application', createdApp.id, {
      full_name: applicantName,
      email: applicantEmail,
      opportunity_id
    });

    res.status(201).json({
      success: true,
      application: createdApp,
      reference_id: `VS-APP-${String(createdApp.id).padStart(5, '0')}`,
      message: 'Your application has been submitted successfully. We will review your application and contact you with the next steps.'
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
});

const { login, authenticateToken } = require('./auth');

// Modular Admin Login Route
app.post('/api/admin/login', login);

// Protect all subsequent /api/admin routes
app.use('/api/admin', authenticateToken);

// Admin Route to fetch all applications with rich opportunity metadata and filters
app.get('/api/admin/applications', async (req, res) => {
  try {
    const { status, opportunity_id, search } = req.query;
    let query = `
      SELECT 
        a.*, 
        o.title as opportunity_title,
        o.categories as opportunity_categories,
        o.type as opportunity_type,
        o.status as opportunity_status
      FROM applications a 
      LEFT JOIN opportunities o ON a.opportunity_id::text = o.id::text 
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status.toLowerCase());
      query += ` AND LOWER(a.status) = $${params.length}`;
    }

    if (opportunity_id && opportunity_id !== 'all') {
      params.push(opportunity_id.toString());
      query += ` AND a.opportunity_id::text = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (
        LOWER(a.full_name) LIKE $${params.length} OR 
        LOWER(a.email) LIKE $${params.length} OR 
        LOWER(a.phone_number) LIKE $${params.length} OR 
        LOWER(COALESCE(o.title, '')) LIKE $${params.length}
      )`;
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Route to fetch single application by ID with responses & attached files
app.get('/api/admin/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT 
        a.*, 
        o.title as opportunity_title,
        o.categories as opportunity_categories,
        o.type as opportunity_type,
        o.status as opportunity_status,
        o.location as opportunity_location,
        o.location_type as opportunity_location_type,
        o.form_fields as opportunity_form_fields
      FROM applications a 
      LEFT JOIN opportunities o ON a.opportunity_id::text = o.id::text 
      WHERE a.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const application = result.rows[0];

    // Fetch custom responses
    const responsesRes = await db.query(
      'SELECT * FROM application_responses WHERE application_id = $1 ORDER BY id ASC',
      [id]
    ).catch(() => ({ rows: [] }));
    application.responses = responsesRes.rows || [];

    // Fetch attached files
    const filesRes = await db.query(
      'SELECT * FROM application_files WHERE application_id = $1 ORDER BY id ASC',
      [id]
    ).catch(() => ({ rows: [] }));
    application.files = filesRes.rows || [];

    res.status(200).json(application);
  } catch (error) {
    console.error('Error fetching application by id:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Route to update application status and append to status history
app.patch('/api/admin/applications/:id/status', async (req, res) => {
  try {
    const { status, note, internal_notes } = req.body;
    const { id } = req.params;

    const newHistoryEntry = {
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status changed to ${String(status).replace('_', ' ').toUpperCase()}`
    };

    const appRes = await db.query('SELECT * FROM applications WHERE id::text = $1::text', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const currentApp = appRes.rows[0];
    let currentHistory = [];
    if (Array.isArray(currentApp.status_history)) {
      currentHistory = currentApp.status_history;
    } else if (typeof currentApp.status_history === 'string') {
      try {
        currentHistory = JSON.parse(currentApp.status_history);
      } catch (e) {
        currentHistory = [];
      }
    }
    currentHistory.push(newHistoryEntry);

    const result = await db.query(
      `UPDATE applications 
       SET 
         status = $1, 
         internal_notes = COALESCE($2, internal_notes),
         status_history = $3::jsonb,
         updated_at = CURRENT_TIMESTAMP
       WHERE id::text = $4::text 
       RETURNING *`,
      [status, internal_notes !== undefined ? internal_notes : null, JSON.stringify(currentHistory), id]
    );

    await logActivity('Updated Application Status', 'Application', id, { status, note });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// Admin Route to dispatch applicant notification / message
app.post('/api/admin/applications/:id/notify', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, new_status } = req.body;

    const appRes = await db.query('SELECT * FROM applications WHERE id::text = $1::text', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    const appData = appRes.rows[0];

    const notificationLog = {
      type: 'notification_sent',
      status: new_status || appData.status,
      timestamp: new Date().toISOString(),
      note: `Notification sent to ${appData.email}: "${subject || 'Update on your VeroSeven Application'}"`,
      notification: {
        subject,
        message,
        recipient: appData.email,
        sent_at: new Date().toISOString()
      }
    };

    let currentHistory = [];
    if (Array.isArray(appData.status_history)) {
      currentHistory = appData.status_history;
    } else if (typeof appData.status_history === 'string') {
      try {
        currentHistory = JSON.parse(appData.status_history);
      } catch (e) {
        currentHistory = [];
      }
    }
    currentHistory.push(notificationLog);

    const updateRes = await db.query(
      `UPDATE applications 
       SET 
         status = COALESCE($1, status),
         status_history = $2::jsonb,
         updated_at = CURRENT_TIMESTAMP
       WHERE id::text = $3::text
       RETURNING *`,
      [new_status || null, JSON.stringify(currentHistory), id]
    );

    await logActivity('Sent Applicant Notification', 'Application', id, {
      applicant_email: appData.email,
      subject,
      new_status
    });

    res.json({
      success: true,
      message: 'Notification sent and logged.',
      application: updateRes.rows[0]
    });
  } catch (error) {
    console.error('Error sending applicant notification:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// Admin Route to update internal review notes
app.patch('/api/admin/applications/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { internal_notes } = req.body;

    const result = await db.query(
      `UPDATE applications 
       SET internal_notes = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id::text = $2::text 
       RETURNING *`,
      [internal_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

app.put('/api/admin/applications/:id', async (req, res) => {
  try {
    const { status, internal_notes, note } = req.body;
    const { id } = req.params;

    const appRes = await db.query('SELECT * FROM applications WHERE id::text = $1::text', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    const appData = appRes.rows[0];

    let currentHistory = [];
    if (Array.isArray(appData.status_history)) {
      currentHistory = appData.status_history;
    } else if (typeof appData.status_history === 'string') {
      try {
        currentHistory = JSON.parse(appData.status_history);
      } catch (e) {
        currentHistory = [];
      }
    }

    if (status) {
      currentHistory.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || 'Application details and status updated'
      });
    }

    const result = await db.query(
      `UPDATE applications 
       SET 
         status = COALESCE($1, status),
         internal_notes = COALESCE($2, internal_notes),
         status_history = $3::jsonb,
         updated_at = CURRENT_TIMESTAMP
       WHERE id::text = $4::text 
       RETURNING *`,
      [status || null, internal_notes !== undefined ? internal_notes : null, JSON.stringify(currentHistory), id]
    );

    await logActivity('Updated Application Details', 'Application', id, { status, internal_notes });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error modifying application:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// Admin Route to delete an application
app.delete('/api/admin/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM applications WHERE id::text = $1::text', [id]);
    await logActivity('Deleted Application', 'Application', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// Projects Routes
app.get('/api/projects', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/admin/projects', async (req, res) => {
  try {
    const { name, description, status, category, website_url, admin_url, docs_url } = req.body;
    
    const result = await db.query(
      'INSERT INTO projects (name, description, status, category, website_url, admin_url, docs_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, status, category, website_url, admin_url, docs_url]
    );
    await logActivity('Created Project', 'Project', result.rows[0].id, { name });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/api/admin/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, category, website_url, admin_url, docs_url } = req.body;
    
    const result = await db.query(
      'UPDATE projects SET name = $1, description = $2, status = $3, category = $4, website_url = $5, admin_url = $6, docs_url = $7 WHERE id = $8 RETURNING *',
      [name, description, status, category, website_url, admin_url, docs_url, id]
    );
    await logActivity('Updated Project', 'Project', id, { name });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/api/admin/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM projects WHERE id = $1', [id]);
    await logActivity('Deleted Project', 'Project', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Teams Routes
app.get('/api/admin/teams', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM teams ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/admin/teams', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      'INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || '']
    );
    await logActivity('Created Team', 'Team', result.rows[0].id, { name });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/api/admin/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      'UPDATE teams SET name=$1, description=$2 WHERE id=$3 RETURNING *',
      [name, description || '', id]
    );
    await logActivity('Updated Team', 'Team', id, { name });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/api/admin/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM teams WHERE id=$1', [id]);
    await logActivity('Deleted Team', 'Team', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Team Members Routes
app.get('/api/admin/team-members', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM team_members ORDER BY team_id, name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/admin/team-members', async (req, res) => {
  try {
    const { name, role, email, project_group, status, team_id } = req.body;
    const result = await db.query(
      'INSERT INTO team_members (name, role, email, project_group, status, team_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, role, email, project_group, status, team_id || null]
    );
    await logActivity('Added Team Member', 'TeamMember', result.rows[0].id, { name, team_id });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/api/admin/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, project_group, status, team_id } = req.body;
    const result = await db.query(
      'UPDATE team_members SET name=$1, role=$2, email=$3, project_group=$4, status=$5, team_id=$6 WHERE id=$7 RETURNING *',
      [name, role, email, project_group, status, team_id || null, id]
    );
    await logActivity('Updated Team Member', 'TeamMember', id, { name, team_id });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/api/admin/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM team_members WHERE id=$1', [id]);
    await logActivity('Deleted Team Member', 'TeamMember', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// CMS Routes
app.get('/api/cms', async (req, res) => {
  try {
    const result = await db.query('SELECT section_key, content FROM cms_content');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/api/admin/cms/:key', async (req, res) => {
  try {
    const { content } = req.body;
    const { key } = req.params;
    const result = await db.query(
      'INSERT INTO cms_content (section_key, content, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (section_key) DO UPDATE SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP RETURNING *',
      [key, JSON.stringify(content)]
    );
    await logActivity('Updated CMS Content', 'CMS', key, { section_key: key });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating CMS:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Updates Routes
app.get('/api/updates', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM updates ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/admin/updates', async (req, res) => {
  try {
    const { title, tag, excerpt, date_label } = req.body;
    const result = await db.query(
      'INSERT INTO updates (title, tag, excerpt, date_label) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, tag, excerpt, date_label]
    );
    await logActivity('Created Update', 'Update', result.rows[0].id, { title });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/api/admin/updates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tag, excerpt, date_label } = req.body;
    const result = await db.query(
      'UPDATE updates SET title = $1, tag = $2, excerpt = $3, date_label = $4 WHERE id = $5 RETURNING *',
      [title, tag, excerpt, date_label, id]
    );
    await logActivity('Modified Update', 'Update', id, { title });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/api/admin/updates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM updates WHERE id = $1', [id]);
    await logActivity('Deleted Update', 'Update', id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting update:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Helper to normalize opportunity records for full multi-category & json field backward compatibility
const normalizeOpp = (opp) => {
  if (!opp) return opp;
  
  const parseJsonField = (val, fallback = []) => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch(e) { return Array.isArray(fallback) ? [val] : fallback; }
    }
    if (Array.isArray(fallback)) {
      return Array.isArray(val) ? val : fallback;
    }
    if (typeof fallback === 'object' && fallback !== null) {
      return (typeof val === 'object' && val !== null && !Array.isArray(val)) ? val : fallback;
    }
    return val;
  };

  let categories = opp.categories;
  if (typeof categories === 'string') {
    try { categories = JSON.parse(categories); } catch(e) { categories = [categories]; }
  }
  if (!Array.isArray(categories) || categories.length === 0) {
    categories = opp.category ? [opp.category] : [];
  }

  let types = opp.type;
  if (typeof types === 'string' && (types.startsWith('[') || types.startsWith('{'))) {
    try { types = JSON.parse(types); } catch(e) { types = [types]; }
  }

  return {
    ...opp,
    categories,
    category: categories[0] || opp.category || '',
    type: types || opp.type || 'Volunteer',
    requirements: parseJsonField(opp.requirements, []),
    responsibilities: parseJsonField(opp.responsibilities, []),
    benefits: parseJsonField(opp.benefits, []),
    skills: parseJsonField(opp.skills, []),
    areas_of_contribution: parseJsonField(opp.areas_of_contribution, []),
    applicant_config: parseJsonField(opp.applicant_config, {}),
    form_fields: parseJsonField(opp.form_fields, []),
    application_count: parseInt(opp.application_count || 0, 10),
    show_on_website: opp.show_on_website !== false,
    status: (opp.status || 'draft').toLowerCase()
  };
};

// ==========================================
// Opportunities Routes
// ==========================================

// Public Route to fetch all active opportunities
app.get('/api/opportunities', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM opportunities 
      WHERE LOWER(status) = 'active' 
        AND (show_on_website IS TRUE OR show_on_website IS NULL) 
      ORDER BY created_at DESC
    `);
    res.status(200).json(result.rows.map(normalizeOpp));
  } catch (error) {
    console.error('Error fetching public opportunities:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Public Route to fetch single opportunity by ID
app.get('/api/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM opportunities WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.status(200).json(normalizeOpp(result.rows[0]));
  } catch (error) {
    console.error('Error fetching opportunity by id:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Route to fetch ALL opportunities with real-time application counts
app.get('/api/admin/opportunities', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        o.*,
        COALESCE(app_counts.app_count, 0)::int AS application_count
      FROM opportunities o
      LEFT JOIN (
        SELECT opportunity_id, COUNT(*) AS app_count 
        FROM applications 
        GROUP BY opportunity_id
      ) app_counts ON o.id = app_counts.opportunity_id
      ORDER BY o.created_at DESC
    `);
    res.status(200).json(result.rows.map(normalizeOpp));
  } catch (error) {
    console.error('Error fetching admin opportunities:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Route to create opportunity
app.post('/api/admin/opportunities', async (req, res) => {
  try {
    const {
      title, summary, description, requirements, type, category, categories, status, featured,
      location_type, location, duration, weekly_commitment, positions, deadline, start_date,
      responsibilities, benefits, skills, areas_of_contribution, applicant_config, form_fields,
      publish_immediately, accept_applications, show_on_website, featured_on_homepage,
      whatsapp_group_link, whatsapp_channel_link
    } = req.body;

    let finalCategories = categories;
    if (typeof finalCategories === 'string') {
      try { finalCategories = JSON.parse(finalCategories); } catch(e) { finalCategories = [finalCategories]; }
    }
    if (!Array.isArray(finalCategories)) {
      finalCategories = category ? [category] : [];
    }
    const primaryCategory = finalCategories[0] || category || '';

    const result = await db.query(
      `INSERT INTO opportunities (
        title, summary, description, requirements, type, category, categories, status, featured,
        location_type, location, duration, weekly_commitment, positions, deadline, start_date,
        responsibilities, benefits, skills, areas_of_contribution, applicant_config, form_fields,
        publish_immediately, accept_applications, show_on_website, featured_on_homepage,
        whatsapp_group_link, whatsapp_channel_link
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
      ) RETURNING *`,
      [
        title || 'Untitled Opportunity', 
        summary || '', 
        description || '', 
        JSON.stringify(requirements || []), 
        Array.isArray(type) ? JSON.stringify(type) : (type || 'Volunteer'), 
        primaryCategory, 
        JSON.stringify(finalCategories),
        (status || 'draft').toLowerCase(), 
        featured || false,
        location_type || 'Remote', 
        location || '', 
        duration || 'Flexible', 
        weekly_commitment || '5–10 hrs',
        positions || null,
        deadline || null,
        start_date || null,
        JSON.stringify(responsibilities || []),
        JSON.stringify(benefits || []),
        JSON.stringify(skills || []),
        JSON.stringify(areas_of_contribution || []),
        JSON.stringify(applicant_config || {}),
        JSON.stringify(form_fields || []),
        publish_immediately || false,
        accept_applications !== false,
        show_on_website !== false,
        featured_on_homepage || false,
        whatsapp_group_link || null,
        whatsapp_channel_link || null
      ]
    );
    await logActivity('Created Opportunity', 'Opportunity', result.rows[0].id, { title: result.rows[0].title });
    res.status(201).json(normalizeOpp(result.rows[0]));
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Route to update opportunity
app.put('/api/admin/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, summary, description, requirements, type, category, categories, status, featured,
      location_type, location, duration, weekly_commitment, positions, deadline, start_date,
      responsibilities, benefits, skills, areas_of_contribution, applicant_config, form_fields,
      publish_immediately, accept_applications, show_on_website, featured_on_homepage,
      whatsapp_group_link, whatsapp_channel_link
    } = req.body;

    let finalCategories = categories;
    if (typeof finalCategories === 'string') {
      try { finalCategories = JSON.parse(finalCategories); } catch(e) { finalCategories = [finalCategories]; }
    }
    if (!Array.isArray(finalCategories)) {
      finalCategories = category ? [category] : [];
    }
    const primaryCategory = finalCategories[0] || category || '';

    const result = await db.query(
      `UPDATE opportunities SET
        title=$1, summary=$2, description=$3, requirements=$4, type=$5, category=$6, categories=$7,
        status=$8, featured=$9, location_type=$10, location=$11, duration=$12,
        weekly_commitment=$13, positions=$14, deadline=$15, start_date=$16,
        responsibilities=$17, benefits=$18, skills=$19, areas_of_contribution=$20, applicant_config=$21, form_fields=$22,
        publish_immediately=$23, accept_applications=$24, show_on_website=$25,
        featured_on_homepage=$26, whatsapp_group_link=$27, whatsapp_channel_link=$28, updated_at=CURRENT_TIMESTAMP
      WHERE id=$29 RETURNING *`,
      [
        title || 'Untitled Opportunity', 
        summary || '', 
        description || '', 
        JSON.stringify(requirements || []), 
        Array.isArray(type) ? JSON.stringify(type) : (type || 'Volunteer'), 
        primaryCategory, 
        JSON.stringify(finalCategories),
        (status || 'draft').toLowerCase(), 
        featured || false, 
        location_type || 'Remote', 
        location || '', 
        duration || 'Flexible',
        weekly_commitment || '5–10 hrs', 
        positions || null, 
        deadline || null, 
        start_date || null,
        JSON.stringify(responsibilities || []), 
        JSON.stringify(benefits || []), 
        JSON.stringify(skills || []), 
        JSON.stringify(areas_of_contribution || []),
        JSON.stringify(applicant_config || {}),
        JSON.stringify(form_fields || []),
        publish_immediately || false, 
        accept_applications !== false, 
        show_on_website !== false,
        featured_on_homepage || false,
        whatsapp_group_link || null,
        whatsapp_channel_link || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    await logActivity('Modified Opportunity', 'Opportunity', id, { title: result.rows[0].title });
    res.status(200).json(normalizeOpp(result.rows[0]));
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Route to duplicate an existing opportunity
app.post('/api/admin/opportunities/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM opportunities WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const src = existing.rows[0];
    const newTitle = `${src.title} (Copy)`;

    const result = await db.query(
      `INSERT INTO opportunities (
        title, summary, description, requirements, type, category, categories, status, featured,
        location_type, location, duration, weekly_commitment, positions, deadline, start_date,
        responsibilities, benefits, skills, areas_of_contribution, applicant_config, form_fields,
        publish_immediately, accept_applications, show_on_website, featured_on_homepage
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26
      ) RETURNING *`,
      [
        newTitle,
        src.summary || '',
        src.description || '',
        typeof src.requirements === 'object' ? JSON.stringify(src.requirements) : (src.requirements || '[]'),
        src.type || 'Volunteer',
        src.category || '',
        typeof src.categories === 'object' ? JSON.stringify(src.categories) : (src.categories || '[]'),
        'draft', // duplicated opportunity defaults to Draft
        false, // reset featured flag
        src.location_type || 'Remote',
        src.location || '',
        src.duration || 'Flexible',
        src.weekly_commitment || '5–10 hrs',
        src.positions || null,
        src.deadline || null,
        src.start_date || null,
        typeof src.responsibilities === 'object' ? JSON.stringify(src.responsibilities) : (src.responsibilities || '[]'),
        typeof src.benefits === 'object' ? JSON.stringify(src.benefits) : (src.benefits || '[]'),
        typeof src.skills === 'object' ? JSON.stringify(src.skills) : (src.skills || '[]'),
        typeof src.areas_of_contribution === 'object' ? JSON.stringify(src.areas_of_contribution) : (src.areas_of_contribution || '[]'),
        typeof src.applicant_config === 'object' ? JSON.stringify(src.applicant_config) : (src.applicant_config || '{}'),
        typeof src.form_fields === 'object' ? JSON.stringify(src.form_fields) : (src.form_fields || '[]'),
        false,
        true,
        src.show_on_website !== false,
        false
      ]
    );

    await logActivity('Duplicated Opportunity', 'Opportunity', result.rows[0].id, {
      original_id: id,
      new_title: newTitle
    });

    res.status(201).json(normalizeOpp({ ...result.rows[0], application_count: 0 }));
  } catch (error) {
    console.error('Error duplicating opportunity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Route to quickly patch opportunity status (e.g. active, draft, closed, archived)
app.patch('/api/admin/opportunities/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const result = await db.query(
      `UPDATE opportunities 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status.toLowerCase(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    await logActivity('Updated Opportunity Status', 'Opportunity', id, { status });
    res.status(200).json(normalizeOpp(result.rows[0]));
  } catch (error) {
    console.error('Error patching opportunity status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Route to delete an opportunity
app.delete('/api/admin/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Unlink applications or keep them for historical records
    await db.query('UPDATE applications SET opportunity_id = NULL WHERE opportunity_id = $1', [id]);
    await db.query('DELETE FROM opportunities WHERE id = $1', [id]);
    await logActivity('Deleted Opportunity', 'Opportunity', id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// VeroSeven Experience Ecosystem Routes
// ==========================================

// --- Events ---
app.get('/api/events', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM events ORDER BY event_date ASC");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.post('/api/admin/events', async (req, res) => {
  try {
    const { title, event_date, location, type, description, image_url, status } = req.body;
    const result = await db.query(
      `INSERT INTO events (title, event_date, location, type, description, image_url, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, event_date || null, location || '', type || '', description || '', image_url || '', status || 'upcoming']
    );
    await logActivity('Created Event', 'Event', result.rows[0].id, { title });
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.put('/api/admin/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, event_date, location, type, description, image_url, status } = req.body;
    const result = await db.query(
      `UPDATE events SET title=$1, event_date=$2, location=$3, type=$4, description=$5, image_url=$6, status=$7, updated_at=CURRENT_TIMESTAMP WHERE id=$8 RETURNING *`,
      [title, event_date || null, location || '', type || '', description || '', image_url || '', status || 'upcoming', id]
    );
    await logActivity('Updated Event', 'Event', id, { title });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.delete('/api/admin/events/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM events WHERE id=$1', [req.params.id]);
    await logActivity('Deleted Event', 'Event', req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// --- Testimonials ---
app.get('/api/testimonials', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM testimonials ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.post('/api/admin/testimonials', async (req, res) => {
  try {
    const { author_name, role, content, avatar_url, program } = req.body;
    const result = await db.query(
      `INSERT INTO testimonials (author_name, role, content, avatar_url, program) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [author_name, role || '', content, avatar_url || '', program || '']
    );
    await logActivity('Created Testimonial', 'Testimonial', result.rows[0].id, { author_name });
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.put('/api/admin/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { author_name, role, content, avatar_url, program } = req.body;
    const result = await db.query(
      `UPDATE testimonials SET author_name=$1, role=$2, content=$3, avatar_url=$4, program=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *`,
      [author_name, role || '', content, avatar_url || '', program || '', id]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.delete('/api/admin/testimonials/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM testimonials WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// --- Gallery Moments ---
app.get('/api/gallery', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM gallery ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.post('/api/admin/gallery', async (req, res) => {
  try {
    const { image_url, caption, related_program } = req.body;
    const result = await db.query(
      `INSERT INTO gallery (image_url, caption, related_program) VALUES ($1, $2, $3) RETURNING *`,
      [image_url, caption || '', related_program || '']
    );
    await logActivity('Added Gallery Image', 'Gallery', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.delete('/api/admin/gallery/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM gallery WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// --- Team Members ---
app.get('/api/team', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM team_members ORDER BY created_at ASC");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.post('/api/admin/team', async (req, res) => {
  try {
    const { name, role, bio, image_url } = req.body;
    const result = await db.query(
      `INSERT INTO team_members (name, role, bio, image_url) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, role, bio || '', image_url || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.put('/api/admin/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, bio, image_url } = req.body;
    const result = await db.query(
      `UPDATE team_members SET name=$1, role=$2, bio=$3, image_url=$4, updated_at=CURRENT_TIMESTAMP WHERE id=$5 RETURNING *`,
      [name, role, bio || '', image_url || '', id]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.delete('/api/admin/team/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM team_members WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// ==========================================
// Activity Logs Routes
// ==========================================
app.get('/api/admin/activity-logs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.listen(PORT, () => console.log(`VeroSeven API running on port ${PORT}`));