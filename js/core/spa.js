/**
 * =====================================================
 *  StudentPath SPA Engine  — spa.js
 *  =====================================================
 *  Drop this script into any page. It will:
 *   • Intercept all internal navbar link clicks
 *   • Fetch the target page, extract its <main>
 *   • Swap the content in-place (NO full page reload)
 *   • Animate a top progress bar
 *   • Load/unload page-specific scripts dynamically
 *   • Update the URL + browser back/forward works
 *   • Navbar stays fixed — only content changes
 * =====================================================
 */
(function () {
  'use strict';

  // ── Per-page script dependencies ──────────────────────────────────
  const PAGE_SCRIPTS = {
    'explore.html':      ['js/data/careersData.js', 'js/features/explore.js'],
    'exams.html':        ['js/data/examData.js',    'js/features/explore-exams.js'],
    'saved.html':        ['js/data/careersData.js', 'js/data/examData.js', 'js/features/saved.js'],
    'guided-path.html':  ['js/features/guided.js'],
    'career.html':       ['js/data/careersData.js', 'js/features/career.js'],
    'exam.html':         ['js/data/examData.js', 'js/data/careersData.js', 'js/features/exam.js'],
    'dashboard.html':    ['js/features/dashboard.js'],
    'compare.html':      ['js/features/compare.js'],
    'search.html':       ['js/data/careersData.js', 'js/data/examData.js', 'js/features/searchResults.js'],
  };

  // ── Per-page CSS ───────────────────────────────────────────────────
  const PAGE_CSS = {
    'explore.html':      'css/explore.css',
    'exams.html':        'css/explore.css',
    'saved.html':        'css/saved.css',
    'guided-path.html':  'css/guided-path.css',
    'career.html':       'css/career.css',
    'exam.html':         'css/exam.css',
    'dashboard.html':    'css/dashboard.css',
    'compare.html':      'css/components.css',
    'search.html':       'css/explore.css',
  };

  // Pages that should always do a normal full reload
  const EXCLUDE = ['index.html', 'home.html', '404.html', 'about.html', 'quiz.html', 'result.html', 'guided-path.html', 'career.html', 'exam.html'];

  // ── State ─────────────────────────────────────────────────────────
  let isNavigating = false;
  let currentPage  = getPageName(window.location.href);

  // ── Inject styles for progress bar ───────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #__spa_bar {
      position: fixed;
      top: 0; left: 0;
      height: 3px;
      width: 0%;
      opacity: 0;
      background: linear-gradient(90deg, #1a8a4a 0%, #4facfe 100%);
      z-index: 99999;
      border-radius: 0 2px 2px 0;
      pointer-events: none;
      transition: width 0.4s ease;
    }
    #__spa_bar.loading {
      opacity: 1;
      width: 75%;
    }
    #__spa_bar.done {
      width: 100% !important;
      transition: width 0.15s ease, opacity 0.3s ease 0.15s;
      opacity: 0;
    }
    /* Smooth content swap */
    main.__spa_out {
      opacity: 0;
      transition: opacity 0.18s ease;
    }
    main.__spa_in {
      opacity: 1;
      transition: opacity 0.22s ease;
    }
    main {
      opacity: 1;
      transition: opacity 0.22s ease;
    }
  `;
  document.head.appendChild(style);

  // ── Progress bar element ──────────────────────────────────────────
  const bar = document.createElement('div');
  bar.id = '__spa_bar';
  document.body.prepend(bar);

  // ── Helpers ───────────────────────────────────────────────────────
  function getPageName(url) {
    const parts = (url || '').split('/');
    const last  = parts[parts.length - 1].split('?')[0];
    return last && last.endsWith('.html') ? last : '';
  }

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function getPageContent(doc, page) {
    const useBody = page === 'career.html' || page === 'guided-path.html';
    const root = useBody
      ? doc.body
      : (doc.querySelector('main') || doc.querySelector('#app') || doc.body);

    if (root === doc.body) {
      const html = Array.from(doc.body.children)
        .filter(el => el.tagName !== 'SCRIPT' && el.id !== 'navbarContainer')
        .map(el => el.outerHTML)
        .join('');

      return {
        className: page.replace('.html', '') + '-spa-content',
        html
      };
    }

    return {
      className: root.className || '',
      html: root.innerHTML
    };
  }

  function showBar() {
    bar.className = '';
    bar.style.width = '0%';
    bar.style.opacity = '1';
    requestAnimationFrame(() => bar.classList.add('loading'));
  }

  function hideBar() {
    bar.classList.remove('loading');
    bar.classList.add('done');
    setTimeout(() => { bar.className = ''; bar.style.width = '0%'; }, 500);
  }

  // ── CSS loader (idempotent) ────────────────────────────────────────
  function ensureCSS(href) {
    if (!href) return;
    const id = 'spa-css-' + href.replace(/[/.]/g, '_');
    if (!document.getElementById(id)) {
      const link   = document.createElement('link');
      link.rel     = 'stylesheet';
      link.href    = href;
      link.id      = id;
      document.head.appendChild(link);
    }
  }

  // ── Script loader ─────────────────────────────────────────────────
  function removePageScripts() {
    document.querySelectorAll('script[data-spa-page]').forEach(s => s.remove());
  }

  function injectScript(src) {
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.type  = 'module';
      s.src   = src + '?_spa=' + Date.now(); // fresh each time
      s.setAttribute('data-spa-page', 'true');
      s.onload  = resolve;
      s.onerror = () => { console.warn('[SPA] missing script:', src); resolve(); };
      document.body.appendChild(s);
    });
  }

  async function loadPageScripts(page) {
    // Remove previous page scripts
    removePageScripts();

    // Clean up globals that feature scripts register
    [
      'filterType', 'setPill', 'sortCareers', 'searchCareer',
      'filterExam', 'openCareer', 'openExam', 'showTab',
    ].forEach(k => { try { if (window[k]) delete window[k]; } catch (_) {} });

    const scripts = PAGE_SCRIPTS[page] || [];
    for (const src of scripts) {
      await injectScript(src);
    }
  }

  // ── Active nav link ────────────────────────────────────────────────
  function updateNav(page) {
    document.querySelectorAll('.nav-center a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const match = href === page || href.endsWith('/' + page);
      link.classList.toggle('active', match);

      if (match) {
        const indicator = document.querySelector('.nav-indicator');
        if (indicator) {
          requestAnimationFrame(() => {
            const r  = link.getBoundingClientRect();
            const pr = link.parentElement.getBoundingClientRect();
            indicator.style.width = r.width + 'px';
            indicator.style.left  = (r.left - pr.left) + 'px';
          });
        }
      }
    });
  }

  // ── Core navigation ────────────────────────────────────────────────
  async function navigateTo(page, pushState = true) {
    if (isNavigating || page === currentPage) return;
    isNavigating = true;
    currentPage  = page;

    showBar();

    // Get the current <main> so we can swap it
    const mainEl = document.querySelector('main');

    try {
      // Fade out current content
      if (mainEl) {
        mainEl.classList.add('__spa_out');
        await delay(180);
      }

      // Fetch target page
      const res = await fetch(page);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${page}`);
      const html = await res.text();

      // Parse and extract <main>
      const parser  = new DOMParser();
      const doc     = parser.parseFromString(html, 'text/html');
      const pageContent = getPageContent(doc, page);
      document.body.className = doc.body.className || '';

      // Swap content
      if (mainEl) {
        mainEl.className = pageContent.className + ' __spa_out';
        mainEl.innerHTML = pageContent.html;
      } else {
        // Edge case: no main yet, create one
        const m = document.createElement('main');
        m.className = pageContent.className;
        m.innerHTML = pageContent.html;
        document.body.appendChild(m);
      }

      // Ensure page CSS is loaded
      ensureCSS(PAGE_CSS[page]);

      // Load page scripts
      await loadPageScripts(page);

      // Push URL
      if (pushState) history.pushState({ page }, '', page);

      // Update nav indicator
      updateNav(page);

      // Update page title
      const newTitle = doc.querySelector('title');
      if (newTitle) document.title = newTitle.textContent;

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Fade in new content
      const activeMain = document.querySelector('main');
      if (activeMain) {
        activeMain.classList.remove('__spa_out');
        activeMain.classList.add('__spa_in');
      }

    } catch (err) {
      console.error('[SPA] Navigation failed:', err);
      // Hard fallback — normal browser navigation
      window.location.href = page;
      return;
    } finally {
      hideBar();
      isNavigating = false;
    }
  }

  // ── Link click interceptor ─────────────────────────────────────────
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href') || '';

    // Skip externals, anchors, tel, mailto, _blank
    if (
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      link.target === '_blank'
    ) return;

    const page = getPageName(href) || href;

    // Skip excluded pages (index, login, etc.)
    if (EXCLUDE.includes(page)) return;

    e.preventDefault();
    navigateTo(page);
  }, true); // capture phase so it fires before any onclick handlers

  // ── Browser back / forward ─────────────────────────────────────────
  window.addEventListener('popstate', function (e) {
    const page = (e.state && e.state.page) || getPageName(window.location.href);
    if (page) navigateTo(page, false);
  });

  // ── Expose globally for page scripts ──────────────────────────────
  // Usage in feature scripts: window.spaGo("career.html")
  window.spaGo = function (href) {
    const page = getPageName(href) || href;
    if (EXCLUDE.includes(page)) {
      window.location.href = href;
    } else {
      navigateTo(page);
    }
  };

  // ── Set initial history state ──────────────────────────────────────
  if (!history.state) {
    history.replaceState({ page: currentPage }, '', window.location.href);
  }

})();
