const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');

// Configurable Auth Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

/**
 * Modular Authentication Service
 * You can swap out the implementation of these functions in the future to use a different auth provider.
 */

// Handles logging in and generating a token
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await db.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Express Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    
    // Store user info in request for downstream routes
    req.user = user;
    next();
  });
};

const applicantRegister = async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    const existing = await db.query('SELECT * FROM applicants WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO applicants (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email',
      [full_name, email, password_hash]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'applicant' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Applicant register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const applicantLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await db.query('SELECT * FROM applicants WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Account not setup. Please use the invite link to set a password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'applicant' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, full_name: user.full_name, email: user.email } });
  } catch (err) {
    console.error('Applicant login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  authenticateToken,
  applicantRegister,
  applicantLogin
};
