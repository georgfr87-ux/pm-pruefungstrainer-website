document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  var navLinks = nav ? nav.querySelectorAll("a") : [];

  if (!header || !toggle || !nav) {
    return;
  }

  function closeMenu() {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Navigation öffnen");
  }

  function setSingleActiveLink(targetLink) {
    if (!targetLink) {
      return;
    }

    navLinks.forEach(function (link) {
      link.classList.remove("active");
    });

    targetLink.classList.add("active");
  }

  toggle.addEventListener("click", function () {
    var isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label", isOpen ? "Navigation schließen" : "Navigation öffnen");
  });

  window.addEventListener("scroll", function () {
    if (header.classList.contains("nav-open")) {
      closeMenu();
    }
  }, { passive: true });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setSingleActiveLink(link);
      closeMenu();
    });
  });
});
