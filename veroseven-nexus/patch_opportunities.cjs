const fs = require('fs');

let content = fs.readFileSync('opportunities.html', 'utf8');

// Update Title and Meta
content = content.replace(/<title>Updates — VEROSEVEN<\/title>/, '<title>Opportunities — VEROSEVEN</title>');
content = content.replace(/content="Stay up to date with VEROSEVEN's journey.*?"/, 'content="Join the VEROSEVEN team. View our open opportunities."');

// Update Nav active state
content = content.replace(/class="nav-link active">Updates<\/a>/, 'class="nav-link">Updates</a>\n        <a href="opportunities.html" class="nav-link active">Opportunities</a>');
content = content.replace(/<a href="contact.html" class="nav-link">Contact<\/a>/, '<a href="contact.html" class="nav-link">Contact</a>'); // already placed by above or we can just replace specifically

// Remove the featured post section and replace header
const headerRegex = /<section class="hero[^>]*>[\s\S]*?<\/section>/;
const newHeader = `<section class="hero" style="min-height:40vh; align-items:flex-end; padding-bottom:3rem;">
    <div class="container text-center fade-up">
      <span class="badge">Careers</span>
      <h1 style="margin-top:1rem;">Opportunities</h1>
      <p style="margin:0 auto; font-size:1.1rem; max-width:600px;">Join us in building authentic, impactful technology. Explore our open roles.</p>
    </div>
  </section>`;
content = content.replace(headerRegex, newHeader);

// Clean out updates-grid-container and modal ids so we don't conflict
content = content.replace('updates-grid-container', 'opportunities-grid');
content = content.replace(/updatesModal/g, 'oppModal');

// Replace JS fetching logic
const jsRegex = /window\.updatesData = updates;[\s\S]*?\}\);/g;
const newJS = `window.oppData = [];
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
`;
content = content.replace(jsRegex, newJS);

// Replace JS modal open logic
const jsModalRegex = /window\.openModal = function\(idx\) \{[\s\S]*?style\.display = 'block';\s*\};/;
const newJSModal = `window.openModal = function(idx) {
      const opp = window.oppData[idx];
      document.getElementById('modalMeta').innerHTML = '<span class="blog-tag">' + opp.category + '</span><span class="dot"></span><span style="color:var(--color-accent)">' + opp.type + '</span><span class="dot"></span><span>' + opp.location + '</span>';
      document.getElementById('modalTitle').innerText = opp.title;
      
      const contentHtml = opp.description.replace(/\\n/g, '<br/>');
      const applyBtn = '<div style="margin-top:2rem;"><a href="mailto:hello@veroseven.com?subject=Application for ' + encodeURIComponent(opp.title) + '" class="btn btn-primary">Apply Now</a></div>';
      
      document.getElementById('modalContent').innerHTML = contentHtml + applyBtn;
      document.getElementById('oppModal').style.display = 'block';
    };`;
content = content.replace(jsModalRegex, newJSModal);

fs.writeFileSync('opportunities.html', content);
console.log('opportunities.html prepared');
