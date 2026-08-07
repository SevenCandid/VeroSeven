import React, { useState } from 'react';
import {
  X, Mail, Phone, MapPin, Briefcase, Calendar, Clock,
  ExternalLink, FileText, CheckCircle2, AlertCircle,
  Save, Sparkles, User, MessageSquare, History, Award, Check,
  Send, School, GraduationCap, ChevronRight
} from 'lucide-react';
import './ApplicantProfileModal.css';

const STAGE_COLORS = {
  submitted: { label: 'Submitted', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
  under_review: { label: 'Under Review', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  shortlisted: { label: 'Shortlisted', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.3)' },
  interview: { label: 'Interview', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)', border: 'rgba(129, 140, 248, 0.3)' },
  accepted: { label: 'Accepted', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)' },
  rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.3)' }
};

export default function ApplicantProfileModal({
  application,
  onClose,
  onUpdateStatus,
  onSaveNotes,
  onSendNotification
}) {
  if (!application) return null;

  const [currentStatus, setCurrentStatus] = useState((application.status || 'submitted').toLowerCase());
  const [internalNotes, setInternalNotes] = useState(application.internal_notes || '');
  const [statusNote, setStatusNote] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'messaging', 'timeline'

  // Notification tab states
  const [notifySubject, setNotifySubject] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyStage, setNotifyStage] = useState('');
  const [isSendingNotify, setIsSendingNotify] = useState(false);

  const history = Array.isArray(application.status_history) ? application.status_history : [];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(application.id, newStatus, statusNote || `Stage shifted to ${newStatus.replace('_', ' ').toUpperCase()}`);
      setCurrentStatus(newStatus);
      setStatusNote('');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveInternalNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onSaveNotes(application.id, internalNotes);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Quick email notification templates
  const applyEmailTemplate = (templateType) => {
    const name = application.full_name || 'Candidate';
    const role = application.opportunity_title || 'Opportunity';

    if (templateType === 'accepted') {
      setNotifySubject(`Congratulations! Your application for ${role} at VeroSeven`);
      setNotifyMessage(
`Dear ${name},

We are thrilled to inform you that your application for ${role} at VeroSeven has been ACCEPTED!

Our team was thoroughly impressed by your background and motivation. We are excited to welcome you aboard to collaborate on building authentic innovation.

Next Steps:
1. Please confirm your acceptance by replying to this email.
2. Our onboarding coordinator will share the project repository access and communication channels.

Welcome to the team!

Warm regards,
VeroSeven Recruitment & Leadership Team`
      );
      setNotifyStage('accepted');
    } else if (templateType === 'interview') {
      setNotifySubject(`Invitation to Interview: ${role} at VeroSeven`);
      setNotifyMessage(
`Dear ${name},

Thank you for your application for ${role} at VeroSeven.

We would like to invite you for a virtual interview session to discuss your background, technical interests, and how we can work together.

Please let us know your availability over the next few days (including your timezone) or pick a convenient slot.

We look forward to speaking with you!

Best regards,
VeroSeven Technical Team`
      );
      setNotifyStage('interview');
    } else if (templateType === 'under_review') {
      setNotifySubject(`Update: Your application for ${role} is Under Review`);
      setNotifyMessage(
`Dear ${name},

Thank you for applying for ${role} at VeroSeven.

This is a quick note to confirm that our technical review team is actively evaluating your dossier. We aim to complete evaluations shortly and will follow up with next steps.

Thank you for your interest and patience.

Best regards,
VeroSeven Recruitment Team`
      );
      setNotifyStage('under_review');
    } else if (templateType === 'rejected') {
      setNotifySubject(`Update on your application for ${role} — VeroSeven`);
      setNotifyMessage(
`Dear ${name},

Thank you for taking the time to apply for ${role} at VeroSeven.

After careful review, we regret to inform you that we will not be moving forward with your application for this specific role at this time. We received many strong applications and had to make difficult decisions.

We encourage you to stay connected and explore future openings on our opportunities board.

We wish you all the best in your career endeavors!

Warm regards,
VeroSeven Team`
      );
      setNotifyStage('rejected');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifySubject.trim() || !notifyMessage.trim()) return;
    if (!onSendNotification) return;

    setIsSendingNotify(true);
    try {
      const success = await onSendNotification(application.id, notifySubject, notifyMessage, notifyStage || null);
      if (success) {
        if (notifyStage) setCurrentStatus(notifyStage);
        setNotifySubject('');
        setNotifyMessage('');
        setNotifyStage('');
        setActiveTab('timeline');
      }
    } finally {
      setIsSendingNotify(false);
    }
  };

  const stage = STAGE_COLORS[currentStatus] || STAGE_COLORS.submitted;

  // Custom Form Data Entries
  const customData = application.form_data && typeof application.form_data === 'object' ? application.form_data : {};
  const standardKeys = [
    'name', 'full_name', 'email', 'phone', 'phone_number', 'location',
    'education', 'current_role', 'institution', 'skills', 'areas_of_contribution',
    'availability', 'experience_level', 'portfolio_url', 'resume_url',
    'motivation', 'agreement_confirmed', 'portfolio', 'resume', 'cv', 'github', 'linkedin'
  ];
  const customEntries = Object.entries(customData).filter(([key]) => !standardKeys.includes(key));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="applicant-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="applicant-modal-header">
          <div className="applicant-header-main">
            <div className="applicant-avatar">
              {(application.full_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="applicant-name-block">
              <div className="applicant-title-row">
                <h2>{application.full_name || 'Applicant'}</h2>
                <span
                  className="applicant-status-badge"
                  style={{
                    color: stage.color,
                    background: stage.bg,
                    borderColor: stage.border
                  }}
                >
                  {stage.label}
                </span>
                <span className="applicant-ref-tag">
                  REF: VS-APP-{String(application.id).padStart(5, '0')}
                </span>
              </div>
              <p className="applicant-opp-title">
                Applied for: <strong>{application.opportunity_title || 'General Opportunity'}</strong>
              </p>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="applicant-modal-tabs">
          <button
            className={`modal-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={15} />
            <span>Candidate Dossier</span>
          </button>
          <button
            className={`modal-tab-btn ${activeTab === 'messaging' ? 'active' : ''}`}
            onClick={() => setActiveTab('messaging')}
          >
            <Send size={15} />
            <span>Candidate Messaging</span>
          </button>
          <button
            className={`modal-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <History size={15} />
            <span>Status Timeline ({history.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="applicant-modal-body">
          {activeTab === 'profile' && (
            <div className="applicant-dossier-grid">
              {/* Left Column: Details */}
              <div className="dossier-left-col">
                {/* Contact & Basics Card */}
                <div className="dossier-section-card">
                  <h4 className="dossier-section-title">Contact & Basic Information</h4>
                  <div className="dossier-contact-list">
                    {application.email && (
                      <div className="dossier-contact-item">
                        <Mail size={15} />
                        <a href={`mailto:${application.email}`} className="contact-link">{application.email}</a>
                      </div>
                    )}
                    {application.phone_number && (
                      <div className="dossier-contact-item">
                        <Phone size={15} />
                        <a href={`tel:${application.phone_number}`} className="contact-link">{application.phone_number}</a>
                      </div>
                    )}
                    {application.location && (
                      <div className="dossier-contact-item">
                        <MapPin size={15} />
                        <span>{application.location}</span>
                      </div>
                    )}
                    {application.occupation && (
                      <div className="dossier-contact-item">
                        <Briefcase size={15} />
                        <span>{application.occupation}</span>
                      </div>
                    )}
                    <div className="dossier-contact-item">
                      <Calendar size={15} />
                      <span>Applied: {new Date(application.created_at || Date.now()).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Links & Attachments */}
                  <div className="dossier-links-row">
                    {application.portfolio_url && (
                      <a
                        href={application.portfolio_url.startsWith('http') ? application.portfolio_url : `https://${application.portfolio_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-dossier-link"
                      >
                        <ExternalLink size={14} />
                        <span>Portfolio / Profiles</span>
                      </a>
                    )}
                    {application.resume_url && (
                      <a
                        href={application.resume_url.startsWith('http') ? application.resume_url : `https://${application.resume_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-dossier-link"
                      >
                        <FileText size={14} />
                        <span>View Resume / CV</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Professional & Education Card */}
                {(application.experience_level || application.education || application.current_role || application.institution) && (
                  <div className="dossier-section-card">
                    <h4 className="dossier-section-title">Professional & Education Background</h4>
                    <div className="dossier-meta-grid">
                      {application.experience_level && (
                        <div className="dossier-meta-box">
                          <span className="meta-box-label">Experience Level</span>
                          <span className="meta-box-val">{application.experience_level}</span>
                        </div>
                      )}
                      {application.education && (
                        <div className="dossier-meta-box">
                          <span className="meta-box-label">Education</span>
                          <span className="meta-box-val">{application.education}</span>
                        </div>
                      )}
                      {application.current_role && (
                        <div className="dossier-meta-box">
                          <span className="meta-box-label">Current Role</span>
                          <span className="meta-box-val">{application.current_role}</span>
                        </div>
                      )}
                      {application.institution && (
                        <div className="dossier-meta-box">
                          <span className="meta-box-label">Institution / Org</span>
                          <span className="meta-box-val">{application.institution}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Background & Motivation */}
                <div className="dossier-section-card">
                  <h4 className="dossier-section-title">Motivation & Statement</h4>
                  <p className="dossier-text-block">
                    {application.motivation || application.statement || 'No statement provided.'}
                  </p>
                </div>

                {/* Skills & Contribution */}
                <div className="dossier-section-card">
                  <h4 className="dossier-section-title">Skills & Availability</h4>
                  {application.skills && (
                    <div className="dossier-field-group">
                      <span className="field-subtitle">Skills & Technologies:</span>
                      <p className="dossier-text-block">{application.skills}</p>
                    </div>
                  )}
                  {application.areas_of_contribution && (
                    <div className="dossier-field-group">
                      <span className="field-subtitle">Areas of Contribution:</span>
                      <p className="dossier-text-block">{application.areas_of_contribution}</p>
                    </div>
                  )}
                  {application.availability && (
                    <div className="dossier-field-group">
                      <span className="field-subtitle">Availability & Commitment:</span>
                      <p className="dossier-text-block">{application.availability}</p>
                    </div>
                  )}
                </div>

                {/* Custom Form Fields if any */}
                {customEntries.length > 0 && (
                  <div className="dossier-section-card">
                    <h4 className="dossier-section-title">Opportunity-Specific Responses</h4>
                    <div className="custom-fields-grid">
                      {customEntries.map(([key, val]) => (
                        <div key={key} className="custom-field-item">
                          <span className="custom-field-label">{key.replace(/^custom_\d+_/, '').replace(/_/g, ' ')}</span>
                          <span className="custom-field-value">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Stage Pipeline & Admin Notes */}
              <div className="dossier-right-col">
                {/* Pipeline Progression Card */}
                <div className="dossier-section-card">
                  <h4 className="dossier-section-title">Candidate Pipeline Stage</h4>
                  <div className="pipeline-steps-list">
                    {['submitted', 'under_review', 'shortlisted', 'interview', 'accepted', 'rejected'].map(stKey => {
                      const cfg = STAGE_COLORS[stKey];
                      const isCurrent = currentStatus === stKey;
                      return (
                        <button
                          key={stKey}
                          type="button"
                          className={`pipeline-step-btn ${isCurrent ? 'active' : ''}`}
                          onClick={() => handleStatusChange(stKey)}
                          disabled={isUpdatingStatus}
                          style={{
                            borderColor: isCurrent ? cfg.color : 'rgba(255, 255, 255, 0.08)',
                            background: isCurrent ? cfg.bg : 'rgba(255, 255, 255, 0.02)'
                          }}
                        >
                          <div className="pipeline-btn-icon" style={{ color: cfg.color }}>
                            {isCurrent ? <Check size={16} /> : <div className="step-circle" />}
                          </div>
                          <span className="pipeline-btn-text" style={{ color: isCurrent ? cfg.color : '#cbd5e1' }}>
                            {cfg.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Note for stage change */}
                  <div className="stage-change-note-box">
                    <input
                      type="text"
                      className="stage-note-input"
                      placeholder="Optional note for status change..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                    />
                  </div>
                </div>

                {/* Internal Admin Review Notes */}
                <div className="dossier-section-card">
                  <div className="notes-header-row">
                    <h4 className="dossier-section-title">
                      <MessageSquare size={15} />
                      Internal Review Notes
                    </h4>
                    <button
                      type="button"
                      className="btn-save-notes"
                      onClick={handleSaveInternalNotes}
                      disabled={isSavingNotes}
                    >
                      <Save size={13} />
                      <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
                    </button>
                  </div>
                  <textarea
                    className="internal-notes-textarea"
                    placeholder="Add internal evaluation feedback, interview notes, team allocation remarks..."
                    rows={6}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* CANDIDATE MESSAGING TAB */}
          {activeTab === 'messaging' && (
            <div className="applicant-messaging-container">
              <div className="messaging-header-info">
                <h4>Send Notification to {application.full_name}</h4>
                <p>Email: <a href={`mailto:${application.email}`}>{application.email}</a></p>
              </div>

              {/* Template Selectors */}
              <div className="template-selectors-row">
                <span className="template-label">Quick Templates:</span>
                <button type="button" className="btn-template green" onClick={() => applyEmailTemplate('accepted')}>
                  ✓ Acceptance Letter
                </button>
                <button type="button" className="btn-template indigo" onClick={() => applyEmailTemplate('interview')}>
                  🗓️ Interview Invite
                </button>
                <button type="button" className="btn-template yellow" onClick={() => applyEmailTemplate('under_review')}>
                  ⏳ Under Review Note
                </button>
                <button type="button" className="btn-template red" onClick={() => applyEmailTemplate('rejected')}>
                  ✕ Rejection Courtesy
                </button>
              </div>

              {/* Message Form */}
              <form onSubmit={handleSendNotification} className="notify-composer-form">
                <div className="form-group-notify">
                  <label>Email Subject:</label>
                  <input
                    type="text"
                    className="notify-input"
                    placeholder="e.g. Update regarding your VeroSeven Application..."
                    value={notifySubject}
                    onChange={(e) => setNotifySubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-notify">
                  <label>Message Content:</label>
                  <textarea
                    className="notify-textarea"
                    placeholder="Write your email body message here..."
                    rows={8}
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="notify-actions-bar">
                  <div className="stage-sync-option">
                    <label>Also update status to:</label>
                    <select
                      value={notifyStage}
                      onChange={(e) => setNotifyStage(e.target.value)}
                      className="notify-stage-select"
                    >
                      <option value="">-- Keep Current Status ({currentStatus}) --</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn-send-notify"
                    disabled={isSendingNotify || !notifySubject || !notifyMessage}
                  >
                    <Send size={15} />
                    <span>{isSendingNotify ? 'Dispatching...' : 'Dispatch Message & Log'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="applicant-timeline-view">
              <h4 className="timeline-heading">Status & Communication History</h4>
              {history.length === 0 ? (
                <div className="timeline-empty">
                  <Clock size={28} />
                  <p>No transition history recorded for this application yet.</p>
                </div>
              ) : (
                <div className="timeline-track">
                  {history.map((entry, idx) => {
                    const cfg = STAGE_COLORS[(entry.status || 'submitted').toLowerCase()] || STAGE_COLORS.submitted;
                    return (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-dot" style={{ background: cfg.color, borderColor: cfg.bg }} />
                        <div className="timeline-content">
                          <div className="timeline-title-row">
                            <span className="timeline-status-label" style={{ color: cfg.color }}>
                              {entry.type === 'notification_sent' ? '📧 Notification Dispatched' : cfg.label}
                            </span>
                            <span className="timeline-time">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                            </span>
                          </div>
                          {entry.note && (
                            <p className="timeline-note">{entry.note}</p>
                          )}
                          {entry.notification && (
                            <div className="timeline-notification-preview">
                              <strong>Subject: {entry.notification.subject}</strong>
                              <pre>{entry.notification.message}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
