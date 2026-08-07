import React, { useMemo } from 'react';
import {
  Users, Briefcase, FolderGit2, Layers, Plus, Sparkles,
  Clock, CheckCircle2, ArrowUpRight, Activity, Calendar,
  ChevronRight, TrendingUp, ExternalLink, ShieldCheck, Eye,
  Compass, FileText, Send, Radio, Award, AlertCircle
} from 'lucide-react';
import './OverviewDashboard.css';

const STAGE_CONFIG = [
  { id: 'submitted', label: 'Submitted', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.12)' },
  { id: 'under_review', label: 'Under Review', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)' },
  { id: 'shortlisted', label: 'Shortlisted', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.12)' },
  { id: 'interview', label: 'Interview', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)' },
  { id: 'accepted', label: 'Accepted', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)' },
  { id: 'rejected', label: 'Rejected', color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)' }
];

export default function OverviewDashboard({
  projects = [],
  opportunities = [],
  applications = [],
  activityLogs = [],
  teamMembers = [],
  updates = [],
  loading = false,
  onNavigateTab,
  onCreateOpportunity,
  onCreateProject,
  onCreateUpdate,
  onViewOpportunity,
  onViewApplicant
}) {
  // Dynamic Greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Summary Metrics Calculations
  const metrics = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const devProjects = projects.filter(p => p.status === 'in_development').length;

    const activeOpps = opportunities.filter(o => (o.status || 'draft').toLowerCase() === 'active').length;
    const draftOpps = opportunities.filter(o => (o.status || 'draft').toLowerCase() === 'draft').length;

    const pendingReviewApps = applications.filter(a => {
      const st = (a.status || 'submitted').toLowerCase();
      return st === 'submitted' || st === 'under_review';
    }).length;

    const acceptedApps = applications.filter(a => (a.status || '').toLowerCase() === 'accepted').length;

    return {
      totalProjects: projects.length,
      activeProjects,
      devProjects,
      totalOpps: opportunities.length,
      activeOpps,
      draftOpps,
      totalApps: applications.length,
      pendingReviewApps,
      acceptedApps,
      totalTeam: teamMembers.length,
      totalUpdates: updates.length
    };
  }, [projects, opportunities, applications, teamMembers, updates]);

  // Candidate Pipeline Breakdown
  const pipelineStats = useMemo(() => {
    const total = applications.length || 1; // avoid / 0
    return STAGE_CONFIG.map(st => {
      const count = applications.filter(a => (a.status || 'submitted').toLowerCase() === st.id).length;
      const pct = Math.round((count / total) * 100);
      return {
        ...st,
        count,
        pct
      };
    });
  }, [applications]);

  // Recent 5 Applications
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);
  }, [applications]);

  // Top Active Opportunities
  const featuredOpportunities = useMemo(() => {
    return [...opportunities]
      .sort((a, b) => {
        // Active and featured first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      })
      .slice(0, 4);
  }, [opportunities]);

  // Recent Activity Feed
  const recentLogs = useMemo(() => {
    return [...activityLogs].slice(0, 6);
  }, [activityLogs]);

  return (
    <div className="overview-container">
      {/* Executive Welcome & Actions Header */}
      <div className="overview-hero-panel">
        <div className="hero-welcome-content">
          <div className="hero-status-pill">
            <span className="live-pulse-dot" />
            <span>VeroSeven HQ Command Active</span>
          </div>
          <h1 className="hero-greeting-title">
            {greeting}, <span>Administrator</span>
          </h1>
          <p className="hero-greeting-subtitle">
            Here is your live operational overview across ecosystem products, talent recruitment pipelines, and platform updates.
          </p>
        </div>

        <div className="hero-quick-actions">
          <button
            type="button"
            className="btn-hero-primary"
            onClick={onCreateOpportunity}
          >
            <Plus size={16} />
            <span>New Opportunity</span>
          </button>
          <button
            type="button"
            className="btn-hero-secondary"
            onClick={() => onNavigateTab('applications')}
          >
            <Users size={16} />
            <span>Review Applicants</span>
          </button>
          <a
            href="https://veroseven.com/opportunities.html"
            target="_blank"
            rel="noreferrer"
            className="btn-hero-ghost"
            title="Open public opportunities portal"
          >
            <ExternalLink size={15} />
            <span>Public Site</span>
          </a>
        </div>
      </div>

      {/* Primary KPI Metric Cards - Compact single row */}
      <div className="overview-kpi-grid">
        {/* Metric 1: Candidate Applications */}
        <div
          className="kpi-card gold-glow"
          onClick={() => onNavigateTab('applications')}
        >
          <div className="kpi-card-header">
            <span className="kpi-title">Candidate Pipeline</span>
            <Users size={15} className="kpi-icon" style={{ color: '#d4af37' }} />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{metrics.totalApps}</span>
            <span className="kpi-trend up">
              <TrendingUp size={11} />
              <span>{metrics.pendingReviewApps} Pending</span>
            </span>
          </div>
          <div className="kpi-footer-meta">
            <span>{metrics.acceptedApps} Accepted candidates</span>
            <ChevronRight size={12} className="kpi-arrow" />
          </div>
        </div>

        {/* Metric 2: Open Opportunities */}
        <div
          className="kpi-card purple-glow"
          onClick={() => onNavigateTab('opportunities')}
        >
          <div className="kpi-card-header">
            <span className="kpi-title">Opportunities</span>
            <Briefcase size={15} className="kpi-icon" style={{ color: '#c084fc' }} />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{metrics.totalOpps}</span>
            <span className="kpi-tag-badge active">
              {metrics.activeOpps} Live
            </span>
          </div>
          <div className="kpi-footer-meta">
            <span>{metrics.draftOpps} in Draft stage</span>
            <ChevronRight size={12} className="kpi-arrow" />
          </div>
        </div>

        {/* Metric 3: Active Projects & Products */}
        <div
          className="kpi-card blue-glow"
          onClick={() => onNavigateTab('projects')}
        >
          <div className="kpi-card-header">
            <span className="kpi-title">Ecosystem Projects</span>
            <FolderGit2 size={15} className="kpi-icon" style={{ color: '#60a5fa' }} />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{metrics.totalProjects}</span>
            <span className="kpi-tag-badge blue">
              {metrics.activeProjects} Active
            </span>
          </div>
          <div className="kpi-footer-meta">
            <span>{metrics.devProjects} in dev</span>
            <ChevronRight size={12} className="kpi-arrow" />
          </div>
        </div>

        {/* Metric 4: Platform & Team */}
        <div
          className="kpi-card emerald-glow"
          onClick={() => onNavigateTab('team')}
        >
          <div className="kpi-card-header">
            <span className="kpi-title">Core Team & Updates</span>
            <ShieldCheck size={15} className="kpi-icon" style={{ color: '#34d399' }} />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{metrics.totalTeam}</span>
            <span className="kpi-tag-badge emerald">
              {metrics.totalUpdates} Updates
            </span>
          </div>
          <div className="kpi-footer-meta">
            <span>Enterprise Admin Verified</span>
            <ChevronRight size={12} className="kpi-arrow" />
          </div>
        </div>
      </div>

      {/* Interactive Candidate Pipeline Funnel */}
      <div className="overview-section-panel">
        <div className="panel-header-row">
          <div>
            <h3 className="panel-title">Recruitment Pipeline Funnel</h3>
            <p className="panel-subtitle">Current distribution of candidate dossiers across evaluation stages</p>
          </div>
          <button
            type="button"
            className="btn-panel-action"
            onClick={() => onNavigateTab('applications')}
          >
            <span>Open Pipeline Board</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="pipeline-funnel-bar">
          {pipelineStats.map(st => (
            <div
              key={st.id}
              className="funnel-segment"
              style={{
                width: `${Math.max(st.pct, applications.length === 0 ? 16.6 : 3)}%`,
                background: st.color
              }}
              title={`${st.label}: ${st.count} candidate(s) (${st.pct}%)`}
              onClick={() => onNavigateTab('applications')}
            />
          ))}
        </div>

        <div className="pipeline-stages-grid">
          {pipelineStats.map(st => (
            <div
              key={st.id}
              className="pipeline-stage-chip"
              onClick={() => onNavigateTab('applications')}
            >
              <div className="stage-chip-top">
                <span className="stage-dot" style={{ background: st.color }} />
                <span className="stage-name">{st.label}</span>
              </div>
              <div className="stage-chip-bottom">
                <span className="stage-count">{st.count}</span>
                <span className="stage-percent">{applications.length > 0 ? `${st.pct}%` : '0%'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Grid: Applications Stream & Active Opportunities */}
      <div className="overview-main-grid">
        {/* Left Column: Recent Candidate Submissions */}
        <div className="overview-column">
          <div className="overview-section-panel">
            <div className="panel-header-row">
              <div className="panel-title-with-badge">
                <h3 className="panel-title">Recent Submissions</h3>
                <span className="count-pill">{applications.length}</span>
              </div>
              <button
                type="button"
                className="btn-panel-action"
                onClick={() => onNavigateTab('applications')}
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="recent-apps-list">
              {recentApplications.length === 0 ? (
                <div className="empty-feed-box">
                  <Clock size={28} />
                  <p>No candidate submissions received yet.</p>
                  <button
                    type="button"
                    className="btn-empty-action"
                    onClick={onCreateOpportunity}
                  >
                    Post an Opportunity
                  </button>
                </div>
              ) : (
                recentApplications.map(app => {
                  const stage = STAGE_CONFIG.find(s => s.id === (app.status || 'submitted').toLowerCase()) || STAGE_CONFIG[0];
                  return (
                    <div
                      key={app.id}
                      className="app-feed-card"
                      onClick={() => onNavigateTab('applications')}
                    >
                      <div className="app-feed-avatar">
                        {(app.full_name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="app-feed-info">
                        <div className="app-feed-name-row">
                          <span className="app-feed-name">{app.full_name || 'Applicant'}</span>
                          <span
                            className="app-feed-status-pill"
                            style={{ color: stage.color, background: stage.bg }}
                          >
                            {stage.label}
                          </span>
                        </div>
                        <p className="app-feed-opp">
                          {app.opportunity_title || 'General Opportunity'}
                        </p>
                        <div className="app-feed-meta">
                          <span>{app.email}</span>
                          {app.created_at && (
                            <>
                              <span>•</span>
                              <span>{new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} className="app-feed-chevron" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Opportunities Tracker */}
          <div className="overview-section-panel">
            <div className="panel-header-row">
              <div className="panel-title-with-badge">
                <h3 className="panel-title">Active Opportunities</h3>
                <span className="count-pill">{metrics.activeOpps}</span>
              </div>
              <button
                type="button"
                className="btn-panel-action"
                onClick={() => onNavigateTab('opportunities')}
              >
                <span>Manage</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="opps-summary-grid">
              {featuredOpportunities.length === 0 ? (
                <div className="empty-feed-box">
                  <Briefcase size={28} />
                  <p>No opportunities listed. Create your first opening to attract talent.</p>
                  <button
                    type="button"
                    className="btn-empty-action"
                    onClick={onCreateOpportunity}
                  >
                    + Create Opportunity
                  </button>
                </div>
              ) : (
                featuredOpportunities.map(opp => {
                  let cats = opp.categories;
                  if (typeof cats === 'string') {
                    try { cats = JSON.parse(cats); } catch(e) { cats = [cats]; }
                  }
                  if (!Array.isArray(cats) || cats.length === 0) {
                    cats = opp.category ? [opp.category] : ['General'];
                  }

                  const appCount = applications.filter(a => String(a.opportunity_id) === String(opp.id)).length;
                  const isActive = (opp.status || 'draft').toLowerCase() === 'active';

                  return (
                    <div
                      key={opp.id}
                      className="opp-mini-card"
                      onClick={() => onNavigateTab('opportunities')}
                    >
                      <div className="opp-mini-header">
                        <div className="opp-mini-title-wrap">
                          <h4 className="opp-mini-title">{opp.title}</h4>
                          {opp.featured && <span className="opp-featured-star">★ Featured</span>}
                        </div>
                        <span className={`opp-status-pill ${isActive ? 'active' : 'draft'}`}>
                          {isActive ? 'Live' : opp.status || 'Draft'}
                        </span>
                      </div>

                      <div className="opp-mini-tags">
                        {cats.slice(0, 2).map((c, i) => (
                          <span key={i} className="opp-mini-tag">{c}</span>
                        ))}
                        {cats.length > 2 && <span className="opp-mini-tag">+{cats.length - 2}</span>}
                      </div>

                      <div className="opp-mini-footer">
                        <span className="opp-mini-apps">
                          <Users size={13} />
                          <strong>{appCount}</strong> candidate{appCount === 1 ? '' : 's'}
                        </span>
                        <span className="opp-mini-deadline">
                          <Clock size={13} />
                          {opp.deadline ? new Date(opp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Rolling'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Ecosystem Flagships & System Activity Stream */}
        <div className="overview-column">
          {/* Ecosystem Projects Hub */}
          <div className="overview-section-panel">
            <div className="panel-header-row">
              <div className="panel-title-with-badge">
                <h3 className="panel-title">Ecosystem Projects</h3>
                <span className="count-pill">{projects.length}</span>
              </div>
              <button
                type="button"
                className="btn-panel-action"
                onClick={() => onNavigateTab('admin-hub')}
              >
                <span>Admin Hub</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="projects-quick-list">
              {projects.length === 0 ? (
                <div className="empty-feed-box">
                  <FolderGit2 size={28} />
                  <p>No ecosystem projects registered.</p>
                  <button
                    type="button"
                    className="btn-empty-action"
                    onClick={onCreateProject}
                  >
                    + Add Project
                  </button>
                </div>
              ) : (
                projects.slice(0, 4).map(proj => (
                  <div key={proj.id} className="project-quick-item">
                    <div className="project-quick-left">
                      <div className="project-avatar">
                        {(proj.name || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div className="project-info">
                        <span className="project-name">{proj.name}</span>
                        <span className="project-cat">{proj.category || 'Core Product'}</span>
                      </div>
                    </div>
                    <div className="project-quick-right">
                      <span className={`project-status-dot ${proj.status === 'active' ? 'active' : 'dev'}`}>
                        {proj.status === 'active' ? 'Live' : 'In Dev'}
                      </span>
                      {proj.website_url && (
                        <a
                          href={proj.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-proj-link"
                          title="Open project website"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Activity Stream */}
          <div className="overview-section-panel">
            <div className="panel-header-row">
              <div className="panel-title-with-badge">
                <h3 className="panel-title">Audit Activity Feed</h3>
                <Activity size={15} style={{ color: '#d4af37' }} />
              </div>
              <button
                type="button"
                className="btn-panel-action"
                onClick={() => onNavigateTab('activity')}
              >
                <span>Full Log</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="activity-feed-list">
              {recentLogs.length === 0 ? (
                <div className="empty-feed-box">
                  <Activity size={28} />
                  <p>No recent activity recorded.</p>
                </div>
              ) : (
                recentLogs.map((log, idx) => (
                  <div key={log.id || idx} className="activity-feed-item">
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <div className="activity-title-row">
                        <span className="activity-action">{log.action || 'System Action'}</span>
                        <span className="activity-time">
                          {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>
                      <p className="activity-details">
                        {typeof log.details === 'object' && log.details !== null
                          ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(' · ')
                          : log.entity_type || 'Platform modification'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
