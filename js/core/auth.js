import { auth, db } from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   ELEMENT REFERENCES
========================= */
const authSection = document.getElementById("authSection");
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const signupTab = document.getElementById("signupTab");
const loginTab = document.getElementById("loginTab");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const toastEl = document.getElementById("toast");

/* =========================
   THEME
========================= */
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}

window.toggleTheme = function () {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
};

/* =========================
   QUIZ
========================= */
window.startQuiz = function () {
  window.location.href = "/quiz.html";
};

/* =========================
   AUTH MODAL HELPERS
========================= */
function openAuthSection() {
  if (!authSection) return;
  authSection.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeAuthSection() {
  if (!authSection) return;
  authSection.classList.add("hidden");
  document.body.style.overflow = "auto";
}

function showLoginForm() {
  if (!loginForm || !signupForm || !loginTab || !signupTab) return;
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
}

function showSignupForm() {
  if (!loginForm || !signupForm || !loginTab || !signupTab) return;
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
}

function showToast(message, type = "success") {
  if (!toastEl) return;

  toastEl.innerText = message;
  toastEl.className = "toast show " + type;

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3000);
}

/* Expose modal actions to HTML buttons */
window.showLanding = function () {
  closeAuthSection();
};

window.showLogin = function () {
  openAuthSection();
  showLoginForm();
};

window.showSignup = function () {
  openAuthSection();
  showSignupForm();
};

window.showLoginForm = showLoginForm;
window.showSignupForm = showSignupForm;
window.showToast = showToast;

/* =========================
   SIGNUP
========================= */
window.signup = async function () {
  const name = nameInput?.value.trim() || "";
  const email = emailInput?.value.trim() || "";
  const password = passwordInput?.value.trim() || "";

  if (!name || !email || !password) {
    showToast("Enter all fields", "error");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name,
      email
    });

    await updateProfile(user, { displayName: name });

    showToast("Account created!", "success");
    closeAuthSection();

    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 1200);
  } catch (err) {
    showToast(err.message, "error");
  }
};

/* =========================
   LOGIN
========================= */
window.login = async function () {
  const email = loginEmailInput?.value.trim() || "";
  const password = loginPasswordInput?.value.trim() || "";

  if (!email || !password) {
    showToast("Enter all fields", "error");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);

    showToast("Welcome back 🚀", "success");
    closeAuthSection();

    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 800);
  } catch (err) {
    showToast(err.message, "error");
  }
};

/* =========================
   AUTH STATE CONTROL
========================= */
onAuthStateChanged(auth, (user) => {
  const authView = localStorage.getItem("authView");

  if (authView === "signup") {
    openAuthSection();
    showSignupForm();
    localStorage.removeItem("authView");
    return;
  }

  if (authView === "login") {
    openAuthSection();
    showLoginForm();
    localStorage.removeItem("authView");
    return;
  }

  if (user) {
    window.location.href = "/dashboard.html";
  }
});

/* =========================
   CLOSE MODAL ON OUTSIDE CLICK
========================= */
if (authSection) {
  authSection.addEventListener("click", function (e) {
    if (e.target === authSection) {
      closeAuthSection();
    }
  });
}

/* =========================
   MOBILE / BACK BUTTON RESET
========================= */
function resetPage() {
  document.body.classList.remove("fade-out");
  document.body.style.opacity = "1";
  document.body.style.visibility = "visible";
  document.body.style.overflow = "auto";

  if (authSection) {
    authSection.classList.add("hidden");
  }
}

window.addEventListener("pageshow", resetPage);
window.addEventListener("DOMContentLoaded", resetPage);

/* =========================
   INTRO TEXT ANIMATION
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const introText = document.getElementById("introText");
  if (!introText) return;

  const words = introText.textContent.trim().split(/\s+/);
  introText.innerHTML = words
    .map((word) => `<span class="intro-word">${word}&nbsp;</span>`)
    .join("");

  const wordSpans = introText.querySelectorAll(".intro-word");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          wordSpans.forEach((span, index) => {
            span.style.transitionDelay = `${index * 45}ms`;
            span.classList.add("show");
          });
        } else {
          wordSpans.forEach((span) => span.classList.remove("show"));
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(introText);
});

/* =========================
   REVIEW ROTATOR
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("reviewBox");
  const reviewText = document.getElementById("reviewText");
  const reviewUser = document.getElementById("reviewUser");

  if (!box || !reviewText || !reviewUser) return;

  const reviews = [
    { text: "This platform changed my career direction.", user: "Aman" },
    { text: "I finally found clarity in my future.", user: "Rahul" },
    { text: "Best AI career tool I’ve used.", user: "Sneha" }
  ];

  let index = 0;

  function showReview() {
    box.classList.remove("show");

    setTimeout(() => {
      reviewText.innerText = `"${reviews[index].text}"`;
      reviewUser.innerText = `— ${reviews[index].user}`;
      box.classList.add("show");
      index = (index + 1) % reviews.length;
    }, 400);
  }

  showReview();
  setInterval(showReview, 3000);
});