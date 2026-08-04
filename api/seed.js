require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE TABLE IF NOT EXISTS updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    tag VARCHAR(100),
    excerpt TEXT,
    date_label VARCHAR(100),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO projects (name, description, status, category) VALUES 
('Nexra', 'A modern communication platform designed to simplify messaging, engagement, and digital communication for businesses, organizations, and communities. Nexra powers bulk SMS, messaging APIs, and notification systems at scale.', 'active', 'Bulk SMS, Messaging APIs, Notification Systems'),
('VeroSeven AI', 'AI assistants and intelligent systems designed to automate workflows, enhance decision-making, and unlock new capabilities for businesses and developers.', 'in_development', 'AI Assistants, Automation, Intelligent Agents'),
('Omnivote', 'A comprehensive voting and awards management platform built for organizations, institutions, and communities seeking transparent, digital-first voting solutions.', 'in_development', 'Voting, Awards, Management'),
('Smart Queue', 'A digital queue management system that reduces wait times, improves customer experience, and streamlines operations for businesses and service centers.', 'in_development', 'Queue Management, Digital Ops, SaaS'),
('Device Health AI', 'An AI-powered device diagnostics and monitoring platform that helps individuals and organizations proactively maintain and protect their technology assets.', 'in_development', 'AI Diagnostics, Monitoring, Device Health')
ON CONFLICT DO NOTHING;

INSERT INTO updates (title, tag, date_label, excerpt) VALUES 
('Welcome to VEROSEVEN', 'Announcement', 'May 2026', 'This is the beginning. After months of planning, building, and refining our vision, VEROSEVEN is officially announcing its technology ecosystem. We''re starting with a bold mission and a clear direction — to build technology that truly matters. Here''s what we''re about and where we''re headed.'),
('Building Nexra', 'Product', 'May 2026', 'Nexra began as a question: why is bulk messaging still so complicated? We''re building the answer — a clean, modern, and powerful communication platform.'),
('Our Vision for Innovation', 'Vision', 'May 2026', 'Innovation isn''t about doing something new for the sake of novelty. It''s about solving real problems with real craft. Here''s how VEROSEVEN thinks about building.'),
('Product Development Updates', 'Development', 'May 2026', 'A transparent look at where we are in building Nexra — what''s working, what''s not, and what''s next. We believe in building in public.'),
('Behind the Scenes at VEROSEVEN', 'Behind the Scenes', 'May 2026', 'Building a technology ecosystem is not a linear journey. Get a candid glimpse into the early days — the wins, the pivots, and the lessons learned.'),
('Structuring the VEROSEVEN Ecosystem', 'Ecosystem', 'May 2026', 'Why build an ecosystem instead of a single product? How our five divisions connect and support each other. The strategic thinking behind VEROSEVEN''s architecture.')
ON CONFLICT DO NOTHING;
`;

pool.query(sql).then(() => {
  console.log('Successfully migrated and seeded data!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
