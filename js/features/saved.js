// ================= TABS =================
window.showTab = function(tab, e) {
  const careersTab = document.getElementById("savedCareers");
  const examsTab = document.getElementById("savedExams");
  if (!careersTab || !examsTab) return;

  careersTab.style.display = tab === "careers" ? "grid" : "none";

  examsTab.style.display = tab === "exams" ? "grid" : "none";

  document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));
  e?.target?.classList.add("active");
};


// ================= RENDER =================
function renderSaved() {

  const careersContainer = document.getElementById("savedCareers");
  const examsContainer = document.getElementById("savedExams");
  if (!careersContainer || !examsContainer) return;

  const savedCareers = JSON.parse(localStorage.getItem("savedCareers")) || [];
  const savedExams = JSON.parse(localStorage.getItem("savedExams")) || [];

  careersContainer.innerHTML = "";
  examsContainer.innerHTML = "";

  // ===== EMPTY STATES =====
  if (savedCareers.length === 0) {
    careersContainer.innerHTML = "<p class='empty'>No saved careers yet</p>";
  } else {
    savedCareers.forEach(c => {
      const card = document.createElement("div");
      card.className = "saved-card";

      card.innerHTML = `
        <div class="remove-btn">✕</div>

        <img src="${c.image}" alt="${c.name}" onerror="this.src='https://placehold.co/300x140/e0e7ef/888?text=${encodeURIComponent(c.name)}'">

        <div class="saved-info">
          <h3>${c.name}</h3>
          <p>${c.salaryLabel}</p>
        </div>
      `;

      // 👉 Open detail
      card.onclick = () => {
        localStorage.setItem("selectedCareer", JSON.stringify(c));
        if (window.spaGo) window.spaGo("career.html");
        else window.location.href = "career.html";
      };

      // 👉 Remove from saved
      const removeBtn = card.querySelector(".remove-btn");
      removeBtn.onclick = (e) => {
        e.stopPropagation();

        let saved = JSON.parse(localStorage.getItem("savedCareers")) || [];
        saved = saved.filter(item => item.key !== c.key);

        localStorage.setItem("savedCareers", JSON.stringify(saved));

        renderSaved(); // refresh UI
      };

      careersContainer.appendChild(card);
    });
  }

  // ===== EXAMS =====
  if (savedExams.length === 0) {
    examsContainer.innerHTML = "<p class='empty'>No saved exams yet</p>";
  } else {
    savedExams.forEach(e => {
      const card = document.createElement("div");
      card.className = "saved-card";

      card.innerHTML = `
        <div class="remove-btn">✕</div>

        <img src="${e.image}" alt="${e.name}" onerror="this.src='https://placehold.co/300x140/e0e7ef/888?text=${encodeURIComponent(e.name)}'">

        <div class="saved-info">
          <h3>${e.name}</h3>
          <p>${e.salaryLabel}</p>
        </div>
      `;

      const removeBtn = card.querySelector(".remove-btn");

      removeBtn.onclick = (ev) => {
        ev.stopPropagation();

        let saved = JSON.parse(localStorage.getItem("savedExams")) || [];
        saved = saved.filter(item => item.name !== e.name);

        localStorage.setItem("savedExams", JSON.stringify(saved));

        renderSaved();
      };

      examsContainer.appendChild(card);
    });
  }
}


// ================= INIT =================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderSaved);
} else {
  renderSaved();
}
