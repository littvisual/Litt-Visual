/* ============================================================
   LITT — interaction layer
   ============================================================ */
(function () {
  "use strict";
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---------- text animations: split text into word / letter spans ---------- */
  function splitEl(el, chars) {
    var n = 0;
    function walk(node, into) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          c.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { into.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w";
            var wi = document.createElement("span"); wi.className = "wi";
            if (chars) {
              Array.from(part).forEach(function (ch) {
                var s = document.createElement("span");
                s.className = "ch"; s.textContent = ch; s.style.setProperty("--i", n++);
                wi.appendChild(s);
              });
            } else { wi.textContent = part; wi.style.setProperty("--i", n++); }
            w.appendChild(wi); into.appendChild(w);
          });
        } else if (c.nodeType === 1) {
          if (c.tagName === "BR") { into.appendChild(c.cloneNode(false)); return; }
          var shell = c.cloneNode(false); walk(c, shell); into.appendChild(shell);
        }
      });
    }
    var text = el.textContent.replace(/\s+/g, " ").trim();
    var frag = document.createDocumentFragment();
    walk(el, frag);
    el.innerHTML = "";
    if (chars) {                                  // letters are noisy for screen readers
      var sr = document.createElement("span"); sr.className = "sr-only"; sr.textContent = text;
      var vis = document.createElement("span"); vis.setAttribute("aria-hidden", "true"); vis.appendChild(frag);
      el.appendChild(sr); el.appendChild(vis);
    } else el.appendChild(frag);
    el.classList.add("is-split");
    return el.querySelectorAll(".wi");
  }
  document.querySelectorAll(".split-chars").forEach(function (el) { splitEl(el, true); });
  document.querySelectorAll(".split, .split-fade").forEach(function (el) { splitEl(el, false); });
  requestAnimationFrame(function () {
    document.querySelectorAll(".split-fade[data-auto]").forEach(function (el) { el.classList.add("in"); });
  });

  /* ---------- scramble: mono labels decode into place ---------- */
  var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/—·";
  function scramble(el, delay) {
    if (reduceMotion || el.__scr) return;
    el.__scr = true;
    var final = el.textContent, start = null, dur = Math.min(1500, 450 + final.length * 32);
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur), out = "";
      for (var i = 0; i < final.length; i++) {
        var ch = final[i];
        out += (ch === " " || i < p * final.length) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame); else el.textContent = final;
    }
    setTimeout(function () { requestAnimationFrame(frame); }, delay || 0);
  }
  document.querySelectorAll(".scramble[data-auto]").forEach(function (el) { scramble(el, 250); });

  /* ---------- scrub: words light up with scroll position ---------- */
  var scrubs = Array.prototype.slice.call(document.querySelectorAll(".scrub")).map(function (el) {
    return { el: el, ws: splitEl(el, false) };
  });
  if (scrubs.length) {
    var scrubTick = false;
    var updScrub = function () {
      scrubTick = false;
      var vh = window.innerHeight;
      scrubs.forEach(function (o) {
        var r = o.el.getBoundingClientRect();
        var p = reduceMotion ? 1 : (vh * 0.88 - r.top) / (r.height + vh * 0.3);
        var lit = Math.round(Math.max(0, Math.min(1, p)) * o.ws.length);
        for (var i = 0; i < o.ws.length; i++) o.ws[i].classList.toggle("lit", i < lit);
      });
    };
    window.addEventListener("scroll", function () { if (!scrubTick) { scrubTick = true; requestAnimationFrame(updScrub); } }, { passive: true });
    window.addEventListener("resize", updScrub);
    updScrub();
  }

  /* ---------- white-circle cursor ---------- */
  if (fine) {
    var cursor = document.querySelector(".cursor");
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;
    document.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; if (cursor) cursor.classList.add("on"); });
    // hide the circle when the pointer leaves the window or the tab loses focus
    document.addEventListener("mouseleave", function () { cursor && cursor.classList.remove("on"); });
    window.addEventListener("mouseout", function (e) { if (!e.relatedTarget && cursor) cursor.classList.remove("on"); });
    window.addEventListener("blur", function () { cursor && cursor.classList.remove("on"); });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      if (cursor) cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mousedown", function () { cursor && cursor.classList.add("down"); });
    document.addEventListener("mouseup", function () { cursor && cursor.classList.remove("down"); });
    var hoverSel = "a,button,input,textarea,select,.tile,.lb-nav,.lb-close";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hoverSel)) cursor && cursor.classList.add("hovering");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hoverSel)) cursor && cursor.classList.remove("hovering");
    });
  }

  /* ---------- nav: solid on scroll ---------- */
  var nav = document.querySelector("nav");
  function onScroll() {
    if (window.pageYOffset > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  function closeMenu() { document.body.classList.remove("menu-open"); if (toggle) toggle.setAttribute("aria-expanded", "false"); }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  document.querySelectorAll(".nav-links a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- smooth-scroll for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });

  /* ---------- balanced masonry (shortest-column packing) ---------- */
  var grid = document.querySelector(".masonry");
  var origTiles = grid ? Array.prototype.slice.call(grid.querySelectorAll("figure.tile")) : [];
  function colCount() {
    var w = window.innerWidth;
    return w <= 520 ? 1 : w <= 820 ? 2 : w <= 1200 ? 3 : 4;
  }
  function layoutMasonry() {
    if (!grid) return;
    var cols = colCount();
    if (grid.__cols === cols) return;      // nothing to do
    grid.__cols = cols;
    grid.style.display = "flex";
    grid.style.alignItems = "flex-start";
    grid.style.gap = "20px";
    grid.innerHTML = "";
    var colEls = [], heights = [];
    for (var i = 0; i < cols; i++) {
      var c = document.createElement("div");
      c.className = "mcol";
      c.style.cssText = "flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:20px";
      grid.appendChild(c); colEls.push(c); heights.push(0);
    }
    origTiles.forEach(function (t) {
      var img = t.querySelector("img");
      var wA = +img.getAttribute("width") || 3, hA = +img.getAttribute("height") || 4;
      var ratio = hA / wA;                 // relative height at unit column width
      var mi = 0;
      for (var i = 1; i < cols; i++) if (heights[i] < heights[mi]) mi = i;
      t.style.margin = "0";
      colEls[mi].appendChild(t);
      heights[mi] += ratio + 0.12;         // + gap allowance
    });
  }
  layoutMasonry();
  var rT;
  window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(layoutMasonry, 180); });

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          if (en.target.classList.contains("scramble")) scramble(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal, figure.tile, .split, .split-fade:not([data-auto]), .scramble:not([data-auto]), .site-banner").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal, figure.tile, .split, .split-fade, .site-banner").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- hero slideshow: slow random cross-fade ---------- */
  (function () {
    var box = document.getElementById("slideshow");
    if (!box) return;
    var slides = box.querySelectorAll(".slide");
    if (slides.length < 2) return;

    // Only landscape frames that fill the wide hero cleanly (portrait shots crop
    // badly at full-bleed). Shuffled fresh on each visit.
    var pool = [
      "images/grid/img-11.jpg", "images/grid/img-28.jpg", "images/grid/img-03.jpg",
      "images/grid/img-08.jpg", "images/grid/img-19.jpg", "images/grid/img-18.jpg",
      "images/grid/img-22.jpg", "images/grid/img-24.jpg", "images/grid/img-10.jpg",
      "images/grid/img-17.jpg", "images/grid/img-04.jpg", "images/grid/img-14.jpg"
    ];
    for (var j = pool.length - 1; j > 0; j--) {          // Fisher–Yates shuffle
      var k = Math.floor(Math.random() * (j + 1));
      var t = pool[j]; pool[j] = pool[k]; pool[k] = t;
    }

    function set(el, url, cb) {                            // preload, then apply
      var pre = new Image();
      pre.onload = pre.onerror = function () { el.style.backgroundImage = "url('" + url + "')"; if (cb) cb(); };
      pre.src = url;
    }

    var idx = 0, cur = 0, visible = true;
    set(slides[0], pool[0], function () { slides[0].classList.add("show"); });

    // don't cycle for visitors who prefer reduced motion — show one still frame
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;

    var heroEl = document.querySelector(".hero");
    if (heroEl && "IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.04 }).observe(heroEl);
    }

    setInterval(function () {
      if (!visible) return;                               // pause while hero is off-screen
      idx = (idx + 1) % pool.length;
      var nx = 1 - cur;
      set(slides[nx], pool[idx], function () {
        slides[nx].classList.add("show");
        slides[cur].classList.remove("show");
        cur = nx;
      });
    }, 5000);                                             // switch every 5s (~2.8s hold + 2.2s fade)
  })();

  /* ---------- lightbox ---------- */
  var tiles = origTiles.length ? origTiles : Array.prototype.slice.call(document.querySelectorAll("figure.tile"));
  var lb = document.querySelector(".lightbox");
  var lbImg = lb ? lb.querySelector("img") : null;
  var lbCap = lb ? lb.querySelector(".lb-cap") : null;
  var current = -1, navToken = 0;

  function preload(i) {
    var t = tiles[(i + tiles.length) % tiles.length];
    if (t) { var im = new Image(); im.src = t.getAttribute("data-full"); }
  }

  // Preload the target BEFORE swapping so the enlarged photo never blanks out.
  function showAt(i) {
    if (!tiles.length) return;
    current = (i + tiles.length) % tiles.length;
    var t = tiles[current];
    var full = t.getAttribute("data-full");
    var cap = (t.getAttribute("data-num") || "") + " — " + (t.getAttribute("data-title") || "");
    var token = ++navToken;                       // invalidate any in-flight load
    lb.classList.add("loading");
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      if (token !== navToken) return;             // a newer nav superseded this one
      lbImg.src = full;                           // cached → paints immediately, no flash
      lbCap.textContent = cap;
      lb.classList.remove("loading");
    };
    pre.src = full;
    preload(current + 1); preload(current - 1);   // neighbours ready for instant nav
  }

  function openLB(i) { showAt(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeLB() { lb.classList.remove("open"); document.body.style.overflow = ""; }
  function next() { showAt(current + 1); }
  function prev() { showAt(current - 1); }

  tiles.forEach(function (t, i) { t.addEventListener("click", function () { openLB(i); }); });
  if (lb) {
    lb.querySelector(".lb-close").addEventListener("click", function (e) { e.stopPropagation(); closeLB(); });
    lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); next(); });
    lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); prev(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLB(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLB();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });
    // touch swipe on mobile
    var sx = 0, sy = 0;
    lb.addEventListener("touchstart", function (e) { var c = e.changedTouches[0]; sx = c.clientX; sy = c.clientY; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      var c = e.changedTouches[0], dx = c.clientX - sx, dy = c.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
    }, { passive: true });
  }

  /* ---------- contact form (Formspree-ready) ---------- */
  var form = document.getElementById("contact-form-el");
  var status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      // Until a real Formspree endpoint is set, don't fire a broken POST.
      if (action.indexOf("YOUR_FORM_ID") !== -1 || action.trim() === "") {
        e.preventDefault();
        status.textContent = "Demo mode — add your Formspree endpoint to go live.";
        status.className = "form-status err";
        return;
      }
      // Real endpoint present: submit via fetch for a smooth inline confirmation.
      e.preventDefault();
      var data = new FormData(form);
      status.textContent = "Sending…";
      status.className = "form-status";
      fetch(action, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (r.ok) {
            form.reset();
            status.textContent = "Thank you — your message is on its way.";
            status.className = "form-status ok";
          } else {
            status.textContent = "Something went wrong. Please email bookings@littvisual.com.";
            status.className = "form-status err";
          }
        })
        .catch(function () {
          status.textContent = "Network error. Please email bookings@littvisual.com.";
          status.className = "form-status err";
        });
    });
  }

  /* ---------- email button: open native mail app, fall back to Gmail ----------
     mailto: only works when the visitor has a default mail app configured.
     If nothing takes over shortly after the click, we send them to Gmail's
     compose window instead so the button always goes somewhere. */
  (function () {
    var ADDR = "bookings@littvisual.com";
    var SUBJ = "Booking enquiry — Litt Visual";
    var GMAIL = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(ADDR) + "&su=" + encodeURIComponent(SUBJ);
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      a.addEventListener("click", function () {
        var tookOver = false;                       // a mail app / new tab grabbed focus
        function mark() { tookOver = true; }
        window.addEventListener("blur", mark, { once: true });
        function vis() { if (document.hidden) tookOver = true; }
        document.addEventListener("visibilitychange", vis, { once: true });
        setTimeout(function () {
          window.removeEventListener("blur", mark);
          document.removeEventListener("visibilitychange", vis);
          if (!tookOver && !document.hidden && document.hasFocus()) {
            window.location.href = GMAIL;           // no mail handler → Gmail compose
          }
        }, 1200);
      });
    });
  })();

  /* year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
