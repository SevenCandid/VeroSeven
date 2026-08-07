import React, { useState, useEffect, useRef } from 'react';
import {
  X, Plus, GripVertical, Trash2, ChevronDown, ChevronUp,
  Eye, Save, Send, ArrowLeft, Check, Star, AlertCircle, CheckSquare
} from 'lucide-react';
import './CreateOpportunityForm.css';

// ─── Tiny helpers ────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).substr(2, 9);

const OPPORTUNITY_TYPES = ['Volunteer','Internship','Paid Internship','Part-time','Full-time','Contract','Ambassador','Open Source'];
const CATEGORIES        = ['Backend Development','Frontend Development','Mobile Development','UI/UX Design','DevOps','QA & Testing','AI & Machine Learning','Technical Writing','Product Management','General'];
const STATUSES          = ['Draft','Active','Closed'];
const LOCATION_TYPES    = ['Remote','Hybrid','On-site'];
const DURATIONS         = ['Flexible','2 Weeks','1 Month','3 Months','6 Months','Custom'];
const WEEKLY_COMMITS    = ['2–5 hrs','5–10 hrs','10–20 hrs','20+ hrs'];
const BENEFITS_LIST     = ['Mentorship','Certificate','Recommendation Letter','Portfolio Experience','Networking','Flexible Schedule','Paid Opportunity in Future','Employment Consideration'];
const SKILL_SUGGESTIONS = ['Python','FastAPI','React','Next.js','TypeScript','Docker','Git','PostgreSQL','Supabase','Flutter','Node.js','Django','Vue.js','GraphQL','AWS','MongoDB'];
const FIELD_TYPES       = ['text','textarea','email','phone','url','number','select','multi-select','checkbox','radio','file','date'];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="opp-section">
      <button type="button" className="opp-section-header" onClick={() => setOpen(o => !o)}>
        <span className="opp-section-title">{icon} {title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="opp-section-body">{children}</div>}
    </div>
  );
}

function DynamicList({ label, items, setItems, placeholder, icon = '•' }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v) { setItems(prev => [...prev, { id: uid(), value: v }]); setDraft(''); }
  };
  const remove = id => setItems(prev => prev.filter(i => i.id !== id));

  // drag-to-reorder
  const dragItem = useRef(null);
  const dragOver = useRef(null);
  const handleDrop = () => {
    const copy = [...items];
    const dragged = copy.splice(dragItem.current, 1)[0];
    copy.splice(dragOver.current, 0, dragged);
    dragItem.current = null; dragOver.current = null;
    setItems(copy);
  };

  return (
    <div className="opp-field">
      <label className="opp-label">{label}</label>
      <ul className="dynamic-list">
        {items.map((item, i) => (
          <li key={item.id} className="dynamic-list-item"
            draggable
            onDragStart={() => { dragItem.current = i; }}
            onDragEnter={() => { dragOver.current = i; }}
            onDragEnd={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <GripVertical size={14} className="drag-handle" />
            <span className="list-icon">{icon}</span>
            <span className="list-item-value">{item.value}</span>
            <button type="button" className="list-remove-btn" onClick={() => remove(item.id)}><X size={12} /></button>
          </li>
        ))}
      </ul>
      <div className="dynamic-list-input-row">
        <input
          type="text"
          className="opp-input"
          placeholder={placeholder}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" className="opp-add-btn" onClick={add}><Plus size={14} /> Add</button>
      </div>
    </div>
  );
}

