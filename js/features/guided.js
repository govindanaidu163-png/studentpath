import { CAREER_TREE } from "../data/guidedPathData.js";

/* ================= STATE ================= */

const state = {
  path: [], // [{id,label,icon,color,summary,optionIndex,optionCount,next,details}]
  current: CAREER_TREE,
  history: [],
  leafReached: false,
  currentRoadmap: null,
  currentLeaf: null,
};

let selectTimer = null;

/* ================= ELEMENTS ================= */

const canvas = document.getElementById("bg-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const qLabel = document.getElementById("question-label");
const qText = document.getElementById("question-text");
const qSub = document.getElementById("question-sub");
const qWrap = document.getElementById("question-wrap");
const grid = document.getElementById("options-grid");

const depthLabel = document.getElementById("depth-label");
const progressBar = document.getElementById("progress-bar");
const backBtn = document.getElementById("btn-back");
const resetBtn = document.getElementById("btn-reset");
const roadmapBtn = document.getElementById("btn-roadmap");
const dashboardBtn = document.getElementById("btn-dashboard");
const exportBtn = document.getElementById("btn-export");

const drawer = document.getElementById("roadmap-drawer");
const backdrop = document.getElementById("drawer-backdrop");
const drawerClose = document.getElementById("drawer-close");
const drawerContent = document.getElementById("drawer-content");

/* ================= TREE DRAWING ================= */

let treeNodes = [];
let treeEdges = [];
let particles = [];
let time = 0;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(79,195,247,${alpha})`;
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r},${g},${b},${alpha})`;
}

function burstParticles(x, y, color) {
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16;
    particles.push({
      x: x || canvas.width / 2,
      y: y || canvas.height * 0.5,
      vx: Math.cos(angle) * (1 + Math.random() * 2),
      vy: Math.sin(angle) * (1 + Math.random() * 2) - 2,
      r: 1.5 + Math.random() * 2,
      color: color || "#4fc3f7",
      life: 0.8 + Math.random() * 0.4,
    });
  }
}

function buildTreeData() {
  treeNodes = [];
  treeEdges = [];

  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;

  const root = {
    x: cx,
    y: H - 60,
    r: 6,
    alpha: 1,
    glow: true,
    color: "#4fc3f7",
    label: "",
    active: true,
  };

  treeNodes.push(root);

  if (state.path.length === 0) return;

  const levelH = Math.min(80, Math.max(60, (H - 140) / (state.path.length + 1)));
  let prevNode = root;
  let x = cx;
  let y = H - 60;

  state.path.forEach((step, i) => {
    const spread = Math.max(22, 42 - i * 3);
    const shiftFromOption = (step.optionIndex - ((step.optionCount || 1) - 1) / 2) * spread;
    const zig = i % 2 === 0 ? -1 : 1;
    const offset = (30 + i * 8) * zig + shiftFromOption;

    x = Math.max(70, Math.min(W - 70, x + offset));
    y = H - 60 - (i + 1) * levelH;

    const node = {
      x,
      y,
      r: Math.max(3.5, 6 - i * 0.35),
      alpha: 1,
      glow: true,
      color: step.color || "#4fc3f7",
      label: step.label,
      active: i === state.path.length - 1,
    };

    treeNodes.push(node);
    treeEdges.push({
      x1: prevNode.x,
      y1: prevNode.y,
      x2: x,
      y2: y,
      color: step.color || "#4fc3f7",
      alpha: 0.72 - i * 0.05,
    });

    prevNode = node;
  });

  // Ghost branches from current node (future options)
  if (!state.leafReached && state.current && state.current.options && state.current.options.length) {
    const last = treeNodes[treeNodes.length - 1];
    const opts = state.current.options;
    opts.forEach((opt, idx) => {
      const spread = 44;
      const gx = Math.max(60, Math.min(W - 60, last.x + (idx - (opts.length - 1) / 2) * spread));
      const gy = Math.max(60, last.y - 72);

      treeEdges.push({
        x1: last.x,
        y1: last.y,
        x2: gx,
        y2: gy,
        color: opt.color || "#4fc3f7",
        alpha: 0.11,
        dash: true,
      });

      treeNodes.push({
        x: gx,
        y: gy,
        r: 2,
        alpha: 0.15,
        glow: false,
        color: opt.color || "#4fc3f7",
        label: "",
        active: false,
      });
    });
  }
}

