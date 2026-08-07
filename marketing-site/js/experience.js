document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'https://veroseven-api.onrender.com/api';

  async function fetchEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    try {
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error('Network error');
      const events = await res.json();
      
      if (events.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted)">No upcoming events scheduled at this moment.</p>';
        return;
      }

      container.innerHTML = events.slice(0, 3).map(evt => `
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:1.5rem; transition:transform 0.2s;">
          <h4 style="margin:0 0 0.5rem; font-size:1.1rem; color:var(--color-white)">${evt.title}</h4>
          <p style="margin:0 0 0.5rem; color:var(--color-accent); font-size:0.85rem; font-weight:600;">
            ${new Date(evt.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} 
            • ${evt.location}
          </p>
          <p style="margin:0; font-size:0.9rem; color:rgba(255,255,255,0.7); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${evt.description}</p>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = '<p style="color:var(--text-muted)">Unable to load events.</p>';
      console.error(err);
    }
  }

  async function fetchUpdates() {
    const container = document.getElementById('updates-container');
    if (!container) return;

    try {
      const res = await fetch(`${API_BASE}/updates`);
      if (!res.ok) throw new Error('Network error');
      const allUpdates = await res.json();
      
      // Filter updates relevant to Education, Experience, Impact
      const relevantTags = ['education', 'impact', 'experience', 'academy', 'challenge'];
      const filtered = allUpdates.filter(u => relevantTags.some(t => u.tag.toLowerCase().includes(t)));

      if (filtered.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted)">Check back soon for impact updates.</p>';
        return;
      }

      container.innerHTML = filtered.slice(0, 3).map(upd => `
        <a href="updates.html" style="text-decoration:none; display:block;">
          <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:1.5rem; transition:transform 0.2s;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
              <span style="font-size:0.75rem; background:rgba(212,175,55,0.1); color:var(--color-accent); padding:0.2rem 0.5rem; border-radius:4px;">${upd.tag}</span>
              <span style="font-size:0.75rem; color:rgba(255,255,255,0.5);">${upd.date_label}</span>
            </div>
            <h4 style="margin:0 0 0.5rem; font-size:1.1rem; color:var(--color-white)">${upd.title}</h4>
            <p style="margin:0; font-size:0.9rem; color:rgba(255,255,255,0.7); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${upd.excerpt}</p>
          </div>
        </a>
      `).join('');
    } catch (err) {
      container.innerHTML = '<p style="color:var(--text-muted)">Unable to load updates.</p>';
      console.error(err);
    }
  }

  async function fetchGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    try {
      const res = await fetch(`${API_BASE}/gallery`);
      if (!res.ok) throw new Error('Network error');
      const gallery = await res.json();
      
      if (gallery.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center;">More moments coming soon.</p>';
        return;
      }

      container.innerHTML = gallery.map(img => `
        <div class="gallery-item">
          <img src="${img.image_url}" alt="${img.caption}" loading="lazy" />
          <div class="gallery-caption">
            <strong>${img.related_program || 'Tech Moment'}</strong><br>
            ${img.caption || ''}
          </div>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center;">Unable to load gallery.</p>';
      console.error(err);
    }
  }

  async function fetchTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    try {
      const res = await fetch(`${API_BASE}/testimonials`);
      if (!res.ok) throw new Error('Network error');
      const testimonials = await res.json();
      
      if (testimonials.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center;">No testimonials available.</p>';
        return;
      }

      container.innerHTML = testimonials.map(t => `
        <div class="testimonial-card">
          <p style="font-style:italic; line-height:1.6; color:rgba(255,255,255,0.9); margin-bottom:1.5rem;">"${t.content}"</p>
          <div style="display:flex; align-items:center; gap:1rem;">
            ${t.avatar_url ? `<img src="${t.avatar_url}" alt="${t.author_name}" style="width:48px; height:48px; border-radius:50%; object-fit:cover;" />` : `<div style="width:48px; height:48px; border-radius:50%; background:var(--color-surface); border:1px solid var(--color-border); display:flex; align-items:center; justify-content:center; color:var(--color-accent);"><i data-lucide="user"></i></div>`}
            <div>
              <div style="font-weight:700; color:white;">${t.author_name}</div>
              <div style="font-size:0.85rem; color:var(--color-accent);">${t.role}</div>
            </div>
          </div>
        </div>
      `).join('');
      
      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch (err) {
      container.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center;">Unable to load testimonials.</p>';
      console.error(err);
    }
  }

  // Init
  fetchEvents();
  fetchUpdates();
  fetchGallery();
  fetchTestimonials();
});
