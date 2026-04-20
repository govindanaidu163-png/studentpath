
    import { careers } from "../data/careersData.js";

    /* ================= STATE ================= */
    let currentType = "all";
    let currentSearch = "";
    let currentSort = "high";
    let trendingTimer = null;
    let trendingPaused = false;
    let trendingIndex = 0;

    /* ================= HELPERS ================= */
    function getCareerId(career) {
      return String(career.key || career.name || "").toLowerCase().trim();
    }

    function getTrendingScore(career) {
      const text = `${career.name || ""} ${career.type || ""}`.toLowerCase();
      let score = 0;

      const salary = Number(career.salary || 0);
      score += Math.min(salary / 6000, 18);

      if (/(software|developer|coding|programming|tech|ai|data|cyber|it)/.test(text)) score += 20;
      if (/(design|creative|content|writing|video|music|ui|ux|art)/.test(text)) score += 14;
      if (/(finance|business|marketing|management|sales|hr|economics)/.test(text)) score += 12;
      if (/(doctor|nurse|medical|health|psychology|teacher|law|legal)/.test(text)) score += 11;
      if (/(research|science|analytical|engineer|scientist|math)/.test(text)) score += 8;

      return score;
    }

    function getTrendingTone(career) {
      const text = `${career.name || ""} ${career.type || ""}`.toLowerCase();

      if (/(software|developer|coding|programming|tech|ai|data|cyber|it)/.test(text)) return "tech";
      if (/(design|creative|content|writing|video|music|ui|ux|art)/.test(text)) return "creative";
      if (/(finance|business|marketing|management|sales|hr|economics)/.test(text)) return "business";
      if (/(doctor|nurse|medical|health|psychology|teacher|law|legal)/.test(text)) return "service";
      if (/(research|science|analytical|engineer|scientist|math)/.test(text)) return "science";

      return "balanced";
    }

    function getTrendingComment(career) {
      const name = `${career.name || ""}`.toLowerCase();
      const text = `${career.name || ""} ${career.type || ""}`.toLowerCase();

      if (/software engineer|developer|coding|programming/.test(text)) {
        return "Builds real products · Deep focus";
      }

      if (/ai engineer|machine learning|ai/.test(text)) {
        return "Trains smart systems · High thinking";
      }

      if (/data scientist|data analyst|data/.test(text)) {
        return "Finds patterns · Strong logic";
      }

      if (/cyber security|security|cyber/.test(text)) {
        return "Protects systems · Alert mindset";
      }

      if (/ui\/ux|ux|ui|design|designer/.test(text)) {
        return "Creative problem solver · Visual thinking";
      }

      if (/digital marketer|marketing/.test(text)) {
        return "Growth + creativity · People aware";
      }

      if (/entrepreneur/.test(name)) {
        return "Risk taker · Big vision";
      }

      if (/investment banker|stock trader|finance/.test(text)) {
        return "Fast decisions · Money + strategy";
      }

      if (/lawyer|legal/.test(text)) {
        return "Argument + precision · Clear thinking";
      }

      if (/doctor|medical|health|nurse/.test(text)) {
        return "High responsibility · Service work";
      }

      if (/teacher|education/.test(text)) {
        return "Guides people · Calm communication";
      }

      if (/writer|content|copy/.test(text)) {
        return "Best for introverts · Storytelling power";
      }

      if (/actor|artist|music|creative/.test(text)) {
        return "Expression first · Stage presence";
      }

      if (/pilot/.test(text)) {
        return "Discipline + calm · Precision under pressure";
      }

      if (/scientist|research|biotechnology|biotech/.test(text)) {
        return "Curiosity-driven · Discovery mindset";
      }

      if (/accountant|accounts/.test(text)) {
        return "Structured work · Stability first";
      }

      return "Balanced growth · Good future scope";
    }

    function getSmartTrending(list) {
      const seen = new Set();

      return list
        .filter((career) => {
          const id = getCareerId(career);
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        })
        .map((career) => ({
          ...career,
          _score: getTrendingScore(career),
          _tone: getTrendingTone(career),
          _comment: getTrendingComment(career),
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 8);
    }

   function openCareer(career) {
  localStorage.setItem("selectedCareer", JSON.stringify(career));

  document.body.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = "career.html";
  }, 300);
}

    function focusTrendingCard(cards, index, row) {
      cards.forEach((card) => card.classList.remove("is-focused"));

      const card = cards[index];
      if (!card) return;

      card.classList.add("is-focused");

      const maxScroll = Math.max(0, row.scrollWidth - row.clientWidth);
      const target = Math.max(
        0,
        Math.min(
          card.offsetLeft - (row.clientWidth - card.offsetWidth) / 2,
          maxScroll
        )
      );

      row.scrollTo({
        left: target,
        behavior: "smooth"
      });
    }

    function startTrendingAutoScroll() {
      const row = document.getElementById("trendingCareers");
      if (!row) return;

      const cards = [...row.querySelectorAll(".card")];
      if (cards.length < 2) return;

      clearInterval(trendingTimer);
      trendingPaused = false;
      trendingIndex = 0;

      row.onmouseenter = () => {
        trendingPaused = true;
      };

      row.onmouseleave = () => {
        trendingPaused = false;
      };

      focusTrendingCard(cards, trendingIndex, row);
      trendingIndex = 1;

      trendingTimer = setInterval(() => {
        if (trendingPaused) return;

        focusTrendingCard(cards, trendingIndex, row);
        trendingIndex = (trendingIndex + 1) % cards.length;
      }, 2200);
    }

    /* ================= SEARCH ================= */
    window.searchCareer = function () {
      currentSearch = document.getElementById("searchInput").value.toLowerCase();
      updateUI();
    };

    /* ================= FILTER ================= */
    window.filterType = function (type, btn) {
      currentType = type;

      document.querySelectorAll("#filterPanel button").forEach((b) => {
        b.classList.remove("active");
      });

      btn.classList.add("active");
      document.getElementById("filterPanel").classList.add("hidden");

      updateUI();
    };

    /* ================= SORT ================= */
    window.sortCareers = function (type) {
      currentSort = type;
      updateUI();
    };

    /* ================= TOGGLE FILTER ================= */
    window.toggleFilters = function () {
      document.getElementById("filterPanel").classList.toggle("hidden");
    };

    /* ================= UPDATE UI ================= */
    function updateUI() {
      let filtered = [...careers];

      if (currentType !== "all") {
        filtered = filtered.filter((c) => c.type && c.type.toLowerCase() === currentType);
      }

      if (currentSearch !== "") {
        filtered = filtered.filter((c) => c.name && c.name.toLowerCase().includes(currentSearch));
      }

      if (currentSort === "high") {
        filtered.sort((a, b) => (b.salary || 0) - (a.salary || 0));
      } else if (currentSort === "low") {
        filtered.sort((a, b) => (a.salary || 0) - (b.salary || 0));
      } else {
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      }

      showTrendingCareers(filtered);
      displayCareers(filtered);
    }

    /* ================= TRENDING CAREERS ================= */
    function showTrendingCareers(list) {
      const container = document.getElementById("trendingCareers");
      container.innerHTML = "";

      const trending = getSmartTrending(list);

      trending.forEach((career) => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
          <div class="career-note tone-${career._tone}">${career._comment}</div>
          <img src="${career.image}" class="card-img" alt="${career.name}" />
          <div class="card-overlay"></div>
          <div class="card-content">
            <h3>${career.name}</h3>
          </div>
        `;

        div.onclick = () => openCareer(career);
        container.appendChild(div);
      });

      setTimeout(() => {
        startTrendingAutoScroll();
      }, 120);
    }

    /* ================= CATEGORY SECTIONS ================= */
    function displayCareers(list) {
      const container = document.getElementById("careerSections");
      const noResults = document.getElementById("noResults");

      container.innerHTML = "";

      if (list.length === 0) {
        noResults.style.display = "block";
        return;
      } else {
        noResults.style.display = "none";
      }

      const grouped = {};

      list.forEach((career) => {
        const type = career.type || "other";
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(career);
      });

      for (let type in grouped) {
        const section = document.createElement("div");
        section.className = "category-section";

        section.innerHTML = `
          <div class="row-header">
            <h2>${type.toUpperCase()} 🚀</h2>
            <div>
              <button onclick="scrollRow(this, -1)">⬅</button>
              <button onclick="scrollRow(this, 1)">➡</button>
            </div>
          </div>

          <div class="cards"></div>
        `;

        const row = section.querySelector(".cards");

        grouped[type].forEach((career) => {
          const div = document.createElement("div");
          div.className = "card";

          div.innerHTML = `
            <img src="${career.image}" class="card-img" alt="${career.name}" />
            <div class="card-overlay"></div>
            <div class="card-content">
              <h3>${career.name}</h3>
              <p>${career.salaryLabel}</p>
            </div>
          `;

          div.onclick = () => openCareer(career);
          row.appendChild(div);
        });

        container.appendChild(section);
      }
    }

    /* ================= SCROLL ARROWS ================= */
    window.scrollRow = function (btn, dir) {
      const row = btn.closest(".row-header").nextElementSibling;

      row.scrollBy({
        left: dir * 250,
        behavior: "smooth"
      });
    };

    /* ================= INIT ================= */
    updateUI();
    
function resetPage() {
  // fade हटाओ
  document.body.classList.remove("fade-out");

  // scroll fix
  document.body.style.opacity = "1";
  document.body.style.visibility = "visible";
  document.body.style.overflow = "auto";

  // modal close
  document.getElementById("authSection")?.classList.add("hidden");

  // sidebar close
  document.getElementById("sidebar")?.classList.remove("open");
}

// IMPORTANT
window.addEventListener("pageshow", resetPage);
window.addEventListener("DOMContentLoaded", resetPage);