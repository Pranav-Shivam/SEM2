/* ============================================================
   ACI Exam Prep — shared app logic
   Header/nav/footer injection, theme, collapsibles, quizzes,
   progress tracking, MathJax, scroll-spy.
   ============================================================ */
(function () {
  "use strict";

  // ---- Site structure ----
  const SESSIONS = [
    ["session1", "S1 · Intro to AI & Agents"],
    ["session2", "S2 · Agents, Environments & Problem Solving"],
    ["session3", "S3 · Uninformed & Informed Search (A*)"],
    ["session4", "S4 · Heuristic Design & Hill Climbing"],
    ["session5", "S5 · Local Search, GA & ACO intro"],
    ["session6", "S6 · ACO & Neural Architecture Search"],
    ["session7", "S7 · Adversarial Search & Minimax"],
    ["session8", "S8 · Alpha-Beta Pruning & MCTS"],
  ];
  const PAPERS = [
    ["paper-jun2025", "Jun 2025 — Regular ★answers"],
    ["paper-jul2025", "Jul 2025 — Makeup ★answers"],
    ["paper-regular-set", "Regular Set — 8 Qs (solved)"],
    ["paper-feb2025", "Feb 2025 — Makeup (solved)"],
    ["paper-aug2019-reg", "Aug 2019 — Regular (solved)"],
    ["paper-aug2019-makeup", "Aug 2019 — Makeup (solved)"],
    ["paper-jan2020", "Jan 2020 — Makeup (solved)"],
  ];

  const rel = (window.ACI_REL || ""); // pages set ACI_REL='' (root). Kept for flexibility.

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  // ---- Header ----
  function buildHeader() {
    const page = document.body.dataset.page || "";
    const sessLinks = SESSIONS.map(([id, t]) =>
      `<a href="${id}.html"><span class="mi-num">${t.split(" ")[0]}</span>${t.replace(/^S\d+ · /, "")}</a>`).join("");
    const paperLinks = PAPERS.map(([id, t]) => `<a href="${id}.html">${t}</a>`).join("");

    const header = el(`
      <header class="site">
        <div class="nav-inner">
          <a class="brand" href="index.html">
            <span class="logo">ACI</span>
            <span>ACI Exam Prep<small>AIMLCZG557 · Mid-Sem</small></span>
          </a>
          <button class="menu-btn" aria-label="Menu">☰</button>
          <nav class="links">
            <a href="../index.html" class="hub-back" title="Back to Study Hub">← Study Hub</a>
            <a href="index.html" data-p="index">Home</a>
            <div class="dropdown"><a href="session1.html" data-p="sessions">Sessions</a>
              <div class="dropdown-menu">${sessLinks}</div></div>
            <div class="dropdown"><a href="papers.html" data-p="papers">Papers</a>
              <div class="dropdown-menu"><a href="papers.html"><b>All papers ▸</b></a>${paperLinks}</div></div>
            <a href="practice.html" data-p="practice">Practice</a>
            <a href="tools.html" data-p="tools">Visualizers</a>
            <a href="formulas.html" data-p="formulas">Formula Sheet</a>
            <button class="theme-toggle" title="Toggle theme">🌙</button>
          </nav>
        </div>
      </header>`);
    document.body.prepend(header);

    // active state
    const map = { index: "index", sessions: "sessions", papers: "papers", practice: "practice", tools: "tools", formulas: "formulas" };
    let group = "";
    if (page.startsWith("session")) group = "sessions";
    else if (page.startsWith("paper")) group = "papers";
    else group = page;
    header.querySelectorAll("nav.links > a, .dropdown > a").forEach(a => {
      if (a.dataset.p === group) a.classList.add("active");
    });

    // mobile menu
    header.querySelector(".menu-btn").addEventListener("click", () => {
      header.querySelector("nav.links").classList.toggle("open");
    });
    // theme toggle
    header.querySelector(".theme-toggle").addEventListener("click", toggleTheme);
    refreshThemeIcon();
  }

  function buildFooter() {
    const f = el(`
      <footer class="site">
        <div class="f-inner">
          <div>Built from CS1–CS8 slides, class transcripts &amp; past papers · <strong>AIMLCZG557 — Artificial &amp; Computational Intelligence</strong></div>
          <div>Reference: Russell &amp; Norvig, <em>AI: A Modern Approach</em> (4th ed.) · Study aid, not official material.</div>
        </div>
      </footer>`);
    document.body.appendChild(f);
  }

  // ---- Reading progress bar ----
  function buildProgressBar() {
    const bar = el('<div id="progress-bar"></div>');
    document.body.prepend(bar);
    const upd = () => {
      const h = document.documentElement;
      const sc = h.scrollTop || document.body.scrollTop;
      const max = (h.scrollHeight - h.clientHeight) || 1;
      bar.style.width = Math.min(100, (sc / max) * 100) + "%";
    };
    window.addEventListener("scroll", upd, { passive: true });
    upd();
  }

  // ---- Theme ----
  function applyTheme(t) { document.documentElement.setAttribute("data-theme", t); }
  function currentTheme() { return document.documentElement.getAttribute("data-theme") || "dark"; }
  function refreshThemeIcon() {
    const b = document.querySelector(".theme-toggle");
    if (b) b.textContent = currentTheme() === "dark" ? "🌙" : "☀️";
  }
  function toggleTheme() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("study-hub-theme", next); } catch (e) {}
    refreshThemeIcon();
  }

  // ---- Collapsible solutions ----
  function wireCollapsibles() {
    document.addEventListener("click", (e) => {
      const t = e.target.closest(".sol-toggle");
      if (!t) return;
      t.classList.toggle("open");
      const body = t.nextElementSibling;
      if (body && body.classList.contains("sol-body")) {
        body.classList.toggle("open");
        if (window.MathJax && window.MathJax.typesetPromise && body.classList.contains("open")) {
          window.MathJax.typesetPromise([body]).catch(() => {});
        }
      }
    });
  }
  // expand/collapse all
  window.ACIToggleAll = function (open) {
    document.querySelectorAll(".sol-toggle").forEach(t => {
      const body = t.nextElementSibling;
      t.classList.toggle("open", open);
      if (body) body.classList.toggle("open", open);
    });
    if (open && window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise().catch(()=>{});
  };

  // ---- Quiz engine ----
  function wireQuizzes() {
    document.querySelectorAll(".quiz").forEach(quiz => {
      const qs = quiz.querySelectorAll(".q");
      quiz.dataset.total = qs.length;
      quiz.dataset.answered = 0;
      quiz.dataset.correct = 0;
      qs.forEach(q => {
        q.querySelectorAll(".opt").forEach(opt => {
          opt.addEventListener("click", () => {
            if (q.dataset.done) return;
            q.dataset.done = "1";
            const correct = opt.dataset.correct === "1";
            opt.classList.add(correct ? "correct" : "wrong");
            opt.querySelector(".mark") && (opt.querySelector(".mark").textContent = correct ? "✓" : "✗");
            if (!correct) {
              const right = q.querySelector('.opt[data-correct="1"]');
              if (right) { right.classList.add("reveal-correct"); right.querySelector(".mark") && (right.querySelector(".mark").textContent = "✓"); }
            }
            const ex = q.querySelector(".explain");
            if (ex) ex.classList.add("show");
            quiz.dataset.answered = (+quiz.dataset.answered) + 1;
            if (correct) quiz.dataset.correct = (+quiz.dataset.correct) + 1;
            if (+quiz.dataset.answered === +quiz.dataset.total) {
              const sc = quiz.querySelector(".quiz-score");
              if (sc) {
                const c = +quiz.dataset.correct, t = +quiz.dataset.total;
                const pct = Math.round(c / t * 100);
                let msg = pct === 100 ? "Perfect! 🎯" : pct >= 70 ? "Solid — almost there. 💪" : "Review this module again. 📚";
                sc.innerHTML = `You scored <span style="color:var(--accent-2)">${c}/${t}</span> (${pct}%). ${msg}`;
                sc.classList.add("show");
                sc.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
            }
          });
        });
      });
    });
  }

  // ---- Progress tracking (sessions completed) ----
  const PKEY = "aci-progress-v1";
  function getProgress() { try { return JSON.parse(localStorage.getItem(PKEY) || "{}"); } catch (e) { return {}; } }
  function setDone(id, val) { const p = getProgress(); if (val) p[id] = 1; else delete p[id]; try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) {} }
  window.ACIProgress = { get: getProgress, set: setDone, sessions: SESSIONS };

  function wireProgressToggles() {
    const p = getProgress();
    document.querySelectorAll("[data-track]").forEach(box => {
      const id = box.dataset.track;
      const cb = box.querySelector("input[type=checkbox]");
      if (cb) {
        cb.checked = !!p[id];
        cb.addEventListener("change", () => { setDone(id, cb.checked); updateProgressUI(); });
      }
    });
    updateProgressUI();
  }
  function updateProgressUI() {
    const p = getProgress();
    const done = SESSIONS.filter(([id]) => p[id]).length;
    const pct = Math.round(done / SESSIONS.length * 100);
    const ring = document.getElementById("prog-pct");
    if (ring) ring.textContent = pct + "%";
    const cnt = document.getElementById("prog-count");
    if (cnt) cnt.textContent = done + " / " + SESSIONS.length;
    const fill = document.getElementById("prog-fill");
    if (fill) fill.style.width = pct + "%";
    // reflect on module cards
    document.querySelectorAll("[data-session-card]").forEach(c => {
      const id = c.dataset.sessionCard;
      const badge = c.querySelector(".done-badge");
      if (badge) badge.style.display = p[id] ? "inline-block" : "none";
    });
  }

  // ---- Auto "mark complete" button on session pages ----
  function wireSessionComplete() {
    const btn = document.getElementById("mark-complete");
    if (!btn) return;
    const id = document.body.dataset.page;
    const p = getProgress();
    const setLabel = () => { btn.textContent = getProgress()[id] ? "✓ Marked complete" : "Mark this session complete"; btn.classList.toggle("alt", !!getProgress()[id]); };
    setLabel();
    btn.addEventListener("click", () => { const cur = !!getProgress()[id]; setDone(id, !cur); setLabel(); });
  }

  // ---- Scroll-spy for TOC ----
  function wireScrollSpy() {
    const toc = document.querySelector(".toc");
    if (!toc) return;
    const links = [...toc.querySelectorAll("a")];
    const ids = links.map(a => a.getAttribute("href")).filter(h => h && h.startsWith("#")).map(h => h.slice(1));
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
    const onScroll = () => {
      let cur = sections[0] ? sections[0].id : null;
      const y = window.scrollY + 100;
      sections.forEach(s => { if (s.offsetTop <= y) cur = s.id; });
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---- Prev/Next pager on session pages ----
  function wirePager() {
    const host = document.getElementById("session-pager");
    if (!host) return;
    const id = document.body.dataset.page;
    const idx = SESSIONS.findIndex(([s]) => s === id);
    if (idx < 0) return;
    const prev = SESSIONS[idx - 1], next = SESSIONS[idx + 1];
    let html = "";
    if (prev) html += `<a class="card" href="${prev[0]}.html"><div class="dir">‹ Previous</div><div class="ttl">${prev[1]}</div></a>`;
    else html += `<a class="card" href="index.html"><div class="dir">‹ Back</div><div class="ttl">Home dashboard</div></a>`;
    if (next) html += `<a class="card next" href="${next[0]}.html"><div class="dir">Next ›</div><div class="ttl">${next[1]}</div></a>`;
    else html += `<a class="card next" href="papers.html"><div class="dir">Next ›</div><div class="ttl">Solved past papers</div></a>`;
    host.innerHTML = html;
  }

  // ---- MathJax ----
  function loadMathJax() {
    window.MathJax = {
      tex: { inlineMath: [["\\(", "\\)"], ["$", "$"]], displayMath: [["\\[", "\\]"], ["$$", "$$"]] },
      svg: { fontCache: "global" },
      options: { skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"] }
    };
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-svg.min.js";
    s.async = true;
    document.head.appendChild(s);
  }

  // ---- init ----
  document.addEventListener("DOMContentLoaded", () => {
    buildProgressBar();
    buildHeader();
    buildFooter();
    wireCollapsibles();
    wireQuizzes();
    wireProgressToggles();
    wireSessionComplete();
    wireScrollSpy();
    wirePager();
    loadMathJax();
  });
})();
