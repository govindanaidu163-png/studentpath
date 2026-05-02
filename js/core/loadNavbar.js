// ================= IMPORT FIREBASE =================
import { auth } from "../firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// ================= LOAD NAVBAR =================
async function loadNavbar() {
  try {
    const res = await fetch("navbar.html");
    if (!res.ok) throw new Error("navbar.html not found");
    const html = await res.text();

    const container = document.getElementById("navbarContainer");
    if (!container) return;

    container.innerHTML = html;

    // Load and initialize search
    if (!window.initGlobalSearch) {
      await injectSearchScript();
    }
    if (window.initGlobalSearch) {
      window.initGlobalSearch();
    }

    initNavbar();
    initProfileDropdown();

  } catch (e) {
    console.error("[loadNavbar] Error:", e);
  }
}

function injectSearchScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "js/core/globalSearch.js";
    script.onload = resolve;
    script.onerror = () => {
      console.warn("Failed to load globalSearch.js");
      resolve();
    };
    document.body.appendChild(script);
  });
}


// ================= NAVBAR UNDERLINE ANIMATION =================
function initNavbar() {
  const links = document.querySelectorAll(".nav-center a");
  const indicator = document.querySelector(".nav-indicator");

  if (!indicator) return;

  function moveIndicator(el) {
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();
    indicator.style.width = rect.width + "px";
    indicator.style.left = (rect.left - parentRect.left) + "px";
  }

  links.forEach(link => {
    // Mark active based on current page
    const linkPage = link.getAttribute("href");
    const currentPage = window.location.pathname.split("/").pop() || "explore.html";
    if (linkPage === currentPage) {
      link.classList.add("active");
      // Use rAF to ensure layout is complete before measuring
      requestAnimationFrame(() => moveIndicator(link));
    }

    link.addEventListener("mouseenter", () => moveIndicator(link));
    link.addEventListener("mouseleave", () => {
      const active = document.querySelector(".nav-center a.active");
      if (active) moveIndicator(active);
    });
  });

  // Re-run active check whenever SPA navigates
  document.addEventListener("spa-navigated", (e) => {
    const page = e.detail?.page;
    links.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === page) {
        link.classList.add("active");
        requestAnimationFrame(() => moveIndicator(link));
      }
    });
  });
}


// ================= PROFILE DROPDOWN =================
function initProfileDropdown() {
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");

  if (!profileBtn || !profileDropdown) return;

  // Toggle Dropdown
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("active");
  });

  // Click outside to close
  document.addEventListener("click", (e) => {
    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove("active");
    }
  });

  // Theme Toggle
  if (themeToggleBtn && window.studentPathTheme) {
    // Initial State
    const isDark = window.studentPathTheme.get() === 'dark';
    if (themeIcon) themeIcon.textContent = isDark ? "☀️" : "🌙";
    if (themeText) themeText.textContent = isDark ? "Light Mode" : "Dark Mode";

    themeToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const newTheme = window.studentPathTheme.toggle();
      const nowDark = newTheme === 'dark';
      if (themeIcon) themeIcon.textContent = nowDark ? "☀️" : "🌙";
      if (themeText) themeText.textContent = nowDark ? "Light Mode" : "Dark Mode";
    });
  }

  // Firebase user state
  try {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if (userNameEl) userNameEl.textContent = user.displayName || "User";
        if (userEmailEl) userEmailEl.textContent = user.email;
      } else {
        if (userNameEl) userNameEl.textContent = "Guest";
        if (userEmailEl) userEmailEl.textContent = "Not logged in";
      }
    });
  } catch(e) {
    console.warn("Firebase auth error:", e);
  }

  // Logout
  logoutBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    signOut(auth)
      .then(() => {
        alert("Logged out successfully");
        window.location.href = "index.html";
      })
      .catch(console.error);
  });
}


// ================= START =================
loadNavbar();