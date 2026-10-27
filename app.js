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
    // Services Scroll-Deck
    // ─────────────────────────────────────────────────────────────────
    const section = document.querySelector('.services-scroll-section');
    const stage = section?.querySelector('.services-sticky-stage');
    const deck = section?.querySelector('#services-deck');
    const track = deck?.querySelector('.services-track');
    const cards = track ? Array.from(track.querySelectorAll('.service-card')) : [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileLayout = window.matchMedia('(max-width: 1023px)');
    let frameRequested = false;
    let currentActive = -1;

    const setCardAccessibility = (activeIndex, mobile = false) => {
      cards.forEach((card, index) => {
        const inactive = !mobile && index !== activeIndex;
        card.setAttribute('aria-hidden', String(inactive));
        card.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((el) => {
          if (inactive) {
            if (!el.hasAttribute('data-original-tabindex')) {
              el.dataset.originalTabindex = el.hasAttribute('tabindex') ? el.getAttribute('tabindex') : '';
            }
            el.setAttribute('tabindex', '-1');
          } else if (el.hasAttribute('data-original-tabindex')) {
            const orig = el.dataset.originalTabindex;
            if (orig === '') el.removeAttribute('tabindex');
            else el.setAttribute('tabindex', orig);
            delete el.dataset.originalTabindex;
          }
        });
      });
    };

    const useStaticCards = () => {
      if (section) {
        section.style.height = 'auto';
        section.classList.add('services-static');
      }
      if (track) track.style.transform = ''; 
      cards.forEach((card) => {
        card.style.transform = '';
        card.style.opacity = '';
        card.style.zIndex = '';
        card.style.pointerEvents = '';
      });
      setCardAccessibility(0, true);
    };

    const setScrollLayout = () => {
      if (!section || !stage || !deck || !track || cards.length < 2) return;
      if (mobileLayout.matches || reducedMotion.matches) { useStaticCards(); return; }
      section.classList.remove('services-static');
      const stageHeight = stage.offsetHeight;
      section.style.height = `${stageHeight + (cards.length - 1) * window.innerHeight}px`;
      updateFromScroll(true);
    };

    const updateFromScroll = (force = false) => {
      frameRequested = false;
      if (!section || !stage || !deck || !track || mobileLayout.matches || reducedMotion.matches) return;
      const rect = section.getBoundingClientRect();
      const available = Math.max(1, section.offsetHeight - stage.offsetHeight);
      const progress = Math.min(cards.length - 1, Math.max(0, -rect.top / available * (cards.length - 1)));
      const activeIndex = Math.min(cards.length - 1, Math.floor(progress + 0.001));
      if (!force && activeIndex === currentActive && Math.abs(progress - activeIndex) < 0.015) return;
      currentActive = activeIndex;

      track.style.transform = `translate3d(${-progress * deck.clientWidth}px, 0, 0)`;
      cards.forEach((card, index) => {
        card.style.pointerEvents = index === activeIndex ? 'auto' : 'none';
      });
      setCardAccessibility(activeIndex);
    };

    const requestUpdate = () => {
      if (frameRequested) return;
      frameRequested = true;
      window.requestAnimationFrame(() => updateFromScroll());
    };

    if (section && stage && deck && track && cards.length > 0) {
      section.style.setProperty('--service-card-count', String(cards.length));
      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', setScrollLayout, { passive: true });
      mobileLayout.addEventListener?.('change', setScrollLayout);
      reducedMotion.addEventListener?.('change', setScrollLayout);
      setScrollLayout();
    }

    // ─────────────────────────────────────────────────────────────────
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