function CheckGroup({ label, options, selected, setSelected, single }) {
  const toggle = (opt) => {
    if (single) {
      setSelected([opt]);
    } else {
      setSelected(prev =>
        prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
      );
    }
  };
  return (
    <div className="opp-field">
      {label && <label className="opp-label">{label}</label>}
      <div className="check-group">
        {options.map(opt => (
          <button
            key={opt} type="button"
            className={`check-chip ${selected.includes(opt) ? 'active' : ''}`}
            onClick={() => toggle(opt)}
          >
            {selected.includes(opt) && <Check size={11} />} {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="toggle-row" onClick={() => onChange(!checked)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!checked); } }}>
      <div>
        <div className="toggle-label">{label}</div>
        {desc && <div className="toggle-desc">{desc}</div>}
      </div>
      <div className={`toggle-switch ${checked ? 'on' : ''}`}>
        <div className="toggle-thumb" />
      </div>
    </div>
  );
}

function TagsInput({ label, selected, setSelected, suggestions }) {
  const [draft, setDraft] = useState('');
  const addTag = (tag) => {
    const v = tag.trim();
    if (v && !selected.includes(v)) setSelected(prev => [...prev, v]);
    setDraft('');
  };
  const removeTag = (t) => setSelected(prev => prev.filter(x => x !== t));
  return (
    <div className="opp-field">
      <label className="opp-label">{label}</label>
      <div className="tags-container">
        {selected.map(t => (
          <span key={t} className="tag">
            {t} <button type="button" onClick={() => removeTag(t)}><X size={10} /></button>
          </span>
        ))}
        <input
          type="text"
          className="tags-input"
          placeholder="Type skill & press Enter…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(draft); } }}
        />
      </div>
      <div className="tag-suggestions">
        {suggestions.filter(s => !selected.includes(s)).map(s => (
          <button key={s} type="button" className="tag-suggestion" onClick={() => addTag(s)}><Plus size={10} /> {s}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Form Builder ─────────────────────────────────────────────────────────────
function FormBuilder({ fields, setFields }) {
  const addField = (type) => {
    setFields(prev => [...prev, {
      id: uid(), type, label: '', placeholder: '', description: '',
      required: false, options: [], defaultValue: '', helpText: ''
    }]);
  };
  const removeField = (id) => setFields(prev => prev.filter(f => f.id !== id));
  const updateField = (id, key, value) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };
  const addOption = (id) => {
    setFields(prev => prev.map(f => f.id === id
      ? { ...f, options: [...(f.options || []), ''] }
      : f
    ));
  };
  const updateOption = (fid, idx, val) => {
    setFields(prev => prev.map(f => {
      if (f.id !== fid) return f;
      const opts = [...(f.options || [])];
      opts[idx] = val;
      return { ...f, options: opts };
    }));
  };
  const removeOption = (fid, idx) => {
    setFields(prev => prev.map(f => {
      if (f.id !== fid) return f;
      const opts = [...(f.options || [])];
      opts.splice(idx, 1);
      return { ...f, options: opts };
    }));
  };

  // Drag reorder
  const dragItem = useRef(null);
  const dragOver = useRef(null);
  const handleDrop = () => {
    const copy = [...fields];
    const dragged = copy.splice(dragItem.current, 1)[0];
    copy.splice(dragOver.current, 0, dragged);
    dragItem.current = null; dragOver.current = null;
    setFields(copy);
  };

  return (
    <div className="form-builder">
      <div className="field-type-picker">
        <span className="opp-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Add Field:</span>
        <div className="field-type-grid">
          {FIELD_TYPES.map(ft => (
            <button key={ft} type="button" className="field-type-btn" onClick={() => addField(ft)}>
              <Plus size={12} /> {ft}
            </button>
          ))}
        </div>
      </div>
      {fields.length === 0 && (
        <div className="form-builder-empty">
          <AlertCircle size={24} />
          <p>No fields added yet. Click a field type above to start building your application form.</p>
        </div>
      )}
      <div className="form-builder-fields">
        {fields.map((field, i) => (
          <div
            key={field.id}
            className="form-builder-field"
            draggable
            onDragStart={() => { dragItem.current = i; }}
            onDragEnter={() => { dragOver.current = i; }}
            onDragEnd={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <div className="fb-field-header">
              <GripVertical size={14} className="drag-handle" />
              <span className="fb-field-type">{field.type}</span>
              <span className="fb-field-label-preview">{field.label || 'Untitled Field'}</span>
              {field.required && <span className="fb-required-badge">Required</span>}
              <button type="button" className="list-remove-btn" onClick={() => removeField(field.id)}><Trash2 size={13} /></button>
            </div>
            <div className="fb-field-config">
              <div className="fb-config-grid">
                <div className="opp-field">
                  <label className="opp-label">Label *</label>
                  <input className="opp-input" type="text" value={field.label}
                    onChange={e => updateField(field.id, 'label', e.target.value)} placeholder="Field label" />
                </div>
                <div className="opp-field">
                  <label className="opp-label">Placeholder</label>
                  <input className="opp-input" type="text" value={field.placeholder}
                    onChange={e => updateField(field.id, 'placeholder', e.target.value)} placeholder="Placeholder text" />
                </div>
                <div className="opp-field">
                  <label className="opp-label">Help Text</label>
                  <input className="opp-input" type="text" value={field.helpText}
                    onChange={e => updateField(field.id, 'helpText', e.target.value)} placeholder="Shown below field" />
                </div>
                <div className="opp-field">
                  <label className="opp-label">Default Value</label>
                  <input className="opp-input" type="text" value={field.defaultValue}
                    onChange={e => updateField(field.id, 'defaultValue', e.target.value)} placeholder="Pre-filled value" />
                </div>
              </div>
              {(field.type === 'select' || field.type === 'multi-select' || field.type === 'radio') && (
                <div className="opp-field" style={{ marginTop: '0.75rem' }}>
                  <label className="opp-label">Options</label>
                  {(field.options || []).map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <input className="opp-input" type="text" value={opt}
                        onChange={e => updateOption(field.id, idx, e.target.value)} placeholder={`Option ${idx + 1}`} />
                      <button type="button" className="list-remove-btn" onClick={() => removeOption(field.id, idx)}><X size={12} /></button>
                    </div>
                  ))}
                  <button type="button" className="opp-add-btn" onClick={() => addOption(field.id)} style={{ marginTop: '0.25rem' }}>
                    <Plus size={13} /> Add Option
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <label className="opp-checkbox-row">
                  <input type="checkbox" checked={field.required}
                    onChange={e => updateField(field.id, 'required', e.target.checked)} />
                  <span>Required</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Live Preview ─────────────────────────────────────────────────────────────
function LivePreview({ data }) {
  const { title, summary, description, type, category, location_type, location, duration, weekly_commitment,
    requirements, responsibilities, benefits, skills, status, positions, deadline, start_date, featured } = data;
  return (
    <div className="live-preview">
      <div className="preview-header">
        {featured && <span className="preview-featured-badge"><Star size={11} /> Featured</span>}
        <div className="preview-type-row">
          {type && type.length > 0 && <span className="preview-tag blue">{Array.isArray(type) ? type[0] : type}</span>}
          {category && <span className="preview-tag purple">{category}</span>}
          <span className={`preview-tag ${status?.toLowerCase() === 'active' ? 'green' : status?.toLowerCase() === 'closed' ? 'red' : 'gray'}`}>
            {status || 'Draft'}
          </span>
        </div>
        <h2 className="preview-title">{title || 'Opportunity Title'}</h2>
        <p className="preview-summary">{summary || 'Short summary of this opportunity will appear here.'}</p>
        <div className="preview-meta">
          <span>📍 {location_type || 'Remote'}{location ? ` · ${location}` : ''}</span>
          {duration && <span>⏱ {duration}</span>}
          {weekly_commitment && <span>📅 {weekly_commitment}</span>}
          {positions && <span>👥 {positions} position{positions > 1 ? 's' : ''}</span>}
          {deadline && <span>⏰ Deadline: {new Date(deadline).toLocaleDateString()}</span>}
          {start_date && <span>🚀 Starts: {new Date(start_date).toLocaleDateString()}</span>}
        </div>
      </div>
      <div className="preview-body">
        {description && (
          <div className="preview-section">
            <h3>About This Role</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{description}</p>
          </div>
        )}
        {requirements && requirements.length > 0 && (
          <div className="preview-section">
            <h3>Requirements</h3>
            <ul>
              {(Array.isArray(requirements) ? requirements : []).map(r => <li key={r.id || r}>✓ {r.value || r}</li>)}
            </ul>
          </div>
        )}
        {responsibilities && responsibilities.length > 0 && (
          <div className="preview-section">
            <h3>Responsibilities</h3>
            <ul>
              {(Array.isArray(responsibilities) ? responsibilities : []).map(r => <li key={r.id || r}>• {r.value || r}</li>)}
            </ul>
          </div>
        )}
        {benefits && benefits.length > 0 && (
          <div className="preview-section">
            <h3>What You Get</h3>
            <div className="preview-benefits">
              {(Array.isArray(benefits) ? benefits : []).map(b => (
                <span key={b.id || b} className="preview-benefit"><CheckSquare size={13} /> {b.value || b}</span>
              ))}
            </div>
          </div>
        )}
        {skills && skills.length > 0 && (
          <div className="preview-section">
            <h3>Skills</h3>
            <div className="preview-skills">
              {(Array.isArray(skills) ? skills : []).map(s => <span key={s} className="preview-skill">{s}</span>)}
            </div>
          </div>
        )}
        <button className="preview-apply-btn">Apply Now</button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateOpportunityForm({ initial, onSave, onCancel, apiFetch }) {
  const isEdit = !!initial?.id;

  // ── Section 1: Basic Info
  const [title, setTitle]         = useState(initial?.title || '');
  const [summary, setSummary]     = useState(initial?.summary || '');
  const [description, setDesc]    = useState(initial?.description || '');
  const [type, setType]           = useState(() => {
    if (!initial?.type) return [];
    try { return Array.isArray(initial.type) ? initial.type : JSON.parse(initial.type); }
    catch { return [initial.type]; }
  });
  const [category, setCategory]   = useState(initial?.category ? [initial.category] : []);
  const [status, setStatus]       = useState(initial?.status ? [initial.status.charAt(0).toUpperCase() + initial.status.slice(1)] : ['Draft']);
  const [featured, setFeatured]   = useState(initial?.featured || false);

  // ── Section 2: Logistics
  const [locationType, setLocType]  = useState(initial?.location_type ? [initial.location_type] : ['Remote']);
  const [location, setLocation]     = useState(initial?.location || '');
  const [duration, setDuration]     = useState(initial?.duration ? [initial.duration] : []);
  const [weeklyCommit, setWeekly]   = useState(initial?.weekly_commitment ? [initial.weekly_commitment] : []);
  const [positions, setPositions]   = useState(initial?.positions || '');
  const [deadline, setDeadline]     = useState(initial?.deadline ? initial.deadline.substring(0,10) : '');
  const [startDate, setStartDate]   = useState(initial?.start_date ? initial.start_date.substring(0,10) : '');

  // ── Sections 3-5
  const parseJsonList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(v => typeof v === 'string' ? { id: uid(), value: v } : v);
    try { const p = JSON.parse(val); return Array.isArray(p) ? p.map(v => typeof v === 'string' ? { id: uid(), value: v } : v) : []; }
    catch { return []; }
  };

  const [requirements, setReqs]         = useState(() => parseJsonList(initial?.requirements));
  const [responsibilities, setResps]    = useState(() => parseJsonList(initial?.responsibilities));
  const [benefits, setBenefits]         = useState(() => {
    const raw = initial?.benefits;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(v => (typeof v === 'string' ? { id: uid(), value: v } : v));
    try { return JSON.parse(raw).map(v => typeof v === 'string' ? { id: uid(), value: v } : v); } catch { return []; }
  });

  const selectedBenefits = benefits.map(b => b.value);
  const toggleBenefit = (b) => {
    if (selectedBenefits.includes(b)) setBenefits(prev => prev.filter(x => x.value !== b));
    else setBenefits(prev => [...prev, { id: uid(), value: b }]);
  };

  // ── Section 6: Skills
  const [skills, setSkills] = useState(() => {
    const raw = initial?.skills;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  });

  // ── Section 7: Visibility
  const [publishNow, setPublishNow]       = useState(initial?.publish_immediately || false);
  const [acceptApps, setAcceptApps]       = useState(initial?.accept_applications !== false);
  const [showOnSite, setShowOnSite]       = useState(initial?.show_on_website !== false);
  const [featuredHome, setFeaturedHome]   = useState(initial?.featured_on_homepage || false);

  // ── Section 8: Form Builder
  const parseFormFields = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(f => ({ id: uid(), ...f }));
    try { return JSON.parse(raw).map(f => ({ id: uid(), ...f })); } catch { return []; }
  };
  const [formFields, setFormFields] = useState(() => parseFormFields(initial?.form_fields));

  // ── Preview
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const buildPayload = (overrideStatus) => ({
    title,
    summary,
    description,
    requirements: JSON.stringify(requirements.map(r => r.value)),
    type: JSON.stringify(type),
    category: category[0] || '',
    status: (overrideStatus || status[0] || 'draft').toLowerCase(),
    featured,
    location_type: locationType[0] || 'Remote',
    location: locationType.includes('Remote') && !locationType.includes('Hybrid') && !locationType.includes('On-site') ? '' : location,
    duration: duration[0] || '',
    weekly_commitment: weeklyCommit[0] || '',
    positions: positions ? parseInt(positions) : null,
    deadline: deadline || null,
    start_date: startDate || null,
    responsibilities: JSON.stringify(responsibilities.map(r => r.value)),
    benefits: JSON.stringify(benefits.map(b => b.value)),
    skills,
    form_fields: formFields.map(({ id, ...rest }) => rest),
    publish_immediately: publishNow,
    accept_applications: acceptApps,
    show_on_website: showOnSite,
    featured_on_homepage: featuredHome,
  });

  const handleSubmit = async (e, overrideStatus) => {
    if (e) e.preventDefault();
    if (!title.trim()) { alert('Please enter an opportunity title.'); return; }
    setSaving(true);
    try {
      await onSave(buildPayload(overrideStatus));
    } finally {
      setSaving(false);
    }
  };

  const showLocation = locationType.includes('Hybrid') || locationType.includes('On-site');

  const previewData = {
    title, summary, description,
    type, category: category[0], location_type: locationType[0], location,
    duration: duration[0], weekly_commitment: weeklyCommit[0],
    requirements, responsibilities, benefits, skills,
    status: status[0], positions, deadline, start_date: startDate, featured
  };

  return (
    <div className="opp-form-page">
      {/* Header */}
      <div className="opp-form-header">
        <button type="button" className="opp-back-btn" onClick={onCancel}>
          <ArrowLeft size={18} /> Back
        </button>
        <div>
          <h1 className="opp-form-title">{isEdit ? 'Edit Opportunity' : 'Create Opportunity'}</h1>
          <p className="opp-form-subtitle">Build a compelling opportunity to attract the right contributors</p>
        </div>
        <div className="opp-form-header-actions">
          <button type="button" className="opp-btn opp-btn-ghost" onClick={() => setShowPreview(p => !p)}>
            <Eye size={16} /> {showPreview ? 'Hide' : 'Preview'}
          </button>
          <button type="button" className="opp-btn opp-btn-secondary" disabled={saving}
            onClick={(e) => handleSubmit(e, 'draft')}>
            <Save size={16} /> Save Draft
          </button>
          <button type="button" className="opp-btn opp-btn-primary" disabled={saving}
            onClick={(e) => handleSubmit(e, 'active')}>
            <Send size={16} /> {saving ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      <div className={`opp-form-body ${showPreview ? 'with-preview' : ''}`}>
        {/* LEFT: Form */}
        <form className="opp-form-main" onSubmit={(e) => handleSubmit(e)}>

          {/* S1: Basic Info */}
          <Section title="Basic Information" icon="📋">
            <div className="opp-field">
              <label className="opp-label">Opportunity Title <span className="required-star">*</span></label>
              <input className="opp-input opp-input-lg" type="text" value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Backend Developer – API Team" required />
            </div>
            <div className="opp-field">
              <label className="opp-label">Short Summary <span className="char-count">{summary.length}/150</span></label>
              <input className="opp-input" type="text" value={summary} maxLength={150}
                onChange={e => setSummary(e.target.value)}
                placeholder="One sentence that sells this opportunity…" />
            </div>
            <div className="opp-field">
              <label className="opp-label">Full Description</label>
              <textarea className="opp-input opp-textarea" rows={6} value={description}
                onChange={e => setDesc(e.target.value)}
                placeholder="Describe the role in detail. What will the person work on? What's the team like?" />
            </div>
            <CheckGroup label="Opportunity Type" options={OPPORTUNITY_TYPES} selected={type} setSelected={setType} />
            <CheckGroup label="Category" options={CATEGORIES} selected={category} setSelected={setCategory} single />
            <CheckGroup label="Status" options={STATUSES} selected={status} setSelected={setStatus} single />
            <Toggle label="Featured Opportunity" desc="Highlight this opportunity with a star badge"
              checked={featured} onChange={setFeatured} />
          </Section>

          {/* S2: Logistics */}
          <Section title="Logistics" icon="📍">
            <CheckGroup label="Location Type" options={LOCATION_TYPES} selected={locationType} setSelected={setLocType} single />
            {showLocation && (
              <div className="opp-field">
                <label className="opp-label">Location</label>
                <input className="opp-input" type="text" value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City, Country or Office Address" />
              </div>
            )}
            <CheckGroup label="Duration" options={DURATIONS} selected={duration} setSelected={setDuration} single />
            <CheckGroup label="Weekly Commitment" options={WEEKLY_COMMITS} selected={weeklyCommit} setSelected={setWeekly} single />
            <div className="opp-grid-2">
              <div className="opp-field">
                <label className="opp-label">Number of Positions (optional)</label>
                <input className="opp-input" type="number" min={1} value={positions}
                  onChange={e => setPositions(e.target.value)} placeholder="e.g. 3" />
              </div>
              <div className="opp-field">
                <label className="opp-label">Application Deadline</label>
                <input className="opp-input" type="date" value={deadline}
                  onChange={e => setDeadline(e.target.value)} />
              </div>
              <div className="opp-field">
                <label className="opp-label">Start Date</label>
                <input className="opp-input" type="date" value={startDate}
                  onChange={e => setStartDate(e.target.value)} />
              </div>
            </div>
          </Section>

          {/* S3: Requirements */}
          <Section title="Requirements" icon="✅">
            <DynamicList
              label="Add a requirement"
              items={requirements}
              setItems={setReqs}
              placeholder="e.g. Basic knowledge of Git"
              icon="✓"
            />
          </Section>

          {/* S4: Responsibilities */}
          <Section title="Responsibilities" icon="📌">
            <DynamicList
              label="Add a responsibility"
              items={responsibilities}
              setItems={setResps}
              placeholder="e.g. Build and maintain REST APIs"
              icon="•"
            />
          </Section>

          {/* S5: Benefits */}
          <Section title="Benefits" icon="🎁">
            <div className="opp-field">
              <label className="opp-label">Select benefits offered</label>
              <div className="check-group">
                {BENEFITS_LIST.map(b => (
                  <button key={b} type="button"
                    className={`check-chip ${selectedBenefits.includes(b) ? 'active' : ''}`}
                    onClick={() => toggleBenefit(b)}>
                    {selectedBenefits.includes(b) && <Check size={11} />} {b}
                  </button>
                ))}
              </div>
            </div>
            <DynamicList
              label="Or add a custom benefit"
              items={benefits.filter(b => !BENEFITS_LIST.includes(b.value))}
              setItems={(updater) => {
                const custom = typeof updater === 'function' ? updater(benefits.filter(b => !BENEFITS_LIST.includes(b.value))) : updater;
                setBenefits([...benefits.filter(b => BENEFITS_LIST.includes(b.value)), ...custom]);
              }}
              placeholder="e.g. Remote work stipend"
              icon="+"
            />
          </Section>

          {/* S6: Skills */}
          <Section title="Skills" icon="🛠">
            <TagsInput
              label="Required / Preferred Skills"
              selected={skills}
              setSelected={setSkills}
              suggestions={SKILL_SUGGESTIONS}
            />
          </Section>

          {/* S7: Visibility */}
          <Section title="Visibility" icon="👁">
            <div className="toggles-stack">
              <Toggle label="Publish Immediately" desc="Make this opportunity live right away"
                checked={publishNow} onChange={setPublishNow} />
              <Toggle label="Accept Applications" desc="Allow people to apply through the website"
                checked={acceptApps} onChange={setAcceptApps} />
              <Toggle label="Show on Public Website" desc="Visible on veroseven.netlify.app/opportunities"
                checked={showOnSite} onChange={setShowOnSite} />
              <Toggle label="Featured on Homepage" desc="Pin this opportunity to the homepage hero"
                checked={featuredHome} onChange={setFeaturedHome} />
            </div>
          </Section>

          {/* S8: Form Builder */}
          <Section title="Application Form Builder" icon="📝" defaultOpen={false}>
            <p className="opp-hint">Build the form that applicants will fill out. Drag fields to reorder.</p>
            <FormBuilder fields={formFields} setFields={setFormFields} />
          </Section>

          {/* Bottom Actions */}
          <div className="opp-form-footer">
            <button type="button" className="opp-btn opp-btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="button" className="opp-btn opp-btn-secondary" disabled={saving}
              onClick={(e) => handleSubmit(e, 'draft')}>
              <Save size={16} /> Save Draft
            </button>
            <button type="button" className="opp-btn opp-btn-primary" disabled={saving}
              onClick={(e) => handleSubmit(e, 'active')}>
              <Send size={16} /> {saving ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>

        {/* RIGHT: Preview */}
        {showPreview && (
          <div className="opp-preview-panel">
            <div className="preview-panel-header">
              <Eye size={16} /> Live Preview
            </div>
            <LivePreview data={previewData} />
          </div>
        )}
      </div>
    </div>
  );
}