function drawTree() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  time += 0.012;

  const grad = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height * 0.6,
    0,
    canvas.width / 2,
    canvas.height * 0.6,
    canvas.width * 0.7
  );
  grad.addColorStop(0, "rgba(10,22,40,0.4)");
  grad.addColorStop(1, "rgba(5,8,16,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Edges
  treeEdges.forEach((e) => {
    ctx.beginPath();
    ctx.moveTo(e.x1, e.y1);

    const cpx = (e.x1 + e.x2) / 2 + Math.sin(time) * 3;
    const cpy = (e.y1 + e.y2) / 2;

    ctx.quadraticCurveTo(cpx, cpy, e.x2, e.y2);

    if (e.dash) {
      ctx.setLineDash([4, 8]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = hexToRgba(e.color || "#4fc3f7", e.alpha || 0.5);
    ctx.lineWidth = 1.5;

    if (!e.dash) {
      ctx.shadowColor = e.color || "#4fc3f7";
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
  });

  // Nodes
  treeNodes.forEach((n) => {
    const pulse = n.active ? Math.sin(time * 2) * 2 : 0;
    const r = n.r + pulse;

    if (n.glow) {
      const ringGrad = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r * 5);
      ringGrad.addColorStop(0, hexToRgba(n.color || "#4fc3f7", 0.15));
      ringGrad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2);
      ctx.fillStyle = ringGrad;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(n.color || "#4fc3f7", n.alpha);
    if (n.glow) {
      ctx.shadowColor = n.color || "#4fc3f7";
      ctx.shadowBlur = n.active ? 20 : 10;
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    if (n.label && n.alpha > 0.4) {
      ctx.font = "10px Syne, sans-serif";
      ctx.fillStyle = hexToRgba("#e8eef8", n.alpha * 0.7);
      ctx.textAlign = "center";
      ctx.fillText(n.label, n.x, n.y - r - 6);
    }
  });

  // Particles
  particles = particles.filter((p) => p.life > 0);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.02;
    p.vy -= 0.05;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(p.color, p.life);
    ctx.fill();
  });

  requestAnimationFrame(drawTree);
}

/* ================= QUESTION + OPTION RENDER ================= */

function createOptionCard(opt) {
  const card = document.createElement("div");
  card.className = "option-card";
  card.style.setProperty("--card-glow", hexToRgba(opt.color || "#4fc3f7", 0.1));
  card.style.setProperty("--card-accent", opt.color || "#4fc3f7");

  const isLeaf = opt.leaf || false;

  card.innerHTML = `
    ${isLeaf ? '<span class="leaf-badge">Career End</span>' : ''}
    <span class="card-icon" style="color:${opt.color || "#4fc3f7"}">${opt.icon || "◈"}</span>
    <div class="card-label">${opt.label}</div>
    <div class="card-desc">${opt.desc || ""}</div>
    <span class="card-arrow">→</span>
    <div class="card-glow-line"></div>
  `;

  card.addEventListener("click", () => selectOption(opt, card));
  return card;
}

function renderQuestion(node, isInitial = false) {
  const doRender = () => {
    qLabel.textContent = `Step ${state.path.length + 1}`;
    qText.textContent = node.question;
    qSub.textContent = node.subtitle || "";

    if (!grid) return;
    grid.innerHTML = "";
    (node.options || []).forEach((opt) => {
      grid.appendChild(createOptionCard(opt));
    });

    qWrap.style.animation = "none";
    requestAnimationFrame(() => {
      qWrap.style.animation = "fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards";
    });

    updateBottomBar();
    buildTreeData();
    updateRoadmapDrawer();
  };

  if (isInitial) {
    doRender();
  } else {
    qWrap.style.animation = "fadeSlideDown 0.3s cubic-bezier(0.4,0,0.2,1) forwards";
    grid.querySelectorAll(".option-card").forEach((c, i) => {
      c.classList.add("exiting");
      c.style.animation = `cardOut 0.3s cubic-bezier(0.4,0,0.2,1) ${i * 0.04}s forwards`;
    });
    setTimeout(doRender, 320);
  }
}

function showLeafEnd(opt) {
  buildTreeData();
  updateBottomBar();
  updateRoadmapDrawer();

  qWrap.style.animation = "fadeSlideDown 0.3s ease forwards";
  setTimeout(() => {
    qLabel.textContent = "Career Destination";
    qText.textContent = opt.label;
    qSub.textContent = opt.desc || "You've reached your career destination";

    grid.innerHTML = `
      <div style="text-align:center; padding: 20px 0; width: 100%;">
        <div style="font-size: 36px; margin-bottom: 12px; color:${opt.color || "#4fc3f7"}">◈</div>
        <div style="font-family:var(--font-display); font-size: 13px; color:var(--text2); max-width: 320px; line-height:1.6; margin: 0 auto;">
          Your career roadmap has been built. Open <strong style="color:${opt.color || "#4fc3f7"}">View Roadmap</strong> to explore skills, timeline, salary, and next steps.
        </div>
      </div>
    `;

    qWrap.style.animation = "fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards";
  }, 320);
}

function selectOption(opt, cardEl) {
  if (state.leafReached) return;

  cardEl.classList.add("selected-flash");

  const rect = cardEl.getBoundingClientRect();
  burstParticles(rect.left + cardEl.offsetWidth / 2, rect.top + cardEl.offsetHeight / 2, opt.color || "#4fc3f7");

  state.history.push(state.current);
  state.path.push({
    id: opt.id,
    label: opt.label,
    icon: opt.icon,
    color: opt.color,
    summary: opt.desc || "",
    optionIndex: state.current?.options ? state.current.options.indexOf(opt) : 0,
    optionCount: state.current?.options?.length || 1,
    next: opt.children || null,
    details: opt.roadmap || null,
  });

  setTimeout(() => {
    if (opt.leaf || !opt.children) {
      state.leafReached = true;
      state.currentLeaf = opt;
      state.currentRoadmap = opt.roadmap || null;
      state.current = null;
      showLeafEnd(opt);
    } else {
      state.current = opt.children;
      state.currentRoadmap = null;
      state.currentLeaf = null;
      state.leafReached = false;
      renderQuestion(opt.children);
    }

    updateRoadmapDrawer();
  }, 420);
}

/* ================= ROADMAP DRAWER ================= */

function openRoadmap() {
  drawer.classList.add("open");
  backdrop.classList.add("open");
}

function closeRoadmap() {
  drawer.classList.remove("open");
  backdrop.classList.remove("open");
}

function updateRoadmapDrawer() {
  const content = drawerContent;
  if (!content) return;

  const rm = state.currentRoadmap;

  let pathHTML = `<div class="drawer-section"><div class="drawer-section-label">Your Path</div><div class="path-trail">`;

  if (state.path.length === 0) {
    pathHTML += `<div style="font-size:12px;color:var(--text3)">Start making choices to build your roadmap.</div>`;
  } else {
    const labels = ["Stage", "Level", "Stream", "Domain", "Career", "Specialization"];

    state.path.forEach((p, i) => {
      const isCurrent = i === state.path.length - 1;
      pathHTML += `
        <div class="path-node ${isCurrent ? "current" : ""}">
          <div class="path-dot" style="${isCurrent ? `background:${p.color};border-color:${p.color};box-shadow:0 0 16px ${p.color}50` : `border-color:${p.color}`}">${p.icon || "◈"}</div>
          <div class="path-content">
            <div class="path-stage">${labels[i] || `Step ${i + 1}`}</div>
            <div class="path-value" style="${isCurrent ? `color:${p.color}` : ""}">${p.label}</div>
          </div>
        </div>
      `;
    });
  }

  pathHTML += `</div></div>`;

  let rmHTML = "";

  if (rm) {
    const diffMap = {
      "Low": 20,
      "Low-Medium": 35,
      "Medium": 50,
      "Medium-High": 65,
      "High": 78,
      "Very High": 90,
      "Extreme": 100,
    };
    const diffPct = diffMap[rm.difficulty] || 50;

    rmHTML = `
      <div class="drawer-section" style="margin-top:24px">
        <div class="drawer-section-label">Career Overview</div>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-card-label">⏱ Timeline</div>
            <div class="info-card-value highlight">${rm.time || "—"}</div>
          </div>

          <div class="info-card">
            <div class="info-card-label">💰 Salary Range</div>
            <div class="info-card-value highlight">${rm.salary || "—"}</div>
          </div>

          <div class="info-card" style="grid-column:span 2">
            <div class="info-card-label">🎯 Personality Fit</div>
            <div class="info-card-value">${rm.personality || "—"}</div>
          </div>

          <div class="info-card" style="grid-column:span 2">
            <div class="info-card-label">📊 Difficulty Level</div>
            <div class="info-card-value">${rm.difficulty || "—"}</div>
            <div class="difficulty-bar"><div class="difficulty-fill" style="width:${diffPct}%"></div></div>
          </div>
        </div>
      </div>

      <div class="drawer-section" style="margin-top:24px">
        <div class="drawer-section-label">Key Skills</div>
        <div class="skills-list">
          ${(rm.skills || []).map((s) => `<span class="skill-pill">${s}</span>`).join("")}
        </div>
      </div>

      <div class="drawer-section" style="margin-top:24px">
        <div class="drawer-section-label">Backup Options</div>
        <div class="backup-list">
          ${(rm.backup || []).map((b) => `<div class="backup-item">${b}</div>`).join("")}
        </div>
      </div>
    `;
  } else if (state.path.length > 0) {
    rmHTML = `
      <div class="drawer-section" style="margin-top:24px">
        <div style="font-size:12px;color:var(--text3);line-height:1.6">
          Keep making selections to unlock your full career roadmap with skills, salary, and timeline data.
        </div>
      </div>
    `;
  }

  content.innerHTML = pathHTML + rmHTML;
}

/* ================= BOTTOM BAR ================= */

function updateBottomBar() {
  backBtn.disabled = state.history.length === 0;

  const depthNames = [
    "Choose Stage",
    "Select Level",
    "Pick Stream",
    "Pick Domain",
    "Choose Career",
    "Specialization",
    "Destination",
  ];

  depthLabel.textContent = depthNames[Math.min(state.path.length, depthNames.length - 1)];

  const pct = Math.min((state.path.length / 6) * 100, 100);
  progressBar.style.width = `${pct}%`;
}

/* ================= ACTIONS ================= */

function goBack() {
  if (state.history.length === 0) return;

  state.path.pop();
  state.current = state.history.pop();
  state.leafReached = false;
  state.currentLeaf = null;
  state.currentRoadmap = null;

  renderQuestion(state.current);
  updateRoadmapDrawer();
}

function resetAll() {
  state.path = [];
  state.history = [];
  state.current = CAREER_TREE;
  state.leafReached = false;
  state.currentLeaf = null;
  state.currentRoadmap = null;

  renderQuestion(CAREER_TREE, true);
  updateRoadmapDrawer();
  closeRoadmap();
}

function exportRoadmap() {
  if (state.path.length === 0) {
    showToast("Start your journey first!");
    return;
  }

  const lines = ["STUDENTPATH — CAREER ROADMAP", "═".repeat(40), ""];
  const labels = ["Stage", "Level", "Stream", "Domain", "Career", "Specialization"];

  state.path.forEach((p, i) => {
    lines.push(`${labels[i] || `Step ${i + 1}`}: ${p.label}`);
  });

  if (state.currentRoadmap) {
    const rm = state.currentRoadmap;
    lines.push("", "─".repeat(40));
    lines.push(`Timeline: ${rm.time}`);
    lines.push(`Salary: ${rm.salary}`);
    lines.push(`Difficulty: ${rm.difficulty}`);
    lines.push(`Personality Fit: ${rm.personality}`);
    lines.push(`Skills: ${(rm.skills || []).join(", ")}`);
    lines.push(`Backup Options: ${(rm.backup || []).join(", ")}`);
  }

  lines.push("", "─".repeat(40));
  lines.push("Generated by StudentPath");

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "studentpath-roadmap.txt";
  a.click();

  showToast("Roadmap exported!");
}

function showToast(msg) {
  const t = document.createElement("div");
  t.style.cssText = `
    position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
    background:rgba(79,195,247,0.15); border:1px solid rgba(79,195,247,0.3);
    color:#e8eef8; font-size:12px; font-family:var(--font-body); padding:10px 20px;
    border-radius:100px; z-index:300; backdrop-filter:blur(10px);
    animation: fadeIn 0.3s ease forwards;
  `;
  t.textContent = msg;
  document.body.appendChild(t);

  setTimeout(() => {
    t.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => t.remove(), 300);
  }, 2000);
}

