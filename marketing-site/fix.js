const fs = require('fs');
let text = fs.readFileSync('opportunities.html', 'utf8');
const endIdx = text.indexOf('</html>');
if (endIdx === -1) {
    console.log('Could not find </html>');
    process.exit(1);
}
// take everything up to </html> and the tag itself
let cleanText = text.slice(0, endIdx + 7);

let modalHTML = `
  <!-- Modal for full opportunity content -->
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
  </div>
`;

// Insert modalHTML before </body>
cleanText = cleanText.replace('</body>\r\n</html>', modalHTML + '\n</body>\n</html>');
cleanText = cleanText.replace('</body>\n</html>', modalHTML + '\n</body>\n</html>');

fs.writeFileSync('opportunities.html', cleanText, 'utf8');
console.log('Fixed opportunities.html');
