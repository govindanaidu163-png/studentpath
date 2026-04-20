// ================= SAFE LOAD =================
document.addEventListener("DOMContentLoaded", () => {

  const result = localStorage.getItem("careerResult");

  const careerData = {
    tech: {
      title: "🚀 Software Engineer",
      desc: "You enjoy logic, problem solving, and building digital systems."
    },
    medical: {
      title: "🩺 Healthcare Professional",
      desc: "You care deeply about people and want to help others."
    },
    creative: {
      title: "🎨 Creative Designer",
      desc: "You love creativity and visual storytelling."
    },
    business: {
      title: "📈 Entrepreneur / Manager",
      desc: "You are driven by leadership and decision making."
    }
  };

  const titleEl = document.getElementById("careerTitle");
  const descEl = document.getElementById("careerDesc");

  if (titleEl && descEl) {
    if (result && careerData[result]) {
      titleEl.innerText = careerData[result].title;
      descEl.innerText = careerData[result].desc;
    } else {
      titleEl.innerText = "No Result Found";
      descEl.innerText = "Please take the quiz first.";
    }
  }

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

});

// GLOBAL BUTTON FUNCTIONS
window.goDashboard = function () {
  window.location.href = "/index.html";
};

window.retakeQuiz = function () {
  window.location.href = "/quiz.html";
};

window.goSignup = function () {
  localStorage.setItem("authView", "signup");
  window.location.href = "/index.html";
};