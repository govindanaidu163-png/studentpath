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
const authModal = document.getElementById("authModal");
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
const authToggle = document.getElementById("authToggle");
const authFormsWrapper = document.getElementById("authFormsWrapper");

function openAuthSection() {
  authSection.classList.remove("hidden");

  document.body.style.overflow = "hidden";

  // 🔥 FORCE scroll to top (fixes your bug)
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}
function closeAuthSection() {
  authSection.classList.add("hidden");
  document.body.style.overflow = "auto";
  if (authModal) authModal.style.transform = "";
}

function showLoginForm() {
  if (!authToggle || !authFormsWrapper || !loginTab || !signupTab) return;
  authToggle.setAttribute("data-active", "login");
  authFormsWrapper.setAttribute("data-active", "login");
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
}

function showSignupForm() {
  if (!authToggle || !authFormsWrapper || !loginTab || !signupTab) return;
  authToggle.setAttribute("data-active", "signup");
  authFormsWrapper.setAttribute("data-active", "signup");
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
}

/* =========================
   3D TILT EFFECT
========================= */
if (authSection && authModal) {
  authSection.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 768) return;
    
    const rect = authModal.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateY = (x / (rect.width / 2)) * 5;
    const rotateX = -(y / (rect.height / 2)) * 5;

    const clampedY = Math.max(-5, Math.min(5, rotateY));
    const clampedX = Math.max(-5, Math.min(5, rotateX));

    authModal.style.transform = `scale(1) rotateX(${clampedX}deg) rotateY(${clampedY}deg)`;
  });

  authSection.addEventListener("mouseleave", () => {
    authModal.style.transform = ``;
  });
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

window.openAuthSection = openAuthSection;
window.closeAuthSection = closeAuthSection;
window.showLoginForm = showLoginForm;
window.showSignupForm = showSignupForm;

/* =========================
   SIGNUP LOGIC
========================= */
async function handleSignup(event) {
  event?.preventDefault();

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

    await updateProfile(user, { displayName: name });

    try {
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (profileErr) {
      console.warn("Account created, but profile document was not saved:", profileErr);
    }

    localStorage.setItem("user", JSON.stringify({ uid: user.uid, email, name }));
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
    if (err.code === "auth/operation-not-allowed") msg = "Email/password signup is not enabled in Firebase Authentication.";
    if (err.code === "auth/unauthorized-domain") msg = "This website domain is not authorized in Firebase Authentication.";
    
    showToast(msg, "error");
    signupBtn.disabled = false;
    signupBtn.innerText = "Create Account";
    if (signupForm) {
      signupForm.classList.remove("shake");
      void signupForm.offsetWidth;
      signupForm.classList.add("shake");
    }
  }
}

/* =========================
   LOGIN LOGIC
========================= */
async function handleLogin(event) {
  event?.preventDefault();

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

    localStorage.setItem("user", JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: user.displayName || "User"
    }));
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
    if (err.code === "auth/operation-not-allowed") msg = "Email/password login is not enabled in Firebase Authentication.";
    if (err.code === "auth/unauthorized-domain") msg = "This website domain is not authorized in Firebase Authentication.";
    
    showToast(msg, "error");
    loginBtn.disabled = false;
    loginBtn.innerText = "Login";
    if (loginForm) {
      loginForm.classList.remove("shake");
      void loginForm.offsetWidth;
      loginForm.classList.add("shake");
    }
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
