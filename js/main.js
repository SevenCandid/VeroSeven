/**
 * VEROSEVEN — Main JavaScript
 * Handles: Navigation, scroll effects, fade-up animations
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Mobile Navigation Toggle ─────────────────────────────────────
  const menuToggle = document.getElementById('menuToggle');
  const navLinks   = document.getElementById('navLinks');
  const navClose   = document.getElementById('navClose');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const expanded = navLinks.classList.toggle('show');
      menuToggle.setAttribute('aria-expanded', expanded);
    });

    if (navClose) {
      navClose.addEventListener('click', () => {
        navLinks.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    }

    // Close menu when a link is clicked
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('show'));
    });
  }

  // ── Navbar Scroll Effect ─────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // ── Intersection Observer — Fade-Up Animations ───────────────────
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Trigger all .fade-up elements
  document.querySelectorAll('.fade-up').forEach((el, i) => {
    // Give above-the-fold elements a tiny delay before activating
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setTimeout(() => el.classList.add('in-view'), i * 80);
    } else {
      observer.observe(el);
    }
  });

  // ── Smooth Scroll for Anchor Links ───────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Active Nav Link Highlighting ─────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

});
