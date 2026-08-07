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

function CategoryMultiSelect({ selected = [], setSelected }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customList, setCustomList] = useState(CATEGORIES);

  const allAvailableCategories = Array.from(new Set([...customList, ...selected]));

  const filteredCategories = allAvailableCategories.filter(cat =>
    cat.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const isExactMatch = allAvailableCategories.some(
    cat => cat.toLowerCase() === searchTerm.trim().toLowerCase()
  );

  const addCategory = (cat) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    if (!selected.includes(trimmed)) {
      setSelected([...selected, trimmed]);
    }
    if (!customList.includes(trimmed)) {
      setCustomList(prev => [...prev, trimmed]);
    }
    setSearchTerm('');
  };

  const removeCategory = (cat) => {
    setSelected(selected.filter(c => c !== cat));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        addCategory(searchTerm.trim());
      }
    }
  };

  return (
    <div className="opp-field category-multi-select-field">
      <div className="category-select-header">
        <label className="opp-label">
          Categories <span className="required-star">*</span>
          <span className="opp-label-sub"> (Select one or multiple areas)</span>
        </label>
        {selected.length > 0 && (
          <button
            type="button"
            className="category-clear-btn"
            onClick={() => setSelected([])}
          >
            Clear all ({selected.length})
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="selected-categories-chips">
          {selected.map(cat => (
            <span key={cat} className="category-chip selected">
              <span className="category-chip-text">{cat}</span>
              <button
                type="button"
                className="category-chip-remove"
                onClick={() => removeCategory(cat)}
                title={`Remove ${cat}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="category-search-bar">
        <input
          type="text"
          className="opp-input category-search-input"
          placeholder="Search categories or type a new custom category & press Enter…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {searchTerm.trim() && !isExactMatch && (
          <button
            type="button"
            className="opp-add-custom-cat-btn"
            onClick={() => addCategory(searchTerm.trim())}
          >
            <Plus size={14} /> Add "{searchTerm.trim()}"
          </button>
        )}
      </div>

      <div className="category-suggestions-wrapper">
        <div className="category-suggestions-title">
          {searchTerm ? 'Matching Categories:' : 'Suggested Categories (Click to select/unselect):'}
        </div>
        <div className="category-suggestions-list">
          {filteredCategories.map(cat => {
            const isSelected = selected.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                className={`category-suggestion-pill ${isSelected ? 'is-selected' : ''}`}
                onClick={() => isSelected ? removeCategory(cat) : addCategory(cat)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (isSelected) removeCategory(cat);
                  else addCategory(cat);
                }}
              >
                {isSelected ? <Check size={12} className="pill-check-icon" /> : <Plus size={12} className="pill-plus-icon" />}
                <span>{cat}</span>
              </button>
            );
          })}
          {filteredCategories.length === 0 && !searchTerm.trim() && (
            <span className="no-categories-hint">No categories found.</span>
          )}
        </div>
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

  // Drag-to-reorder fields
  const dragField = useRef(null);
  const dragOverField = useRef(null);
  const handleFieldDrop = () => {
    const copy = [...fields];
    const dragged = copy.splice(dragField.current, 1)[0];
    copy.splice(dragOverField.current, 0, dragged);
    dragField.current = null; dragOverField.current = null;
    setFields(copy);
  };

  return (
    <div className="opp-field">
      <div className="form-builder-toolbar">
        <span className="toolbar-label">Add Field:</span>
        <div className="field-type-chips">
          {FIELD_TYPES.map(ft => (
            <button key={ft} type="button" className="field-type-chip" onClick={() => addField(ft)}>
              <Plus size={11} /> {ft}
            </button>
          ))}
        </div>
      </div>

      {fields.length === 0 && (
        <div className="empty-fields-notice">
          No custom fields added yet. Default fields (Full Name, Email, Phone, Background, Availability, Motivation) will be used.
        </div>
      )}

      <div className="form-fields-list">
        {fields.map((f, i) => (
          <div key={f.id} className="field-builder-card"
            draggable
            onDragStart={() => { dragField.current = i; }}
            onDragEnter={() => { dragOverField.current = i; }}
            onDragEnd={handleFieldDrop}
            onDragOver={e => e.preventDefault()}
          >
            <div className="field-card-header">
              <div className="field-card-drag"><GripVertical size={14} /></div>
              <span className="field-type-badge">{f.type}</span>
              <input
                type="text"
                className="field-label-input"
                placeholder="Field Label (e.g. GitHub Profile URL)"
                value={f.label}
                onChange={e => updateField(f.id, 'label', e.target.value)}
              />
              <button type="button" className="field-remove-btn" onClick={() => removeField(f.id)}><Trash2 size={14} /></button>
            </div>
            <div className="field-card-body">
              <div className="field-card-row">
                <input
                  type="text"
                  className="opp-input opp-input-sm"
                  placeholder="Placeholder text…"
                  value={f.placeholder}
                  onChange={e => updateField(f.id, 'placeholder', e.target.value)}
                />
                <input
                  type="text"
                  className="opp-input opp-input-sm"
                  placeholder="Help text / description…"
                  value={f.helpText || ''}
                  onChange={e => updateField(f.id, 'helpText', e.target.value)}
                />
              </div>

              {['select','multi-select','checkbox','radio'].includes(f.type) && (
                <div className="field-options-builder">
                  <label className="field-options-label">Options:</label>
                  {(f.options || []).map((opt, oi) => (
                    <div key={oi} className="field-opt-row">
                      <input
                        type="text"
                        className="opp-input opp-input-sm"
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={e => updateOption(f.id, oi, e.target.value)}
                      />
                      <button type="button" className="list-remove-btn" onClick={() => removeOption(f.id, oi)}><X size={12} /></button>
                    </div>
                  ))}
                  <button type="button" className="opp-btn-ghost-sm" onClick={() => addOption(f.id)}>
                    <Plus size={12} /> Add Option
                  </button>
                </div>
              )}

              <div className="field-card-footer">
                <label className="field-req-toggle">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={e => updateField(f.id, 'required', e.target.checked)}
                  />
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
  const { title, summary, description, type, category, categories, location_type, location, duration, weekly_commitment,
    requirements, responsibilities, benefits, skills, areas_of_contribution, status, positions, deadline, start_date, featured } = data;

  const displayCategories = Array.isArray(categories) && categories.length > 0
    ? categories
    : (category ? [category] : []);

  return (
    <div className="live-preview">
      <div className="preview-header">
        {featured && <span className="preview-featured-badge"><Star size={11} /> Featured</span>}
        <div className="preview-type-row">
          {type && type.length > 0 && <span className="preview-tag blue">{Array.isArray(type) ? type[0] : type}</span>}
          {displayCategories.map(cat => (
            <span key={cat} className="preview-tag purple">{cat}</span>
          ))}
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
        {areas_of_contribution && areas_of_contribution.length > 0 && (
          <div className="preview-section">
            <h3>Areas of Contribution</h3>
            <div className="preview-skills">
              {(Array.isArray(areas_of_contribution) ? areas_of_contribution : []).map(s => <span key={s} className="preview-skill">{s}</span>)}
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
  const [categories, setCategories] = useState(() => {
    if (Array.isArray(initial?.categories) && initial.categories.length > 0) {
      return initial.categories;
    }
    if (typeof initial?.categories === 'string') {
      try {
        const parsed = JSON.parse(initial.categories);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    if (initial?.category) {
      return [initial.category];
    }
    return [];
  });
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

  const [areasOfContribution, setAreasOfContribution] = useState(() => {
    const raw = initial?.areas_of_contribution;
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
    categories,
    category: categories[0] || '',
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
    areas_of_contribution: areasOfContribution,
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
    type, category: categories[0] || '', categories, location_type: locationType[0], location,
    duration: duration[0], weekly_commitment: weeklyCommit[0],
    requirements, responsibilities, benefits, skills, areas_of_contribution: areasOfContribution,
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
            <CategoryMultiSelect selected={categories} setSelected={setCategories} />
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
            <div className="opp-field">
              <label className="opp-label">Weekly Commitment</label>
              <div className="check-group">
                {WEEKLY_COMMITS.map(opt => (
                  <button
                    key={opt} type="button"
                    className={`check-chip ${(weeklyCommit[0] || '') === opt ? 'active' : ''}`}
                    onClick={() => setWeekly([opt])}
                  >
                    {(weeklyCommit[0] || '') === opt && <Check size={11} />} {opt}
                  </button>
                ))}
              </div>
              <input className="opp-input" style={{ marginTop: '0.5rem' }} type="text" 
                value={WEEKLY_COMMITS.includes(weeklyCommit[0] || '') ? '' : (weeklyCommit[0] || '')}
                onChange={e => setWeekly([e.target.value])}
                placeholder="Or type a custom commitment (e.g. Flexible)" />
            </div>
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

          <Section title="Areas of Contribution" icon="🎯">
            <TagsInput
              label="Available Areas of Contribution"
              selected={areasOfContribution}
              setSelected={setAreasOfContribution}
              suggestions={['Marketing', 'Design', 'Community Management', 'Content Writing', 'Business Development', 'Strategy', 'Quality Assurance']}
            />
            <div className="field-help" style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
              Add areas of contribution for opportunities that don't require specific technical skills.
            </div>
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
