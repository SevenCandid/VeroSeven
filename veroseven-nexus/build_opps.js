const fs = require('fs');
let content = fs.readFileSync('updates.html', 'utf8');

// Title and Meta
content = content.replace('<title>Updates — VEROSEVEN</title>', '<title>Opportunities — VEROSEVEN</title>');
content = content.replace('content="Stay up to date with VEROSEVEN\'s journey, product releases, and behind-the-scenes stories."', 'content="Join the VEROSEVEN team. View our open opportunities."');

// Nav
content = content.replace('<a href="updates.html" class="nav-link active">Updates</a>', '<a href="updates.html" class="nav-link">Updates</a>');
content = content.replace('<a href="opportunities.html" class="nav-link">Opportunities</a>', '<a href="opportunities.html" class="nav-link active">Opportunities</a>');

// Header
const headerRegex = /<section class="section bg-gradient" style="padding-top: 5\.5rem; padding-bottom: 1\.5rem;">[\s\S]*?<\/section>/;
const newHeader = `<section class="section bg-gradient" style="padding-top: 5.5rem; padding-bottom: 1.5rem;">
    <div class="container text-center fade-up">
      <span class="badge">Careers</span>
      <h1 style="margin-top:1rem;">Opportunities</h1>
      <p style="margin: 1rem auto 0; font-size: 1.1rem; max-width: 600px; animation-delay:0.2s;">Join us in building authentic, impactful technology. Explore our open roles.</p>
    </div>
  </section>`;
content = content.replace(headerRegex, newHeader);

// Remove Featured Post
const featuredPostRegex = /<!-- Featured Post -->[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(featuredPostRegex, '');

// Grid container
content = content.replace('id="updates-grid-container"', 'id="opportunities-grid"');

// JS Block
const jsRegex = /<script>[\s\S]*?\/\/ Fetch live Updates data[\s\S]*?<\/script>/;
const newJS = `<script>
    document.addEventListener('DOMContentLoaded', async () => {
      window.oppData = [];
      try {
        const apiHost = window.location.hostname || 'localhost';
        const res = await fetch(\`http://\${apiHost}:3001/api/opportunities\`);
        if (res.ok) {
          const opps = await res.json();
          window.oppData = opps;
          const gridContainer = document.getElementById('opportunities-grid');
          let delay = 0;
          
          if(opps.length === 0) {
            gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:rgba(255,255,255,0.5);">No open opportunities right now. Check back later!</p>';
          }

          opps.forEach((opp, idx) => {
            gridContainer.innerHTML += \`
              <div class="glass-panel blog-card fade-up in-view" style="animation-delay:\${delay}s;" onclick="openModal(\${idx})">
                <div class="blog-meta">
                  <span class="blog-tag">\${opp.category}</span>
                  <span class="dot"></span>
                  <span style="color:var(--color-accent)">\${opp.type}</span>
                  <span class="dot"></span>
                  <span>\${opp.location}</span>
                </div>
                <h3 class="blog-title">\${opp.title}</h3>
                <div class="blog-read-more" style="margin-top:1rem;">View Details <i data-lucide="arrow-right"></i></div>
              </div>
            \`;
            delay += 0.1;
          });
        }
      } catch (err) {
        console.error('Failed to fetch opportunities:', err);
      }
    });

    window.openModal = function(idx) {
      const opp = window.oppData[idx];
      document.getElementById('modalMeta').innerHTML = '<span class="blog-tag">' + opp.category + '</span><span class="dot"></span><span style="color:var(--color-accent)">' + opp.type + '</span><span class="dot"></span><span>' + opp.location + '</span>';
      document.getElementById('modalTitle').innerText = opp.title;
      
      const contentHtml = opp.description.replace(/\\n/g, '<br/>');
      const applyBtn = '<div style="margin-top:2rem;"><a href="mailto:hello@veroseven.com?subject=Application for ' + encodeURIComponent(opp.title) + '" class="btn btn-primary">Apply Now</a></div>';
      
      document.getElementById('modalContent').innerHTML = contentHtml + applyBtn;
      document.getElementById('oppModal').style.display = 'block';
    };
  </script>`;
content = content.replace(jsRegex, newJS);

// Modal ID
content = content.replace(/updatesModal/g, 'oppModal');

fs.writeFileSync('opportunities.html', content, 'utf8');
console.log('Rebuilt opportunities.html from updates.html');
