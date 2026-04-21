async function loadNavbar() {
  const res = await fetch("navbar.html");
  const html = await res.text();

  document.getElementById("navbarContainer").innerHTML = html;

  initNavbar();
}

function initNavbar() {
  const links = document.querySelectorAll(".nav-center a");
  const indicator = document.querySelector(".nav-indicator");

  function moveIndicator(el) {
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();

    indicator.style.width = rect.width + "px";
    indicator.style.left = (rect.left - parentRect.left) + "px";
  }

  // SET ACTIVE BASED ON URL
  links.forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add("active");
      moveIndicator(link);
    }

    // 🔥 HOVER ANIMATION
    link.addEventListener("mouseenter", () => {
      moveIndicator(link);
    });

    link.addEventListener("mouseleave", () => {
      const active = document.querySelector(".nav-center a.active");
      if (active) moveIndicator(active);
    });
  });
}

loadNavbar();