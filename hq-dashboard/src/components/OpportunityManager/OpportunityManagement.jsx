import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, LayoutGrid, Table as TableIcon,
  Copy, Pencil, Trash2, ExternalLink, Users, Calendar,
  MapPin, Clock, Star, Globe, Archive, CheckCircle2,
  AlertCircle, ChevronLeft, ChevronRight, RotateCcw,
  Sparkles, Check, X, ShieldAlert, ArrowUpDown
} from 'lucide-react';
import './OpportunityManagement.css';

const STATUS_CONFIG = {
  active: { label: 'Active', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)', dot: '#10b981' },
  draft: { label: 'Draft', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', dot: '#f59e0b' },
  closed: { label: 'Closed', bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)', dot: '#94a3b8' },
  archived: { label: 'Archived', bg: 'rgba(168, 85, 247, 0.15)', text: '#d8b4fe', border: 'rgba(168, 85, 247, 0.3)', dot: '#a855f7' }
};

const OPPORTUNITY_TYPES = [
  'Volunteer', 'Internship', 'Paid Internship', 'Part-time', 
  'Full-time', 'Contract', 'Ambassador', 'Open Source'
];

export default function OpportunityManagement({
  opportunities = [],
  loading = false,
  onCreateNew,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
  onViewApplications
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 9 : 12;

  const [oppToDelete, setOppToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract all unique categories dynamically
  const allCategories = useMemo(() => {
    const set = new Set();
    opportunities.forEach(opp => {
      let cats = opp.categories;
      if (typeof cats === 'string') {
        try { cats = JSON.parse(cats); } catch (e) { cats = [cats]; }
      }
      if (Array.isArray(cats)) {
        cats.forEach(c => c && set.add(c));
      } else if (opp.category) {
        set.add(opp.category);
      }
    });
    return Array.from(set).sort();
  }, [opportunities]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = opportunities.length;
    const active = opportunities.filter(o => (o.status || 'draft').toLowerCase() === 'active').length;
    const draft = opportunities.filter(o => (o.status || 'draft').toLowerCase() === 'draft').length;
    const closed = opportunities.filter(o => (o.status || '').toLowerCase() === 'closed').length;
    const archived = opportunities.filter(o => (o.status || '').toLowerCase() === 'archived').length;
    const totalApps = opportunities.reduce((acc, o) => acc + (parseInt(o.application_count, 10) || 0), 0);
    return { total, active, draft, closed, archived, totalApps };
  }, [opportunities]);

  // Filtering & Sorting
  const filteredAndSortedOpps = useMemo(() => {
    let list = [...opportunities];

    // Status Filter
    if (statusFilter !== 'all') {
      list = list.filter(o => (o.status || 'draft').toLowerCase() === statusFilter.toLowerCase());
    }

    // Type Filter
    if (typeFilter !== 'all') {
      list = list.filter(o => {
        if (Array.isArray(o.type)) {
          return o.type.some(t => t.toLowerCase() === typeFilter.toLowerCase());
        }
        return (o.type || '').toLowerCase() === typeFilter.toLowerCase();
      });
    }

    // Category Filter
    if (categoryFilter !== 'all') {
      list = list.filter(o => {
        let cats = o.categories;
        if (typeof cats === 'string') {
          try { cats = JSON.parse(cats); } catch (e) { cats = [cats]; }
        }
        if (!Array.isArray(cats) || cats.length === 0) {
          cats = o.category ? [o.category] : [];
        }
        return cats.includes(categoryFilter);
      });
    }

    // Keyword Search across title, description, categories, requirements, skills
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(o => {
        const title = (o.title || '').toLowerCase();
        const summary = (o.summary || '').toLowerCase();
        const desc = (o.description || '').toLowerCase();
        
        let cats = o.categories;
        if (typeof cats === 'string') {
          try { cats = JSON.parse(cats); } catch (e) { cats = [cats]; }
        }
        const catStr = (Array.isArray(cats) ? cats.join(' ') : (o.category || '')).toLowerCase();

        let reqs = o.requirements;
        if (typeof reqs === 'string') {
          try { reqs = JSON.parse(reqs); } catch (e) { reqs = []; }
        }
        const reqStr = (Array.isArray(reqs) ? reqs.map(r => r.value || r).join(' ') : '').toLowerCase();

        let sk = o.skills;
        if (typeof sk === 'string') {
          try { sk = JSON.parse(sk); } catch (e) { sk = []; }
        }
        const skillStr = (Array.isArray(sk) ? sk.join(' ') : '').toLowerCase();

        return title.includes(q) || summary.includes(q) || desc.includes(q) || catStr.includes(q) || reqStr.includes(q) || skillStr.includes(q);
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'created_desc') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'created_asc') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'deadline_asc') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'deadline_desc') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(b.deadline) - new Date(a.deadline);
      }
      if (sortBy === 'apps_desc') {
        return (parseInt(b.application_count, 10) || 0) - (parseInt(a.application_count, 10) || 0);
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return list;
  }, [opportunities, statusFilter, typeFilter, categoryFilter, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOpps.length / itemsPerPage) || 1;
  const paginatedOpps = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedOpps.slice(start, start + itemsPerPage);
  }, [filteredAndSortedOpps, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    setSortBy('created_desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || typeFilter !== 'all' || categoryFilter !== 'all' || sortBy !== 'created_desc';

  const confirmDelete = async () => {
    if (!oppToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(oppToDelete.id);
      setOppToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDaysRemaining = (deadlineStr) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderStatusBadge = (statusStr) => {
    const s = (statusStr || 'draft').toLowerCase();
    const conf = STATUS_CONFIG[s] || STATUS_CONFIG.draft;
    return (
      <span
        className="opp-status-pill"
        style={{
          background: conf.bg,
          color: conf.text,
          borderColor: conf.border
        }}
      >
        <span className="status-dot" style={{ background: conf.dot }} />
        {conf.label}
      </span>
    );
  };

  return (
    <div className="opp-mgmt-container">
      {/* Header & Metrics */}
      <div className="opp-mgmt-header">
        <div className="opp-mgmt-title-row">
          <div>
            <h2 className="opp-mgmt-heading">Opportunity Management</h2>
            <p className="opp-mgmt-subheading">
              Create, curate, publish, and monitor recruitment opportunities across VeroSeven projects.
            </p>
          </div>
          <button className="btn-create-opp" onClick={onCreateNew}>
            <Plus size={18} />
            <span>Create Opportunity</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="opp-metrics-grid">
          <div className="opp-metric-card" onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>
            <div className="metric-icon-box" style={{ background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' }}>
              <Sparkles size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Opportunities</span>
              <span className="metric-number">{stats.total}</span>
            </div>
          </div>

          <div className="opp-metric-card" onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}>
            <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Active / Live</span>
              <span className="metric-number">{stats.active}</span>
            </div>
          </div>

          <div className="opp-metric-card" onClick={() => { setStatusFilter('draft'); setCurrentPage(1); }}>
            <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
              <Pencil size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Drafts</span>
              <span className="metric-number">{stats.draft}</span>
            </div>
          </div>

          <div className="opp-metric-card" onClick={() => { setStatusFilter('closed'); setCurrentPage(1); }}>
            <div className="metric-icon-box" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>
              <AlertCircle size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Closed / Archived</span>
              <span className="metric-number">{stats.closed + stats.archived}</span>
            </div>
          </div>

          <div className="opp-metric-card" onClick={() => onViewApplications && onViewApplications('all')}>
            <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
              <Users size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Applications</span>
              <span className="metric-number">{stats.totalApps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Mode Toggle */}
      <div className="opp-controls-panel">
        <div className="opp-search-box">
          <Search size={16} className="opp-search-icon" />
          <input
            type="text"
            className="opp-search-input"
            placeholder="Search by title, description, skills, categories, or requirements..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          {searchQuery && (
            <button className="opp-search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="opp-filters-row">
          {/* Status Filter */}
          <div className="filter-group">
            <select
              className="opp-filter-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Live)</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="filter-group">
            <select
              className="opp-filter-select"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Opportunity Types</option>
              {OPPORTUNITY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <select
              className="opp-filter-select"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Categories</option>
              {allCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <select
              className="opp-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_desc">Newest Created</option>
              <option value="created_asc">Oldest Created</option>
              <option value="deadline_asc">Deadline: Most Urgent</option>
              <option value="deadline_desc">Deadline: Furthest</option>
              <option value="apps_desc">Most Applications</option>
              <option value="title_asc">Title A–Z</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="btn-reset-filters" onClick={handleResetFilters} title="Reset all filters">
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Data Table View"
            >
              <TableIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Header info */}
      <div className="opp-results-info">
        <span>Showing <strong>{filteredAndSortedOpps.length}</strong> {filteredAndSortedOpps.length === 1 ? 'opportunity' : 'opportunities'}</span>
        {hasActiveFilters && <span className="active-filter-indicator">Filtered</span>}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="opp-loading-state">
          <div className="spinner" />
          <p>Loading opportunities...</p>
        </div>
      ) : filteredAndSortedOpps.length === 0 ? (
        <div className="opp-empty-state">
          <div className="empty-icon-box">
            <Search size={32} />
          </div>
          <h3>No opportunities found</h3>
          <p>
            {hasActiveFilters
              ? 'No opportunities match your current filter criteria. Try adjusting your search or resetting filters.'
              : 'You haven’t created any opportunities yet. Click the button below to get started.'}
          </p>
          {hasActiveFilters ? (
            <button className="btn-secondary" onClick={handleResetFilters}>
              Reset Filters
            </button>
          ) : (
            <button className="btn-create-opp" onClick={onCreateNew}>
              <Plus size={16} />
              <span>Create First Opportunity</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="opp-card-grid">
          {paginatedOpps.map(opp => {
            let cats = opp.categories;
            if (typeof cats === 'string') {
              try { cats = JSON.parse(cats); } catch (e) { cats = [cats]; }
            }
            if (!Array.isArray(cats) || cats.length === 0) {
              cats = opp.category ? [opp.category] : [];
            }

            const daysLeft = getDaysRemaining(opp.deadline);
            const isLive = (opp.status || '').toLowerCase() === 'active' && opp.show_on_website !== false;

            return (
              <div key={opp.id} className="opp-card">
                {/* Card Top / Header */}
                <div className="opp-card-top">
                  <div className="opp-card-badges">
                    {renderStatusBadge(opp.status)}
                    {opp.featured && (
                      <span className="opp-featured-pill">
                        <Star size={12} />
                        Featured
                      </span>
                    )}
                    {isLive && (
                      <span className="opp-live-pill" title="Visible on public marketing website">
                        <Globe size={12} />
                        Live on Site
                      </span>
                    )}
                  </div>

                  {/* Status Dropdown Quick Changer */}
                  <div className="opp-quick-status">
                    <select
                      value={(opp.status || 'draft').toLowerCase()}
                      onChange={(e) => onStatusChange(opp.id, e.target.value)}
                      className="opp-status-dropdown"
                      title="Quick change opportunity status"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active (Publish)</option>
                      <option value="closed">Closed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Card Main Info */}
                <div className="opp-card-body">
                  <h3 className="opp-card-title">{opp.title}</h3>
                  {opp.summary && (
                    <p className="opp-card-summary">{opp.summary}</p>
                  )}

                  {/* Multi-Category Chips */}
                  {cats.length > 0 && (
                    <div className="opp-categories-row">
                      {cats.map(cat => (
                        <span key={cat} className="opp-cat-tag">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta Attributes */}
                  <div className="opp-meta-list">
                    <div className="opp-meta-item">
                      <Clock size={13} />
                      <span>{Array.isArray(opp.type) ? opp.type.join(', ') : (opp.type || 'Volunteer')}</span>
                    </div>
                    <div className="opp-meta-item">
                      <MapPin size={13} />
                      <span>{opp.location_type || 'Remote'} {opp.location ? `(${opp.location})` : ''}</span>
                    </div>
                    {opp.weekly_commitment && (
                      <div className="opp-meta-item">
                        <span>⏳ {opp.weekly_commitment}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Metrics + Actions */}
                <div className="opp-card-footer">
                  <div className="opp-stats-group">
                    {/* Applications button */}
                    <button
                      className="opp-stat-badge"
                      onClick={() => onViewApplications && onViewApplications(opp.id)}
                      title="View all applicants for this opportunity"
                    >
                      <Users size={14} />
                      <span><strong>{opp.application_count || 0}</strong> {opp.application_count === 1 ? 'applicant' : 'applicants'}</span>
                    </button>

                    {/* Deadline */}
                    {opp.deadline && (
                      <div className={`opp-deadline-badge ${daysLeft !== null && daysLeft < 0 ? 'expired' : daysLeft !== null && daysLeft <= 3 ? 'urgent' : ''}`}>
                        <Calendar size={13} />
                        <span>
                          {daysLeft !== null && daysLeft < 0 
                            ? 'Expired' 
                            : daysLeft !== null && daysLeft === 0
                            ? 'Due today'
                            : daysLeft !== null && daysLeft > 0
                            ? `${daysLeft}d left`
                            : new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="opp-action-buttons">
                    <button
                      className="btn-action-icon"
                      onClick={() => onEdit(opp)}
                      title="Edit Opportunity"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-action-icon"
                      onClick={() => onDuplicate(opp)}
                      title="Duplicate Opportunity"
                    >
                      <Copy size={15} />
                    </button>
                    <a
                      href={`/opportunities.html?id=${opp.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-action-icon"
                      title="View on Public Website"
                    >
                      <ExternalLink size={15} />
                    </a>
                    <button
                      className="btn-action-icon btn-delete"
                      onClick={() => setOppToDelete(opp)}
                      title="Delete Opportunity"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="opp-table-wrapper">
          <table className="opp-data-table">
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Type & Logistics</th>
                <th>Categories</th>
                <th>Status</th>
                <th>Applicants</th>
                <th>Deadline</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOpps.map(opp => {
                let cats = opp.categories;
                if (typeof cats === 'string') {
                  try { cats = JSON.parse(cats); } catch (e) { cats = [cats]; }
                }
                if (!Array.isArray(cats) || cats.length === 0) {
                  cats = opp.category ? [opp.category] : [];
                }

                const daysLeft = getDaysRemaining(opp.deadline);

                return (
                  <tr key={opp.id} className="opp-table-row">
                    {/* Title & Summary */}
                    <td className="col-title" data-label="Opportunity">
                      <div className="opp-table-title-group">
                        <div className="opp-title-row">
                          <strong className="opp-title-text" onClick={() => onEdit(opp)}>{opp.title}</strong>
                          {opp.featured && <span className="star-icon" title="Featured">⭐</span>}
                          {opp.status?.toLowerCase() === 'active' && opp.show_on_website !== false && (
                            <span className="opp-live-pill-sm">Live</span>
                          )}
                        </div>
                        {opp.summary && (
                          <div className="opp-table-summary">{opp.summary}</div>
                        )}
                      </div>
                    </td>

                    {/* Type & Logistics */}
                    <td data-label="Type & Mode">
                      <div className="opp-table-type">
                        <span className="opp-type-badge-sm">{Array.isArray(opp.type) ? opp.type.join(', ') : (opp.type || 'Volunteer')}</span>
                        <span className="opp-table-loc">📍 {opp.location_type || 'Remote'}</span>
                      </div>
                    </td>

                    {/* Categories */}
                    <td data-label="Categories">
                      <div className="opp-table-cats">
                        {cats.length === 0 ? (
                          <span style={{ color: 'var(--text-secondary)' }}>—</span>
                        ) : (
                          cats.map(cat => (
                            <span key={cat} className="opp-cat-tag-sm">
                              {cat}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Status with quick selector */}
                    <td data-label="Status">
                      <div className="opp-table-status-container">
                        <span className={`status-dot-indicator status-${(opp.status || 'draft').toLowerCase()}`} />
                        <select
                          value={(opp.status || 'draft').toLowerCase()}
                          onChange={(e) => onStatusChange(opp.id, e.target.value)}
                          className={`opp-status-dropdown-sm status-select-${(opp.status || 'draft').toLowerCase()}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="closed">Closed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </td>

                    {/* Applications */}
                    <td data-label="Applicants">
                      <button
                        className="table-apps-pill"
                        onClick={() => onViewApplications && onViewApplications(opp.id)}
                        title="Click to view applicants"
                      >
                        <Users size={12} />
                        <span>{opp.application_count || 0}</span>
                      </button>
                    </td>

                    {/* Deadline */}
                    <td data-label="Deadline">
                      {opp.deadline ? (
                        <div className={`table-deadline ${daysLeft !== null && daysLeft < 0 ? 'expired' : ''}`}>
                          <span>{new Date(opp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {daysLeft !== null && daysLeft >= 0 && daysLeft <= 5 && (
                            <span className="urgent-tag">({daysLeft}d left)</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>Flexible</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td data-label="Actions" className="col-actions">
                      <div className="opp-table-actions">
                        <button
                          className="btn-action-icon"
                          onClick={() => onEdit(opp)}
                          title="Edit Opportunity"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn-action-icon"
                          onClick={() => onDuplicate(opp)}
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <a
                          href={`/opportunities.html?id=${opp.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-action-icon"
                          title="View on site"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          className="btn-action-icon btn-delete"
                          onClick={() => setOppToDelete(opp)}
                          title="Delete Opportunity"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="opp-pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {oppToDelete && (
        <div className="modal-backdrop">
          <div className="opp-delete-modal">
            <div className="delete-modal-header">
              <div className="delete-warning-icon">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3>Delete Opportunity</h3>
                <p>This action cannot be undone.</p>
              </div>
            </div>
            <div className="delete-modal-body">
              <p>
                Are you sure you want to permanently delete <strong>"{oppToDelete.title}"</strong>?
              </p>
              {oppToDelete.application_count > 0 && (
                <div className="delete-app-warning">
                  <AlertCircle size={16} />
                  <span>This opportunity has <strong>{oppToDelete.application_count}</strong> submitted applications that will be archived.</span>
                </div>
              )}
            </div>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setOppToDelete(null)}
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
                {isDeleting ? 'Deleting...' : 'Delete Opportunity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
