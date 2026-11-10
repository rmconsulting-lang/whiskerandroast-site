(function () {
  var root = document.documentElement;
  root.classList.add("js");
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
    setOpen(false);
    root.classList.add("nav-ready");
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
  var picks = document.querySelector(".hero-picks");
  var defaultPicks = [];
  var captionById = {};

  if (picks) {
    Array.prototype.forEach.call(picks.children, function (item) {
      defaultPicks.push(item.cloneNode(true));
      var link = item.querySelector("a[href^='#']");
      var caption = item.querySelector(".hero-caption");
      if (!link || !caption) return;
      captionById[link.getAttribute("href").slice(1)] = caption.cloneNode(true);
    });
  }

  function restoreHero() {
    if (!picks) return;
    picks.innerHTML = "";
    defaultPicks.forEach(function (item) {
      picks.appendChild(item.cloneNode(true));
    });
    picks.hidden = false;
  }

  function plainCaption(title) {
    var name = title
      .replace(/^Funny\s+/, "")
      .replace(/^Retro\s+/, "")
      .replace(/\s+Coffee Mug$/, " mug")
      .replace(/\s+Canvas Tote$/, " tote")
      .replace(/\s+Throw Pillow$/, " pillow")
      .replace(/\s+Mug$/, " mug");
    if (!name) name = title || "Product";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  function ensureCardId(card) {
    if (card.id) return card.id;
    var heading = card.querySelector("h3");
    var slug = (heading ? heading.textContent : "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) slug = "product";
    var id = slug;
    var n = 2;
    while (document.getElementById(id)) {
      id = slug + "-" + n;
      n += 1;
    }
    card.id = id;
    return id;
  }

  function heroItem(card, first) {
    var img = card.querySelector("img");
    var heading = card.querySelector("h3");
    var title = heading ? heading.textContent.replace(/\s+/g, " ").trim() : "Product";
    var id = ensureCardId(card);
    var li = document.createElement("li");
    var link = document.createElement("a");
    var photo = document.createElement("span");
    var image = document.createElement("img");
    var badge = card.querySelector(".sample-badge");
    link.href = "#" + id;
    photo.className = "hero-photo";
    image.alt = "";
    image.src = img.getAttribute("src");
    if (img.getAttribute("width")) image.setAttribute("width", img.getAttribute("width"));
    if (img.getAttribute("height")) image.setAttribute("height", img.getAttribute("height"));
    if (first) image.setAttribute("fetchpriority", "high");
    photo.appendChild(image);
    if (badge) {
      var mark = document.createElement("span");
      mark.className = "sample-badge";
      mark.textContent = badge.textContent.replace(/\s+/g, " ").trim();
      photo.appendChild(mark);
    }
    link.appendChild(photo);
    if (captionById[id]) {
      link.appendChild(captionById[id].cloneNode(true));
    } else {
      var caption = document.createElement("span");
      caption.className = "hero-caption";
      caption.textContent = plainCaption(title);
      link.appendChild(caption);
    }
    li.appendChild(link);
    return li;
  }

  function showPetHero(pet) {
    if (!picks) return;
    var chosen = [];
    cards.forEach(function (card) {
      if (chosen.length >= 3) return;
      if (card.getAttribute("data-pet") !== pet) return;
      if (!card.querySelector("img") || !card.querySelector("h3")) return;
      chosen.push(card);
    });
    if (!chosen.length) {
      picks.hidden = true;
      return;
    }
    var fragment = document.createDocumentFragment();
    chosen.forEach(function (card, index) {
      fragment.appendChild(heroItem(card, index === 0));
    });
    picks.innerHTML = "";
    picks.appendChild(fragment);
    picks.hidden = false;
  }

  function syncHero(name) {
    if (!picks) return;
    try {
      if (name === "dog" || name === "cat") showPetHero(name);
      else restoreHero();
    } catch (error) {
      restoreHero();
    }
  }

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
    syncHero(name);
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
