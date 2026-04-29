(function() {
  const currentPath = window.location.pathname;
  if (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('guided-path.html') || currentPath.includes('/guided-path')) {
    return;
  }

  // Inject dark-mode.css synchronously to prevent flickering
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/dark-mode.css';
  document.head.appendChild(link);

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }

  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  window.studentPathTheme = {
    get: () => localStorage.getItem('theme') || 'light',
    toggle: () => {
      const current = window.studentPathTheme.get();
      const newTheme = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
      return newTheme;
    }
  };
})();
