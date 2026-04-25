// ================= IMPORT FIREBASE =================
import { auth } from "../firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// ================= LOAD NAVBAR =================
async function loadNavbar() {
  const res = await fetch("navbar.html");
  const html = await res.text();

  document.getElementById("navbarContainer").innerHTML = html;

  initNavbar();
  initProfilePanel(); // 🔥 important
}


// ================= NAVBAR ANIMATION =================
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
    if (link.href === window.location.href) {
      link.classList.add("active");
      moveIndicator(link);
    }

    link.addEventListener("mouseenter", () => {
      moveIndicator(link);
    });

    link.addEventListener("mouseleave", () => {
      const active = document.querySelector(".nav-center a.active");
      if (active) moveIndicator(active);
    });
  });
}


// ================= PROFILE PANEL =================
function initProfilePanel() {
  const profileBtn = document.getElementById("profileBtn");
  const profilePanel = document.getElementById("profilePanel");
  const closeProfile = document.getElementById("closeProfile");

  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!profileBtn || !profilePanel) return;

  // 🔥 OPEN PANEL
  profileBtn.addEventListener("click", () => {
    profilePanel.classList.add("active");
  });

  // 🔥 CLOSE PANEL
  closeProfile.addEventListener("click", () => {
    profilePanel.classList.remove("active");
  });

  // 🔥 FIREBASE USER DATA
  onAuthStateChanged(auth, (user) => {
    console.log("USER:", user); // debug

    if (user) {
      userNameEl.textContent = user.displayName || "User";
      userEmailEl.textContent = user.email;
    } else {
      userNameEl.textContent = "Guest";
      userEmailEl.textContent = "Not logged in";
    }
  });

  // 🔥 LOGOUT
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        alert("Logged out successfully");
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error(error);
      });
  });
}
try {
  console.log("START");

  const res = await fetch("navbar.html");
  const html = await res.text();

  document.getElementById("navbarContainer").innerHTML = html;

  console.log("NAVBAR LOADED");

} catch (e) {
  console.error("ERROR:", e);
}

// ================= START =================
loadNavbar();