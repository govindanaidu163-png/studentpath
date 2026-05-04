const exams = window.exams || [];

let currentSearch = "";
let currentType = "engineering"; // default
let currentPill = "all";

/* ================= HELPERS ================= */

function openExam(exam) {
  localStorage.setItem("selectedExam", JSON.stringify(exam));
  // Use SPA router if available, else normal navigation
  if (window.spaGo) {
    window.spaGo("exam.html");
  } else {
    window.location.href = "exam.html";
  }
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
    .sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0))
    .slice(0, 6);

  trending.forEach((e, index) => {
    const card = document.createElement("div");
    card.className = "trend-card" + (index % 2 === 1 ? " spotlight" : "");

    card.innerHTML = `
      <img src="${e.image}" class="trend-card-image" alt="${e.name}" onerror="this.style.display='none'">
      <div class="trend-card-content">
        ${index % 2 === 1 ? '<div class="trend-kicker">Spotlight</div>' : ''}
        <div class="trend-title">
          ${index % 2 === 1
        ? `Crack <strong>${e.name}</strong>.<br><small style="font-size:13px;opacity:0.8">${e.salaryLabel}</small>`
        : `<strong>${e.name}:</strong> ${e.salaryLabel}`
      }
        </div>
        ${index % 2 === 0 ? `<div class="trend-salary">Difficulty: ${"⭐".repeat(e.difficulty || 3)}</div>` : ''}
        <button class="trend-btn" type="button">View details</button>
      </div>
    `;

    const detailsBtn = card.querySelector(".trend-btn");
    detailsBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      openExam(e);
    });

    card.onclick = () => openExam(e);
    container.appendChild(card);
  });

  startTrendingSlider();
}

function startTrendingSlider() {
  const track = document.getElementById("trendingExams");
  if (!track) return;

  const cards = track.querySelectorAll(".trend-card");
  if (cards.length <= 2) return;

  let index = 0;
  clearInterval(window._examSliderTimer);

  window._examSliderTimer = setInterval(() => {
    const cardWidth = cards[0].offsetWidth;
    const gap = 16;
    const maxIndex = cards.length - 2;
    index = index >= maxIndex ? 0 : index + 1;
    track.style.transform = `translateX(-${index * (cardWidth + gap)}px)`;
  }, 3500);
}

/* ================= GRID ================= */

function renderGrid(list = exams) {
  const grid = document.getElementById("examGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const isMobile = window.innerWidth <= 720;
  const isDefaultView = !currentSearch && currentPill === "all";

  if (isMobile && isDefaultView) {
    grid.classList.add('netflix-layout');

    const categories = [
      { id: "engineering", title: "Engineering Exams", suffix: "15+ Exams", filterFn: e => e.type === "engineering" },
      { id: "medical", title: "Medical Exams", suffix: "10+ Exams", filterFn: e => e.type === "medical" },
      { id: "government", title: "Government Exams", suffix: "20+ Exams", filterFn: e => e.type === "government" },
      { id: "management", title: "Management Exams", suffix: "12+ Exams", filterFn: e => e.type === "management" }
    ];

    categories.forEach(cat => {
      const catItems = list.filter(cat.filterFn).slice(0, 8);
      if (catItems.length === 0) return;

      const rowWrap = document.createElement("div");
      rowWrap.className = "netflix-row-wrap";
      rowWrap.innerHTML = `
        <div class="netflix-row-header">
          <h3>${cat.title} <span>${cat.suffix}</span></h3>
          <a href="#" class="view-all-btn">View all &rsaquo;</a>
        </div>
        <div class="netflix-row-scroll"></div>
      `;

      const scrollContainer = rowWrap.querySelector(".netflix-row-scroll");

      catItems.forEach(e => {
        const card = createExamCard(e);
        scrollContainer.appendChild(card);
      });

      grid.appendChild(rowWrap);
    });
  } else {
    grid.classList.remove('netflix-layout');
    list.forEach(e => {
      grid.appendChild(createExamCard(e));
    });
  }
}

function createExamCard(e) {
  const card = document.createElement("div");
  card.className = "career-card";

  const saved = isExamSaved(e);
  const diff = e.difficulty || 3;
  const stars = "★".repeat(diff) + "☆".repeat(5 - diff);
  const isHard = diff >= 4;

  card.innerHTML = `
    <button class="save-btn" title="Save">${saved ? "♥" : "♡"}</button>
    <img src="${e.image}" class="career-image" alt="${e.name}" onerror="this.src='https://placehold.co/300x140/e0e7ef/888?text=${encodeURIComponent(e.name)}'">
    <div class="career-info">
      <h3>${e.name}</h3>
      <div class="card-tag ${isHard ? 'high-demand' : ''}">${isHard ? 'Tough Exam' : (e.type || '').toUpperCase()}</div>
      <div class="salary">
        <span class="salary-arrow">↑</span>
        ${e.salaryLabel}
      </div>
      <div class="stars">${stars}</div>
    </div>
  `;

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

  card.onclick = () => openExam(e);
  return card;
}

/* ================= FILTERS ================= */

// Category icon filter
window.filterExam = function (type, el) {
  currentType = type;
  document.querySelectorAll(".cat-icon").forEach(btn => btn.classList.remove("active"));
  if (el) el.classList.add("active");
  updateUI();
};

// Pill filter
window.setPill = function (el, type) {
  currentPill = type;
  document.querySelectorAll(".pill").forEach(btn => btn.classList.remove("active"));
  if (el) el.classList.add("active");
  updateUI();
};

window.searchCareer = function () {
  const input = document.getElementById("searchInput");
  currentSearch = (input?.value || "").trim().toLowerCase();
  updateUI();
};

/* ================= MAIN ================= */

function updateUI() {
  let filtered = [...exams];

  if (currentSearch) {
    filtered = filtered.filter(e =>
      (e.name || "").toLowerCase().includes(currentSearch) ||
      (e.salaryLabel || "").toLowerCase().includes(currentSearch)
    );
  }

  if (currentType && !currentSearch) {
    filtered = filtered.filter(e => e.type === currentType);
  }

  if (currentPill === "hard") {
    filtered = filtered.filter(e => (e.difficulty || 0) >= 4);
    filtered.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
  } else if (currentPill === "easy") {
    filtered = filtered.filter(e => (e.difficulty || 0) <= 3);
  } else if (currentPill === "popular") {
    filtered.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
  }

  renderTrending(filtered.length ? filtered : exams.slice(0, 6));
  renderGrid(filtered);
}

function initExamsPage() {
  updateUI();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExamsPage);
} else {
  initExamsPage();
}
