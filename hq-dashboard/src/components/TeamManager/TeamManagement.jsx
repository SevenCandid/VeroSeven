import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, ChevronDown, ChevronUp, Users } from 'lucide-react';
import './TeamManagement.css';

const TeamManagement = ({ apiFetch, showToast }) => {
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [teamModal, setTeamModal] = useState({ show: false, mode: 'create', data: null });
  const [memberModal, setMemberModal] = useState({ show: false, mode: 'create', data: null, prefilledTeamId: null });

  const [expandedTeams, setExpandedTeams] = useState({});

  const toggleTeam = (teamId) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsRes, membersRes] = await Promise.all([
        apiFetch('/api/admin/teams'),
        apiFetch('/api/admin/team-members')
      ]);

      if (teamsRes.ok && membersRes.ok) {
        setTeams(await teamsRes.json());
        setTeamMembers(await membersRes.json());
      }
    } catch (err) {
      console.error(err);
      showToast('Error fetching team data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
    };

    try {
      const url = teamModal.mode === 'create' ? '/api/admin/teams' : `/api/admin/teams/${teamModal.data.id}`;
      const method = teamModal.mode === 'create' ? 'POST' : 'PUT';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showToast(`Team ${teamModal.mode === 'create' ? 'created' : 'updated'} successfully`);
        setTeamModal({ show: false, mode: 'create', data: null });
        fetchData();
      } else {
        throw new Error('Failed to save team');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team? Members will not be deleted but will be orphaned.')) return;
    try {
      const res = await apiFetch(`/api/admin/teams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Team deleted');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to delete team', 'error');
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      role: formData.get('role'),
      email: formData.get('email'),
      project_group: formData.get('project_group'), // Legacy or specific title
      status: formData.get('status'),
      team_id: formData.get('team_id') ? parseInt(formData.get('team_id'), 10) : null
    };

    try {
      const url = memberModal.mode === 'create' ? '/api/admin/team-members' : `/api/admin/team-members/${memberModal.data.id}`;
      const method = memberModal.mode === 'create' ? 'POST' : 'PUT';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showToast(`Member ${memberModal.mode === 'create' ? 'added' : 'updated'} successfully`);
        setMemberModal({ show: false, mode: 'create', data: null, prefilledTeamId: null });
        fetchData();
      } else {
        throw new Error('Failed to save member');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await apiFetch(`/api/admin/team-members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Member removed');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to remove member', 'error');
    }
  };

  const getMembersByTeam = (teamId) => {
    return teamMembers.filter(m => m.team_id === teamId);
  };

  const orphanedMembers = teamMembers.filter(m => !m.team_id);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Teams...</div>;

  return (
    <div className="team-management">
      <div className="tm-header">
        <button className="btn-primary" onClick={() => setTeamModal({ show: true, mode: 'create', data: null })}>
          <Plus size={16} /> Create Team
        </button>
        <button className="btn-secondary" onClick={() => setMemberModal({ show: true, mode: 'create', data: null, prefilledTeamId: null })}>
          <Users size={16} /> Add Member (Unassigned)
        </button>
      </div>

      <div className="teams-list">
        {teams.map(team => {
          const members = getMembersByTeam(team.id);
          const isExpanded = expandedTeams[team.id];

          return (
            <div key={team.id} className="team-card">
              <div className="team-card-header" onClick={() => toggleTeam(team.id)}>
                <div className="team-info">
                  <h3>{team.name}</h3>
                  <span className="team-meta">{members.length} member{members.length !== 1 ? 's' : ''}</span>
                  {team.description && <p className="team-desc">{team.description}</p>}
                </div>
                <div className="team-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn-text" onClick={() => setMemberModal({ show: true, mode: 'create', data: null, prefilledTeamId: team.id })}>
                    <Plus size={16} /> Add Member
                  </button>
                  <button className="btn-icon" onClick={() => setTeamModal({ show: true, mode: 'edit', data: team })}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon text-danger" onClick={() => handleDeleteTeam(team.id)}>
                    <Trash2 size={16} />
                  </button>
                  <button className="btn-icon" onClick={() => toggleTeam(team.id)}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="team-card-body">
                  {members.length === 0 ? (
                    <div className="empty-state">No members in this team.</div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Project Group</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map(m => (
                          <tr key={m.id}>
                            <td>{m.name} {m.email && <span style={{fontSize:'0.8rem', display:'block', color:'#888'}}>{m.email}</span>}</td>
                            <td>{m.role}</td>
                            <td>{m.project_group}</td>
                            <td><span className={`status-badge ${m.status === 'active' ? 'active' : 'pending'}`}>{m.status}</span></td>
                            <td>
                              <button className="btn-text" onClick={() => setMemberModal({ show: true, mode: 'edit', data: m, prefilledTeamId: team.id })}>Edit</button>
                              <button className="btn-icon" onClick={() => handleDeleteMember(m.id)}><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {orphanedMembers.length > 0 && (
          <div className="team-card">
            <div className="team-card-header" onClick={() => toggleTeam('orphaned')}>
              <div className="team-info">
                <h3>Unassigned / Legacy Members</h3>
                <span className="team-meta">{orphanedMembers.length} member{orphanedMembers.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="team-actions" onClick={e => e.stopPropagation()}>
                <button className="btn-icon" onClick={() => toggleTeam('orphaned')}>
                  {expandedTeams['orphaned'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>
            {expandedTeams['orphaned'] && (
              <div className="team-card-body">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Project Group</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orphanedMembers.map(m => (
                      <tr key={m.id}>
                        <td>{m.name} {m.email && <span style={{fontSize:'0.8rem', display:'block', color:'#888'}}>{m.email}</span>}</td>
                        <td>{m.role}</td>
                        <td>{m.project_group}</td>
                        <td><span className={`status-badge ${m.status === 'active' ? 'active' : 'pending'}`}>{m.status}</span></td>
                        <td>
                          <button className="btn-text" onClick={() => setMemberModal({ show: true, mode: 'edit', data: m, prefilledTeamId: null })}>Assign to Team</button>
                          <button className="btn-icon" onClick={() => handleDeleteMember(m.id)}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TEAM MODAL */}
      {teamModal.show && (
        <div className="modal-overlay" onClick={() => setTeamModal({ show: false, mode: 'create', data: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{teamModal.mode === 'create' ? 'Create Team' : 'Edit Team'}</h2>
              <button className="modal-close" onClick={() => setTeamModal({ show: false, mode: 'create', data: null })}>×</button>
            </div>
            <form onSubmit={handleSaveTeam}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Team Name</label>
                  <input type="text" name="name" defaultValue={teamModal.data?.name || ''} required className="modal-input" />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea name="description" defaultValue={teamModal.data?.description || ''} className="modal-input" rows="3" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary">Save Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER MODAL */}
      {memberModal.show && (
        <div className="modal-overlay" onClick={() => setMemberModal({ show: false, mode: 'create', data: null, prefilledTeamId: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{memberModal.mode === 'create' ? 'Add Member' : 'Edit Member'}</h2>
              <button className="modal-close" onClick={() => setMemberModal({ show: false, mode: 'create', data: null, prefilledTeamId: null })}>×</button>
            </div>
            <form onSubmit={handleSaveMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Team</label>
                  <select name="team_id" defaultValue={memberModal.data?.team_id || memberModal.prefilledTeamId || ''} className="modal-input">
                    <option value="">-- No Team (Unassigned) --</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" name="name" defaultValue={memberModal.data?.name || ''} required className="modal-input" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" defaultValue={memberModal.data?.email || ''} className="modal-input" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" name="role" defaultValue={memberModal.data?.role || ''} className="modal-input" />
                </div>
                <div className="form-group">
                  <label>Legacy Project Group</label>
                  <input type="text" name="project_group" defaultValue={memberModal.data?.project_group || ''} className="modal-input" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" defaultValue={memberModal.data?.status || 'active'} className="modal-input">
                    <option value="active">Active</option>
                    <option value="pending">Pending/Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
