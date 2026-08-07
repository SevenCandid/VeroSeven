import React, { useState, useEffect } from 'react'
import logoUrl from './assets/logo.png'
import './App.css'
import Login from './Login'
import { isAuthenticated, removeToken, getAuthHeaders } from './auth'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import CmsFlagship from './components/CmsFlagship';
import CreateOpportunityForm from './components/CreateOpportunityForm';
import { Globe, Settings, BookOpen, Pencil, Trash2, LogOut, Plus, Search, ExternalLink } from 'lucide-react';

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [cmsContent, setCmsContent] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
  const [oppModal, setOppModal] = useState({ show: false, mode: 'create', data: null });
  const [oppToDelete, setOppToDelete] = useState(null);
  const [showOppForm, setShowOppForm] = useState(false);
  const [editOppData, setEditOppData] = useState(null);

  // New states for Search, Filters, Activity
  const [activityLogs, setActivityLogs] = useState([]);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [projSearch, setProjSearch] = useState('');
  const [projStatusFilter, setProjStatusFilter] = useState('all');

  // Teams
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamModal, setTeamModal] = useState({ show: false, mode: 'create', data: null });
  const [teamToDelete, setTeamToDelete] = useState(null);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    } else if (activeTab === 'projects') {
      fetchProjects();
    } else if (activeTab === 'updates') {
      fetchUpdates();
    } else if (activeTab === 'opportunities') {
      fetchOpportunities();
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
    }
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // In a real app, you would pass the JWT token in headers
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

  const [detailsModalApp, setDetailsModalApp] = useState(null);
  const [appToDelete, setAppToDelete] = useState(null);

  const handleDeleteApplication = async () => {
    if (!appToDelete) return;
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/applications/${appToDelete}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setApplications(applications.filter(a => a.id !== appToDelete));
        setAppToDelete(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveApplicationNotes = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/applications/${detailsModalApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchApplications();
        setDetailsModalApp(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAdminProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    // For 'create', we need all fields. For 'edit', we preserve fields not explicitly set.
    const fullPayload = {
      ...(adminProjectModal.data || {}),
      ...payload
    };
    
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
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
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
      }
    } catch (err) {
      console.error(err);
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
        fetchTeamMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTeamMember = async () => {
    if (!teamToDelete) return;
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/team-members/${teamToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== teamToDelete));
        setTeamToDelete(null);
      }
    } catch (err) {
      console.error(err);
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
        fetchUpdates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUpdateConfirm = async () => {
    if (!updateToDelete) return;
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/updates/${updateToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setUpdateToDelete(null);
        fetchUpdates();
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        fetchOpportunities();
      } else {
        const err = await res.json();
        alert('Error saving opportunity: ' + (err.message || res.status));
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving opportunity.');
    }
  };

  const handleDeleteOpportunityConfirm = async () => {
    if (!oppToDelete) return;
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/opportunities/${oppToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setOppToDelete(null);
        fetchOpportunities();
      }
    } catch (err) {
      console.error(err);
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
        alert('Content saved successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save content.');
    }
  };

  const openDetails = (app) => {
    setDetailsModalApp(app);
  };

  return (
    <>
      {!isAuth ? (
        <Login onLoginSuccess={() => setIsAuth(true)} apiHost={apiHost} />
      ) : (
    <div className="dashboard-container">
      {/* Delete Confirmation Modal */}
      {(appToDelete || projectToDelete || updateToDelete || teamToDelete) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete {appToDelete ? 'Application' : projectToDelete ? 'Project' : teamToDelete ? 'Team Member' : 'Update'}</h3>
            <p>Are you strictly sure you want to delete this? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setAppToDelete(null); setProjectToDelete(null); setUpdateToDelete(null); setTeamToDelete(null); }}>Cancel</button>
              <button className="btn-danger" onClick={appToDelete ? handleDeleteApplication : projectToDelete ? handleDeleteProject : teamToDelete ? handleDeleteTeamMember : handleDeleteUpdateConfirm}>Yes, Delete</button>
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

      {/* Opportunity Full-Page Form */}
      {showOppForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 9999, background: '#0f172a', display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <CreateOpportunityForm
              initial={editOppData}
              onSave={handleSaveOpportunity}
              onCancel={() => { setShowOppForm(false); setEditOppData(null); }}
              apiFetch={apiFetch}
            />
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {detailsModalApp && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <h3>Applicant Details {detailsModalApp.opportunity_title ? `- ${detailsModalApp.opportunity_title}` : ''}</h3>
            
            <div className="modal-details-grid">
              {detailsModalApp.full_name && (
                <div className="detail-group">
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">{detailsModalApp.full_name}</div>
                </div>
              )}
              {detailsModalApp.email && (
                <div className="detail-group">
                  <div className="detail-label">Email Address</div>
                  <div className="detail-value">{detailsModalApp.email}</div>
                </div>
              )}
              {detailsModalApp.phone_number && (
                <div className="detail-group">
                  <div className="detail-label">Phone Number</div>
                  <div className="detail-value">{detailsModalApp.phone_number}</div>
                </div>
              )}
              {detailsModalApp.location && (
                <div className="detail-group">
                  <div className="detail-label">Location</div>
                  <div className="detail-value">{detailsModalApp.location}</div>
                </div>
              )}
              {detailsModalApp.occupation && (
                <div className="detail-group">
                  <div className="detail-label">Role/Occupation</div>
                  <div className="detail-value">{detailsModalApp.occupation}</div>
                </div>
              )}
              {detailsModalApp.availability && (
                <div className="detail-group">
                  <div className="detail-label">Availability</div>
                  <div className="detail-value">{detailsModalApp.availability}</div>
                </div>
              )}
            </div>

            {detailsModalApp.background && (
              <div className="detail-group">
                <div className="detail-label">Background</div>
                <div className="detail-value">{detailsModalApp.background}</div>
              </div>
            )}
            
            {detailsModalApp.skills && (
              <div className="detail-group">
                <div className="detail-label">Skills & Expertise</div>
                <div className="detail-value">{detailsModalApp.skills}</div>
              </div>
            )}

            {detailsModalApp.motivation && (
              <div className="detail-group">
                <div className="detail-label">Motivation</div>
                <div className="detail-value">{detailsModalApp.motivation}</div>
              </div>
            )}

            {/* Dynamic Form Data rendering */}
            {detailsModalApp.form_data && Object.keys(detailsModalApp.form_data).length > 0 && (
              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Application Specifics</h4>
                {Object.entries(detailsModalApp.form_data).map(([key, value]) => (
                  <div className="detail-group" key={key} style={{ marginBottom: '1rem' }}>
                    <div className="detail-label" style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</div>
                    <div className="detail-value">
                      {typeof value === 'string' && value.startsWith('http') ? (
                        <a href={value} target="_blank" rel="noreferrer" style={{color: 'var(--color-accent)'}}>{value}</a>
                      ) : (
                        value
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '2rem' }}>
              <button className="btn-cancel" onClick={() => setDetailsModalApp(null)}>Close</button>
            </div>
            
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Internal Updates</h4>
              <form onSubmit={handleSaveApplicationNotes}>
                <div className="detail-group" style={{ marginBottom: '1rem' }}>
                  <label className="detail-label">Application Status</label>
                  <select name="status" defaultValue={detailsModalApp.status || 'pending'} style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}}>
                    <option value="pending" style={{color: 'black'}}>Pending</option>
                    <option value="reviewed" style={{color: 'black'}}>Reviewed</option>
                    <option value="accepted" style={{color: 'black'}}>Accepted</option>
                    <option value="rejected" style={{color: 'black'}}>Rejected</option>
                  </select>
                </div>
                <div className="detail-group" style={{ marginBottom: '1rem' }}>
                  <label className="detail-label">Internal Notes</label>
                  <textarea name="internal_notes" defaultValue={detailsModalApp.internal_notes || ''} rows="3" placeholder="Add private notes..." style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white'}} />
                </div>
                <button type="submit" className="btn-text">Save Status & Notes</button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar logoUrl={logoUrl} activeTab={activeTab} setActiveTab={setActiveTab} setIsAuth={setIsAuth} isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />
      <div className={`sidebar-overlay ${isMobileSidebarOpen ? 'open' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}></div>

      {/* Main Content Area */}
      <main className="main-content">
        <Topbar setIsMobileSidebarOpen={setIsMobileSidebarOpen} logoUrl={logoUrl} />

        <div className="dashboard-content">
          <h1 className="page-title">
            {activeTab === 'cms' ? 'Content Management' : 
             activeTab === 'opportunities' ? 'Opportunities' :
             activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>

          {activeTab === 'overview' && (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Active Projects</span>
                <span className="stat-value">{projects.filter(p => p.status === 'active').length || '0'}</span>
                <span className="stat-change">{projects.filter(p => p.status === 'in_development').length} In Development</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Pending Applications</span>
                <span className="stat-value">{applications.length || '0'}</span>
                <span className="stat-change">Requires Review</span>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="data-table-container">
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                <input 
                  type="text" 
                  placeholder="Search name, email, or role..." 
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white', minWidth: '250px' }}
                />
                <select 
                  value={appStatusFilter} 
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'white' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              {loading ? <p style={{padding: '1rem'}}>Loading applications...</p> : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role/Skills</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.filter(app => {
                        const searchMatch = (app.full_name || app.form_data?.name || app.form_data?.full_name || '').toLowerCase().includes(appSearch.toLowerCase()) || 
                                          (app.email || app.form_data?.email || '').toLowerCase().includes(appSearch.toLowerCase()) ||
                                          (app.opportunity_title || app.occupation || '').toLowerCase().includes(appSearch.toLowerCase());
                        const statusMatch = appStatusFilter === 'all' || app.status === appStatusFilter;
                        return searchMatch && statusMatch;
                      }).length === 0 ? (
                        <tr><td colSpan="6" style={{textAlign: 'center'}}>No applications match your criteria.</td></tr>
                      ) : (
                        applications.filter(app => {
                          const searchMatch = (app.full_name || app.form_data?.name || app.form_data?.full_name || '').toLowerCase().includes(appSearch.toLowerCase()) || 
                                            (app.email || app.form_data?.email || '').toLowerCase().includes(appSearch.toLowerCase()) ||
                                            (app.opportunity_title || app.occupation || '').toLowerCase().includes(appSearch.toLowerCase());
                          const statusMatch = appStatusFilter === 'all' || app.status === appStatusFilter;
                          return searchMatch && statusMatch;
                        }).map(app => (
                          <tr key={app.id}>
                            <td>{app.full_name || (app.form_data && (app.form_data.name || app.form_data.full_name)) || 'Applicant'}</td>
                            <td>{app.email || (app.form_data && app.form_data.email) || 'N/A'}</td>
                            <td>{app.opportunity_title || app.occupation || 'Dynamic Role'}</td>
                            <td>
                              <span className={`status-badge ${app.status}`}>{app.status}</span>
                            </td>
                            <td>{new Date(app.created_at).toLocaleDateString()}</td>
                            <td>
                              <button className="btn-text" onClick={() => openDetails(app)}>
                                View Details
                              </button>
                              <button className="btn-icon" onClick={() => setAppToDelete(app.id)} title="Delete Application">
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

          {activeTab === 'opportunities' && (
            <div className="data-table-container">
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{opportunities.length} opportunit{opportunities.length !== 1 ? 'ies' : 'y'}</span>
                </div>
                <button className="btn-text" onClick={() => { setEditOppData(null); setShowOppForm(true); }}>
                  <><Plus size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Add Opportunity</>
                </button>
              </div>
              {loading ? <p style={{padding: '1rem'}}>Loading opportunities...</p> : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Featured</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opportunities.length === 0 ? (
                        <tr><td colSpan="7" style={{textAlign: 'center'}}>No opportunities yet.</td></tr>
                      ) : (
                        opportunities.map(opp => (
                          <tr key={opp.id}>
                            <td><strong>{opp.title}</strong>{opp.summary && <div style={{fontSize:'0.73rem',color:'var(--text-secondary)',marginTop:'2px'}}>{opp.summary}</div>}</td>
                            <td>{Array.isArray(opp.type) ? opp.type.join(', ') : (opp.type || '—')}</td>
                            <td>{opp.category || '—'}</td>
                            <td>{opp.location_type || opp.location || '—'}</td>
                            <td>
                              <span className={`status-badge ${opp.status === 'active' ? 'active' : opp.status === 'closed' ? 'pending' : 'pending'}`}>
                                {opp.status}
                              </span>
                            </td>
                            <td style={{textAlign:'center'}}>{opp.featured ? '⭐' : '—'}</td>
                            <td>
                              <button className="btn-text" onClick={() => { setEditOppData(opp); setShowOppForm(true); }}>
                                Edit
                              </button>
                              <button className="btn-icon" onClick={() => setOppToDelete(opp.id)} title="Delete Opportunity">
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

          {activeTab === 'cms-flagship' && (
            <div className="cms-container" style={{ padding: '1rem' }}>
              <CmsFlagship />
            </div>
          )}
        </div>
      </main>
    </div>
      )}
    </>
  )
}

export default App
