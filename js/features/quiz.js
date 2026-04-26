// ================= QUESTIONS =================
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

// ================= STATE =================
let current = 0;

let score = {
  tech: 0,
  medical: 0,
  creative: 0,
  business: 0
};

// ================= DOM =================
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const questionBox = document.getElementById("questionBox");

// ================= LOAD QUESTION =================
function loadQuestion() {
  const q = questions[current];

  if (!questionText || !optionsContainer) {
    console.error("Elements not found");
    return;
  }

  questionText.innerText = q.q;
  optionsContainer.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.innerText = opt.text;

    btn.onclick = () => {
      score[opt.type]++;
      btn.classList.add("selected");
      setTimeout(nextQuestion, 200);
    };

    optionsContainer.appendChild(btn);
  });

  updateProgress();
}

// ================= NEXT =================
function nextQuestion() {
  if (questionBox) {
    questionBox.style.opacity = 0.5;
    questionBox.style.transform = "scale(0.97)";
  }

  setTimeout(() => {
    current++;

    if (current < questions.length) {
      loadQuestion();

      if (questionBox) {
        questionBox.style.opacity = 1;
        questionBox.style.transform = "scale(1)";
      }
    } else {
      showAnalyzing();
    }
  }, 150);
}

// ================= PROGRESS =================
function updateProgress() {
  const percent = Math.round((current / questions.length) * 100);

  if (progressFill) progressFill.style.width = percent + "%";
  if (progressText) progressText.innerText = percent + "%";
}

// ================= ANALYZING =================
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

// ================= RESULT =================
function showResult() {
  const best = Object.keys(score).reduce((a, b) =>
    score[a] > score[b] ? a : b
  );

  localStorage.setItem("careerResult", best);

  window.location.href = "result.html";
}

// ================= START =================
window.onload = function () {
  console.log("Quiz started");
  loadQuestion();
};

// PARTICLES
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
