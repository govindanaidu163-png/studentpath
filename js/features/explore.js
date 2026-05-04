const careers = window.careers || [];

let currentSearch = "";
let currentType = window.innerWidth <= 720 ? "" : "tech"; // default to Tech on desktop, but show all on mobile
let currentSort = "high";
let currentPill = "all";

let trendingIndex = 0;
let trendingTimer = null;

/* ================= HELPERS ================= */

function openCareer(career) {
  localStorage.setItem("selectedCareer", JSON.stringify(career));
  // Use SPA router if available, else normal navigation
  if (window.spaGo) {
    window.spaGo("career.html");
  } else {
    window.location.href = "career.html";
  }
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
    .sort((a, b) => (b.salary || 0) - (a.salary || 0))
    .slice(0, 6);

  trending.forEach((c, index) => {
    const card = document.createElement("div");
    card.className = "trend-card" + (index % 2 === 1 ? " spotlight" : "");

    card.innerHTML = `
      <img src="${c.image}" class="trend-card-image" alt="${c.name}" onerror="this.style.display='none'">
      <div class="trend-card-content">
        ${index % 2 === 1 ? '<div class="trend-kicker">Spotlight</div>' : ''}
        <div class="trend-title">
          ${index % 2 === 1
        ? `Learn about <strong>${c.name}</strong>.<br><small style="font-size:13px;opacity:0.8">High demand, lucrative salaries</small>`
        : `<strong>${c.name}:</strong> Shape the Future`
      }
        </div>
        ${index % 2 === 0 ? `<div class="trend-salary">&#8377; ${c.salaryLabel}</div>` : ''}
        <button class="trend-btn" type="button">View details</button>
      </div>
    `;

    const detailsBtn = card.querySelector(".trend-btn");
    detailsBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      openCareer(c);
    });

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
    const gap = 16;
    const maxIndex = cards.length - 2;

    trendingIndex = trendingIndex >= maxIndex ? 0 : trendingIndex + 1;
    track.style.transform = `translateX(-${trendingIndex * (cardWidth + gap)}px)`;
  }

  trendingTimer = setInterval(slideNext, 3500);
}

/* ================= GRID / EXPLORE RENDER ================= */

function renderExplore(list = window.careers) {
  const grid = document.getElementById("careerGrid");
  if (!grid) return;

  if (!list || list.length === 0) {
    grid.innerHTML = "<p style='padding: 20px; text-align: center; color: var(--text-muted);'>No data available</p>";
    return;
  }

  grid.innerHTML = "";

  const isMobile = window.innerWidth <= 720;
  const isDefaultView = !currentSearch && currentPill === "all";

  if (isMobile && isDefaultView) {
    grid.classList.add('netflix-layout');

    const groupedCareers = {};
    list.forEach(career => {
      if (!career.category) return;
      if (!groupedCareers[career.category]) {
        groupedCareers[career.category] = [];
      }
      groupedCareers[career.category].push(career);
    });

    const categoryOrder = [
      "Engineering",
      "Medical",
      "Business",
      "Sports",
      "Creativity",
      "Government"
    ];

    categoryOrder.forEach(cat => {
      if (groupedCareers[cat] && groupedCareers[cat].length > 0) {
        const catItems = groupedCareers[cat];
        
        const rowWrap = document.createElement("div");
        rowWrap.className = "netflix-row-wrap category-section";
        rowWrap.innerHTML = `
          <div class="netflix-row-header section-header">
            <h3>${cat} <span>${catItems.length}+ Paths</span></h3>
            <a href="#" class="view-all-btn view-all">View all &rsaquo;</a>
          </div>
          <div class="netflix-row-scroll horizontal-scroll"></div>
        `;

        const scrollContainer = rowWrap.querySelector(".netflix-row-scroll");

        catItems.forEach(c => {
          const card = createCard(c);
          scrollContainer.appendChild(card);
        });

        grid.appendChild(rowWrap);
      }
    });
  } else {
    grid.classList.remove('netflix-layout');
    list.forEach(c => {
      grid.appendChild(createCard(c));
    });
  }
}

function createCard(c) {
  const card = document.createElement("div");
  card.className = "career-card";

  const saved = isSaved(c);
  const isHighDemand = (c.growth || 0) >= 4;
  const rating = Math.round(c.rating || 4);
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  card.innerHTML = `
    <button class="save-btn" title="Save">${saved ? "♥" : "♡"}</button>
    <img src="${c.image}" class="career-image" alt="${c.name}" onerror="this.src='https://placehold.co/300x140/e0e7ef/888?text=${encodeURIComponent(c.name)}'">
    <div class="career-info">
      <h3>${c.name}</h3>
      <div class="card-tag ${isHighDemand ? 'high-demand' : ''}">${isHighDemand ? 'High Demand' : (c.stream || c.type || '').toUpperCase()}</div>
      <div class="salary">
        <span class="salary-arrow">↑</span>
        ${c.salaryLabel}
      </div>
      <div class="stars">${stars}</div>
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
  return card;
}

/* ================= FILTERS ================= */

window.searchCareer = function () {
  const input = document.getElementById("searchInput");
  currentSearch = (input?.value || "").toLowerCase();
  updateUI();
};

// Type filter from icon row
window.filterType = function (type, el) {
  currentType = type;
  document.querySelectorAll(".cat-icon").forEach(btn => btn.classList.remove("active"));
  if (el) el.classList.add("active");
  updateUI();
};

// Pill filter (top free, high demand, etc.)
window.setPill = function (el, type) {
  currentPill = type;
  document.querySelectorAll(".pill").forEach(btn => btn.classList.remove("active"));
  if (el) el.classList.add("active");

  if (type === "high") currentSort = "high";
  else if (type === "salary") currentSort = "salary";
  else currentSort = "high";

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

  // Type filter maps: icon categories → data types
  const typeMap = {
    "tech": ["science"],
    "health": ["science"],
    "business": ["commerce"],
    "design": ["arts"],
    "finance": ["commerce"],
    "engineering": ["science"],
    "creative": ["arts"],
  };

  if (currentType && typeMap[currentType]) {
    filtered = filtered.filter(c => typeMap[currentType].includes(c.type || ""));
  }

  if (currentPill === "high") {
    filtered = filtered.filter(c => (c.growth || 0) >= 4 || (c.successRate || 0) >= 60);
  } else if (currentPill === "easy") {
    filtered = filtered.filter(c => (c.difficulty || 0) <= 3 || (c.successRate || 0) >= 65);
  }

  if (currentSort === "high" || currentSort === "salary") {
    filtered.sort((a, b) => (b.salary || 0) - (a.salary || 0));
  } else if (currentSort === "low") {
    filtered.sort((a, b) => (a.salary || 0) - (b.salary || 0));
  } else if (currentSort === "name") {
    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  renderTrending(filtered);
  renderExplore(filtered);
}

function initExplorePage() {
  updateUI();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExplorePage);
} else {
  initExplorePage();
}
