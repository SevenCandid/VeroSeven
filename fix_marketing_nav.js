const fs = require('fs');
const cssPath = 'c:/Users/DELL/VeroSeven/marketing-site/css/components.css';

const responsiveCSS = `
/* --- Mobile Navigation --- */
@media (max-width: 991px) {
  .menu-toggle {
    display: block;
  }
  
  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    background: var(--color-primary);
    flex-direction: column;
    padding: 5rem 2rem 2rem 2rem;
    transition: right var(--transition-normal);
    box-shadow: -5px 0 30px rgba(0,0,0,0.8);
    z-index: 200;
    align-items: flex-start;
  }
  
  .nav-links.show {
    right: 0;
  }
  
  .nav-close {
    display: block;
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: none;
    border: none;
    color: var(--color-white);
    font-size: 1.5rem;
    cursor: pointer;
  }
  
  .nav-link {
    width: 100%;
    text-align: left;
    padding: 1rem 0;
    font-size: 1.1rem;
    border-bottom: 1px solid var(--color-border);
    border-radius: 0;
  }
  
  .nav-link:hover, .nav-link.active {
    background: transparent;
    color: var(--color-accent);
  }
  
  .nav-link.active::after {
    display: none;
  }
  
  .nav-links .btn {
    margin-top: 1rem;
    width: 100%;
  }
}
`;

fs.appendFileSync(cssPath, responsiveCSS);
console.log('Appended mobile nav CSS to components.css');
