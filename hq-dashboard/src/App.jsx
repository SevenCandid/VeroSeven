import React, { useState, useEffect } from 'react';
import logoUrl from './assets/logo.png';
import './App.css';
import Login from './Login';
import { isAuthenticated, removeToken, getAuthHeaders } from './auth';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CmsFlagship from './components/CmsFlagship';
import CreateOpportunityForm from './components/CreateOpportunityForm';
import OpportunityManagement from './components/OpportunityManager/OpportunityManagement';
import ApplicationManagement from './components/ApplicationManager/ApplicationManagement';
import OverviewDashboard from './components/Overview/OverviewDashboard';
import Toast from './components/Toast';
import {
  Globe, Settings, BookOpen, Pencil, Trash2, LogOut, Plus, Search, ExternalLink
} from 'lucide-react';

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [cmsContent, setCmsContent] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter state for Applications tab (when coming from Opportunity Management)
  const [selectedOppFilter, setSelectedOppFilter] = useState('all');

  // Modals for Projects
  const [projectModal, setProjectModal] = useState({ show: false, mode: 'create', data: null });
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [adminProjectModal, setAdminProjectModal] = useState({ show: false, mode: 'create', data: null });

  const apiHost = window.location.hostname || 'localhost';

  const apiFetch = async (url, options = {}) => {
    const headers = { ...options.headers, ...getAuthHeaders() };
    const response = await fetch(url, { ...options, headers });
    
    // Auto logout on 401/403 for admin routes
    if ((response.status === 401 || response.status === 403) && url.includes('/api/admin')) {
      removeToken();
      setIsAuth(false);
    }
    
    return response;
  };

  const [updateModal, setUpdateModal] = useState({ show: false, mode: 'create', data: null });
  const [updateToDelete, setUpdateToDelete] = useState(null);

  // Opportunities
  const [opportunities, setOpportunities] = useState([]);
  const [showOppForm, setShowOppForm] = useState(false);
  const [editOppData, setEditOppData] = useState(null);

  // New states for Search, Filters, Activity
  const [activityLogs, setActivityLogs] = useState([]);
  const [projSearch, setProjSearch] = useState('');
  const [projStatusFilter, setProjStatusFilter] = useState('all');

  // Teams
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamModal, setTeamModal] = useState({ show: false, mode: 'create', data: null });
  const [teamToDelete, setTeamToDelete] = useState(null);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
      fetchOpportunities();
    } else if (activeTab === 'projects') {
      fetchProjects();
    } else if (activeTab === 'updates') {
      fetchUpdates();
    } else if (activeTab === 'opportunities') {
      fetchOpportunities();
      fetchApplications();
    } else if (activeTab === 'cms') {
      fetchCms();
    } else if (activeTab === 'activity') {
      fetchActivityLogs();
    } else if (activeTab === 'team') {
      fetchTeamMembers();
    } else if (activeTab === 'admin-hub') {
      fetchProjects();
    } else if (activeTab === 'overview') {
      fetchProjects();
      fetchApplications();
      fetchOpportunities();
      fetchActivityLogs();
      fetchTeamMembers();
      fetchUpdates();
    }
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchCms = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/cms`);
      if (res.ok) {
        const data = await res.json();
        setCmsContent(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/updates`);
      if (res.ok) {
        const data = await res.json();
        setUpdates(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/opportunities`);
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/team-members`);
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/activity-logs`);
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Opportunity Actions
  const handleSaveOpportunity = async (payload) => {
    const isEdit = !!editOppData?.id;
    try {
      const url = isEdit
        ? `https://veroseven-api.onrender.com/api/admin/opportunities/${editOppData.id}`
        : `https://veroseven-api.onrender.com/api/admin/opportunities`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowOppForm(false);
        setEditOppData(null);
        showToast(isEdit ? 'Opportunity updated successfully!' : 'Opportunity created successfully!', 'success');
        fetchOpportunities();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error saving opportunity', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving opportunity', 'error');
    }
  };

  const handleDuplicateOpportunity = async (oppId) => {
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/opportunities/${oppId}/duplicate`, {
        method: 'POST'
      });
      if (res.ok) {
        const dup = await res.json();
        showToast(`Opportunity duplicated as "${dup.title}"`, 'success');
        fetchOpportunities();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to duplicate opportunity', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error duplicating opportunity', 'error');
    }
  };

  const handleOpportunityStatusChange = async (oppId, newStatus) => {
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/opportunities/${oppId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Opportunity status changed to ${newStatus}`, 'success');
        fetchOpportunities();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error updating status', 'error');
    }
  };

  const handleToggleFeaturedOpportunity = async (oppId, currentFeatured) => {
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/opportunities/${oppId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured })
      });
      if (res.ok) {
        showToast(`Opportunity ${!currentFeatured ? 'marked as Featured' : 'unfeatured'}`, 'success');
        fetchOpportunities();
      } else {
        showToast('Failed to update featured flag', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error updating featured flag', 'error');
    }
  };

  const handleDeleteOpportunity = async (oppId) => {
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/opportunities/${oppId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Opportunity deleted permanently', 'success');
        fetchOpportunities();
      } else {
        showToast('Failed to delete opportunity', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error deleting opportunity', 'error');
    }
  };

  // Candidate Application Actions
  const handleUpdateAppStatus = async (appId, newStatus, note = '') => {
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note })
      });
      if (res.ok) {
        showToast(`Candidate stage moved to ${newStatus.replace('_', ' ')}`, 'success');
        fetchApplications();
      } else {
        showToast('Failed to update stage', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error updating stage', 'error');
    }
  };

  const handleSaveAppNotes = async (appId, internalNotes) => {
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internal_notes: internalNotes })
      });
      if (res.ok) {
        showToast('Internal evaluation notes saved', 'success');
        fetchApplications();
      } else {
        showToast('Failed to save notes', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving notes', 'error');
    }
  };

  const handleSendApplicantNotification = async (appId, subject, message, newStatus) => {
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/applications/${appId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, new_status: newStatus })
      });
      if (res.ok) {
        showToast('Notification dispatched & logged to candidate timeline', 'success');
        fetchApplications();
        return true;
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to dispatch notification', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      showToast('Network error sending notification', 'error');
      return false;
    }
  };

  const handleDeleteApplication = async (appId) => {
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/applications/${appId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Application record deleted', 'success');
        fetchApplications();
      } else {
        showToast('Failed to delete application', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error deleting application', 'error');
    }
  };

  // Projects & Updates CRUD
  const handleSaveProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const url = projectModal.mode === 'create' 
        ? `https://veroseven-api.onrender.com/api/admin/projects`
        : `https://veroseven-api.onrender.com/api/admin/projects/${projectModal.data.id}`;
      
      const res = await apiFetch(url, {
        method: projectModal.mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setProjectModal({ show: false, mode: 'create', data: null });
        showToast('Project saved', 'success');
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving project', 'error');
    }
  };

  const handleSaveAdminProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    const fullPayload = { ...(adminProjectModal.data || {}), ...payload };
    
    try {
      const url = adminProjectModal.mode === 'create'
        ? `https://veroseven-api.onrender.com/api/admin/projects`
        : `https://veroseven-api.onrender.com/api/admin/projects/${adminProjectModal.data.id}`;

      const res = await apiFetch(url, {
        method: adminProjectModal.mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
      });
      if (res.ok) {
        setAdminProjectModal({ show: false, mode: 'create', data: null });
        showToast('Project links saved', 'success');
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving project links', 'error');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/projects/${projectToDelete}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== projectToDelete));
        setProjectToDelete(null);
        showToast('Project deleted', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting project', 'error');
    }
  };

  const handleSaveTeamMember = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const url = teamModal.mode === 'create' 
        ? `https://veroseven-api.onrender.com/api/admin/team-members`
        : `https://veroseven-api.onrender.com/api/admin/team-members/${teamModal.data.id}`;
      
      const res = await apiFetch(url, {
        method: teamModal.mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setTeamModal({ show: false, mode: 'create', data: null });
        showToast('Team member saved', 'success');
        fetchTeamMembers();
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving team member', 'error');
    }
  };

  const handleDeleteTeamMember = async () => {
    if (!teamToDelete) return;
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/team-members/${teamToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== teamToDelete));
        setTeamToDelete(null);
        showToast('Team member removed', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Error removing team member', 'error');
    }
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const url = updateModal.mode === 'create' 
        ? `https://veroseven-api.onrender.com/api/admin/updates`
        : `https://veroseven-api.onrender.com/api/admin/updates/${updateModal.data.id}`;
      
      const res = await apiFetch(url, {
        method: updateModal.mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setUpdateModal({ show: false, mode: 'create', data: null });
        showToast('Update published', 'success');
        fetchUpdates();
      }
    } catch (err) {
      console.error(err);
      showToast('Error publishing update', 'error');
    }
  };

  const handleDeleteUpdateConfirm = async () => {
    if (!updateToDelete) return;
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/updates/${updateToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setUpdateToDelete(null);
        showToast('Update deleted', 'success');
        fetchUpdates();
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting update', 'error');
    }
  };

  const handleUpdateCms = async (key, content) => {
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/cms/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        fetchCms();
        showToast('CMS content saved successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save CMS content', 'error');
    }
  };

  return (
    <>
      {!isAuth ? (
        <Login onLoginSuccess={() => setIsAuth(true)} apiHost={apiHost} />
      ) : (
        <div className="dashboard-container">
          {/* Global Toast */}
          <Toast toast={toast} onClose={() => setToast(null)} />

          {/* Delete Confirmation Modal for Projects / Updates / Teams */}
          {(projectToDelete || updateToDelete || teamToDelete) && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Delete {projectToDelete ? 'Project' : teamToDelete ? 'Team Member' : 'Update'}</h3>
                <p>Are you strictly sure you want to delete this? This action cannot be undone.</p>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => { setProjectToDelete(null); setUpdateToDelete(null); setTeamToDelete(null); }}>Cancel</button>
                  <button className="btn-danger" onClick={projectToDelete ? handleDeleteProject : teamToDelete ? handleDeleteTeamMember : handleDeleteUpdateConfirm}>Yes, Delete</button>
                </div>
              </div>
            </div>
          )}

          {/* Project Form Modal */}
          {projectModal.show && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{projectModal.mode === 'create' ? 'Create Project' : 'Edit Project'}</h3>
                <form onSubmit={handleSaveProject}>
                  <div className="detail-group">
                    <label className="detail-label">Name</label>
                    <input type="text" name="name" defaultValue={projectModal.data?.name || ''} required style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                  </div>
                  <div className="detail-group">
                    <label className="detail-label">Description</label>
                    <textarea name="description" defaultValue={projectModal.data?.description || ''} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} rows="3" />
                  </div>
                  <div className="modal-details-grid">
                    <div className="detail-group">
                      <label className="detail-label">Status</label>
                      <select name="status" defaultValue={projectModal.data?.status || 'active'} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}}>
                        <option value="active" style={{color: 'black'}}>Active</option>
                        <option value="in_development" style={{color: 'black'}}>In Development</option>
                      </select>
                    </div>
                    <div className="detail-group">
                      <label className="detail-label">Category (Tags)</label>
                      <input type="text" name="category" defaultValue={projectModal.data?.category || ''} placeholder="e.g. AI, Communications" style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                    </div>
                    <div className="detail-group">
                      <label className="detail-label">Website URL</label>
                      <input type="url" name="website_url" defaultValue={projectModal.data?.website_url || ''} placeholder="https://..." style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setProjectModal({show: false})}>Cancel</button>
                    <button type="submit" className="btn-text">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Admin Project Form Modal (For Admin Hub) */}
          {adminProjectModal.show && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{adminProjectModal.mode === 'create' ? 'Create Project (Admin)' : 'Edit Project (Admin)'}</h3>
                <form onSubmit={handleSaveAdminProject}>
                  <div className="detail-group">
                    <label className="detail-label">Name</label>
                    <input type="text" name="name" defaultValue={adminProjectModal.data?.name || ''} required style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                  </div>
                  <div className="modal-details-grid">
                    <div className="detail-group">
                      <label className="detail-label">Status</label>
                      <select name="status" defaultValue={adminProjectModal.data?.status || 'active'} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}}>
                        <option value="active" style={{color: 'black'}}>Active</option>
                        <option value="in_development" style={{color: 'black'}}>In Development</option>
                      </select>
                    </div>
                    <div className="detail-group">
                      <label className="detail-label">Website URL</label>
                      <input type="url" name="website_url" defaultValue={adminProjectModal.data?.website_url || ''} placeholder="https://..." style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                    </div>
                    <div className="detail-group">
                      <label className="detail-label">Admin Dashboard URL</label>
                      <input type="url" name="admin_url" defaultValue={adminProjectModal.data?.admin_url || ''} placeholder="https://..." style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                    </div>
                    <div className="detail-group">
                      <label className="detail-label">Docs / Swagger URL</label>
                      <input type="url" name="docs_url" defaultValue={adminProjectModal.data?.docs_url || ''} placeholder="https://..." style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                    </div>
                  </div>
                  <div className="modal-actions" style={{marginTop: '1.5rem'}}>
                    <button type="button" className="btn-cancel" onClick={() => setAdminProjectModal({show: false})}>Cancel</button>
                    <button type="submit" className="btn-text">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Team Form Modal */}
          {teamModal.show && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{teamModal.mode === 'create' ? 'Add Team Member' : 'Edit Team Member'}</h3>
                <form onSubmit={handleSaveTeamMember}>
                  <div className="detail-group">
                    <label className="detail-label">Name</label>
                    <input type="text" name="name" defaultValue={teamModal.data?.name || ''} required style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                  </div>
                  <div className="modal-details-grid">
                    <div className="detail-group">
                      <label className="detail-label">Role</label>
                      <input type="text" name="role" defaultValue={teamModal.data?.role || ''} required style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                    </div>
                    <div className="detail-group">
                      <label className="detail-label">Email (Optional)</label>
                      <input type="email" name="email" defaultValue={teamModal.data?.email || ''} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                    </div>
                  </div>
                  <div className="modal-details-grid">
                    <div className="detail-group">
                      <label className="detail-label">Project / Group</label>
                      <input type="text" name="project_group" defaultValue={teamModal.data?.project_group || 'VeroSeven Core'} required style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                    </div>
                    <div className="detail-group">
                      <label className="detail-label">Status</label>
                      <select name="status" defaultValue={teamModal.data?.status || 'active'} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}}>
                        <option value="active" style={{color: 'black'}}>Active</option>
                        <option value="former" style={{color: 'black'}}>Former</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-actions" style={{marginTop: '1.5rem'}}>
                    <button type="button" className="btn-cancel" onClick={() => setTeamModal({show: false})}>Cancel</button>
                    <button type="submit" className="btn-text">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Update Form Modal */}
          {updateModal.show && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{updateModal.mode === 'create' ? 'Create Update' : 'Edit Update'}</h3>
                <form onSubmit={handleSaveUpdate}>
                  <div className="detail-group">
                    <label className="detail-label">Title</label>
                    <input type="text" name="title" defaultValue={updateModal.data?.title || ''} required style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                  </div>
                  <div className="detail-group">
                    <label className="detail-label">Excerpt / Content</label>
                    <textarea name="excerpt" defaultValue={updateModal.data?.excerpt || ''} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} rows="4" />
                  </div>
                  <div className="modal-details-grid">
                    <div className="detail-group">
                      <label className="detail-label">Tag (e.g., Announcement, Product)</label>
                      <input type="text" name="tag" defaultValue={updateModal.data?.tag || ''} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                    </div>
                    <div className="detail-group">
                      <label className="detail-label">Date Label (e.g., May 2026)</label>
                      <input type="text" name="date_label" defaultValue={updateModal.data?.date_label || ''} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setUpdateModal({show: false})}>Cancel</button>
                    <button type="submit" className="btn-text">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Sidebar */}
          <Sidebar
            logoUrl={logoUrl}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setIsAuth={setIsAuth}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={toggleSidebarCollapse}
          />
          <div className={`sidebar-overlay ${isMobileSidebarOpen ? 'open' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}></div>

          {/* Main Content Area */}
          <main className="main-content">
            {showOppForm ? (
              /* Full-page opportunity form */
              <CreateOpportunityForm
                initial={editOppData}
                onSave={handleSaveOpportunity}
                onCancel={() => { setShowOppForm(false); setEditOppData(null); }}
                apiFetch={apiFetch}
              />
            ) : (
              <>
                <Topbar setIsMobileSidebarOpen={setIsMobileSidebarOpen} logoUrl={logoUrl} />
                <div className="dashboard-content">
                  {activeTab !== 'overview' && (
                    <h1 className="page-title">
                      {activeTab === 'cms' ? 'Content Management' : 
                       activeTab === 'opportunities' ? 'Opportunity Management' :
                       activeTab === 'applications' ? 'Recruitment Pipeline' :
                       activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h1>
                  )}

                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <OverviewDashboard
                      projects={projects}
                      opportunities={opportunities}
                      applications={applications}
                      activityLogs={activityLogs}
                      teamMembers={teamMembers}
                      updates={updates}
                      loading={loading}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                      onCreateOpportunity={() => { setEditOppData(null); setShowOppForm(true); }}
                      onCreateProject={() => setProjectModal({ show: true, mode: 'create', data: null })}
                      onCreateUpdate={() => setUpdateModal({ show: true, mode: 'create', data: null })}
                      onViewOpportunity={(oppId) => {
                        setSelectedOppFilter(String(oppId));
                        setActiveTab('applications');
                      }}
                      onViewApplicant={() => {
                        setActiveTab('applications');
                      }}
                    />
                  )}

                  {/* OPPORTUNITIES MANAGEMENT TAB */}
                  {activeTab === 'opportunities' && (
                    <OpportunityManagement
                      opportunities={opportunities}
                      loading={loading}
                      onCreateNew={() => { setEditOppData(null); setShowOppForm(true); }}
                      onEditOpportunity={(opp) => { setEditOppData(opp); setShowOppForm(true); }}
                      onDuplicateOpportunity={handleDuplicateOpportunity}
                      onStatusChange={handleOpportunityStatusChange}
                      onToggleFeatured={handleToggleFeaturedOpportunity}
                      onDeleteOpportunity={handleDeleteOpportunity}
                      onViewApplicants={(oppId) => {
                        setSelectedOppFilter(String(oppId));
                        setActiveTab('applications');
                      }}
                    />
                  )}

                  {/* APPLICATIONS RECRUITMENT PIPELINE TAB */}
                  {activeTab === 'applications' && (
                    <ApplicationManagement
                      applications={applications}
                      opportunities={opportunities}
                      loading={loading}
                      selectedOppFilter={selectedOppFilter}
                      onOppFilterChange={(oppId) => setSelectedOppFilter(oppId)}
                      onUpdateStatus={handleUpdateAppStatus}
                      onSaveNotes={handleSaveAppNotes}
                      onSendNotification={handleSendApplicantNotification}
                      onDeleteApplication={handleDeleteApplication}
                    />
                  )}

                  {/* PROJECTS TAB */}
                  {activeTab === 'projects' && (
                    <div className="data-table-container">
                      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <input 
                            type="text" 
                            placeholder="Search projects..." 
                            value={projSearch}
                            onChange={(e) => setProjSearch(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white', minWidth: '250px' }}
                          />
                          <select 
                            value={projStatusFilter} 
                            onChange={(e) => setProjStatusFilter(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'white' }}
                          >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="in_development">In Development</option>
                          </select>
                        </div>
                        <button className="btn-text" onClick={() => setProjectModal({ show: true, mode: 'create', data: null })}>
                          + Add Project
                        </button>
                      </div>
                      {loading ? <p style={{padding: '1rem'}}>Loading projects...</p> : (
                        <div className="table-responsive">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Project Name</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {projects.filter(proj => {
                                const searchMatch = (proj.name || '').toLowerCase().includes(projSearch.toLowerCase()) || 
                                                  (proj.category || '').toLowerCase().includes(projSearch.toLowerCase());
                                const statusMatch = projStatusFilter === 'all' || proj.status === projStatusFilter;
                                return searchMatch && statusMatch;
                              }).length === 0 ? (
                                <tr><td colSpan="4" style={{textAlign: 'center'}}>No projects match your criteria.</td></tr>
                              ) : (
                                projects.filter(proj => {
                                  const searchMatch = (proj.name || '').toLowerCase().includes(projSearch.toLowerCase()) || 
                                                    (proj.category || '').toLowerCase().includes(projSearch.toLowerCase());
                                  const statusMatch = projStatusFilter === 'all' || proj.status === projStatusFilter;
                                  return searchMatch && statusMatch;
                                }).map(proj => (
                                  <tr key={proj.id}>
                                    <td>{proj.name}</td>
                                    <td>{proj.category}</td>
                                    <td>
                                      <span className={`status-badge ${proj.status === 'active' ? 'active' : 'pending'}`}>
                                        {proj.status === 'in_development' ? 'In Development' : proj.status}
                                      </span>
                                    </td>
                                    <td>
                                      <button className="btn-text" onClick={() => setProjectModal({ show: true, mode: 'edit', data: proj })}>
                                        Edit
                                      </button>
                                      <button className="btn-icon" onClick={() => setProjectToDelete(proj.id)} title="Delete Project">
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ACTIVITY TAB */}
                  {activeTab === 'activity' && (
                    <div className="data-table-container">
                      {loading ? <p style={{padding: '1rem'}}>Loading activity logs...</p> : (
                        <div className="table-responsive">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Date & Time</th>
                                <th>Action</th>
                                <th>Entity Type</th>
                                <th>Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activityLogs.length === 0 ? (
                                <tr><td colSpan="4" style={{textAlign: 'center'}}>No activity logs found.</td></tr>
                              ) : (
                                activityLogs.map(log => (
                                  <tr key={log.id}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                                    <td style={{ fontWeight: '500', color: 'var(--color-accent)' }}>{log.action}</td>
                                    <td>{log.entity_type}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                      {log.details ? JSON.stringify(log.details) : 'N/A'}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ADMIN HUB TAB */}
                  {activeTab === 'admin-hub' && (
                    <div className="data-table-container">
                      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--border-color)' }}>
                        <button className="btn-text" onClick={() => setAdminProjectModal({ show: true, mode: 'create', data: null })}>
                          <><Plus size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Add Project / Product</>
                        </button>
                      </div>
                      {loading ? <p style={{padding: '1rem'}}>Loading projects for admin hub...</p> : (
                        <div className="table-responsive">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Project Name</th>
                                <th>Website URL</th>
                                <th>Admin Dashboard</th>
                                <th>Docs / Swagger</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {projects.length === 0 ? (
                                <tr><td colSpan="5" style={{textAlign: 'center'}}>No projects found. Add one in the Projects tab.</td></tr>
                              ) : (
                                projects.map(proj => (
                                  <tr key={proj.id}>
                                    <td style={{fontWeight: 'bold', color: 'var(--color-accent)'}}>{proj.name}</td>
                                    <td>
                                      {proj.website_url ? <a href={proj.website_url} target="_blank" rel="noreferrer" className="btn-text" style={{padding: '0.2rem 0.5rem', fontSize: '0.8rem'}}><><Globe size={14} style={{marginRight: "4px", verticalAlign: "middle"}} /> View Site</></a> : <span style={{color: 'var(--text-secondary)'}}>None</span>}
                                    </td>
                                    <td>
                                      {proj.admin_url ? <a href={proj.admin_url} target="_blank" rel="noreferrer" className="btn-text" style={{padding: '0.2rem 0.5rem', fontSize: '0.8rem', background: 'rgba(74, 144, 226, 0.2)'}}><><Settings size={14} style={{marginRight: "4px", verticalAlign: "middle"}} /> Dashboard</></a> : <span style={{color: 'var(--text-secondary)'}}>None</span>}
                                    </td>
                                    <td>
                                      {proj.docs_url ? <a href={proj.docs_url} target="_blank" rel="noreferrer" className="btn-text" style={{padding: '0.2rem 0.5rem', fontSize: '0.8rem', background: 'rgba(80, 227, 194, 0.2)'}}><><BookOpen size={14} style={{marginRight: "4px", verticalAlign: "middle"}} /> Docs</></a> : <span style={{color: 'var(--text-secondary)'}}>None</span>}
                                    </td>
                                    <td>
                                      <button className="btn-icon" onClick={() => setAdminProjectModal({ show: true, mode: 'edit', data: proj })} title="Edit URLs">
                                        <Pencil size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TEAM TAB */}
                  {activeTab === 'team' && (
                    <div className="data-table-container">
                      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--border-color)' }}>
                        <button className="btn-text" onClick={() => setTeamModal({ show: true, mode: 'create', data: null })}>
                          <><Plus size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Add Team Member</>
                        </button>
                      </div>
                      {loading ? <p style={{padding: '1rem'}}>Loading team members...</p> : (
                        <div className="table-responsive">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Project / Group</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teamMembers.length === 0 ? (
                                <tr><td colSpan="5" style={{textAlign: 'center'}}>No team members added yet.</td></tr>
                              ) : (
                                teamMembers.map(member => (
                                  <tr key={member.id}>
                                    <td>{member.name} {member.email && <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{member.email}</div>}</td>
                                    <td>{member.role}</td>
                                    <td>
                                      <span style={{padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', fontSize: '0.85rem'}}>
                                        {member.project_group}
                                      </span>
                                    </td>
                                    <td>
                                      <span className={`status-badge ${member.status === 'active' ? 'active' : 'pending'}`}>
                                        {member.status}
                                      </span>
                                    </td>
                                    <td>
                                      <button className="btn-text" onClick={() => setTeamModal({ show: true, mode: 'edit', data: member })}>
                                        Edit
                                      </button>
                                      <button className="btn-icon" onClick={() => setTeamToDelete(member.id)} title="Remove Member">
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* UPDATES TAB */}
                  {activeTab === 'updates' && (
                    <div className="data-table-container">
                      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--border-color)' }}>
                        <button className="btn-text" onClick={() => setUpdateModal({ show: true, mode: 'create', data: null })}>
                          <><Plus size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Add Update</>
                        </button>
                      </div>
                      {loading ? <p style={{padding: '1rem'}}>Loading updates...</p> : (
                        <div className="table-responsive">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Tag</th>
                                <th>Date Label</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {updates.length === 0 ? (
                                <tr><td colSpan="4" style={{textAlign: 'center'}}>No updates yet.</td></tr>
                              ) : (
                                updates.map(upd => (
                                  <tr key={upd.id}>
                                    <td>{upd.title}</td>
                                    <td><span className="tag" style={{fontSize: '0.7rem'}}>{upd.tag}</span></td>
                                    <td>{upd.date_label}</td>
                                    <td>
                                      <button className="btn-text" onClick={() => setUpdateModal({ show: true, mode: 'edit', data: upd })}>
                                        Edit
                                      </button>
                                      <button className="btn-icon" onClick={() => setUpdateToDelete(upd.id)} title="Delete Update">
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CMS TAB */}
                  {activeTab === 'cms' && (
                    <div className="cms-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                      {loading ? <p>Loading CMS content...</p> : (
                        cmsContent.map(section => (
                          <div key={section.section_key} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>{section.section_key.replace('_', ' ')}</h3>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.target);
                              const payload = {};
                              for (let [k, v] of formData.entries()) { payload[k] = v; }
                              handleUpdateCms(section.section_key, payload);
                            }}>
                              {Object.keys(section.content).map(fieldKey => (
                                <div className="detail-group" key={fieldKey}>
                                  <label className="detail-label" style={{ textTransform: 'capitalize' }}>{fieldKey}</label>
                                  {fieldKey === 'text' || fieldKey === 'subtitle' ? (
                                    <textarea name={fieldKey} defaultValue={section.content[fieldKey]} rows="3" style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white'}} />
                                  ) : (
                                    <input type="text" name={fieldKey} defaultValue={section.content[fieldKey]} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white'}} />
                                  )}
                                </div>
                              ))}
                              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                                <button type="submit" className="btn-text">Save Changes</button>
                              </div>
                            </form>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* CMS FLAGSHIP TAB */}
                  {activeTab === 'cms-flagship' && (
                    <div className="cms-container" style={{ padding: '1rem' }}>
                      <CmsFlagship />
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </>
  );
}

export default App;
