/* ============================================================
   StudentPath — Career Page JS
   Preserves all original logic + adds premium interactions
   ============================================================ */

// ---- REVIEWS DATA (static, career-agnostic) ----
const REVIEWS = [
  {
    text: "This platform completely changed how I thought about my career. The roadmap was eye-opening — clear, actionable, and realistic.",
    name: "Aryan Kapoor",
    role: "Now a Software Engineer @ TCS",
    initials: "AK",
    stars: 5
  },
  {
    text: "I was clueless about what to do after 12th. StudentPath gave me the exact steps I needed. No fluff, just a real plan.",
    name: "Priya Sharma",
    role: "Now a Data Analyst @ Infosys",
    initials: "PS",
    stars: 5
  },
  {
    text: "The salary insights and demand stats helped me convince my parents this career was worth pursuing. Absolutely recommend.",
    name: "Rohan Verma",
    role: "Cybersecurity Intern @ Wipro",
    initials: "RV",
    stars: 5
  },
  {
    text: "What I love is how the skills section is honest. It doesn't promise shortcuts — just the real work required. Respect.",
    name: "Sneha Nair",
    role: "Pre-med Student, AIIMS Aspirant",
    initials: "SN",
    stars: 5
  },
  {
    text: "I saved three careers and compared them. The depth of information here beats everything I found on Google.",
    name: "Kabir Mehta",
    role: "Commerce Stream, Planning MBA",
    initials: "KM",
    stars: 5
  }
];

// ============================================================
// MAIN INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

  // ---- ORIGINAL LOGIC (PRESERVED) ----
  const data = JSON.parse(localStorage.getItem("selectedCareer"));

  const titleEl    = document.getElementById("careerTitle");
  const descEl     = document.getElementById("careerDesc");
  const salaryEl   = document.getElementById("careerSalary");
  const skillsList = document.getElementById("skillsList");
  const roadmapList= document.getElementById("roadmapList");

  if (!data) {
    titleEl.textContent = "No career selected";
    descEl.textContent  = "Go back and choose a career.";
    salaryEl.textContent = "--";
    return;
  }

  // Populate core fields
  titleEl.textContent  = data.name  || data.title || "Career";
  descEl.textContent   = data.description || data.desc || "An exciting career path.";
  salaryEl.textContent = data.salaryLabel || (data.salary ? `₹${data.salary}L+` : "--");

  // Badge / meta
  const streamEl = document.getElementById("careerStream");
  if (streamEl && data.stream) {
    streamEl.textContent = data.stream.toUpperCase() + " STREAM";
  }

  const futureEl = document.getElementById("careerFuture");
  const futureQuoteEl = document.getElementById("careerFutureQuote");
  const future = data.future || "High demand in the coming years.";
  if (futureEl)      futureEl.textContent = future;
  if (futureQuoteEl) futureQuoteEl.textContent = future;

  // Story body — use desc if no long description
  const storyBodyEl = document.getElementById("storyBody");
  if (storyBodyEl) {
    storyBodyEl.textContent = data.description || data.desc ||
      "Every professional in this field brings something unique. The path isn't always linear, but those who commit to continuous learning consistently rise to the top.";
  }

  // 3D Card
  const c3dTitle  = document.getElementById("c3dTitle");
  const c3dStream = document.getElementById("c3dStream");
  const c3dDiff   = document.getElementById("c3dDiff");
  const c3dGrowth = document.getElementById("c3dGrowth");
  const c3dSalary = document.getElementById("c3dSalary");
  if (c3dTitle)  c3dTitle.textContent  = data.name  || data.title || "Career";
  if (c3dStream) c3dStream.textContent = data.stream ? data.stream.toUpperCase() : "STREAM";
  if (c3dDiff)   c3dDiff.textContent   = data.difficulty ? `${data.difficulty}/5` : "--";
  if (c3dGrowth) c3dGrowth.textContent = data.growth ? `${data.growth}/5` : "--";
  if (c3dSalary) c3dSalary.textContent = data.salaryLabel || "--";

  // Stat counters data
  const successTarget = data.successRate || 60;
  const growthTarget  = data.growth       || 4;
  document.getElementById("statSuccess").dataset.target = successTarget;
  document.getElementById("statGrowth").dataset.target  = growthTarget;

  // Salary bar (normalize against 100L max)
  const salaryMax = 100;
  const salaryRaw = data.salary || 0;
  const salaryPct = Math.min((salaryRaw / salaryMax) * 100, 100);
  const salaryBar = document.getElementById("salaryBar");
  if (salaryBar) {
    // Bar triggers on scroll via observer below
    salaryBar.dataset.width = salaryPct;
  }
  const successBar = document.getElementById("successBar");
  if (successBar) successBar.dataset.width = successTarget;
  const growthBar = document.getElementById("growthBar");
  if (growthBar) growthBar.dataset.width = (growthTarget / 5) * 100;

  // Skills
  skillsList.innerHTML = "";
  const skills = data.skills || [];
  skills.forEach((skill, i) => {
    const pill = document.createElement("div");
    pill.className = "skill-pill";
    pill.textContent = skill;
    pill.style.transitionDelay = `${i * 80}ms`;
    skillsList.appendChild(pill);
  });

  // Roadmap
  roadmapList.innerHTML = "";
  const roadmap = data.roadmap || [];
  roadmap.forEach((step, i) => {
    const div = document.createElement("div");
    div.className = "roadmap-step";
    div.innerHTML = `
      <div class="roadmap-step-num">Step ${i + 1}</div>
      <div class="roadmap-step-text">${step}</div>
    `;
    div.style.transitionDelay = `${i * 120}ms`;
    roadmapList.appendChild(div);
  });

  // ---- ENHANCEMENTS ----
  initCursor();
  initCanvas();
  initNavScroll();
  initScrollReveal();
  initCounters();
  init3DCard();
  initReviews();
  initParallax();

}); // end DOMContentLoaded


