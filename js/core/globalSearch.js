/**
 * StudentPath — Global Smart Search Engine
 * Works across careers + exams data.
 * Features: Grouped results, prefix matching, real-time suggestions, mobile fix.
 */

(function () {

  // ── Debounce Function ───────────────────────────────────────────────
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ── Build index from window.careers + window.exams ──────────────────
  function buildIndex() {
    const index = [];

    const careers = window.careers || [];
    careers.forEach(c => {
      const searchText = [
        c.name, c.key, c.desc, c.stream, c.type,
        ...(c.skills || []), ...(c.roadmap || [])
      ].join(' ').toLowerCase();

      index.push({
        type: 'career',
        key: c.key,
        name: c.name,
        subtitle: c.stream || c.type || '',
        desc: c.desc || '',
        emoji: '💼',
        searchText,
        relevance: 0
      });
    });

    const exams = window.exams || [];
    exams.forEach(e => {
      const searchText = [
        e.name, e.key, e.type, e.salaryLabel,
        ...(e.careers || [])
      ].join(' ').toLowerCase();

      index.push({
        type: 'exam',
        key: e.key,
        name: e.name,
        subtitle: (e.careers || []).join(', '),
        desc: e.type || '',
        emoji: '📝',
        searchText,
        relevance: 0
      });
    });

    return index;
  }

  // ── Score a single item against a query ────────────────────────────
  function score(item, q) {
    const name = item.name.toLowerCase();
    const text = item.searchText;
    
    if (name === q) return 150; // Exact match
    if (name.startsWith(q)) return 100; // Prefix match
    if (name.includes(q))   return 80; // Contains in name
    if (text.startsWith(q)) return 60; // Prefix in metadata
    if (text.includes(q))   return 40; // Contains in metadata
    return 0;
  }

  // ── Navigate to result ──────────────────────────────────────────────
  function openResult(item) {
    if (item.type === 'career') {
      if (window.openCareer) {
        window.openCareer(item.key);
      } else {
        window.location.href = `career.html?key=${item.key}`;
      }
    } else {
      if (window.openExam) {
        window.openExam(item.key);
      } else {
        window.location.href = `exam.html?key=${item.key}`;
      }
    }
  }

  // ── Render suggestions list (Grouped) ────────────────────────────────
  function renderSuggestions(results, dropdown) {
    dropdown.innerHTML = '';

    if (!results.length) {
      dropdown.innerHTML = `<div class="sg-empty">No results found for your search</div>`;
      dropdown.classList.add('visible');
      return;
    }

    const groups = {
      career: results.filter(r => r.type === 'career').slice(0, 5),
      exam: results.filter(r => r.type === 'exam').slice(0, 5)
    };

    const types = [
      { key: 'career', label: 'Careers', icon: '💼' },
      { key: 'exam', label: 'Exams', icon: '📝' }
    ];

    types.forEach(type => {
      const items = groups[type.key];
      if (items && items.length > 0) {
        const section = document.createElement('div');
        section.className = 'sg-section';
        
        const header = document.createElement('div');
        header.className = 'sg-header';
        header.innerHTML = `${type.icon} ${type.label}`;
        section.appendChild(header);

        items.forEach(item => {
          const el = document.createElement('div');
          el.className = 'sg-item';
          el.innerHTML = `
            <span class="sg-icon">${item.emoji}</span>
            <div class="sg-info">
              <span class="sg-name">${item.name}</span>
              <span class="sg-sub">${item.subtitle}</span>
            </div>
            <span class="sg-badge ${item.type}">${item.type}</span>
          `;
          el.addEventListener('mousedown', (e) => {
            e.preventDefault();
            openResult(item);
            dropdown.classList.remove('visible');
          });
          section.appendChild(el);
        });

        dropdown.appendChild(section);
      }
    });

    dropdown.classList.add('visible');
  }

  // ── Core init — called after navbar HTML is ready ───────────────────
  window.initGlobalSearch = function () {
    const input     = document.getElementById('searchInput');
    const searchBar = input ? input.closest('.search-bar') : null;

    if (!input || !searchBar) return;

    // Fix mobile search button
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');

    // Ensure search-bar is position:relative for dropdown anchor
    searchBar.style.position = 'relative';

    // Create suggestion dropdown
    let dropdown = document.getElementById('sg-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'sg-dropdown';
      dropdown.className = 'sg-dropdown';
      document.body.appendChild(dropdown);
    }

    // Position dropdown under search bar
    function positionDropdown() {
      const rect = searchBar.getBoundingClientRect();
      const isMobile = window.innerWidth <= 560;
      
      if (isMobile) {
        // Handled by CSS fixed positioning
        dropdown.style.top = '';
        dropdown.style.left = '';
        dropdown.style.width = '';
      } else {
        dropdown.style.top    = (rect.bottom + window.scrollY + 8) + 'px';
        dropdown.style.left   = rect.left + 'px';
        dropdown.style.width  = Math.max(rect.width, 320) + 'px';
      }
    }

    // Lazily build index
    let _index = null;
    function getIndex() {
      if (!_index) _index = buildIndex();
      return _index;
    }

    // Refresh index when new page data loads
    document.addEventListener('spa-navigated', () => { _index = null; });

    // ── Input handler with Debounce ──────────────────────────────────
    const handleSearch = debounce(() => {
      const q = input.value.trim().toLowerCase();

      if (q.length < 1) {
        dropdown.classList.remove('visible');
        return;
      }

      // Page-specific search integration
      if (window.searchCareer) window.searchCareer(q);
      if (window.filterExam)   window.filterExam(q);

      const idx = getIndex();
      const results = idx
        .map(item => ({ ...item, relevance: score(item, q) }))
        .filter(item => item.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance);

      positionDropdown();
      renderSuggestions(results, dropdown);
    }, 200);

    input.addEventListener('input', handleSearch);

    // Reposition on scroll / resize
    window.addEventListener('scroll', positionDropdown, { passive: true });
    window.addEventListener('resize', positionDropdown, { passive: true });

    // ── Close on blur / outside click ───────────────────────────────
    document.addEventListener('mousedown', (e) => {
      if (!dropdown.contains(e.target) && e.target !== input) {
        dropdown.classList.remove('visible');
      }
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length > 0) {
        positionDropdown();
        dropdown.classList.add('visible');
      }
    });

    // ── Keyboard navigation ───────────────────────────────────────────
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('visible');
        input.blur();
      }
      if (e.key === 'Enter') {
        const first = dropdown.querySelector('.sg-item');
        if (first) {
          first.dispatchEvent(new MouseEvent('mousedown'));
        } else {
          // If no suggestion, maybe trigger search page?
          const q = input.value.trim();
          if (q) {
            const url = `search.html?q=${encodeURIComponent(q)}`;
            if (window.spaGo) window.spaGo(url);
            else window.location.href = url;
          }
        }
      }
    });

    // ── Mobile search button fix ─────────────────────────────────────
    if (mobileSearchBtn) {
      mobileSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        searchBar.classList.add('mobile-active');
        input.focus();
      });
    }

    // Touch interaction for mobile icons
    const searchIcon = searchBar.querySelector('.search-icon');
    if (searchIcon) {
      searchIcon.addEventListener('click', () => {
        input.focus();
      });
    }
  };

})();
