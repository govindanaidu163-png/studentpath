/**
 * Smooth Page Transitions
 * Works by intercepting internal link clicks and animating a
 * full-screen overlay before navigating.
 */

(function () {

  // ── Create overlay DOM ──────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.id = "page-transition-overlay";
  overlay.innerHTML = `
    <div class="half half-left"></div>
    <div class="half half-right"></div>
  `;
  document.body.appendChild(overlay);

  // ── Page-in animation (runs on every page load) ─────────────────
  function pageIn() {
    // Start in "enter" (fully covering) state, then transition to "leave"
    overlay.classList.add("enter");
    overlay.style.pointerEvents = "all";

    // Small delay so browser paints the "enter" state first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.remove("enter");
        overlay.classList.add("leave");
        overlay.style.pointerEvents = "none";
      });
    });
  }

  // ── Page-out animation (runs before navigating away) ────────────
  function pageOut(href) {
    overlay.classList.remove("leave");
    overlay.classList.add("enter");
    overlay.style.pointerEvents = "all";

    document.body.classList.add("fading");

    // Wait for animation to complete, then navigate
    setTimeout(() => {
      window.location.href = href;
    }, 400);
  }

  // ── Intercept internal link clicks ──────────────────────────────
  document.addEventListener("click", function (e) {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");

    // Skip: external, anchors, mailto, tel, javascript
    if (
      !href ||
      href.startsWith("http") ||
      href.startsWith("//") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) return;

    // Skip: new tab
    if (link.target === "_blank") return;

    // Skip: same page
    const currentPage = window.location.pathname.split("/").pop();
    const targetPage = href.split("/").pop().split("?")[0];
    if (currentPage === targetPage) return;

    e.preventDefault();
    pageOut(href);
  });

  // ── Run page-in on load ─────────────────────────────────────────
  window.addEventListener("DOMContentLoaded", () => {
    pageIn();
  });

})();
