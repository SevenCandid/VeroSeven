import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, MessageSquare, Calendar } from 'lucide-react';
import './ExperienceManager.css';

export default function ExperienceManager({ apiFetch, showToast }) {
  const [activeTab, setActiveTab] = useState('events'); // events, testimonials, gallery
  const [events, setEvents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);

  const [loading, setLoading] = useState(false);

  // Modals
  const [eventModal, setEventModal] = useState({ show: false, mode: 'create', data: null });
  const [testimonialModal, setTestimonialModal] = useState({ show: false, mode: 'create', data: null });
  const [galleryModal, setGalleryModal] = useState({ show: false, mode: 'create', data: null });

  useEffect(() => {
    if (activeTab === 'events') fetchEvents();
    if (activeTab === 'testimonials') fetchTestimonials();
    if (activeTab === 'gallery') fetchGallery();
  }, [activeTab]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('https://veroseven-api.onrender.com/api/events');
      if (res.ok) setEvents(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('https://veroseven-api.onrender.com/api/testimonials');
      if (res.ok) setTestimonials(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('https://veroseven-api.onrender.com/api/gallery');
      if (res.ok) setGallery(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const url = eventModal.mode === 'create' 
        ? 'https://veroseven-api.onrender.com/api/admin/events'
        : `https://veroseven-api.onrender.com/api/admin/events/${eventModal.data.id}`;
      
      const res = await apiFetch(url, {
        method: eventModal.mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Event saved', 'success');
        setEventModal({ show: false, mode: 'create', data: null });
        fetchEvents();
      }
    } catch (err) {
      showToast('Error saving event', 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete event?')) return;
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/events/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Event deleted', 'success'); fetchEvents(); }
    } catch (err) { showToast('Error deleting event', 'error'); }
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const url = testimonialModal.mode === 'create' 
        ? 'https://veroseven-api.onrender.com/api/admin/testimonials'
        : `https://veroseven-api.onrender.com/api/admin/testimonials/${testimonialModal.data.id}`;
      
      const res = await apiFetch(url, {
        method: testimonialModal.mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Testimonial saved', 'success');
        setTestimonialModal({ show: false, mode: 'create', data: null });
        fetchTestimonials();
      }
    } catch (err) {
      showToast('Error saving testimonial', 'error');
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete testimonial?')) return;
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Testimonial deleted', 'success'); fetchTestimonials(); }
    } catch (err) { showToast('Error deleting testimonial', 'error'); }
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const res = await apiFetch('https://veroseven-api.onrender.com/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Image added to gallery', 'success');
        setGalleryModal({ show: false, mode: 'create', data: null });
        fetchGallery();
      }
    } catch (err) {
      showToast('Error saving gallery image', 'error');
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete image?')) return;
    try {
      const res = await apiFetch(`https://veroseven-api.onrender.com/api/admin/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Image deleted', 'success'); fetchGallery(); }
    } catch (err) { showToast('Error deleting image', 'error'); }
  };

  return (
    <div className="experience-manager fade-up">
      <div className="header-actions">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Experience Ecosystem</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage Events, Testimonials, and Tech Moments Gallery.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 'events' && (
            <button className="btn-primary" onClick={() => setEventModal({ show: true, mode: 'create', data: null })}>
              <Plus size={16} /> New Event
            </button>
          )}
          {activeTab === 'testimonials' && (
            <button className="btn-primary" onClick={() => setTestimonialModal({ show: true, mode: 'create', data: null })}>
              <Plus size={16} /> New Testimonial
            </button>
          )}
          {activeTab === 'gallery' && (
            <button className="btn-primary" onClick={() => setGalleryModal({ show: true, mode: 'create', data: null })}>
              <Plus size={16} /> Add Photo
            </button>
          )}
        </div>
      </div>

      <div className="exp-tabs">
        <button className={`exp-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
          <Calendar size={16} /> Events
        </button>
        <button className={`exp-tab ${activeTab === 'testimonials' ? 'active' : ''}`} onClick={() => setActiveTab('testimonials')}>
          <MessageSquare size={16} /> Testimonials
        </button>
        <button className={`exp-tab ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>
          <ImageIcon size={16} /> Gallery
        </button>
      </div>

      <div className="exp-content">
        {loading && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}

        {!loading && activeTab === 'events' && (
          <div className="grid grid-3">
            {events.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No events found.</p> : events.map(evt => (
              <div key={evt.id} className="card">
                {evt.image_url && <img src={evt.image_url} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem' }}>{evt.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{evt.type} • {evt.location}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{evt.event_date ? new Date(evt.event_date).toLocaleString() : 'TBA'}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={() => setEventModal({ show: true, mode: 'edit', data: evt })}><Edit2 size={14} /></button>
                    <button className="btn-danger" onClick={() => handleDeleteEvent(evt.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === 'testimonials' && (
          <div className="grid grid-3">
            {testimonials.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No testimonials found.</p> : testimonials.map(t => (
              <div key={t.id} className="card" style={{ padding: '1.5rem' }}>
                <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'var(--text-muted)' }}>"{t.content}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {t.avatar_url && <img src={t.avatar_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />}
                  <div>
                    <div style={{ fontWeight: '600' }}>{t.author_name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn-secondary" onClick={() => setTestimonialModal({ show: true, mode: 'edit', data: t })}><Edit2 size={14} /></button>
                  <button className="btn-danger" onClick={() => handleDeleteTestimonial(t.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === 'gallery' && (
          <div className="grid grid-4">
            {gallery.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No gallery images found.</p> : gallery.map(g => (
              <div key={g.id} className="card" style={{ position: 'relative' }}>
                <img src={g.image_url} alt={g.caption} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ padding: '0.5rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{g.caption || 'No caption'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>{g.related_program}</p>
                </div>
                <button className="btn-danger" onClick={() => handleDeleteGallery(g.id)} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {eventModal.show && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3>{eventModal.mode === 'create' ? 'Create Event' : 'Edit Event'}</h3>
            <form onSubmit={handleSaveEvent}>
              <div className="modal-details-grid">
                <div className="detail-group">
                  <label className="detail-label">Event Title</label>
                  <input type="text" name="title" defaultValue={eventModal.data?.title || ''} required className="opp-input" />
                </div>
                <div className="detail-group">
                  <label className="detail-label">Type (e.g. Workshop, Competition)</label>
                  <input type="text" name="type" defaultValue={eventModal.data?.type || ''} className="opp-input" />
                </div>
                <div className="detail-group">
                  <label className="detail-label">Location</label>
                  <input type="text" name="location" defaultValue={eventModal.data?.location || ''} className="opp-input" />
                </div>
                <div className="detail-group">
                  <label className="detail-label">Event Date (ISO or MM/DD/YYYY)</label>
                  <input type="text" name="event_date" defaultValue={eventModal.data?.event_date || ''} className="opp-input" />
                </div>
              </div>
              <div className="detail-group" style={{ marginTop: '1rem' }}>
                <label className="detail-label">Description</label>
                <textarea name="description" defaultValue={eventModal.data?.description || ''} className="opp-input" rows="3"></textarea>
              </div>
              <div className="detail-group" style={{ marginTop: '1rem' }}>
                <label className="detail-label">Cover Image URL</label>
                <input type="text" name="image_url" defaultValue={eventModal.data?.image_url || ''} className="opp-input" />
              </div>
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn-cancel" onClick={() => setEventModal({ show: false })}>Cancel</button>
                <button type="submit" className="btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {testimonialModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{testimonialModal.mode === 'create' ? 'Add Testimonial' : 'Edit Testimonial'}</h3>
            <form onSubmit={handleSaveTestimonial}>
              <div className="modal-details-grid">
                <div className="detail-group">
                  <label className="detail-label">Author Name</label>
                  <input type="text" name="author_name" defaultValue={testimonialModal.data?.author_name || ''} required className="opp-input" />
                </div>
                <div className="detail-group">
                  <label className="detail-label">Role / Affiliation</label>
                  <input type="text" name="role" defaultValue={testimonialModal.data?.role || ''} className="opp-input" />
                </div>
              </div>
              <div className="detail-group" style={{ marginTop: '1rem' }}>
                <label className="detail-label">Content</label>
                <textarea name="content" defaultValue={testimonialModal.data?.content || ''} required className="opp-input" rows="4"></textarea>
              </div>
              <div className="modal-details-grid" style={{ marginTop: '1rem' }}>
                <div className="detail-group">
                  <label className="detail-label">Avatar URL</label>
                  <input type="text" name="avatar_url" defaultValue={testimonialModal.data?.avatar_url || ''} className="opp-input" />
                </div>
                <div className="detail-group">
                  <label className="detail-label">Related Program</label>
                  <input type="text" name="program" defaultValue={testimonialModal.data?.program || ''} className="opp-input" />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn-cancel" onClick={() => setTestimonialModal({ show: false })}>Cancel</button>
                <button type="submit" className="btn-primary">Save Testimonial</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {galleryModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Tech Moment (Gallery)</h3>
            <form onSubmit={handleSaveGallery}>
              <div className="detail-group">
                <label className="detail-label">Image URL</label>
                <input type="text" name="image_url" required className="opp-input" />
              </div>
              <div className="detail-group" style={{ marginTop: '1rem' }}>
                <label className="detail-label">Caption (Optional)</label>
                <input type="text" name="caption" className="opp-input" />
              </div>
              <div className="detail-group" style={{ marginTop: '1rem' }}>
                <label className="detail-label">Related Program (Optional)</label>
                <input type="text" name="related_program" className="opp-input" />
              </div>
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn-cancel" onClick={() => setGalleryModal({ show: false })}>Cancel</button>
                <button type="submit" className="btn-primary">Add Image</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
