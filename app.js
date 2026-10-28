(() => {
  'use strict';

  // ─────────────────────────────────────────────────────────────────
  // Theme Management (Light / Dark)
  // ─────────────────────────────────────────────────────────────────
  const getPreferredTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    updateThemeLabels(isDark);
  };

  const toggleTheme = () => {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  const updateThemeLabels = (isDark) => {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
    const mobileLabel = document.getElementById('theme-label-mobile');
    const mobileBadge = document.getElementById('theme-badge-mobile');
    if (mobileLabel) mobileLabel.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
    if (mobileBadge) mobileBadge.textContent = isDark ? 'Activado' : 'Desactivado';
  };

  // Apply theme immediately to prevent flash
  applyTheme(getPreferredTheme());

  // ─────────────────────────────────────────────────────────────────
  // DOM Ready
  // ─────────────────────────────────────────────────────────────────
  const onReady = (cb) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb, { once: true });
    } else {
      cb();
    }
  };

  onReady(() => {
    // Sync theme state on load
    applyTheme(getPreferredTheme());

    // Theme toggle buttons
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const themeBtnMobile = document.getElementById('theme-toggle-mobile');
    if (themeBtnMobile) themeBtnMobile.addEventListener('click', toggleTheme);

    // OS theme change listener (when user hasn't set explicit preference)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
    });

    // ─────────────────────────────────────────────────────────────────
        // Services shown in normal document flow
    const servicesSection = document.querySelector('.services-scroll-section');
    const servicesTrack = servicesSection?.querySelector('.services-track');
    const serviceCards = servicesTrack ? Array.from(servicesTrack.querySelectorAll('.service-card')) : [];
    if (servicesSection && servicesTrack && serviceCards.length) {
      servicesSection.style.height = 'auto';
      servicesSection.classList.add('services-static');
      servicesTrack.style.transform = '';
      serviceCards.forEach((card) => {
        card.style.transform = '';
        card.style.opacity = '';
        card.style.zIndex = '';
        card.style.pointerEvents = '';
        card.setAttribute('aria-hidden', 'false');
      });
    }
    // Mobile Navigation Controls
    // ─────────────────────────────────────────────────────────────────
    const mobileNavDetails = document.querySelectorAll('.mobile-navigation');
    mobileNavDetails.forEach((menu) => {
      menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => { menu.open = false; });
      });
      const backdrop = menu.querySelector('.mobile-nav-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', (e) => { e.stopPropagation(); menu.open = false; });
      }
    });

    // Close on outside click
    document.addEventListener('click', (event) => {
      mobileNavDetails.forEach((menu) => {
        if (menu.open && !menu.contains(event.target)) menu.open = false;
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        mobileNavDetails.forEach((menu) => { if (menu.open) menu.open = false; });
      }
    });

    // Close on desktop resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        mobileNavDetails.forEach((menu) => { if (menu.open) menu.open = false; });
      }
    }, { passive: true });

    // ─────────────────────────────────────────────────────────────────
    // Contact form handler
    // ─────────────────────────────────────────────────────────────────
    const contactForm = document.querySelector('[data-contact-form]');
    if (contactForm) {
      contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const status = document.getElementById('form-status');
        const msg = '¡Gracias por contactarnos! Un especialista de Tecnología Transaccional se pondrá en contacto pronto.';
        if (status) {
          status.textContent = msg;
          // Make visible temporarily
          status.classList.remove('sr-only');
          status.classList.add('block', 'text-sm', 'text-secondary', 'dark:text-emerald-400', 'mt-4', 'text-center');
        }
        contactForm.reset();
        alert(msg);
        setTimeout(() => {
          if (status) {
            status.classList.add('sr-only');
            status.classList.remove('block', 'text-sm', 'text-secondary', 'dark:text-emerald-400', 'mt-4', 'text-center');
            status.textContent = '';
          }
        }, 6000);
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // Scrollspy: active nav item highlight
    // ─────────────────────────────────────────────────────────────────
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const desktopNavLinks = Array.from(document.querySelectorAll('header nav a.nav-item[data-path]'));
    const mobileNavLinks = Array.from(document.querySelectorAll('.mobile-nav-panel a.mobile-nav-item[data-path]'));

    const updateActiveNav = () => {
      const scrollY = window.scrollY + 120;
      let currentId = '';
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= scrollY) { currentId = sections[i].id; break; }
      }
      if (!currentId && sections.length > 0) currentId = sections[0].id;

      desktopNavLinks.forEach((link) => {
        if (link.getAttribute('data-path') === currentId) {
          link.classList.add('bg-primary', 'dark:bg-emerald-600', 'text-on-primary', 'font-semibold');
          link.classList.remove('text-on-surface-variant', 'dark:text-slate-300');
        } else {
          link.classList.remove('bg-primary', 'dark:bg-emerald-600', 'text-on-primary', 'font-semibold');
          link.classList.add('text-on-surface-variant', 'dark:text-slate-300');
        }
      });

      mobileNavLinks.forEach((link) => {
        if (link.getAttribute('data-path') === currentId) {
          link.classList.add('bg-primary/10', 'dark:bg-emerald-950/50', 'text-primary', 'dark:text-emerald-400', 'font-bold');
        } else {
          link.classList.remove('bg-primary/10', 'dark:bg-emerald-950/50', 'text-primary', 'dark:text-emerald-400', 'font-bold');
        }
      });
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // Ensure anchor sections are focusable for in-page links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target && !target.hasAttribute('tabindex') && target.tagName.toLowerCase() === 'section') {
        target.setAttribute('tabindex', '-1');
      }
    });
  });
})();
