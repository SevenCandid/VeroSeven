const fs = require('fs');
let text = fs.readFileSync('opportunities.html', 'utf8');

// Fix nav
text = text.replace(/<div class="nav-links" id="navLinks">[\s\S]*?<\/button>\s*<\/div>/, `<div class="nav-links" id="navLinks">
        <button class="nav-close" id="navClose" aria-label="Close Menu">✕</button>
        <a href="index.html" class="nav-link">Home</a>
        <a href="products.html" class="nav-link">Products</a>
        <a href="ecosystem.html" class="nav-link">Ecosystem</a>
        <a href="about.html" class="nav-link">About</a>
        <a href="updates.html" class="nav-link">Updates</a>
        <a href="opportunities.html" class="nav-link active">Opportunities</a>
        <a href="contact.html" class="nav-link">Contact</a>
        <a href="https://whatsapp.com/channel/0029VbCP2pc2ER6ZSRBTLx2l" target="_blank" class="btn btn-primary" style="padding:0.6rem 1.2rem; font-size:0.9rem;">
          <svg style="margin-right:6px" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          Join WhatsApp Channel
        </a>
      </div>
      <button class="menu-toggle" id="menuToggle" aria-label="Toggle Menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>`);

// Fix footer
text = text.replace(/<div class="footer-grid">[\s\S]*?<div class="footer-bottom">/, `<div class="footer-grid">
        <div class="footer-brand">
          <div class="logo" style="font-size:1.25rem; margin-bottom:0.75rem;">
            <img src="assets/vero_logo.png" alt="VEROSEVEN Logo" />
            VEROSEVEN
          </div>
          <p class="footer-tagline">Authentic Innovation. Limitless Possibilities.</p>
          <p style="margin-top:1rem; color:rgba(255,255,255,0.5); font-size:0.875rem;">Building technology that matters.</p>
        </div>
        <div class="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="products.html">Products</a></li>
            <li><a href="ecosystem.html">Ecosystem</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="updates.html">Updates</a></li>
            <li><a href="opportunities.html">Opportunities</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Get In Touch</h4>
          <ul>
            <li><a href="mailto:hello@veroseven.com">hello@veroseven.com</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">`);

// Fix duplicate modals
let singleModal = `  <!-- Modal for full opportunity content -->
  <style>
    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 999; backdrop-filter: blur(10px); }
    .modal-content { background: var(--color-primary); width: 90%; max-width: 800px; margin: 5rem auto; padding: 3rem; border-radius: 24px; border: 1px solid rgba(212,175,55,0.3); position: relative; max-height: 80vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(0,0,0,0.8); }
    .modal-close { position: absolute; top: 1.5rem; right: 1.5rem; background: none; border: none; color: white; font-size: 2rem; cursor: pointer; }
    
    @media (max-width: 768px) {
      .modal-content {
        margin: 2rem auto;
        padding: 1.5rem;
        width: 95%;
        border-radius: 16px;
        max-height: 90vh;
      }
      .modal-close {
        top: 0.75rem;
        right: 0.75rem;
        font-size: 1.5rem;
      }
      #modalTitle {
        font-size: 1.75rem !important;
        margin-top: 1.5rem !important;
      }
      #modalContent {
        font-size: 1rem !important;
      }
    }
  </style>
  <div id="oppModal" class="modal">
    <div class="modal-content">
      <button class="modal-close" onclick="document.getElementById('oppModal').style.display='none'">&times;</button>
      <div class="blog-meta" id="modalMeta"></div>
      <h2 id="modalTitle" style="margin: 1rem 0; font-size: 2.5rem;"></h2>
      <div id="modalContent" style="font-size: 1.1rem; line-height: 1.8; color: rgba(255,255,255,0.8);"></div>
    </div>
  </div>`;
text = text.replace(/<!-- Modal for full opportunity content -->[\s\S]*<\/body>/, singleModal + '\n</body>');

fs.writeFileSync('opportunities.html', text, 'utf8');
console.log('Fixed file');
