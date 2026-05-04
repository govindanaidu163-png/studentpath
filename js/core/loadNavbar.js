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
    initMobileBottomNavScroll();

    // Run isolation check initially
    isolateProfilePage();

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

  // Handle mobile bottom nav active states
  const mobileLinks = document.querySelectorAll(".bottom-nav-link");
  mobileLinks.forEach(link => {
    const linkPage = link.getAttribute("href");
    const currentPage = window.location.pathname.split("/").pop() || "explore.html";
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
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
    
    mobileLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === page) {
        link.classList.add("active");
      }
    });
  });
}


// ================= PROFILE DATA LOADER =================
window.loadUserProfile = function () {
  const nameEl = document.querySelector("#userName");
  const avatarEl = document.querySelector("#userAvatar");
  const userEmailEl = document.querySelector("#userEmail");

  if (!nameEl) return;

  try {
    const userStr = localStorage.getItem("user");
    // Fallback to Firebase user if available
    const authUser = auth.currentUser;

    if (userStr) {
      const user = JSON.parse(userStr);
      nameEl.textContent = user.name || user.displayName || "User";
      if (userEmailEl) userEmailEl.textContent = user.email || "";
      if (avatarEl) avatarEl.textContent = nameEl.textContent.charAt(0).toUpperCase();
    } else if (authUser) {
      nameEl.textContent = authUser.displayName || "User";
      if (userEmailEl) userEmailEl.textContent = authUser.email || "";
      if (avatarEl) avatarEl.textContent = nameEl.textContent.charAt(0).toUpperCase();
    } else {
      nameEl.textContent = "Guest";
      if (userEmailEl) userEmailEl.textContent = "Not logged in";
      if (avatarEl) avatarEl.textContent = "G";
    }
  } catch (e) {
    console.error("Error loading user profile:", e);
  }
};

window.addEventListener("load", window.loadUserProfile);
document.addEventListener("DOMContentLoaded", window.loadUserProfile);

// ================= PAGE DETECTION & ISOLATION =================
function isolateProfilePage(pageUrl) {
  const currentPage = pageUrl || window.location.pathname;

  if (currentPage.includes("profile")) {
    document.querySelector(".search-bar")?.remove();
    document.querySelector(".mobile-tabs")?.remove(); // Also known as tabs-container
    document.querySelector(".explore-sections")?.remove();
  }
}

// Re-run on SPA navigation to ensure profile data updates and UI isolation
document.addEventListener("spa-navigated", (e) => {
  const page = e.detail?.page;
  // Use requestAnimationFrame to ensure the new DOM is fully rendered
  requestAnimationFrame(() => {
    window.loadUserProfile();
    isolateProfilePage(page);
  });
});

// ================= PROFILE DROPDOWN =================
function initProfileDropdown() {
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");
  const logoutBtn = document.getElementById("logoutBtn");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");

  // Toggle Dropdown (only if exists)
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.loadProfile) window.loadProfile(); // Reload profile data on click
      profileDropdown.classList.toggle("active");
    });

    // Click outside to close
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("active");
      }
    });
  } else if (profileBtn) {
    // If it's just a button (e.g. desktop link to profile.html)
    profileBtn.addEventListener("click", () => {
      if (window.loadProfile) window.loadProfile();
    });
  }

  const mobileProfileBtn = document.getElementById("mobileProfileBtn");
  if (mobileProfileBtn) {
    mobileProfileBtn.addEventListener("click", () => {
      if (window.loadProfile) window.loadProfile();
    });
  }

  // Theme toggle is handled globally in theme.js
  try {
    onAuthStateChanged(auth, (user) => {
      if (user && window.APP_STATE) {
        APP_STATE.user = {
          name: user.displayName,
          email: user.email,
          uid: user.uid
        };
        localStorage.setItem("user", JSON.stringify(APP_STATE.user));
      }
      if (window.loadProfile) window.loadProfile();
    });
  } catch (e) {
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


// ================= MOBILE BOTTOM NAV SCROLL =================
function initMobileBottomNavScroll() {
  let lastScroll = 0;
  // Get the mobile bottom navigation element.
  const bottomNav = document.querySelector(".mobile-bottom-nav");
  if (!bottomNav) return;

  // Ensure scroll listener is not duplicated.
  if (window._bottomNavScrollListener) {
    window.removeEventListener("scroll", window._bottomNavScrollListener);
  }

  window._bottomNavScrollListener = () => {
    let currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 50) {
      // Scroll down -> hide
      bottomNav.style.transform = "translate(-50%, 120%)";
    } else {
      // Scroll up -> show
      bottomNav.style.transform = "translate(-50%, 0)";
    }

    lastScroll = currentScroll;
  };

  window.addEventListener("scroll", window._bottomNavScrollListener);
}

// ================= START =================
loadNavbar();