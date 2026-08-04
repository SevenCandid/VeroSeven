import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, RefreshCw, Edit2, Trash2, Plus } from 'lucide-react';
import { getAuthHeaders, removeToken } from '../auth';

const apiHost = window.location.hostname || 'localhost';

const apiFetch = async (url, options = {}) => {
  const headers = { ...options.headers, ...getAuthHeaders() };
  const response = await fetch(`https://veroseven-api.onrender.com${url}`, { ...options, headers });
  
  if ((response.status === 401 || response.status === 403) && url.includes('/api/admin')) {
    removeToken();
    window.location.reload();
  }
  
  if (!response.ok) throw new Error('API request failed');
  return response.json();
};

export default function CmsFlagship() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [flagshipProducts, setFlagshipProducts] = useState([]);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  
  const defaultForm = {
    badge_text: 'Flagship Product',
    product_name: 'New Product',
    description: '',
    button_text: 'Explore',
    button_url: '#',
    card_icon: 'star',
    card_title: 'Title',
    card_subtitle: 'Subtitle',
    card_status: 'Active'
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchCmsData();
  }, []);

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/cms');
      const flagshipEntry = data.find(item => item.section_key === 'home_flagship');
      
      if (flagshipEntry && flagshipEntry.content) {
        let content = flagshipEntry.content;
        if (!Array.isArray(content)) {
          content = [content];
        }
        setFlagshipProducts(content);
      }
    } catch (error) {
      console.error('Error fetching CMS:', error);
      setMessage({ text: 'Failed to load flagship configuration.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setFormData(flagshipProducts[index]);
      setEditIndex(index);
    } else {
      setFormData(defaultForm);
      setEditIndex(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData(defaultForm);
    setEditIndex(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = () => {
    let updatedList = [...flagshipProducts];
    if (editIndex !== null) {
      updatedList[editIndex] = formData;
    } else {
      updatedList.push(formData);
    }
    setFlagshipProducts(updatedList);
    handleCloseModal();
  };

  const handleDeleteProduct = (index) => {
    if (window.confirm("Are you sure you want to delete this flagship product?")) {
      const updatedList = [...flagshipProducts];
      updatedList.splice(index, 1);
      setFlagshipProducts(updatedList);
    }
  };

  const handleSaveToCMS = async () => {
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });
      
      await apiFetch('/api/admin/cms/home_flagship', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: flagshipProducts })
      });
      
      setMessage({ text: 'Flagship products updated successfully.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error saving CMS:', error);
      setMessage({ text: 'Failed to save changes.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Flagship Products</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Manage the flagship products displayed on the marketing homepage.
          </p>
        </div>
        <button
          className="btn-text"
          style={{ 
            background: 'var(--primary-color)',
            borderColor: 'var(--border-color)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px'
          }}
          onClick={() => handleOpenModal()}
        >
          <Plus size={16} /> Add Flagship Product
        </button>
      </div>

      {message.text && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          backgroundColor: message.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#4ade80' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{message.text}</span>
        </div>
      )}

      {/* List View */}
      {flagshipProducts.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
          No flagship products found. Click "Add Flagship Product" to create one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {flagshipProducts.map((product, idx) => (
            <div key={idx} className="data-table-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="status-badge active">{product.badge_text}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleOpenModal(idx)} className="btn-icon" style={{ color: 'var(--primary-color)' }} title="Edit"><Edit2 size={16}/></button>
                  <button onClick={() => handleDeleteProduct(idx)} className="btn-icon" style={{ color: '#ef4444' }} title="Delete"><Trash2 size={16}/></button>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{product.product_name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Button:</strong> {product.button_text} ({product.button_url})
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginTop: '2.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)' 
      }}>
        <button
          onClick={handleSaveToCMS}
          disabled={saving}
          className="btn-text"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem'
          }}
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Publishing to CMS...' : 'Save & Publish Changes'}
        </button>
      </div>

      {/* Modal Editor */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontSize: '1.1rem' }}>
              {editIndex !== null ? 'Edit Flagship Product' : 'Add Flagship Product'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Main Details</h4>
                <InputField label="Badge Text" name="badge_text" value={formData.badge_text} onChange={handleChange} />
                <InputField label="Product Name" name="product_name" value={formData.product_name} onChange={handleChange} />
                <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <InputField label="Button Text" name="button_text" value={formData.button_text} onChange={handleChange} />
                  <InputField label="Button URL" name="button_url" value={formData.button_url} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Side Card</h4>
                <InputField label="Icon Name (Lucide)" name="card_icon" value={formData.card_icon} onChange={handleChange} placeholder="e.g. radio, box, sparkles" />
                <InputField label="Card Title" name="card_title" value={formData.card_title} onChange={handleChange} />
                <InputField label="Card Subtitle" name="card_subtitle" value={formData.card_subtitle} onChange={handleChange} placeholder="e.g. Feature 1 • Feature 2" />
                <InputField label="Status Badge" name="card_status" value={formData.card_status} onChange={handleChange} placeholder="e.g. Launching Soon" />
              </div>
            </div>
            
            <div className="modal-actions" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-text" style={{ background: 'var(--primary-color)', color: 'white', padding: '0.6rem 1.2rem', border: 'none' }} onClick={handleSaveProduct}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <div className="detail-group" style={{ marginBottom: 0 }}>
    <label className="detail-label">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', 
        background: 'rgba(0,0,0,0.1)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange }) => (
  <div className="detail-group" style={{ marginBottom: 0 }}>
    <label className="detail-label">{label}</label>
    <textarea
      name={name}
      rows={4}
      value={value}
      onChange={onChange}
      style={{
        width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', 
        background: 'rgba(0,0,0,0.1)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', resize: 'vertical'
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
    />
  </div>
);
