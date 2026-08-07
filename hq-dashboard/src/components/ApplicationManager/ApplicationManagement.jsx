import React, { useState, useMemo } from 'react';
import {
  Users, Search, Filter, Kanban, Table as TableIcon,
  ChevronRight, Calendar, Mail, Phone, MapPin, Briefcase,
  FileText, ExternalLink, Trash2, CheckCircle2, Clock,
  Eye, Check, X, ShieldAlert, ArrowUpDown, ChevronDown, Sparkles
} from 'lucide-react';
import ApplicantProfileModal from './ApplicantProfileModal';
import './ApplicationManagement.css';

const STAGES = [
  { id: 'submitted', label: 'Submitted', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.25)' },
  { id: 'under_review', label: 'Under Review', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)' },
  { id: 'shortlisted', label: 'Shortlisted', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.12)', border: 'rgba(192, 132, 252, 0.25)' },
  { id: 'interview', label: 'Interview', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)', border: 'rgba(129, 140, 248, 0.25)' },
  { id: 'accepted', label: 'Accepted', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.25)' },
  { id: 'rejected', label: 'Rejected', color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.25)' }
];

export default function ApplicationManagement({
  applications = [],
  opportunities = [],
  loading = false,
  selectedOppFilter = 'all',
  onOppFilterChange,
  onUpdateStatus,
  onSaveNotes,
  onSendNotification,
  onDeleteApplication
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [appToDelete, setAppToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = applications.length;
    const submitted = applications.filter(a => (a.status || 'submitted').toLowerCase() === 'submitted').length;
    const review = applications.filter(a => (a.status || '').toLowerCase() === 'under_review').length;
    const shortlisted = applications.filter(a => (a.status || '').toLowerCase() === 'shortlisted').length;
    const interview = applications.filter(a => (a.status || '').toLowerCase() === 'interview').length;
    const accepted = applications.filter(a => (a.status || '').toLowerCase() === 'accepted').length;
    const rejected = applications.filter(a => (a.status || '').toLowerCase() === 'rejected').length;
    return { total, submitted, review, shortlisted, interview, accepted, rejected };
  }, [applications]);

  // Filtered and Sorted Applications
  const filteredApps = useMemo(() => {
    let list = [...applications];

    // Opportunity Filter
    if (selectedOppFilter && selectedOppFilter !== 'all') {
      list = list.filter(a => String(a.opportunity_id) === String(selectedOppFilter));
    }

    // Stage Filter
    if (stageFilter !== 'all') {
      list = list.filter(a => (a.status || 'submitted').toLowerCase() === stageFilter.toLowerCase());
    }

    // Keyword Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a => {
        const name = (a.full_name || '').toLowerCase();
        const email = (a.email || '').toLowerCase();
        const phone = (a.phone_number || '').toLowerCase();
        const occ = (a.occupation || '').toLowerCase();
        const loc = (a.location || '').toLowerCase();
        const skills = (a.skills || '').toLowerCase();
        const opp = (a.opportunity_title || '').toLowerCase();
        const bg = (a.background || '').toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q) || occ.includes(q) || loc.includes(q) || skills.includes(q) || opp.includes(q) || bg.includes(q);
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'name_asc') {
        return (a.full_name || '').localeCompare(b.full_name || '');
      }
      return 0;
    });

    return list;
  }, [applications, selectedOppFilter, stageFilter, searchQuery, sortBy]);

  // Group applications by stage for Kanban
  const stageGroups = useMemo(() => {
    const map = {};
    STAGES.forEach(s => {
      map[s.id] = [];
    });
    filteredApps.forEach(app => {
      const st = (app.status || 'submitted').toLowerCase();
      if (map[st]) {
        map[st].push(app);
      } else {
        map['submitted'].push(app);
      }
    });
    return map;
  }, [filteredApps]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStageFilter('all');
    if (onOppFilterChange) onOppFilterChange('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery !== '' || stageFilter !== 'all' || (selectedOppFilter && selectedOppFilter !== 'all') || sortBy !== 'newest';

  const confirmDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteApplication(appToDelete.id);
      setAppToDelete(null);
      if (selectedApplicant && selectedApplicant.id === appToDelete.id) {
        setSelectedApplicant(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickStatusChange = async (appId, newStatus) => {
    if (selectedApplicant && String(selectedApplicant.id) === String(appId)) {
      setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
    }
    await onUpdateStatus(appId, newStatus, `Stage shifted to ${newStatus}`);
  };

  // Sync selectedApplicant if data updates
  const activeModalApplicant = useMemo(() => {
    if (!selectedApplicant) return null;
    return applications.find(a => String(a.id) === String(selectedApplicant.id)) || selectedApplicant;
  }, [selectedApplicant, applications]);

  return (
    <div className="app-mgmt-container">
      {/* Header & Metrics */}
      <div className="app-mgmt-header">
        <div className="app-mgmt-title-row">
          <div>
            <h2 className="app-mgmt-heading">Candidate Application Pipeline</h2>
            <p className="app-mgmt-subheading">
              Track candidate submissions, manage pipeline stages, review dossiers, and coordinate technical recruitments.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="app-metrics-grid">
          <div className="app-metric-card" onClick={() => { setStageFilter('all'); if (onOppFilterChange) onOppFilterChange('all'); }}>
            <div className="metric-icon-box" style={{ background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' }}>
              <Users size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Candidates</span>
              <span className="metric-number">{stats.total}</span>
            </div>
          </div>

          <div className="app-metric-card" onClick={() => setStageFilter('submitted')}>
            <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
              <Clock size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Submitted</span>
              <span className="metric-number">{stats.submitted}</span>
            </div>
          </div>

          <div className="app-metric-card" onClick={() => setStageFilter('under_review')}>
            <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
              <Eye size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Under Review</span>
              <span className="metric-number">{stats.review}</span>
            </div>
          </div>

          <div className="app-metric-card" onClick={() => setStageFilter('shortlisted')}>
            <div className="metric-icon-box" style={{ background: 'rgba(192, 132, 252, 0.1)', color: '#c084fc' }}>
              <Sparkles size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Shortlisted</span>
              <span className="metric-number">{stats.shortlisted}</span>
            </div>
          </div>

          <div className="app-metric-card" onClick={() => setStageFilter('interview')}>
            <div className="metric-icon-box" style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8' }}>
              <Briefcase size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Interview</span>
              <span className="metric-number">{stats.interview}</span>
            </div>
          </div>

          <div className="app-metric-card" onClick={() => setStageFilter('accepted')}>
            <div className="metric-icon-box" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Accepted</span>
              <span className="metric-number">{stats.accepted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="app-controls-panel">
        <div className="app-search-box">
          <Search size={16} className="app-search-icon" />
          <input
            type="text"
            className="app-search-input"
            placeholder="Search candidates by name, email, role, skills, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="app-search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="app-filters-row">
          {/* Opportunity Selector */}
          <div className="filter-group" style={{ minWidth: 200 }}>
            <select
              className="app-filter-select"
              value={selectedOppFilter || 'all'}
              onChange={(e) => onOppFilterChange && onOppFilterChange(e.target.value)}
            >
              <option value="all">All Opportunities</option>
              {opportunities.map(opp => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} ({opp.application_count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="filter-group">
            <select
              className="app-filter-select"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="all">All Stages</option>
              {STAGES.map(st => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <select
              className="app-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest Submissions</option>
              <option value="oldest">Oldest Submissions</option>
              <option value="name_asc">Candidate Name A–Z</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="btn-reset-filters" onClick={handleResetFilters}>
              <X size={14} />
              <span>Reset</span>
            </button>
          )}

          {/* View Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
            >
              <Kanban size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="app-results-info">
        <span>Showing <strong>{filteredApps.length}</strong> {filteredApps.length === 1 ? 'candidate' : 'candidates'}</span>
        {selectedOppFilter && selectedOppFilter !== 'all' && (
          <span className="opp-filter-tag">
            Opp: {opportunities.find(o => String(o.id) === String(selectedOppFilter))?.title || 'Selected'}
          </span>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="app-loading-state">
          <div className="spinner" />
          <p>Loading candidate applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="app-empty-state">
          <div className="empty-icon-box">
            <Users size={32} />
          </div>
          <h3>No applications found</h3>
          <p>
            {hasActiveFilters
              ? 'No candidate applications match your current filters. Try resetting search or opportunity filters.'
              : 'No candidates have applied to this opportunity yet.'}
          </p>
          {hasActiveFilters && (
            <button className="btn-secondary" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN PIPELINE VIEW */
        <div className="kanban-pipeline-board">
          {STAGES.map(stage => {
            const list = stageGroups[stage.id] || [];
            return (
              <div key={stage.id} className="kanban-column">
                {/* Column Header */}
                <div className="kanban-col-header" style={{ borderTopColor: stage.color }}>
                  <div className="col-header-left">
                    <span className="col-stage-dot" style={{ background: stage.color }} />
                    <span className="col-stage-title">{stage.label}</span>
                  </div>
                  <span className="col-stage-count" style={{ background: stage.bg, color: stage.color }}>
                    {list.length}
                  </span>
                </div>

                {/* Column Body / Candidate Cards */}
                <div className="kanban-col-cards">
                  {list.length === 0 ? (
                    <div className="kanban-col-empty">
                      <span>No candidates in {stage.label}</span>
                    </div>
                  ) : (
                    list.map(app => (
                      <div
                        key={app.id}
                        className="kanban-card"
                        onClick={() => setSelectedApplicant(app)}
                      >
                        <div className="kanban-card-top">
                          <div className="card-applicant-name">
                            <strong>{app.full_name || 'Applicant'}</strong>
                            {app.occupation && (
                              <span className="card-applicant-role">{app.occupation}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="btn-card-del"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAppToDelete(app);
                            }}
                            title="Delete Application"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Opportunity Tag */}
                        <div className="card-opp-badge">
                          <Briefcase size={12} />
                          <span>{app.opportunity_title || 'General Application'}</span>
                        </div>

                        {/* Contact Meta */}
                        <div className="card-meta-row">
                          {app.location && (
                            <span className="card-meta-item">
                              <MapPin size={11} />
                              {app.location}
                            </span>
                          )}
                          <span className="card-meta-item">
                            <Calendar size={11} />
                            {new Date(app.created_at || Date.now()).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Skills Snippet */}
                        {app.skills && (
                          <div className="card-skills-snippet">
                            <span>🛠 {app.skills.slice(0, 45)}{app.skills.length > 45 ? '...' : ''}</span>
                          </div>
                        )}

                        {/* Card Bottom Quick Stage Selector */}
                        <div className="kanban-card-footer" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={(app.status || 'submitted').toLowerCase()}
                            onChange={(e) => handleQuickStatusChange(app.id, e.target.value)}
                            className="card-stage-select"
                          >
                            {STAGES.map(st => (
                              <option key={st.id} value={st.id}>Move: {st.label}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn-view-dossier"
                            onClick={() => setSelectedApplicant(app)}
                          >
                            <Eye size={12} />
                            <span>Dossier</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="app-table-wrapper">
          <table className="app-data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Opportunity</th>
                <th>Stage</th>
                <th>Contact</th>
                <th>Applied Date</th>
                <th>Links</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => {
                const stConfig = STAGES.find(s => s.id === (app.status || 'submitted').toLowerCase()) || STAGES[0];
                return (
                  <tr key={app.id}>
                    {/* Candidate */}
                    <td>
                      <div className="table-candidate-cell" onClick={() => setSelectedApplicant(app)}>
                        <div className="table-avatar">
                          {(app.full_name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong className="table-name-link">{app.full_name || 'Applicant'}</strong>
                          {app.occupation && (
                            <div className="table-role-sub">{app.occupation}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Opportunity */}
                    <td>
                      <div className="table-opp-title">
                        {app.opportunity_title || 'General Application'}
                      </div>
                    </td>

                    {/* Stage with changer */}
                    <td>
                      <select
                        value={(app.status || 'submitted').toLowerCase()}
                        onChange={(e) => handleQuickStatusChange(app.id, e.target.value)}
                        className="table-stage-select"
                        style={{ color: stConfig.color, borderColor: stConfig.border }}
                      >
                        {STAGES.map(st => (
                          <option key={st.id} value={st.id}>{st.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Contact */}
                    <td>
                      <div className="table-contact-cell">
                        {app.email && (
                          <a href={`mailto:${app.email}`} className="table-contact-link" title={app.email}>
                            <Mail size={13} />
                            <span>{app.email}</span>
                          </a>
                        )}
                        {app.phone_number && (
                          <span className="table-phone-sub">
                            <Phone size={11} /> {app.phone_number}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td>
                      <span className="table-date-cell">
                        {new Date(app.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Links */}
                    <td>
                      <div className="table-links-cell">
                        {app.portfolio_url && (
                          <a
                            href={app.portfolio_url.startsWith('http') ? app.portfolio_url : `https://${app.portfolio_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="table-link-btn"
                            title="Portfolio"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                        {app.resume_url && (
                          <a
                            href={app.resume_url.startsWith('http') ? app.resume_url : `https://${app.resume_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="table-link-btn"
                            title="Resume"
                          >
                            <FileText size={13} />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions-cell">
                        <button
                          className="btn-action-icon"
                          onClick={() => setSelectedApplicant(app)}
                          title="View Candidate Dossier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn-action-icon btn-delete"
                          onClick={() => setAppToDelete(app)}
                          title="Delete Application"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicant Profile / Dossier Modal */}
      {activeModalApplicant && (
        <ApplicantProfileModal
          application={activeModalApplicant}
          onClose={() => setSelectedApplicant(null)}
          onUpdateStatus={onUpdateStatus}
          onSaveNotes={onSaveNotes}
          onSendNotification={onSendNotification}
        />
      )}

      {/* Confirmation Modal for Delete Application */}
      {appToDelete && (
        <div className="modal-backdrop">
          <div className="opp-delete-modal">
            <div className="delete-modal-header">
              <div className="delete-warning-icon">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3>Delete Application</h3>
                <p>This action will permanently delete this applicant record.</p>
              </div>
            </div>
            <div className="delete-modal-body">
              <p>
                Are you sure you want to delete the application submitted by <strong>"{appToDelete.full_name}"</strong>?
              </p>
            </div>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setAppToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
