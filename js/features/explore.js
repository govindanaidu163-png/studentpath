const careers = window.careers || [];

if (!Array.isArray(careers)) {
  console.error("Careers data not loaded properly");
}

let currentSearch = "";
let currentType = "all";
let currentSort = "high";

let trendingIndex = 0;
let trendingTimer = null;

/* ================= HELPERS ================= */

function openCareer(career) {
  localStorage.setItem("selectedCareer", JSON.stringify(career));
  window.location.href = "career.html";
}

function isSaved(career) {
  const saved = JSON.parse(localStorage.getItem("savedCareers")) || [];
  return saved.some(c => c.key === career.key);
}

/* ================= TRENDING ================= */

function renderTrending(list) {
  const container = document.getElementById("trendingCareers");
  if (!container) return;

  container.innerHTML = "";

  const trending = [...list]
    .map(c => ({
      ...c,
      score: (c.salary || 0) + (c.rating || 4) * 10
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  trending.forEach((c, index) => {
    const card = document.createElement("div");
    card.className = "trend-card";

    card.innerHTML = `
      <img src="${c.image}" class="trend-card-image">
      <div class="trend-card-content">
        <h3>${c.name}</h3>
        <p>${c.salaryLabel}</p>
      </div>
    `;

    card.onclick = () => openCareer(c);
    container.appendChild(card);
  });

  startTrendingSlider();
}

function startTrendingSlider() {
  const track = document.getElementById("trendingCareers");
  if (!track) return;

  const cards = track.querySelectorAll(".trend-card");
  if (cards.length <= 2) return;

  clearInterval(trendingTimer);
  trendingIndex = 0;

  function slideNext() {
    const cardWidth = cards[0].offsetWidth;
    const gap = 18;
    const maxIndex = cards.length - 2;

    trendingIndex = trendingIndex >= maxIndex ? 0 : trendingIndex + 1;
    track.style.transform = `translateX(-${trendingIndex * (cardWidth + gap)}px)`;
  }

  trendingTimer = setInterval(slideNext, 3500);
}

/* ================= GRID ================= */

function renderGrid(list = careers) {
  const grid = document.getElementById("careerGrid");
  if (!grid) return;

  grid.innerHTML = "";

  list.forEach(c => {
    const card = document.createElement("div");
    card.className = "career-card";

    const saved = isSaved(c);

    card.innerHTML = `
      <div class="save-btn">${saved ? "♥" : "♡"}</div>

      <img src="${c.image}" class="career-image">

      <div class="career-info">
        <h3>${c.name}</h3>
        <p class="salary">${c.salaryLabel}</p>

        <div class="meta">
          <span>${"⭐".repeat(Math.round(c.rating || 4))}</span>
          <span class="tag">${c.tag || "Trending"}</span>
        </div>
      </div>
    `;

    const saveBtn = card.querySelector(".save-btn");

    saveBtn.onclick = (e) => {
      e.stopPropagation();

      let saved = JSON.parse(localStorage.getItem("savedCareers")) || [];

      const exists = saved.find(item => item.key === c.key);

      if (exists) {
        saved = saved.filter(item => item.key !== c.key);
        saveBtn.textContent = "♡";
      } else {
        saved.push(c);
        saveBtn.textContent = "♥";
      }

      localStorage.setItem("savedCareers", JSON.stringify(saved));
    };

    card.onclick = () => openCareer(c);

    grid.appendChild(card);
  });
}

/* ================= FILTERS ================= */

window.searchCareer = function () {
  const input = document.getElementById("searchInput");
  currentSearch = (input?.value || "").toLowerCase();
  updateUI();
};

window.filterType = function(type, e) {
  currentType = type;

  document.querySelectorAll(".cat").forEach(btn => {
    btn.classList.remove("active");
  });

  if (e) e.target.classList.add("active");

  updateUI();
};

window.sortCareers = function (type) {
  currentSort = type;
  updateUI();
};

/* ================= MAIN ================= */

function updateUI() {
  let filtered = [...careers];

  if (currentSearch) {
    filtered = filtered.filter(c =>
      (c.name || "").toLowerCase().includes(currentSearch)
    );
  }

  if (currentType !== "all") {
    filtered = filtered.filter(c => (c.type || "") === currentType);
  }

  if (currentSort === "high") {
    filtered.sort((a, b) => (b.salary || 0) - (a.salary || 0));
  } else if (currentSort === "low") {
    filtered.sort((a, b) => (a.salary || 0) - (b.salary || 0));
  } else if (currentSort === "name") {
    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  renderTrending(filtered);
  renderGrid(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  updateUI();
});