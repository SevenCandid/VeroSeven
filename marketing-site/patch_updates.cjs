const fs = require('fs');

let content = fs.readFileSync('updates.html', 'utf8');

// The script inside updates.html fetches the updates. We'll modify it to add onclick handlers.

content = content.replace(/<div class="blog-read-more">Read More/g, `<div class="blog-read-more" onclick='openModal(this)'>Read More`);

// But wait, it's better to store the full content somewhere. 
// Let's replace the JS block entirely to ensure it sets the data cleanly.

const oldJS = `updates.forEach((upd, idx) => {
            if (idx === 0) {
              // The first update is meant for the Featured Post (already hardcoded above the grid)
              // We could dynamically replace the featured post as well:
              const featuredPost = document.getElementById('post-welcome');
              if (featuredPost) {
                featuredPost.innerHTML = \`
                  <div class="blog-meta">
                    <span class="blog-tag">\${upd.tag}</span>
                    <span class="dot"></span>
                    <span>\${upd.date_label}</span>
                    <span class="dot"></span>
                    <span>3 min read</span>
                  </div>
                  <h2 class="blog-title" style="font-size:2rem;">\${upd.title}</h2>
                  <p class="blog-excerpt">\${upd.excerpt}</p>
                  <div class="blog-read-more" onclick='openModal(\${JSON.stringify(upd)})'>Read More <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                \`;
              }
            } else {
              gridContainer.innerHTML += \`
                <div class="glass-panel blog-card fade-up in-view" style="animation-delay:\${delay}s;" onclick='openModal(\${JSON.stringify(upd)})'>
                  <div class="blog-meta">
                    <span class="blog-tag">\${upd.tag}</span>
                    <span class="dot"></span>
                    <span>\${upd.date_label}</span>
                  </div>
                  <h3 class="blog-title">\${upd.title}</h3>
                  <p class="blog-excerpt">\${upd.excerpt}</p>
                  <div class="blog-read-more">Read More <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                </div>
              \`;
              delay += 0.1;
            }
          });`;

// In order to not mess up regex, let's just write a generic replacer or append a global function.
// Since the script in updates.html is dynamically rendering, we can expose `window.updatesData = []` 
// and reference it by index.

const regex = /updates\.forEach\(\(upd, idx\) => \{[\s\S]*? delay \+= 0\.1;\s*\}\s*\}\);/;

const newJS = `window.updatesData = updates;
          updates.forEach((upd, idx) => {
            if (idx === 0) {
              const featuredPost = document.getElementById('post-welcome');
              if (featuredPost) {
                featuredPost.innerHTML = \`
                  <div class="blog-meta">
                    <span class="blog-tag">\${upd.tag}</span><span class="dot"></span><span>\${upd.date_label}</span>
                  </div>
                  <h2 class="blog-title" style="font-size:2rem; cursor:pointer;" onclick="openModal(\${idx})">\${upd.title}</h2>
                  <p class="blog-excerpt">\${upd.excerpt}</p>
                  <div class="blog-read-more" style="cursor:pointer;" onclick="openModal(\${idx})">Read More <i data-lucide="arrow-right"></i></div>
                \`;
              }
            } else {
              gridContainer.innerHTML += \`
                <div class="glass-panel blog-card fade-up in-view" style="animation-delay:\${delay}s;" onclick="openModal(\${idx})">
                  <div class="blog-meta">
                    <span class="blog-tag">\${upd.tag}</span><span class="dot"></span><span>\${upd.date_label}</span>
                  </div>
                  <h3 class="blog-title">\${upd.title}</h3>
                  <p class="blog-excerpt">\${upd.excerpt}</p>
                  <div class="blog-read-more">Read More <i data-lucide="arrow-right"></i></div>
                </div>
              \`;
              delay += 0.1;
            }
          });`;

content = content.replace(regex, newJS);

// Add the openModal function to the script block
content = content.replace('</script>\n  <script src="https://unpkg.com/lucide@latest"></script>', 
`
    window.openModal = function(idx) {
      const upd = window.updatesData[idx];
      document.getElementById('modalMeta').innerHTML = '<span class="blog-tag">' + upd.tag + '</span><span class="dot"></span><span>' + upd.date_label + '</span>';
      document.getElementById('modalTitle').innerText = upd.title;
      // Convert line breaks to paragraphs or br
      document.getElementById('modalContent').innerHTML = upd.content.replace(/\\n/g, '<br/>');
      document.getElementById('updatesModal').style.display = 'block';
    };
  </script>\n  <script src="https://unpkg.com/lucide@latest"></script>`);

fs.writeFileSync('updates.html', content);
console.log('updates.html patched');
