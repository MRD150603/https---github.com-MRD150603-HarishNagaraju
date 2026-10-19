/* Harish Nagaraju — site interactions (no dependencies) */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  // Preloader
  var preloader = document.querySelector(".preloader");
  function hidePreloader() {
    if (preloader) preloader.classList.add("is-hidden");
  }
  window.addEventListener("load", hidePreloader);
  setTimeout(hidePreloader, 2500);

  // Sticky header shadow + scroll-to-top visibility
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 60);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Drawers (mobile nav + contact panel)
  var lastFocus = null;
  function openDrawer(drawer) {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    var closeBtn = drawer.querySelector(".drawer-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeDrawer(drawer) {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll("[data-drawer-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var drawer = document.getElementById(btn.getAttribute("data-drawer-open"));
      if (drawer) openDrawer(drawer);
    });
  });

  document.querySelectorAll(".drawer").forEach(function (drawer) {
    drawer.querySelectorAll(".drawer-close, .drawer-backdrop").forEach(function (el) {
      el.addEventListener("click", function () { closeDrawer(drawer); });
    });
    drawer.querySelectorAll(".drawer-nav a").forEach(function (link) {
      link.addEventListener("click", function () { closeDrawer(drawer); });
    });
  });

  // Hero slideshow
  var slides = document.querySelectorAll(".hero-slides img");
  var dotsWrap = document.querySelector(".hero-dots");
  if (slides.length > 1 && dotsWrap) {
    var current = 0;
    var timer;
    var dots = [];
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Slide " + (i + 1));
      b.addEventListener("click", function () { show(i); restart(); });
      dotsWrap.appendChild(b);
      dots.push(b);
    });
    function show(i) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { show(current + 1); }, 5000);
    }
    dots[0].classList.add("is-active");
    restart();
  } else if (dotsWrap) {
    dotsWrap.remove();
  }

  // Exclusive accordions (fallback for browsers without <details name>)
  document.querySelectorAll(".accordion").forEach(function (acc) {
    var items = acc.querySelectorAll("details");
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  });

  // Gallery lightbox
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var lb = document.querySelector(".lightbox");
  if (galleryItems.length && lb) {
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector("figcaption");
    var idx = 0;
    var lbLastFocus = null;

    function render() {
      var item = galleryItems[idx];
      var img = item.querySelector("img");
      lbImg.src = item.getAttribute("href");
      lbImg.alt = img ? img.alt : "";
      lbCap.textContent = (img ? img.alt : "") + "  ·  " + (idx + 1) + " / " + galleryItems.length;
    }
    function openLb(i) {
      idx = i;
      lbLastFocus = document.activeElement;
      render();
      lb.classList.add("is-open");
      document.body.classList.add("no-scroll");
      lb.querySelector(".lb-close").focus();
    }
    function closeLb() {
      lb.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      if (lbLastFocus) lbLastFocus.focus();
    }
    function step(d) {
      idx = (idx + d + galleryItems.length) % galleryItems.length;
      render();
    }

    galleryItems.forEach(function (item, i) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        openLb(i);
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", closeLb);
    lb.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLb();
    });

    // Swipe on touch devices
    var startX = null;
    lb.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      startX = null;
    });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  // Escape closes open drawers
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".drawer.is-open").forEach(closeDrawer);
  });

  // Active nav link while scrolling
  var navLinks = document.querySelectorAll(".main-nav a[href^='#']");
  if ("IntersectionObserver" in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove("is-active"); });
        var link = map[entry.target.id];
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("section[id], header[id]").forEach(function (s) { spy.observe(s); });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
