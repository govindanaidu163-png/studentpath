/**
 * =====================================================
 *  StudentPath — SPA Router
 *  =====================================================
 *  Strategy:
 *  - Each page keeps its own HTML/CSS/JS files untouched.
 *  - This router creates a SHELL (navbar stays fixed).
 *  - When a nav link is clicked, the router:
 *      1. Fetches the target page HTML
 *      2. Extracts its <main> (or the content wrapper)
 *      3. Swaps it into #spa-content with a smooth animation
 *      4. Dynamically loads that page's scripts (fresh each time)
 *      5. Updates the browser URL via History API
 *  - No files are merged. All feature JS files stay separate.
 * =====================================================
 */

(function () {
  'use strict';

  // ── Route → scripts mapping ──────────────────────────────────────
  // Define which scripts each page needs.
  // Do NOT include loadNavbar.js or firebase — loaded once in shell.
  const PAGE_SCRIPTS = {
    'explore.html': [
      'js/data/careersData.js',
      'js/features/explore.js'
    ],
    'exams.html': [
      'js/data/examData.js',
      'js/features/explore-exams.js'
    ],
    'saved.html': [
      'js/data/careersData.js',
      'js/data/examData.js',
      'js/features/saved.js'
    ],
    'guided-path.html': [
      'js/features/guided.js'
    ],
    'career.html': [
      'js/data/careersData.js',
      'js/features/career.js'
    ],
    'exam.html': [
      'js/data/examData.js',
      'js/data/careersData.js',
      'js/features/exam.js'
    ],
    'dashboard.html': [
      'js/features/dashboard.js'
    ],
  };

  // ── Route → CSS mapping ──────────────────────────────────────────
  const PAGE_CSS = {
    'explore.html': ['css/explore.css'],
    'exams.html':   ['css/explore.css'],
    'saved.html':   ['css/saved.css'],
    'guided-path.html': ['css/guided-path.css'],
    'career.html':  ['css/career.css'],
    'exam.html':    ['css/exam.css'],
    'dashboard.html': ['css/dashboard.css'],
  };

  // Pages that are NOT handled by the SPA (let them navigate normally)
  const SPA_EXCLUDE = ['index.html', 'home.html', '404.html'];

  // ── State ────────────────────────────────────────────────────────
  let currentPage = '';
  let isNavigating = false;

  // ── DOM refs (set after DOMContentLoaded) ────────────────────────
  let contentArea;
  let overlay;

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    contentArea = document.getElementById('spa-content');
    overlay = document.getElementById('spa-overlay');

    if (!contentArea || !overlay) return; // not in SPA shell

    // Load initial page
    const currentFile = getPageName(window.location.pathname);
    const startPage = !currentFile || currentFile === 'app.html' ? 'explore.html' : currentFile;
    loadPage(startPage, false);

    // Intercept link clicks
    document.addEventListener('click', onLinkClick);

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      const page = e.state?.page || 'explore.html';
      loadPage(page, false);
    });

    // Patch: page scripts call window.location.href = 'career.html'
    // We intercept this by providing a global spaGo() that scripts can optionally use.
    // Also patch the native assignment via a Proxy on location (where supported).
    patchLocationHref();
  }

  // ── Patch window.location.href for internal SPA pages ─────────────
  function patchLocationHref() {
    // Provide spaGo as a helper (page scripts already use window.location.href,
    // so we simply re-navigate cleanly after they run)
    window.spaGo = function(href) {
      const pageName = getPageName(href) || href;
      if (SPA_EXCLUDE.includes(pageName)) {
        window.location.href = href;
      } else {
        navigate(pageName);
      }
    };
  }

  // ── Extract page name from path ───────────────────────────────────
  function getPageName(path) {
    const parts = path.split('/');
    const last = parts[parts.length - 1];
    return last && last.includes('.html') ? last : null;
  }

  function getPageContent(doc, pageName) {
    const useBody = pageName === 'career.html' || pageName === 'guided-path.html';
    const root = useBody
      ? doc.body
      : (doc.querySelector('main') || doc.querySelector('#app') || doc.body);

    if (root === doc.body) {
      return {
        tag: 'div',
        className: pageName.replace('.html', '') + '-spa-content',
        html: Array.from(doc.body.children)
          .filter(el => el.tagName !== 'SCRIPT' && el.id !== 'navbarContainer')
          .map(el => el.outerHTML)
          .join('')
      };
    }

    return {
      tag: root.tagName.toLowerCase(),
      className: root.className || '',
      html: root.innerHTML
    };
  }

  // ── Intercept link clicks ─────────────────────────────────────────
  function onLinkClick(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip externals, anchors, mailto, etc.
    if (
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      link.target === '_blank'
    ) return;

    const pageName = getPageName(href) || href;

    // Skip excluded pages — let them navigate normally
    if (SPA_EXCLUDE.includes(pageName)) return;

    e.preventDefault();
    if (pageName === currentPage || isNavigating) return;

    navigate(pageName);
  }

  // ── Navigate to a page ────────────────────────────────────────────
  function navigate(pageName) {
    // Push state so browser URL updates
    history.pushState({ page: pageName }, '', pageName);
    loadPage(pageName, true);
  }

  // ── Core: fetch + inject + run scripts ───────────────────────────
  async function loadPage(pageName, animate = true) {
    if (isNavigating) return;
    isNavigating = true;
    currentPage = pageName;

    try {
      // 1. Transition OUT (fade content area)
      if (animate) {
        await transitionOut();
      }

      // 2. Fetch the page
      const res = await fetch(pageName);
      if (!res.ok) throw new Error(`Failed to load ${pageName}: ${res.status}`);
      const html = await res.text();

      // 3. Parse and extract content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const pageContent = getPageContent(doc, pageName);
      document.body.className = doc.body.className || '';

      // 4. Inject content
      contentArea.innerHTML = `<${pageContent.tag} class="${pageContent.className}">${pageContent.html}</${pageContent.tag}>`;

      // 5. Load page-specific CSS (only if not already loaded)
      loadCSS(PAGE_CSS[pageName] || []);

      // 6. Remove old page scripts, then load new ones
      await loadPageScripts(PAGE_SCRIPTS[pageName] || []);

      // 7. Update active nav link
      updateActiveLink(pageName);

      // Notify navbar of page change
      document.dispatchEvent(new CustomEvent('spa-navigated', { detail: { page: pageName } }));

      // 8. Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // 9. Transition IN
      await transitionIn();

    } catch (err) {
      console.error('[SPA Router] Error loading page:', err);
      contentArea.innerHTML = `
        <div style="padding:60px;text-align:center;color:#666;">
          <h2>Page could not be loaded</h2>
          <p>${err.message}</p>
          <a href="explore.html" style="color:#1a8a4a;">← Go to Explore</a>
        </div>
      `;
      await transitionIn();
    } finally {
      isNavigating = false;
    }
  }

  // ── CSS loader — idempotent (won't re-add already loaded CSS) ────
  function loadCSS(cssPaths) {
    cssPaths.forEach(path => {
      const id = 'spa-css-' + path.replace(/[/\.]/g, '-');
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        link.id = id;
        document.head.appendChild(link);
      }
    });
  }

  // ── Script loader — removes old page scripts, loads new ones ─────
  async function loadPageScripts(scripts) {
    // Remove scripts marked as spa-page-script
    document.querySelectorAll('script[data-spa-page]').forEach(s => s.remove());

    // Also clean up any global state that pages might have set
    cleanupPageGlobals();

    // Load each script fresh
    for (const src of scripts) {
      await injectScript(src);
    }
  }

  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src + '?_=' + Date.now(); // cache bust
      script.setAttribute('data-spa-page', 'true');
      script.onload = resolve;
      script.onerror = () => {
        console.warn('[SPA Router] Could not load script:', src);
        resolve(); // don't block navigation on missing scripts
      };
      document.body.appendChild(script);
    });
  }

  // Clean up known global vars that each page sets, so re-runs are clean
  function cleanupPageGlobals() {
    // explore.js / explore-exams.js globals
    const toClean = [
      'careers', 'exams', 'filterType', 'setPill', 'sortCareers',
      'searchCareer', 'filterExam', 'openCareer', 'openExam',
      'showTab',
    ];
    toClean.forEach(key => {
      try { if (window[key]) delete window[key]; } catch(e) {}
    });
  }

  // ── Active nav link updater ──────────────────────────────────────
  function updateActiveLink(pageName) {
    document.querySelectorAll('.nav-center a').forEach(link => {
      link.classList.remove('active');
      const linkHref = link.getAttribute('href');
      if (linkHref && (linkHref === pageName || linkHref.endsWith('/' + pageName))) {
        link.classList.add('active');
      }
    });

    // Re-run indicator positioning if available
    const indicator = document.querySelector('.nav-indicator');
    const active = document.querySelector('.nav-center a.active');
    if (indicator && active) {
      const rect = active.getBoundingClientRect();
      const parentRect = active.parentElement.getBoundingClientRect();
      indicator.style.width = rect.width + 'px';
      indicator.style.left = (rect.left - parentRect.left) + 'px';
    }
  }

  // ── Transition helpers ───────────────────────────────────────────
  function transitionOut() {
    return new Promise(resolve => {
      overlay.classList.add('active');
      contentArea.style.opacity = '0';
      contentArea.style.transform = 'translateY(12px)';
      setTimeout(resolve, 280);
    });
  }

  function transitionIn() {
    return new Promise(resolve => {
      overlay.classList.remove('active');
      contentArea.style.opacity = '1';
      contentArea.style.transform = 'translateY(0)';
      setTimeout(resolve, 320);
    });
  }

  // ── Start ────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose navigate globally so other code can use it
  window.spaNavigate = navigate;

})();
