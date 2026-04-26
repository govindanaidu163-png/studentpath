// GET RESULT FROM QUIZ
const result = localStorage.getItem("careerResult");

// DATA MAP
const careers = {
  tech: {
    title: "Software Engineer 💻",
    desc: "You love logic, coding and building apps.",
    salary: "₹6L - ₹25L / year",
    roadmap: "Learn Programming → DSA → Projects → Jobs"
  },
  medical: {
    title: "Doctor 🏥",
    desc: "You enjoy helping people and saving lives.",
    salary: "₹5L - ₹20L / year",
    roadmap: "NEET → MBBS → Specialization"
  },
  creative: {
    title: "Designer 🎨",
    desc: "You are creative and love design.",
    salary: "₹4L - ₹15L / year",
    roadmap: "Design Skills → Portfolio → Freelance/Job"
  },
  business: {
    title: "Entrepreneur 💼",
    desc: "You think about business and growth.",
    salary: "Unlimited 🚀",
    roadmap: "Skills → Idea → Build → Scale"
  }
};

// GET ELEMENTS
const title = document.getElementById("careerTitle");
const desc = document.getElementById("careerDesc");
const salary = document.getElementById("salary");
const roadmap = document.getElementById("roadmap");

// SET DATA
if (result && careers[result]) {
  title.innerText = careers[result].title;
  desc.innerText = careers[result].desc;
  salary.innerText = careers[result].salary;
  roadmap.innerText = careers[result].roadmap;
} else {
  title.innerText = "No Result Found";
}

function goSignup() {
  // Set a flag so the landing page opens the signup modal automatically
  localStorage.setItem("authView", "signup");
  window.location.href = "index.html";
}

function goHome() {
  window.location.href = "index.html";
}
// RESTART
function restartQuiz() {
  window.location.href = "quiz.html";
}
