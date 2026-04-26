const authSection = document.getElementById("authSection");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const closeBtn = document.getElementById("closeBtn");

// OPEN
window.showLogin = function () {
  authSection.classList.remove("hidden");
};

// CLOSE
closeBtn.onclick = () => {
  authSection.classList.add("hidden");
};

// SWITCH TABS
loginTab.onclick = () => {
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");

  loginTab.classList.add("active");
  signupTab.classList.remove("active");
};

signupTab.onclick = () => {
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");

  signupTab.classList.add("active");
  loginTab.classList.remove("active");
};