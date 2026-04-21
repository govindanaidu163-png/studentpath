const exams = window.exams || [];

let currentSearch = "";
let currentType = "all";

/* TRENDING */
function renderTrending(list) {
  const container = document.getElementById("trendingExams");
  container.innerHTML = "";

  const top = [...list].slice(0, 6);

  top.forEach(e => {
    const div = document.createElement("div");
    div.className = "trend-card";

    div.innerHTML = `
      <img src="${e.image}" class="trend-card-image">
      <div class="trend-card-content">
        <div class="trend-kicker">Trending</div>
        <h3 class="trend-title">${e.name}</h3>
        <p class="trend-desc">${e.salaryLabel}</p>
        <button class="trend-btn">View details</button>
      </div>
    `;

    div.onclick = () => {
      localStorage.setItem("selectedExam", JSON.stringify(e));
      window.location.href = "exam.html";
    };

    container.appendChild(div);
  });
}

/* GRID */
function renderGrid(list) {
  const grid = document.getElementById("examGrid");
  grid.innerHTML = "";

  list.forEach(e => {
    const card = document.createElement("div");
    card.className = "career-card";

    card.innerHTML = `
      <img src="${e.image}" class="career-image">
      <div class="career-info">
        <h3>${e.name}</h3>
        <p class="salary">${e.salaryLabel}</p>
        <span class="tag">${e.tag}</span>
      </div>
    `;

    card.onclick = () => {
      localStorage.setItem("selectedExam", JSON.stringify(e));
      window.location.href = "exam.html";
    };

    grid.appendChild(card);
  });
}

/* SEARCH */
window.searchExam = function () {
  const input = document.getElementById("searchInput");
  currentSearch = input.value.toLowerCase();
  updateUI();
};

/* FILTER */
window.filterType = function (type) {
  currentType = type;
  updateUI();
};

/* UPDATE */
function updateUI() {
  let filtered = [...exams];

  if (currentSearch) {
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(currentSearch)
    );
  }

  if (currentType !== "all") {
    filtered = filtered.filter(e => e.type === currentType);
  }

  renderTrending(filtered);
  renderGrid(filtered);
}


function filterExam(type) {
  const cards = document.querySelectorAll(".exam-card");

  cards.forEach(card => {
    if (type === "all" || card.dataset.type === type) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  // active button UI
  document.querySelectorAll(".cat").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
}


/* INIT */
document.addEventListener("DOMContentLoaded", updateUI);