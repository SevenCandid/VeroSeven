const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auto-migration on startup: ensure categories column exists and backfills from category
(async () => {
  try {
    await db.query(`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb`);
    await db.query(`
      UPDATE opportunities
      SET categories = jsonb_build_array(category)
      WHERE (categories IS NULL OR categories = '[]'::jsonb)
        AND category IS NOT NULL
        AND category != ''
    `);
  } catch (err) {
    console.log('Categories auto-migration check:', err.message);
  }
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

// API Route for submitting the private application
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
      motivation,
      opportunity_id,
      form_data
    } = req.body;

    const query = `
      INSERT INTO applications (
        full_name, phone_number, email, location, occupation, 
        background, skills, areas_of_contribution, availability, motivation,
        opportunity_id, form_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    
    const values = [
      full_name, phone_number, email, location, occupation,
      background, skills, areas_of_contribution, availability, motivation,
      opportunity_id || null, form_data || {}
    ];

    const result = await db.query(query, values);
    res.status(201).json({ success: true, application: result.rows[0] });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

const { login, authenticateToken } = require('./auth');

// Modular Admin Login Route
app.post('/api/admin/login', login);

// Protect all subsequent /api/admin routes
app.use('/api/admin', authenticateToken);

// Admin Route to fetch all applications
app.get('/api/admin/applications', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, o.title as opportunity_title 
      FROM applications a 
      LEFT JOIN opportunities o ON a.opportunity_id = o.id 
      ORDER BY a.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Route to update application status
app.patch('/api/admin/applications/:id/status', async (req, res) => {
  try {
    const { status, internal_notes } = req.body;
    const { id } = req.params;
    const result = await db.query(
      'UPDATE applications SET status = $1, internal_notes = COALESCE($2, internal_notes) WHERE id = $3 RETURNING *',
      [status, internal_notes, id]
    );
    await logActivity('Updated Application Status', 'Application', id, { status });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/api/admin/applications/:id', async (req, res) => {
  try {
    const { status, internal_notes } = req.body;
    const { id } = req.params;
    const result = await db.query(
      'UPDATE applications SET status = $1, internal_notes = $2 WHERE id = $3 RETURNING *',
      [status, internal_notes, id]
    );
    await logActivity('Updated Application Details', 'Application', id, { status });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Route to delete an application
app.delete('/api/admin/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM applications WHERE id = $1', [id]);
    await logActivity('Deleted Application', 'Application', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
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

// Team Members Routes
app.get('/api/admin/team-members', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM team_members ORDER BY project_group, name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/admin/team-members', async (req, res) => {
  try {
    const { name, role, email, project_group, status } = req.body;
    const result = await db.query(
      'INSERT INTO team_members (name, role, email, project_group, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, role, email, project_group, status]
    );
    await logActivity('Added Team Member', 'TeamMember', result.rows[0].id, { name, project_group });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/api/admin/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, project_group, status } = req.body;
    const result = await db.query(
      'UPDATE team_members SET name=$1, role=$2, email=$3, project_group=$4, status=$5 WHERE id=$6 RETURNING *',
      [name, role, email, project_group, status, id]
    );
    await logActivity('Updated Team Member', 'TeamMember', id, { name, project_group });
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

// Helper to normalize opportunity records for full multi-category backward compatibility
const normalizeOpp = (opp) => {
  if (!opp) return opp;
  let categories = opp.categories;
  if (typeof categories === 'string') {
    try { categories = JSON.parse(categories); } catch(e) { categories = [categories]; }
  }
  if (!Array.isArray(categories) || categories.length === 0) {
    categories = opp.category ? [opp.category] : [];
  }
  return {
    ...opp,
    categories,
    category: categories[0] || opp.category || ''
  };
};

// ==========================================
// Opportunities Routes
// ==========================================

// Public Route to fetch all active opportunities
app.get('/api/opportunities', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM opportunities WHERE status = 'active' ORDER BY created_at DESC");
    res.status(200).json(result.rows.map(normalizeOpp));
  } catch (error) {
    console.error('Error fetching opportunities:', error);
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

// Admin Route to fetch ALL opportunities
app.get('/api/admin/opportunities', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM opportunities ORDER BY created_at DESC');
    res.status(200).json(result.rows.map(normalizeOpp));
  } catch (error) {
    console.error('Error fetching admin opportunities:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/admin/opportunities', async (req, res) => {
  try {
    const {
      title, summary, description, requirements, type, category, categories, status, featured,
      location_type, location, duration, weekly_commitment, positions, deadline, start_date,
      responsibilities, benefits, skills, form_fields,
      publish_immediately, accept_applications, show_on_website, featured_on_homepage
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
        responsibilities, benefits, skills, form_fields,
        publish_immediately, accept_applications, show_on_website, featured_on_homepage
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
      ) RETURNING *`,
      [
        title, summary, description, requirements, type, primaryCategory, JSON.stringify(finalCategories),
        status || 'draft', featured || false,
        location_type || 'Remote', location, duration, weekly_commitment,
        positions || null,
        deadline || null,
        start_date || null,
        JSON.stringify(responsibilities || []),
        JSON.stringify(benefits || []),
        JSON.stringify(skills || []),
        JSON.stringify(form_fields || []),
        publish_immediately || false,
        accept_applications !== false,
        show_on_website !== false,
        featured_on_homepage || false
      ]
    );
    await logActivity('Created Opportunity', 'Opportunity', result.rows[0].id, { title });
    res.status(201).json(normalizeOpp(result.rows[0]));
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/api/admin/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, summary, description, requirements, type, category, categories, status, featured,
      location_type, location, duration, weekly_commitment, positions, deadline, start_date,
      responsibilities, benefits, skills, form_fields,
      publish_immediately, accept_applications, show_on_website, featured_on_homepage
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
        responsibilities=$17, benefits=$18, skills=$19, form_fields=$20,
        publish_immediately=$21, accept_applications=$22, show_on_website=$23,
        featured_on_homepage=$24, updated_at=CURRENT_TIMESTAMP
      WHERE id=$25 RETURNING *`,
      [
        title, summary, description, requirements, type, primaryCategory, JSON.stringify(finalCategories),
        status || 'draft', featured || false,
        location_type || 'Remote', location, duration, weekly_commitment,
        positions || null,
        deadline || null,
        start_date || null,
        JSON.stringify(responsibilities || []),
        JSON.stringify(benefits || []),
        JSON.stringify(skills || []),
        JSON.stringify(form_fields || []),
        publish_immediately || false,
        accept_applications !== false,
        show_on_website !== false,
        featured_on_homepage || false,
        id
      ]
    );
    await logActivity('Modified Opportunity', 'Opportunity', id, { title });
    res.status(200).json(normalizeOpp(result.rows[0]));
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/api/admin/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM opportunities WHERE id = $1', [id]);
    await logActivity('Deleted Opportunity', 'Opportunity', id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
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