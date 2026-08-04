const fs = require('fs');

const filesToUpdate = ['updates.html', 'opportunities.html'];

for (const file of filesToUpdate) {
  let content = fs.readFileSync(file, 'utf8');

  const ctaRegex = /<!-- WhatsApp CTA -->[\s\S]*?<\/section>/;
  const newCTA = `<!-- CTA -->
  <section class="section bg-gradient" style="padding-top:2rem; padding-bottom:2rem;">
    <div class="container">
      <div class="glass-panel fade-up" style="padding:1.5rem 2rem; display:flex; align-items:center; justify-content:space-between; gap:2rem; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:1.5rem;">
          <div style="color:var(--color-accent); font-size:2rem;"><i data-lucide="rocket"></i></div>
          <div>
            <h2 style="margin:0 0 0.25rem 0; font-size:1.5rem;">Follow the Journey</h2>
            <p style="margin:0; font-size:0.95rem; color:rgba(255,255,255,0.7); max-width:600px;">Join the official VEROSEVEN WhatsApp Channel for updates, product launches, behind-the-scenes development, and opportunities to collaborate.</p>
          </div>
        </div>
        <a href="https://whatsapp.com/channel/0029VbCP2pc2ER6ZSRBTLx2l" target="_blank" class="btn btn-primary" id="updates-whatsapp-btn" style="white-space:nowrap; padding:0.6rem 1.2rem;">Join WhatsApp Channel</a>
      </div>
    </div>
  </section>`;

  content = content.replace(ctaRegex, newCTA);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated', file);
}
