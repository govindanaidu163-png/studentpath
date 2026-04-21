// PAGE ENTER
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-loaded");
});

// PAGE EXIT (INTERCEPT LINKS)
document.addEventListener("click", function (e) {
  const link = e.target.closest("a");

  if (!link) return;

  // ignore external links
  if (link.target === "_blank") return;

  // same domain only
  if (!link.href.includes(window.location.origin)) return;

  e.preventDefault();

  document.body.classList.remove("page-loaded");
  document.body.classList.add("page-exit");

  setTimeout(() => {
    window.location.href = link.href;
  }, 300);
});