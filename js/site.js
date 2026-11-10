(function () {
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.getElementById("site-menu");
  var mq = window.matchMedia("(max-width: 720px)");

  function setOpen(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    panel.classList.toggle("is-open", open);
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!event.target.closest(".site-header")) setOpen(false);
    });
    var onViewport = function () { setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onViewport);
    else if (mq.addListener) mq.addListener(onViewport);
  }

  var links = Array.prototype.slice.call(document.querySelectorAll("#site-menu a[href*='#']"));
  var pairs = links.map(function (link) {
    var href = link.getAttribute("href") || "";
    var id = href.split("#")[1];
    var section = id && document.getElementById(id);
    return section ? { link: link, section: section } : null;
  }).filter(Boolean);

  if (pairs.length) {
    var updateCurrent = function () {
      var header = document.querySelector(".site-header");
      var marker = window.scrollY + (header ? header.offsetHeight : 64) + 32;
      var active = null;
      pairs.forEach(function (pair) {
        var top = pair.section.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) active = pair;
      });
      pairs.forEach(function (pair) {
        if (pair === active) pair.link.setAttribute("aria-current", "location");
        else pair.link.removeAttribute("aria-current");
      });
    };
    updateCurrent();
    window.addEventListener("scroll", updateCurrent, { passive: true });
    window.addEventListener("resize", updateCurrent);
  }

  var buttons = Array.prototype.slice.call(document.querySelectorAll(".shop-filters [data-filter]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card[data-pet]"));

  function applyFilter(name) {
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-filter") === name ? "true" : "false");
    });
    cards.forEach(function (card) {
      var pet = card.getAttribute("data-pet");
      var holiday = card.getAttribute("data-holiday") === "true";
      var show = name === "all" || name === pet || (name === "holiday" && holiday);
      card.hidden = !show;
    });
    Array.prototype.forEach.call(document.querySelectorAll("main section.section"), function (section) {
      var sectionCards = section.querySelectorAll(".card[data-pet]");
      if (!sectionCards.length) return;
      var anyVisible = Array.prototype.some.call(sectionCards, function (card) { return !card.hidden; });
      section.hidden = !anyVisible;
    });
  }

  if (buttons.length && cards.length) {
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var name = button.getAttribute("data-filter");
        applyFilter(name);
        if (window.history && window.history.replaceState) {
          var url = new URL(window.location.href);
          if (name === "all") url.searchParams.delete("pet");
          else url.searchParams.set("pet", name);
          window.history.replaceState(null, "", url.pathname + url.search + url.hash);
        }
      });
    });
    var initial = new URLSearchParams(window.location.search).get("pet");
    if (initial === "dog" || initial === "cat" || initial === "holiday") applyFilter(initial);
  }
})();
