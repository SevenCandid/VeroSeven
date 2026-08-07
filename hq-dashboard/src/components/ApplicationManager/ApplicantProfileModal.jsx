import React, { useState } from 'react';
import {
  X, Mail, Phone, MapPin, Briefcase, Calendar, Clock,
  ExternalLink, FileText, CheckCircle2, AlertCircle,
  Save, Sparkles, User, MessageSquare, History, Award, Check
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
  onSaveNotes
}) {
  if (!application) return null;

  const [currentStatus, setCurrentStatus] = useState((application.status || 'submitted').toLowerCase());
  const [internalNotes, setInternalNotes] = useState(application.internal_notes || '');
  const [statusNote, setStatusNote] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'timeline'

  const history = Array.isArray(application.status_history) ? application.status_history : [];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(application.id, newStatus, statusNote || `Status changed to ${newStatus}`);
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

  const stage = STAGE_COLORS[currentStatus] || STAGE_COLORS.submitted;

  // Normalize custom form data
  const customData = application.form_data && typeof application.form_data === 'object' ? application.form_data : {};
  const customEntries = Object.entries(customData).filter(([key]) => {
    return !['name', 'full_name', 'email', 'phone', 'phone_number', 'motivation', 'background', 'skills', 'areas_of_contribution', 'availability'].includes(key);
  });

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
            className={`modal-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <History size={15} />
            <span>Status Timeline ({history.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="applicant-modal-body">
          {activeTab === 'profile' ? (
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
                        <span>Portfolio / GitHub</span>
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

                {/* Background & Statement */}
                <div className="dossier-section-card">
                  <h4 className="dossier-section-title">Motivation & Statement</h4>
                  <p className="dossier-text-block">
                    {application.motivation || application.statement || 'No statement provided.'}
                  </p>
                </div>

                {/* Skills & Contribution */}
                <div className="dossier-section-card">
                  <h4 className="dossier-section-title">Skills & Areas of Contribution</h4>
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
                  {application.background && (
                    <div className="dossier-field-group">
                      <span className="field-subtitle">Professional Background:</span>
                      <p className="dossier-text-block">{application.background}</p>
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
                    <h4 className="dossier-section-title">Additional Submitted Information</h4>
                    <div className="custom-fields-grid">
                      {customEntries.map(([key, val]) => (
                        <div key={key} className="custom-field-item">
                          <span className="custom-field-label">{key.replace(/_/g, ' ')}</span>
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
                    placeholder="Add internal evaluation feedback, interview feedback, rating, team allocation notes..."
                    rows={7}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* TIMELINE VIEW */
            <div className="applicant-timeline-view">
              <h4 className="timeline-heading">Status Transition Log</h4>
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
                              {cfg.label}
                            </span>
                            <span className="timeline-time">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                            </span>
                          </div>
                          {entry.note && (
                            <p className="timeline-note">{entry.note}</p>
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
