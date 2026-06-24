/* ============================================================
   ACI Exam Prep — static, theme-aware SVG diagrams
   Auto-injects into any [data-diagram] element.
   Colors use CSS custom properties via inline style → react to theme.
   ============================================================ */
window.ACIDiagrams = (function () {
  "use strict";
  let UID = 0;

  // ---- helpers ----
  function T(x, y, s, o) { o = o || {}; return `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="fill:${o.c || "var(--text)"};font-family:Inter,system-ui,sans-serif;font-weight:${o.w || 600};font-size:${o.s || 13}px">${s}</text>`; }
  function B(x, y, w, h, label, o) {
    o = o || {}; const r = o.r == null ? 10 : o.r;
    const lines = Array.isArray(label) ? label : [label];
    const cy = y + h / 2 - (lines.length - 1) * 8 + 5;
    let t = ""; lines.forEach((ln, i) => t += T(x + w / 2, cy + i * 16, ln, { s: o.s || 13, c: o.tc || "var(--text)", w: o.w || 700 }));
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" style="fill:${o.fill || "var(--bg-card-2)"};stroke:${o.stroke || "var(--border)"};stroke-width:${o.sw || 2}"/>${t}`;
  }
  function C(cx, cy, r, label, o) { o = o || {}; return `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:${o.fill || "var(--bg-card-2)"};stroke:${o.stroke || "var(--border)"};stroke-width:${o.sw || 2}"/>` + (label != null ? T(cx, cy + 5, label, { s: o.s || 14, c: o.tc || "var(--text)", w: 800 }) : ""); }
  function A(u, x1, y1, x2, y2, o) { o = o || {}; const m = o.accent ? "ahA" : "ah"; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${o.c || "var(--text-faint)"};stroke-width:${o.sw || 2};${o.dash ? "stroke-dasharray:5 4" : ""}" marker-end="url(#${m}${u})"/>`; }
  function L(x1, y1, x2, y2, o) { o = o || {}; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${o.c || "var(--border)"};stroke-width:${o.sw || 2};${o.dash ? "stroke-dasharray:5 4" : ""}"/>`; }
  function wrap(u, vb, body) {
    return `<svg viewBox="${vb}" style="width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="ah${u}" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0L7,3L0,6Z" style="fill:var(--text-faint)"/></marker>
        <marker id="ahA${u}" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0L7,3L0,6Z" style="fill:var(--accent)"/></marker>
      </defs>${body}</svg>`;
  }
  const ACC = "var(--accent)", ACC2 = "var(--accent-2)", ACC3 = "var(--accent-3)", GOOD = "var(--good)", BAD = "var(--bad)", DIM = "var(--text-dim)", FAINT = "var(--text-faint)";

  // ===================== DIAGRAMS =====================
  const D = {

    "agent-loop": (u) => wrap(u, "0 0 640 280", `
      <rect x="12" y="12" width="616" height="256" rx="16" style="fill:none;stroke:${ACC2};stroke-width:2;stroke-dasharray:7 5"/>
      ${T(80, 34, "ENVIRONMENT", { s: 12, w: 800, c: ACC2 })}
      ${B(70, 110, 120, 64, "Sensors", { stroke: ACC })}
      ${B(248, 92, 150, 100, ["AGENT", "f : percepts → actions"], { stroke: ACC, sw: 2.5 })}
      ${B(456, 110, 120, 64, "Actuators", { stroke: ACC })}
      ${A(u, 190, 142, 248, 142, { accent: true, c: ACC })}
      ${A(u, 398, 142, 456, 142, { accent: true, c: ACC })}
      ${T(219, 134, "percepts", { s: 11, c: DIM })}
      ${T(427, 134, "actions", { s: 11, c: DIM })}
      <path d="M516,174 C516,235 516,240 320,240 C150,240 124,235 124,176" style="fill:none;stroke:${FAINT};stroke-width:2" marker-end="url(#ah${u})"/>
      ${T(320, 256, "the environment changes → new percepts", { s: 11, c: FAINT })}
    `),

    "four-views": (u) => wrap(u, "0 0 600 280", `
      ${T(250, 32, "Human-like", { s: 13, w: 800, c: DIM })}
      ${T(440, 32, "Rational", { s: 13, w: 800, c: DIM })}
      ${T(70, 112, "Thought", { s: 13, w: 800, c: DIM, a: "middle" })}
      ${T(70, 202, "Behaviour", { s: 13, w: 800, c: DIM, a: "middle" })}
      ${B(170, 70, 160, 64, ["Thinking", "Humanly"], { tc: DIM })}
      ${B(360, 70, 160, 64, ["Thinking", "Rationally"], { tc: DIM })}
      ${B(170, 160, 160, 64, ["Acting", "Humanly"], { tc: DIM })}
      ${B(360, 160, 160, 64, ["Acting", "Rationally"], { fill: ACC, stroke: ACC, tc: "#fff" })}
      ${T(440, 244, "← this course", { s: 11, c: ACC, w: 700 })}
      ${T(250, 116, "cognitive modelling", { s: 10, c: FAINT })}
      ${T(440, 116, "laws of thought", { s: 10, c: FAINT })}
      ${T(250, 206, "Turing test", { s: 10, c: FAINT })}
    `),

    "agent-types": (u) => {
      const names = [["Simple", "reflex"], ["Model-", "based"], ["Goal-", "based"], ["Utility-", "based"], ["Learning"]];
      const adds = ["reacts", "+ state", "+ goals", "+ utility", "+ learns"];
      let b = ""; const w = 110, gap = 18, x0 = 22, y = 56;
      names.forEach((n, i) => {
        const x = x0 + i * (w + gap);
        const hi = i === 4;
        b += B(x, y, w, 66, n, { stroke: hi ? GOOD : ACC, tc: "var(--text)" });
        b += T(x + w / 2, y + 86, adds[i], { s: 11, c: hi ? GOOD : ACC2, w: 700 });
      });
      b += A(u, 22, 168, 618, 168, { c: FAINT });
      return wrap(u, "0 0 660 190", `${b}${T(330, 186, "increasing capability &amp; autonomy →", { s: 11, c: FAINT })}`);
    },

    "problem-formulation": (u) => {
      const items = ["Initial State", "Actions", "Transition Model", "Goal Test", "Path Cost"];
      let b = ""; const w = 116, gap = 18, y = 40;
      items.forEach((it, i) => {
        const x = 16 + i * (w + gap);
        b += B(x, y, w, 60, it, { s: 12, stroke: i === 3 ? GOOD : ACC });
        if (i < items.length - 1) b += A(u, x + w, y + 30, x + w + gap, y + 30, {});
      });
      return wrap(u, "0 0 680 120", b);
    },

    "bfs-dfs": (u) => {
      // two trees: positions for 7 nodes
      function tree(ox, order, title, color) {
        const P = { r: [ox + 150, 60], a: [ox + 80, 130], b: [ox + 220, 130], c: [ox + 45, 200], d: [ox + 115, 200], e: [ox + 185, 200], f: [ox + 255, 200] };
        const E = [["r", "a"], ["r", "b"], ["a", "c"], ["a", "d"], ["b", "e"], ["b", "f"]];
        let s = E.map(([p, q]) => L(P[p][0], P[p][1], P[q][0], P[q][1], { c: FAINT })).join("");
        ["r", "a", "b", "c", "d", "e", "f"].forEach((k, i) => { s += C(P[k][0], P[k][1], 17, order[i], { stroke: color, tc: "var(--text)" }); });
        s += T(ox + 150, 30, title, { s: 13, w: 800, c: color });
        return s;
      }
      return wrap(u, "0 0 660 240",
        tree(10, [1, 2, 3, 4, 5, 6, 7], "BFS — level by level", ACC) +
        tree(350, [1, 2, 5, 3, 4, 6, 7], "DFS — deep first", ACC3));
    },

    "consistency-triangle": (u) => wrap(u, "0 0 560 240", `
      ${C(110, 90, 26, "n", { stroke: ACC })}
      ${C(330, 90, 26, "n'", { stroke: ACC })}
      ${C(470, 190, 26, "G", { stroke: GOOD, tc: "var(--text)" })}
      ${A(u, 136, 90, 304, 90, { accent: true, c: ACC })}
      ${T(220, 78, "c(n, n')", { s: 12, c: DIM, w: 700 })}
      ${L(126, 108, 448, 176, { c: FAINT, dash: true })}
      ${L(352, 108, 452, 172, { c: FAINT, dash: true })}
      ${T(250, 168, "h(n)", { s: 12, c: FAINT })}
      ${T(420, 132, "h(n')", { s: 12, c: FAINT })}
      ${T(280, 226, "consistency:  h(n) ≤ c(n, n') + h(n')", { s: 14, w: 800, c: ACC2 })}
    `),

    "hill-landscape": (u) => wrap(u, "0 0 680 300", `
      ${L(40, 260, 660, 260, { c: FAINT })}
      ${L(40, 260, 40, 30, { c: FAINT })}
      ${T(350, 288, "state space", { s: 12, c: FAINT })}
      <path d="M40,250 C90,250 110,150 150,150 C185,150 200,205 245,205 C300,205 300,70 345,70 L420,70 C450,70 470,175 510,175 C545,175 555,120 600,120 L640,120" style="fill:none;stroke:${ACC};stroke-width:3"/>
      ${C(150, 150, 6, null, { fill: ACC3, stroke: ACC3 })}
      ${T(150, 134, "local maximum", { s: 11, c: ACC3, w: 700 })}
      ${C(345, 70, 6, null, { fill: GOOD, stroke: GOOD })}
      ${T(360, 58, "global maximum", { s: 11, c: GOOD, w: 800 })}
      ${T(465, 64, "plateau / shoulder", { s: 11, c: FAINT })}
      ${C(95, 218, 7, null, { fill: ACC, stroke: "#fff" })}
      ${A(u, 95, 210, 110, 175, { accent: true, c: ACC })}
      ${T(86, 236, "current state", { s: 11, c: ACC, w: 700, a: "start" })}
      ${T(22, 150, "f", { s: 14, c: FAINT, w: 800 })}
    `),

    "puzzle-heuristics": (u) => {
      function grid(ox, oy, vals, title) {
        let s = T(ox + 81, oy - 10, title, { s: 12, w: 800, c: DIM });
        for (let i = 0; i < 9; i++) {
          const r = Math.floor(i / 3), c = i % 3, x = ox + c * 54, y = oy + r * 54;
          const blank = vals[i] === 0;
          s += `<rect x="${x}" y="${y}" width="50" height="50" rx="7" style="fill:${blank ? "var(--bg-soft)" : "var(--bg-card-2)"};stroke:var(--border);stroke-width:2"/>`;
          if (!blank) s += T(x + 25, y + 32, vals[i], { s: 18, w: 800 });
        }
        return s;
      }
      return wrap(u, "0 0 560 250",
        grid(40, 40, [7, 2, 4, 5, 0, 6, 8, 3, 1], "Start state") +
        grid(330, 40, [1, 2, 3, 4, 5, 6, 7, 8, 0], "Goal state") +
        A(u, 218, 105, 322, 105, { accent: true, c: ACC }) +
        T(280, 232, "h₁ = misplaced tiles = 8   ·   h₂ = Σ Manhattan = 18", { s: 13, w: 700, c: ACC2 }));
    },

    "ga-cycle": (u) => {
      const cx = 260, cy = 168, R = 118;
      const stages = [["Initialize", "population"], ["Evaluate", "fitness"], ["Selection"], ["Crossover"], ["Mutation"]];
      const ang = [-90, -18, 54, 126, 198].map(d => d * Math.PI / 180);
      const pos = ang.map(a => [cx + R * Math.cos(a), cy + R * Math.sin(a)]);
      let s = T(cx, cy - 4, "GA", { s: 22, w: 800, c: ACC }) + T(cx, cy + 18, "loop", { s: 11, c: FAINT });
      // arrows along circle
      for (let i = 0; i < 5; i++) {
        const p = pos[i], q = pos[(i + 1) % 5];
        const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
        const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy);
        const sx = p[0] + dx / len * 42, sy = p[1] + dy / len * 36, ex = q[0] - dx / len * 42, ey = q[1] - dy / len * 36;
        s += A(u, sx, sy, ex, ey, { c: i === 0 ? FAINT : ACC2, accent: i !== 0 });
      }
      pos.forEach((p, i) => { s += C(p[0], p[1], 40, null, { fill: "var(--bg-card-2)", stroke: i === 0 ? ACC3 : ACC2 }); const ls = stages[i]; ls.forEach((ln, j) => s += T(p[0], p[1] + 4 - (ls.length - 1) * 7 + j * 14, ln, { s: 11, w: 700 })); });
      return wrap(u, "0 0 520 336", s);
    },

    "crossover": (u) => {
      function row(y, vals, colorFn, label) {
        let s = T(20, y + 22, label, { s: 12, w: 700, a: "start", c: DIM });
        vals.forEach((v, i) => { const x = 120 + i * 42; s += `<rect x="${x}" y="${y}" width="38" height="34" rx="6" style="fill:${colorFn(i)};stroke:var(--border);stroke-width:1.5"/>` + T(x + 19, y + 23, v, { s: 13, w: 700, c: "#fff" }); });
        return s;
      }
      const blue = "var(--accent)", orange = "var(--accent-3)";
      const cP1 = () => blue, cP2 = () => orange, cC1 = i => i < 4 ? blue : orange, cC2 = i => i < 4 ? orange : blue;
      const cut = 120 + 4 * 42 - 2;
      return wrap(u, "0 0 560 250",
        row(20, [1, 2, 3, 4, 5, 6, 7, 8], cP1, "Parent 1") +
        row(64, [8, 7, 6, 5, 4, 3, 2, 1], cP2, "Parent 2") +
        L(cut, 12, cut, 106, { c: BAD, sw: 2, dash: true }) + T(cut, 122, "cut point (after 4)", { s: 10, c: BAD }) +
        A(u, 280, 130, 280, 158, { accent: true, c: ACC }) +
        row(168, [1, 2, 3, 4, 4, 3, 2, 1], cC1, "Child 1") +
        row(208, [8, 7, 6, 5, 5, 6, 7, 8], cC2, "Child 2"));
    },

    "aco-graph": (u) => {
      const P = { A: [110, 70], B: [430, 70], C: [110, 220], D: [430, 220] };
      const edges = [["A", "B", 5, "A-B"], ["A", "C", 3, "A-C"], ["A", "D", 6, "A-D"], ["B", "D", 2, "B-D"], ["C", "D", 5, "C-D"], ["B", "C", 1.5, "B-C"]];
      let s = "";
      edges.forEach(([p, q, w]) => { s += L(P[p][0], P[p][1], P[q][0], P[q][1], { c: w >= 5 ? ACC2 : FAINT, sw: w }); });
      Object.keys(P).forEach(k => s += C(P[k][0], P[k][1], 24, k, { stroke: ACC }));
      // ants
      s += C(250, 145, 5, null, { fill: ACC3, stroke: ACC3 }) + C(270, 158, 5, null, { fill: ACC3, stroke: ACC3 });
      s += T(280, 270, "thicker edge = stronger pheromone trail (τ);  shorter edge = higher η = 1/cost", { s: 11, c: FAINT });
      return wrap(u, "0 0 560 290", s);
    },

    "codeepneat": (u) => {
      let s = T(95, 28, "Blueprint", { s: 12, w: 800, c: ACC });
      // blueprint nodes
      const bp = [[95, 60], [95, 130], [95, 200]];
      s += C(bp[0][0], bp[0][1], 22, "1", { stroke: ACC }) + C(bp[1][0], bp[1][1], 22, "2", { stroke: ACC }) + C(bp[2][0], bp[2][1], 22, "3", { stroke: ACC });
      s += A(u, 95, 82, 95, 108, { accent: true, c: ACC }) + A(u, 95, 152, 95, 178, { accent: true, c: ACC });
      // modules
      s += T(300, 28, "Module species", { s: 12, w: 800, c: ACC2 });
      s += B(230, 55, 150, 60, ["Mod A:", "Conv→ReLU→Pool"], { s: 11, stroke: ACC2 });
      s += B(230, 150, 150, 60, ["Mod B:", "Conv→ReLU"], { s: 11, stroke: ACC2 });
      s += A(u, 118, 70, 228, 80, { c: FAINT }); s += A(u, 118, 130, 228, 175, { c: FAINT }); s += A(u, 118, 200, 228, 100, { c: FAINT });
      // assembled
      s += T(520, 28, "Assembled net", { s: 12, w: 800, c: GOOD });
      const an = ["Input", "Mod A", "Mod B", "Mod A", "Dense", "Output"];
      an.forEach((n, i) => { const y = 50 + i * 38; s += B(465, y, 110, 30, n, { s: 11, stroke: i === 0 || i === 5 ? GOOD : ACC2, r: 7 }); if (i < an.length - 1) s += A(u, 520, y + 30, 520, y + 38, { c: FAINT }); });
      s += A(u, 388, 110, 462, 110, { accent: true, c: GOOD });
      return wrap(u, "0 0 640 300", s);
    },

    "minimax-tree": (u) => wrap(u, "0 0 520 250", `
      ${L(260, 56, 150, 120, { c: FAINT })}${L(260, 56, 370, 120, { c: FAINT })}
      ${L(150, 140, 95, 200, { c: FAINT })}${L(150, 140, 205, 200, { c: FAINT })}
      ${L(370, 140, 315, 200, { c: FAINT })}${L(370, 140, 425, 200, { c: FAINT })}
      <rect x="240" y="34" width="40" height="36" rx="7" style="fill:${ACC};stroke:${ACC};stroke-width:2"/>${T(260, 58, "4", { c: "#fff", w: 800, s: 15 })}
      ${C(150, 130, 20, "4", { stroke: ACC3, tc: "var(--text)" })}
      ${C(370, 130, 20, "2", { stroke: ACC3, tc: "var(--text)" })}
      ${B(78, 184, 34, 32, "4", { r: 6, s: 14 })}${B(188, 184, 34, 32, "7", { r: 6, s: 14 })}
      ${B(298, 184, 34, 32, "2", { r: 6, s: 14 })}${B(408, 184, 34, 32, "6", { r: 6, s: 14 })}
      ${T(300, 30, "MAX  max(4,2)=4", { s: 12, w: 800, c: ACC, a: "start" })}
      ${T(96, 128, "MIN", { s: 10, c: ACC3, a: "end" })}${T(424, 128, "MIN", { s: 10, c: ACC3, a: "start" })}
      ${T(150, 162, "min(4,7)", { s: 10, c: FAINT })}${T(370, 162, "min(2,6)", { s: 10, c: FAINT })}
    `),

    "alphabeta-prune": (u) => {
      const lx = [50, 130, 210, 290, 370, 450, 530, 610], lv = [6, 5, 8, 10, 2, 1, 9, 12];
      const maxX = [90, 250, 410, 570], maxV = ["6", "8", "2", "✂"];
      const minX = [170, 490], minV = ["6", "2"];
      const pruned = { l3: true, l6: true, l7: true, m3: true }; // leaf idx 3(10),6(9),7(12); max node idx3
      let s = "";
      // edges root->min
      s += L(330, 56, 170, 96, { c: FAINT }) + L(330, 56, 490, 96, { c: FAINT });
      // min->max
      s += L(170, 116, 90, 162, { c: FAINT }) + L(170, 116, 250, 162, { c: FAINT });
      s += L(490, 116, 410, 162, { c: FAINT }) + L(490, 116, 570, 162, { c: BAD, dash: true });
      // max->leaves
      [[0, 90, 0, 1], [1, 250, 2, 3], [2, 410, 4, 5], [3, 570, 6, 7]].forEach(([mi, mxx, a, b]) => {
        const pa = mi === 3, pb = mi === 1;
        s += L(mxx, 182, lx[a], 228, { c: BAD && pa ? BAD : FAINT, dash: pa });
        s += L(mxx, 182, lx[b], 228, { c: (mi === 1 || pa) ? BAD : FAINT, dash: (mi === 1 || pa) });
      });
      // root
      s += `<rect x="310" y="34" width="40" height="36" rx="7" style="fill:${ACC};stroke:${ACC};stroke-width:2"/>` + T(330, 58, "6", { c: "#fff", w: 800, s: 15 });
      // min nodes
      minX.forEach((x, i) => s += C(x, 106, 19, minV[i], { stroke: ACC3, tc: "var(--text)" }));
      // max nodes
      maxX.forEach((x, i) => { const p = i === 3; s += `<rect x="${x - 18}" y="164" width="36" height="34" rx="6" style="fill:var(--bg-card-2);stroke:${p ? BAD : ACC};stroke-width:2;${p ? "stroke-dasharray:4 3" : ""}"/>` + T(x, 186, maxV[i], { s: 13, w: 800, c: p ? BAD : "var(--text)" }); });
      // leaves
      lx.forEach((x, i) => { const p = pruned["l" + i]; s += `<rect x="${x - 16}" y="228" width="32" height="30" rx="5" style="fill:var(--bg-card-2);stroke:${p ? BAD : "var(--border)"};stroke-width:1.8;${p ? "stroke-dasharray:4 3" : ""}"/>` + T(x, 248, lv[i], { s: 12, w: 700, c: p ? BAD : "var(--text)" }); });
      s += T(330, 26, "root MAX = 6", { s: 12, w: 800, c: ACC });
      s += T(330, 286, "✂ pruned leaves: 10, 9, 12  (β-cutoff &amp; α-cutoff)", { s: 12, w: 700, c: BAD });
      return wrap(u, "0 0 660 300", s);
    },

    "mcts-cycle": (u) => {
      const stages = ["Selection", "Expansion", "Simulation", "Backprop"];
      let s = ""; const w = 130, gap = 24, y = 70;
      stages.forEach((st, i) => {
        const x = 14 + i * (w + gap);
        s += B(x, y, w, 56, st, { stroke: [ACC, ACC2, ACC3, GOOD][i] });
        s += T(x + w / 2, y + 78, "" + (i + 1), { s: 11, c: FAINT });
        if (i < 3) s += A(u, x + w, y + 28, x + w + gap, y + 28, { accent: true, c: ACC });
      });
      // loop back arrow on top
      s += `<path d="M610,${y} C610,20 50,20 50,${y - 2}" style="fill:none;stroke:${FAINT};stroke-width:2" marker-end="url(#ah${u})"/>`;
      s += T(330, 26, "repeat many iterations", { s: 11, c: FAINT });
      return wrap(u, "0 0 640 180", s);
    },
  };

  function init(root) {
    (root || document).querySelectorAll("[data-diagram]").forEach(el => {
      if (el.dataset.dgDone) return; el.dataset.dgDone = "1";
      const fn = D[el.dataset.diagram]; if (!fn) return;
      el.classList.add("diagram");
      const cap = el.getAttribute("data-caption");
      el.innerHTML = fn(++UID) + (cap ? `<div class="dg-cap">${cap}</div>` : "");
    });
  }
  document.addEventListener("DOMContentLoaded", () => init());
  return { init, D };
})();
