/* ================= QUESTIONS ================= */
console.log("START RUNNING");
alert("RUNNING");
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

/* ================= STATE ================= */

let score = {
  tech: 0,
  medical: 0,
  creative: 0,
  business: 0
};

let current = 0;

/* ================= ELEMENTS ================= */

const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const questionBox = document.getElementById("questionBox");

/* ================= START ================= */

function startQuizUI() {
  console.log("Quiz script loaded");
  loadQuestion();
  initParticles();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startQuizUI);
} else {
  startQuizUI();
}

/* ================= LOAD QUESTION ================= */

function loadQuestion() {
  const q = questions[current];

  if (!questionText || !optionsContainer) {
    console.error("Quiz elements missing");
    return;
  }

  questionText.innerText = q.q;
  optionsContainer.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.textContent = opt.text;

    btn.addEventListener("click", () => {
      score[opt.type] += 1;
      btn.classList.add("selected");

      const allOptions = optionsContainer.querySelectorAll(".option");
      allOptions.forEach(el => {
        el.style.pointerEvents = "none";
      });

      setTimeout(nextQuestion, 220);
    });

    optionsContainer.appendChild(btn);
  });

  updateProgress();
}

/* ================= NEXT QUESTION ================= */

function nextQuestion() {
  if (!questionBox) return;

  questionBox.style.opacity = "0.5";
  questionBox.style.transform = "scale(0.98)";

  setTimeout(() => {
    current += 1;

    if (current < questions.length) {
      questionBox.style.opacity = "1";
      questionBox.style.transform = "scale(1)";
      loadQuestion();
    } else {
      showAnalyzing();
    }
  }, 120);
}

/* ================= PROGRESS ================= */

function updateProgress() {
  const percent = Math.round((current / questions.length) * 100);

  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${percent}%`;
}

/* ================= ANALYZING ================= */

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

  setTimeout(showResult, 1800);
}

/* ================= RESULT ================= */

function showResult() {
  const best = Object.keys(score).reduce((a, b) =>
    score[a] > score[b] ? a : b
  );

  localStorage.setItem("careerResult", best);
  window.location.href = "result.html";
}

/* ================= PARTICLES ================= */

function initParticles() {
  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.3,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(99,102,241,0.55)";
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}