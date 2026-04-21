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

/* ================= TRENDING CARDS ================= */
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
    card.className = "trend-card" + (index % 2 === 1 ? " right-theme" : "");

    card.innerHTML = `
      <img src="${c.image}" class="trend-card-image" alt="${c.name}">
      <div class="trend-card-content">
        <div class="trend-kicker">${index === 0 ? "Spotlight" : "Trending"}</div>
        <h3 class="trend-title">${c.name}</h3>
        <p class="trend-desc">${c.desc || "Explore this career path."}</p>
        <div class="trend-salary">${c.salaryLabel || ""}</div>
        <button class="trend-btn" type="button">View details</button>
      </div>
    `;

    card.addEventListener("click", () => openCareer(c));
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
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 18;
    const maxIndex = Math.max(0, cards.length - 2);

    trendingIndex = (trendingIndex >= maxIndex) ? 0 : trendingIndex + 1;
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

    const stars = "⭐".repeat(Math.round(c.rating || 4));

    card.innerHTML = `
      <img src="${c.image}" class="career-image" alt="${c.name}">
      <div class="career-info">
        <h3>${c.name}</h3>
        <p class="salary">${c.salaryLabel || ""}</p>
        <div class="meta">
          <span>${stars}</span>
          <span class="tag">${c.tag || "Trending"}</span>
        </div>
      </div>
    `;

    card.onclick = () => openCareer(c);
    grid.appendChild(card);
  });
}

/* ================= SEARCH ================= */
window.searchCareer = function () {
  const input = document.getElementById("searchInput");
  currentSearch = (input?.value || "").toLowerCase();
  updateUI();
};

window.filterType = function (type) {
  currentType = type;
  updateUI();
};

window.sortCareers = function (type) {
  currentSort = type;
  updateUI();
};

window.filterType = function(type) {
  currentType = type;

  // remove active from all
  document.querySelectorAll(".cat").forEach(btn => {
    btn.classList.remove("active");
  });

  // add active to clicked
  event.target.classList.add("active");

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