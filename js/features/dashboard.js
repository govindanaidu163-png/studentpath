// ================= IMPORTS =================
import { auth, db } from "../firebase.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ================= SAFE LOAD =================
document.addEventListener("DOMContentLoaded", () => {

  // ================= AUTH + DATA =================
  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      window.location.href = "/index.html";
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      let finalName = user.email?.split("@")[0] || "User";
      let finalEmail = user.email || "";

      if (docSnap.exists()) {
        const data = docSnap.data();

        finalName = data.name || finalName;

        const careerEl = document.getElementById("careerText");
        if (careerEl) {
          careerEl.innerHTML =
            'Your future is in <span class="gradient-text">' +
            (data.recommendedCareer || "Not selected") +
            "</span>";
        }

        if (data.reasons && Array.isArray(data.reasons)) {
          const reasonEl = document.getElementById("reasonText");
          if (reasonEl) {
            reasonEl.innerText = data.reasons.join(", ");
          }
        }

        const progress = Math.min((data.reasons?.length || 1) * 20, 100);
        updateProgress(progress);
      }

      // Sidebar info
      const nameEl = document.getElementById("sidebarUserName");
      const emailEl = document.getElementById("sidebarUserEmail");

      if (nameEl) nameEl.innerText = finalName;
      if (emailEl) emailEl.innerText = finalEmail;

      // Greeting
      const now = new Date();
      let greeting = "Good morning";

      if (now.getHours() >= 12) greeting = "Good afternoon";
      if (now.getHours() >= 18) greeting = "Good evening";

      const greetEl = document.getElementById("greetingText");
      if (greetEl) {
        greetEl.innerText = `${greeting}, ${finalName.split(" ")[0]}!`;
      }

      const dateEl = document.getElementById("dateText");
      if (dateEl) {
        dateEl.innerText = now.toDateString();
      }

      showToast(`Welcome back ${finalName.split(" ")[0]} 🚀`);

    } catch (err) {
      console.error("Dashboard error:", err);
    }
  });

});


// ================= NAVIGATION =================

function navigate(path) {
  document.body.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = path;
  }, 300);
}

window.goToGuidedPath = () => navigate("/guided-path.html");
window.goToExplore = () => navigate("/explore.html");
window.goToSaved = () => navigate("/saved.html");
window.goToAbout = () => navigate("/about.html");

window.goToDashboardHome = () => {
  closeSidebar();
};


// ================= SIDEBAR =================

window.openSidebar = () => {
  document.getElementById("sidebar")?.classList.add("open");
  document.getElementById("sidebarOverlay")?.classList.add("active");
};

window.closeSidebar = () => {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebarOverlay")?.classList.remove("active");
};


// ================= LOGOUT =================

window.logout = () => {
  signOut(auth)
    .then(() => {
      window.location.href = "/index.html";
    })
    .catch(err => console.error(err));
};


// ================= PROGRESS =================

function updateProgress(value) {
  const bar = document.getElementById("progressBar");
  const percent = document.getElementById("progressPercent");

  if (bar) bar.style.width = `${value}%`;
  if (percent) percent.innerText = `${value}%`;
}


// ================= TOAST =================

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = msg;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


// ================= RESET (FIX BACK BUTTON BUG) =================

function resetPage() {
  document.body.classList.remove("fade-out");

  document.body.style.opacity = "1";
  document.body.style.visibility = "visible";
  document.body.style.overflow = "auto";

  document.getElementById("authSection")?.classList.add("hidden");
  document.getElementById("sidebar")?.classList.remove("open");
}

window.addEventListener("pageshow", resetPage);
window.addEventListener("DOMContentLoaded", resetPage);

