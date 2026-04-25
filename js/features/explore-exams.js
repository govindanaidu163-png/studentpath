const exams = window.exams || [];

if (!Array.isArray(exams)) {
  console.error("Exam data not loaded properly");
}

let currentType = "all";

/* ================= HELPERS ================= */

function openExam(exam) {
  localStorage.setItem("selectedExam", JSON.stringify(exam));
  window.location.href = "exam.html";
}

function isExamSaved(exam) {
  const saved = JSON.parse(localStorage.getItem("savedExams")) || [];
  return saved.some(e => e.key === exam.key);
}

/* ================= TRENDING ================= */

function renderTrending(list) {
  const container = document.getElementById("trendingExams");
  if (!container) return;

  container.innerHTML = "";

  const trending = [...list]
    .map(e => ({
      ...e,
      score: (e.difficulty || 0) * 10
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  trending.forEach(e => {
    const card = document.createElement("div");
    card.className = "trend-card";

    card.innerHTML = `
      <img src="${e.image}" class="trend-card-image">
      <div class="trend-card-content">
        <h3>${e.name}</h3>
        <p>${e.salaryLabel}</p>
      </div>
    `;

    card.onclick = () => openExam(e);

    container.appendChild(card);
  });
}

/* ================= GRID ================= */

function renderGrid(list = exams) {
  const grid = document.getElementById("examGrid");
  if (!grid) return;

  grid.innerHTML = "";

  list.forEach(e => {
    const card = document.createElement("div");
    card.className = "career-card"; // reuse same style

    const saved = isExamSaved(e);

    card.innerHTML = `
      <div class="save-btn">${saved ? "♥" : "♡"}</div>

      <img src="${e.image}" class="career-image">

      <div class="career-info">
        <h3>${e.name}</h3>
        <p class="salary">${e.salaryLabel}</p>

        <div class="meta">
          <span>Difficulty: ${"⭐".repeat(e.difficulty || 3)}</span>
          <span class="tag">${e.tag || "Exam"}</span>
        </div>
      </div>
    `;

    // ❤️ SAVE BUTTON
    const saveBtn = card.querySelector(".save-btn");

    saveBtn.onclick = (ev) => {
      ev.stopPropagation();

      let saved = JSON.parse(localStorage.getItem("savedExams")) || [];

      const exists = saved.find(item => item.key === e.key);

      if (exists) {
        saved = saved.filter(item => item.key !== e.key);
        saveBtn.textContent = "♡";
      } else {
        saved.push(e);
        saveBtn.textContent = "♥";
      }

      localStorage.setItem("savedExams", JSON.stringify(saved));
    };

    // 👉 OPEN EXAM PAGE
    card.onclick = () => openExam(e);

    grid.appendChild(card);
  });
}

/* ================= FILTER ================= */

window.filterType = function(type, e) {
  currentType = type;

  document.querySelectorAll(".category").forEach(btn => {
    btn.classList.remove("active");
  });

  if (e) e.target.classList.add("active");

  updateUI();
};

/* ================= MAIN ================= */

function updateUI() {
  let filtered = [...exams];

  if (currentType !== "all") {
    filtered = filtered.filter(e => e.type === currentType);
  }

  renderTrending(filtered);
  renderGrid(filtered);
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
  updateUI();
});