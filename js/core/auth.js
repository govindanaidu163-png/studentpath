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

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const closeBtn = document.getElementById("closeBtn");
const toastEl = document.getElementById("toast");

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
  toastEl.className = `toast show ${type}`;
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3000);
}

/* =========================
   EVENT LISTENERS
========================= */
if (loginTab) loginTab.addEventListener("click", showLoginForm);
if (signupTab) signupTab.addEventListener("click", showSignupForm);
if (closeBtn) closeBtn.addEventListener("click", closeAuthSection);

if (authSection) {
  authSection.addEventListener("click", (e) => {
    if (e.target === authSection) closeAuthSection();
  });
}

// Global functions for HTML buttons
window.showLogin = () => {
  openAuthSection();
  showLoginForm();
};

window.showSignup = () => {
  openAuthSection();
  showSignupForm();
};

window.startQuiz = () => {
  window.location.href = "quiz.html";
};

/* =========================
   SIGNUP LOGIC
========================= */
async function handleSignup() {
  const name = nameInput?.value.trim();
  const email = emailInput?.value.trim();
  const password = passwordInput?.value.trim();

  if (!name || !email || !password) {
    showToast("Please fill in all fields", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Password should be at least 6 characters", "error");
    return;
  }

  try {
    signupBtn.disabled = true;
    signupBtn.innerText = "Creating Account...";

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), { name, email });
    await updateProfile(user, { displayName: name });

    localStorage.setItem("user", JSON.stringify({ email, name }));
    showToast("Account created successfully!", "success");

    setTimeout(() => {
      window.location.href = "explore.html";
    }, 1000);
  } catch (err) {
    console.error(err);
    let msg = "Signup failed. Please try again.";
    if (err.code === "auth/email-already-in-use") msg = "This email is already in use.";
    if (err.code === "auth/invalid-email") msg = "Please enter a valid email.";
    if (err.code === "auth/weak-password") msg = "Password should be at least 6 characters.";
    
    showToast(msg, "error");
    signupBtn.disabled = false;
    signupBtn.innerText = "Create Account";
  }
}

/* =========================
   LOGIN LOGIC
========================= */
async function handleLogin() {
  const email = loginEmailInput?.value.trim();
  const password = loginPasswordInput?.value.trim();

  if (!email || !password) {
    showToast("Please fill in all fields", "error");
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.innerText = "Logging in...";

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    localStorage.setItem("user", JSON.stringify({ email: user.email, name: user.displayName }));
    showToast("Welcome back!", "success");

    setTimeout(() => {
      window.location.href = "explore.html";
    }, 1000);
  } catch (err) {
    console.error(err);
    let msg = "Login failed. Please check your credentials.";
    if (err.code === "auth/invalid-credential") msg = "Invalid email or password.";
    if (err.code === "auth/user-not-found") msg = "No account found with this email.";
    if (err.code === "auth/wrong-password") msg = "Incorrect password.";
    
    showToast(msg, "error");
    loginBtn.disabled = false;
    loginBtn.innerText = "Login";
  }
}

if (signupBtn) signupBtn.addEventListener("click", handleSignup);
if (loginBtn) loginBtn.addEventListener("click", handleLogin);

/* =========================
   AUTH STATE
========================= */
let isRedirecting = false;

onAuthStateChanged(auth, (user) => {
  // If there's an authView flag, the user came from the result page wanting to sign up/login
  // Don't auto-redirect — let the modal open instead
  const authView = localStorage.getItem("authView");
  if (authView) return;

  if (user && !isRedirecting) {
    const path = window.location.pathname;
    const isLanding = path.endsWith("index.html") || path === "/" || path.endsWith("/");
    
    if (isLanding) {
      isRedirecting = true;
      window.location.href = "explore.html";
    }
  }
});

/* =========================
   AUTO-OPEN MODAL FROM FLAG
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const authView = localStorage.getItem("authView");
  if (authView === "signup") {
    localStorage.removeItem("authView");
    openAuthSection();
    showSignupForm();
  } else if (authView === "login") {
    localStorage.removeItem("authView");
    openAuthSection();
    showLoginForm();
  }
});

/* =========================
   THEME TOGGLE
========================= */
window.toggleTheme = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
};

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}

/* =========================
   INTRO TEXT ANIMATION
========================= */
document.addEventListener("DOMContentLoaded", () => {
  // Reveal the page
  document.body.classList.add("page-loaded");

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
