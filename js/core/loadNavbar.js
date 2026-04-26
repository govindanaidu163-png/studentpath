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

    initNavbar();
    initProfilePanel();

  } catch (e) {
    console.error("[loadNavbar] Error:", e);
  }
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


// ================= PROFILE PANEL =================
function initProfilePanel() {
  const profileBtn   = document.getElementById("profileBtn");
  const profilePanel = document.getElementById("profilePanel");
  const closeProfile = document.getElementById("closeProfile");
  const userNameEl   = document.getElementById("userName");
  const userEmailEl  = document.getElementById("userEmail");
  const logoutBtn    = document.getElementById("logoutBtn");

  if (!profileBtn || !profilePanel) return;

  profileBtn.addEventListener("click", () => profilePanel.classList.add("active"));
  closeProfile?.addEventListener("click", () => profilePanel.classList.remove("active"));

  // Firebase user state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (userNameEl) userNameEl.textContent = user.displayName || "User";
      if (userEmailEl) userEmailEl.textContent = user.email;
    } else {
      if (userNameEl) userNameEl.textContent = "Guest";
      if (userEmailEl) userEmailEl.textContent = "Not logged in";
    }
  });

  // Logout
  logoutBtn?.addEventListener("click", () => {
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