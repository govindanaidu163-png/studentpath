// ================= QUESTIONS WITH LOGIC =================

// (Firebase removed because not used here)
// import { auth , db } from "../firebase.js";

const questions = [
  {
    q: "What do you enjoy the most?",
    options: [
      { text: "Coding", type: "tech" },
      { text: "Helping people", type: "medical" },
      { text: "Designing", type: "creative" },
      { text: "Business", type: "business" }
    ]
  },
  {
    q: "Which skill do you prefer?",
    options: [
      { text: "Logic", type: "tech" },
      { text: "Communication", type: "business" },
      { text: "Creativity", type: "creative" },
      { text: "Care", type: "medical" }
    ]
  },
  {
    q: "What kind of work excites you?",
    options: [
      { text: "Building apps", type: "tech" },
      { text: "Treating patients", type: "medical" },
      { text: "Creating content", type: "creative" },
      { text: "Running companies", type: "business" }
    ]
  }
];

// ================= SCORE SYSTEM =================

let score = {
  tech: 0,
  medical: 0,
  creative: 0,
  business: 0
};

let current = 0;

// ================= LOAD QUESTION =================

function loadQuestion() {
  const q = questions[current];

  const questionText = document.getElementById("questionText");
  const container = document.getElementById("optionsContainer");

  if (!questionText || !container) return;

  questionText.innerText = q.q;
  container.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.innerText = opt.text;

    btn.onclick = () => {
      score[opt.type]++;
      btn.classList.add("selected");
      setTimeout(nextQuestion, 200);
    };

    container.appendChild(btn);
  });

  updateProgress();
}

// ================= NEXT =================

function nextQuestion() {
  const box = document.getElementById("questionBox");
  if (!box) return;

  box.style.opacity = 0.5;
  box.style.transform = "scale(0.97)";

  setTimeout(() => {
    current++;

    if (current < questions.length) {
      loadQuestion();
      box.style.opacity = 1;
      box.style.transform = "scale(1)";
    } else {
      showAnalyzing();
    }
  }, 150);
}

// ================= PROGRESS =================

function updateProgress() {
  const percent = Math.round((current / questions.length) * 100);

  const fill = document.getElementById("progressFill");
  const text = document.getElementById("progressText");

  if (fill) fill.style.width = percent + "%";
  if (text) text.innerText = percent + "%";
}

// ================= AI ANALYZING =================

function showAnalyzing() {
  const container = document.querySelector(".quiz-container");
  if (!container) return;

  container.innerHTML = `
    <div class="ai-box">
      <h2>🤖 Analyzing your answers...</h2>
      <div class="loader"></div>
      <p>Finding your best career match</p>
    </div>
  `;

  setTimeout(showResult, 2000);
}

// ================= RESULT LOGIC =================

function showResult() {
  let best = Object.keys(score).reduce((a, b) =>
    score[a] > score[b] ? a : b
  );

  // SAVE RESULT
  localStorage.setItem("careerResult", best);

  // REDIRECT
  window.location.href = "/pages/result.html";
}

// ================= START =================

document.addEventListener("DOMContentLoaded", loadQuestion);

// ================= PARTICLES (SAFE) =================

const canvas = document.getElementById("particles");

if (canvas) {
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5
    });
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      ctx.fillStyle = "rgba(99,102,241,0.7)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animateParticles);
  }

  animateParticles();
}