/* ================= HELPERS ================= */

function wireButtons() {
backBtn?.addEventListener("click", goBack);
resetBtn?.addEventListener("click", resetAll);
roadmapBtn?.addEventListener("click", () => {
  drawer.classList.contains("open") ? closeRoadmap() : openRoadmap();
});
dashboardBtn?.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});
exportBtn?.addEventListener("click", exportRoadmap);

drawerClose?.addEventListener("click", closeRoadmap);
backdrop?.addEventListener("click", closeRoadmap);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeRoadmap();
    if (e.key === "Backspace" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
      if (!drawer.classList.contains("open")) goBack();
    }
  });
}

/* ================= INIT ================= */

function initGuidedPage() {
  resizeCanvas();
  buildTreeData();
  drawTree();

  renderQuestion(CAREER_TREE, true);
  updateRoadmapDrawer();
  updateBottomBar();
  wireButtons();

  window.addEventListener("resize", () => {
    resizeCanvas();
    buildTreeData();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGuidedPage);
} else {
  initGuidedPage();
}


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
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", resetPage);
} else {
  resetPage();
}

function markGuidedLoaded() {
  document.body.classList.add("loaded");
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", markGuidedLoaded);
} else {
  markGuidedLoaded();
}

// smooth navigation
document.addEventListener("click", function (e) {
  const link = e.target.closest("a");

  if (link && link.href.includes(window.location.origin)) {
    e.preventDefault();

    document.body.classList.remove("loaded");

    setTimeout(() => {
      window.location.href = link.href;
    }, 300);
  }
});
