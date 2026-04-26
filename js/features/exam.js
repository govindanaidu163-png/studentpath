// ================= LOAD EXAM =================

function initExamPage() {

  const exam = JSON.parse(localStorage.getItem("selectedExam"));

  const titleEl = document.getElementById("examTitle");
  const descEl = document.getElementById("examDesc");
  const typeEl = document.getElementById("examType");
  const diffEl = document.getElementById("examDifficulty");
  const careerList = document.getElementById("careerList");

  if (!exam) {
    if (titleEl) titleEl.textContent = "No exam selected";
    if (descEl) descEl.textContent = "Go back and choose an exam.";
    return;
  }

  // ================= BASIC INFO =================

  titleEl.textContent = exam.name;
  descEl.textContent = exam.salaryLabel || "Important entrance exam";
  typeEl.textContent = "Type: " + exam.type.toUpperCase();
  diffEl.textContent = "Difficulty: " + "⭐".repeat(exam.difficulty || 3);

  // ================= SAVE BUTTON =================

  const btn = document.querySelector(".btn-save");

  function isSaved() {
    const saved = JSON.parse(localStorage.getItem("savedExams")) || [];
    return saved.some(e => e.key === exam.key);
  }

  function updateBtn() {
    if (!btn) return;

    if (isSaved()) {
      btn.querySelector(".btn-icon").textContent = "♥";
      btn.style.color = "#ff6b6b";
    } else {
      btn.querySelector(".btn-icon").textContent = "♡";
      btn.style.color = "";
    }
  }

  updateBtn();

  if (btn) btn.onclick = () => {
    let saved = JSON.parse(localStorage.getItem("savedExams")) || [];

    const exists = saved.find(e => e.key === exam.key);

    if (exists) {
      saved = saved.filter(e => e.key !== exam.key);
    } else {
      saved.push(exam);
    }

    localStorage.setItem("savedExams", JSON.stringify(saved));
    updateBtn();
  };

  // ================= RELATED CAREERS =================

  const careers = window.careers || [];

  const related = careers.filter(c =>
    exam.careers?.includes(c.name)
  );

  if (!careerList) return;
  careerList.innerHTML = "";

  if (related.length === 0) {
    careerList.innerHTML = "<p>No related careers found</p>";
    return;
  }

  related.forEach(c => {

    const card = document.createElement("div");
    card.className = "career-card";

    card.innerHTML = `
      <img src="${c.image}" class="career-image" alt="${c.name}" onerror="this.src='https://placehold.co/300x140/e0e7ef/888?text=${encodeURIComponent(c.name)}'">

      <div class="career-info">
        <h3>${c.name}</h3>
        <p>${c.salaryLabel}</p>
      </div>
    `;

    card.onclick = () => {
      localStorage.setItem("selectedCareer", JSON.stringify(c));
      if (window.spaGo) window.spaGo("career.html");
      else window.location.href = "career.html";
    };

    careerList.appendChild(card);
  });

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExamPage);
} else {
  initExamPage();
}
