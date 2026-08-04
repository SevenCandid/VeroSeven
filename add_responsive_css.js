const fs = require('fs');
const cssPath = 'c:/Users/DELL/VeroSeven/hq-dashboard/src/App.css';

const responsiveCSS = `

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .dashboard-container {
    position: relative;
  }

  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 50;
    transform: translateX(-100%);
    width: 280px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(2px);
    z-index: 40;
    display: none;
  }
  
  .sidebar-overlay.open {
    display: block;
  }

  .topbar {
    padding: 0 1rem;
  }

  .dashboard-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .data-table-container {
    overflow-x: auto;
  }

  .modal-content {
    width: 95%;
    margin: 2rem auto;
    padding: 1.5rem;
  }
}
`;

fs.appendFileSync(cssPath, responsiveCSS);
console.log('Appended responsive CSS');