// ============================================================
// CUSTOM CURSOR
// ============================================================
function initCursor() {
  const cursor    = document.getElementById("cursor");
  const cursorDot = document.getElementById("cursorDot");
  if (!cursor || !cursorDot) return;

  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener("mousemove", e => {
    mx = e.clientX;
    my = e.clientY;
    cursorDot.style.left = mx + "px";
    cursorDot.style.top  = my + "px";
  });

  function animCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + "px";
    cursor.style.top  = cy + "px";
    requestAnimationFrame(animCursor);
  }
  animCursor();

  // Scale on interactive elements
  document.querySelectorAll("button, a, .skill-pill, .stat-card, .review-card, .rnav-dot").forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.style.transform = "translate(-50%,-50%) scale(2)";
      cursor.style.background = "rgba(79,142,255,0.08)";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.transform = "translate(-50%,-50%) scale(1)";
      cursor.style.background = "transparent";
    });
  });
}


// ============================================================
// HERO CANVAS — floating particles
// ============================================================
function initCanvas() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx    = canvas.getContext("2d");

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Particles
  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    o: Math.random() * 0.5 + 0.1
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(111,163,255,${p.o})`;
      ctx.fill();
    });

    // Connecting lines for nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79,142,255,${0.08 * (1 - d/100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}


// ============================================================
// NAV SCROLL EFFECT
// ============================================================
function initNavScroll() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });
}


// ============================================================
// SCROLL REVEAL
// ============================================================
function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    ".reveal-up, .reveal-left, .reveal-right, .skill-pill, .roadmap-step, .stat-card"
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || el.style.transitionDelay || "0ms";
        // respect existing delay set inline
        el.classList.add("visible");
        // Trigger stat bars
        if (el.classList.contains("stat-card")) {
          const bar = el.querySelector(".stat-bar-fill");
          if (bar && bar.dataset.width) {
            setTimeout(() => {
              bar.style.width = bar.dataset.width + "%";
            }, 200);
          }
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  revealEls.forEach(el => observer.observe(el));
}


// ============================================================
// ANIMATED COUNTERS
// ============================================================
function initCounters() {
  const counters = document.querySelectorAll(".counter, [data-target]");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      const duration = 1600;
      const start    = performance.now();

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }

      requestAnimationFrame(tick);

      // Also animate bars in stat section
      const card = el.closest(".stat-card");
      if (card) {
        const bar = card.querySelector(".stat-bar-fill");
        if (bar && bar.dataset.width) {
          setTimeout(() => { bar.style.width = bar.dataset.width + "%"; }, 200);
        }
      }

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}


// ============================================================
// 3D CARD TILT
// ============================================================
function init3DCard() {
  const wrap  = document.getElementById("card3d");
  const inner = wrap && wrap.querySelector(".card-3d-inner");
  if (!wrap || !inner) return;

  const MAX_TILT = 18;

  wrap.addEventListener("mousemove", e => {
    const rect   = wrap.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    const rotY   =  dx * MAX_TILT;
    const rotX   = -dy * MAX_TILT;
    inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
  });

  wrap.addEventListener("mouseleave", () => {
    inner.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    inner.style.transition = "transform 0.6s cubic-bezier(0.22,1,0.36,1)";
    setTimeout(() => { inner.style.transition = ""; }, 700);
  });
}


// ============================================================
// REVIEWS SLIDER
// ============================================================
function initReviews() {
  const track     = document.getElementById("reviewsTrack");
  const dotsWrap  = document.getElementById("rnavDots");
  const prevBtn   = document.getElementById("rnavPrev");
  const nextBtn   = document.getElementById("rnavNext");
  if (!track) return;

  let current = 0;

  // Build cards
  REVIEWS.forEach((r, i) => {
    const stars = Array(r.stars).fill('<span class="review-star">★</span>').join('');
    const card  = document.createElement("div");
    card.className = "review-card" + (i === 0 ? " active" : "");
    card.innerHTML = `
      <div class="review-stars">${stars}</div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">
        <div class="review-avatar">${r.initials}</div>
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-role">${r.role}</div>
        </div>
      </div>
    `;
    track.appendChild(card);

    // Dot
    const dot = document.createElement("div");
    dot.className = "rnav-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    const cards = track.querySelectorAll(".review-card");
    const dots  = dotsWrap.querySelectorAll(".rnav-dot");
    cards[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (idx + REVIEWS.length) % REVIEWS.length;
    cards[current].classList.add("active");
    dots[current].classList.add("active");

    // Slide
    const cardW = cards[0].offsetWidth + 20; // gap
    track.style.transform = `translateX(-${current * cardW}px)`;
  }

  prevBtn && prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener("click", () => goTo(current + 1));

  // Auto-advance
  let autoTimer = setInterval(() => goTo(current + 1), 5000);
  track.addEventListener("mouseenter", () => clearInterval(autoTimer));
  track.addEventListener("mouseleave", () => {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  });
}


// ============================================================
// PARALLAX
// ============================================================
function initParallax() {
  const hero   = document.getElementById("hero");
  const glows  = hero && hero.querySelectorAll(".hero-glow");
  const content = document.getElementById("heroContent");
  if (!hero || !glows) return;

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      glows.forEach((g, i) => {
        const speed = 0.08 + i * 0.04;
        g.style.transform = `translateY(${y * speed}px)`;
      });
      if (content) {
        content.style.transform = `translateY(${y * 0.06}px)`;
        content.style.opacity   = Math.max(0, 1 - y / 600);
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}


// ============================================================
// BUTTON HANDLERS (ORIGINAL — PRESERVED)
// ============================================================
window.goBack = function () {
  window.history.back();
};

window.saveCareer = function () {
  const btn = document.querySelector(".btn-save");
  if (btn) {
    btn.querySelector(".btn-icon").textContent = "♥";
    btn.style.color       = "#ff6b6b";
    btn.style.borderColor = "#ff6b6b";
    btn.style.background  = "rgba(255,107,107,0.1)";
  }
  // Could persist to localStorage here
  alert("✅ Career Saved!");
};

window.startLearning = function () {
  alert(" Start Learning...");
};