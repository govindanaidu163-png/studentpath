// =========================
// LOGO SWITCH FUNCTION
// =========================
function updateLogo(theme) {
  const logo = document.getElementById("logo");
  if (!logo) return;

  logo.src =
    theme === "dark"
      ? "/assets/logo/navbar-logo-dark.png"
      : "/assets/logo/navbar-logo.png";
}


// =========================
// MAIN THEME SYSTEM
// =========================
(function () {
  const currentPath = window.location.pathname;

  // ❌ Skip theme for landing + guided path
  if (
    currentPath.endsWith("index.html") ||
    currentPath === "/" ||
    currentPath.endsWith("/") ||
    currentPath.includes("guided-path")
  ) {
    return;
  }

  // =========================
  // LOAD DARK MODE CSS
  // =========================
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/css/dark-mode.css";
  document.head.appendChild(link);


  // =========================
  // APPLY THEME
  // =========================
  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }


  // =========================
  // INITIAL LOAD
  // =========================
  const savedTheme =
    localStorage.getItem("studentpath_theme") || "light";

  applyTheme(savedTheme);


  // =========================
  // FIX: WAIT FOR NAVBAR LOAD
  // =========================

  // Run after full page load
  window.addEventListener("load", () => {
    updateLogo(savedTheme);
  });

  // Run again after slight delay (for dynamic navbar)
  setTimeout(() => {
    updateLogo(savedTheme);
  }, 300);


  // =========================
  // GLOBAL THEME CONTROLLER
  // =========================
  window.studentPathTheme = {
    get: () =>
      localStorage.getItem("studentpath_theme") || "light",

    toggle: () => {
      const current = window.studentPathTheme.get();
      const newTheme = current === "light" ? "dark" : "light";

      localStorage.setItem("studentpath_theme", newTheme);
      applyTheme(newTheme);
      updateLogo(newTheme);

      return newTheme;
    },
  };
})();