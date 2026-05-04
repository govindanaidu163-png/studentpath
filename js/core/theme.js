// =========================
// GLOBAL STATE MANAGER (APP_STATE)
// =========================

window.APP_STATE = {
  user: null,
  theme: "light"
};

// ================= LOAD STATE =================
function loadAppState() {
  try {
    const userStr = localStorage.getItem("userData") || localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user) APP_STATE.user = user;
    }
  } catch(e) {
    console.error("Error parsing user data:", e);
  }

  const theme = localStorage.getItem("theme");
  if (theme) APP_STATE.theme = theme;
}

// ================= APPLY THEME =================
function applyTheme() {
  const isDark = APP_STATE.theme === "dark";
  
  if (document.body) {
    document.body.classList.toggle("dark", isDark);
  }
  document.documentElement.classList.toggle("dark-mode", isDark);

  // Update logo if it exists
  const logo = document.getElementById("logo");
  if (logo) {
    logo.src = isDark ? "/assets/logo/navbar-logo-dark.png" : "/assets/logo/navbar-logo.png";
  }

  // Update theme toggle buttons dynamically
  document.querySelectorAll(".theme-toggle, #themeToggleBtn").forEach(btn => {
    const themeIcon = btn.querySelector(".item-icon") || document.getElementById("themeIcon");
    const themeText = btn.querySelector("span:not(.item-icon)") || document.getElementById("themeText");
    if (themeIcon) themeIcon.textContent = isDark ? "☀️" : "🌙";
    if (themeText) themeText.textContent = isDark ? "Light Mode" : "Dark Mode";
  });
}

// ================= LOAD PROFILE =================
function loadProfile() {
  // If no user, fallback to Guest
  const user = APP_STATE.user || { name: "Guest", email: "Not logged in" };

  // Support both IDs (previous) and Classes (requested)
  const nameEls = document.querySelectorAll(".user-name, #userName");
  const emailEls = document.querySelectorAll(".user-email, #userEmail");
  const avatarEls = document.querySelectorAll(".user-avatar, #userAvatar");

  nameEls.forEach(el => el.innerText = user.name || user.displayName || "User");
  emailEls.forEach(el => el.innerText = user.email || "");
  
  const initial = (user.name || user.displayName || "G").charAt(0).toUpperCase();
  avatarEls.forEach(el => {
    // If it's a text element, set initial. If it's an image, set src.
    if (el.tagName === 'IMG') return;
    el.textContent = initial;
  });
}

// ================= INITIALIZATION =================

// Run IMMEDIATELY for anti-flicker
loadAppState();
applyTheme();

document.addEventListener("DOMContentLoaded", () => {
  loadAppState();
  applyTheme();
  loadProfile();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    loadAppState();
    applyTheme();
    loadProfile();
  }
});

// ================= EVENTS =================

document.addEventListener("click", (e) => {
  if (e.target.closest(".theme-toggle") || e.target.closest("#themeToggleBtn")) {
    APP_STATE.theme = APP_STATE.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", APP_STATE.theme);
    applyTheme();
  }
});

// Expose globally for dynamic triggers (like after login)
window.loadProfile = loadProfile;

// Load Dark Mode CSS globally just in case
if (!document.getElementById("darkModeCss")) {
  const link = document.createElement("link");
  link.id = "darkModeCss";
  link.rel = "stylesheet";
  link.href = "/css/dark-mode.css";
  document.head.appendChild(link);
}