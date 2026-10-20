(function () {
  "use strict";

  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rndi = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function makeCtx() {
    const timers = [];
    return {
      later(ms, fn) { const id = setTimeout(fn, ms); timers.push(id); return id; },
      every(ms, fn) { const id = setInterval(fn, ms); timers.push(id); return id; },
      clear() { timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); }
    };
  }

  function head(title, sub) {
    return el("div", "dm-head", '<span class="dm-title">' + esc(title) + '</span><span class="dm-sub">' + esc(sub) + "</span>");
  }

  function bar(label, value, accent) {
    return (
      '<div class="dm-stat"><div class="dm-stat-top"><span>' + esc(label) + "</span><b>" + Math.round(value) + '%</b></div>' +
      '<div class="dm-bar"><i style="width:' + Math.max(0, Math.min(100, value)) + "%;background:" + accent + '"></i></div></div>'
    );
  }

  function logLine(cls, html) {
    return '<div class="dm-log-line ' + (cls || "") + '">' + html + "</div>";
  }

  /* ------------------------------------------------------------------ */
  /* 1. AI Product Launch — mini-jeu de lancement                        */
  /* ------------------------------------------------------------------ */
  function demoLaunch(container, p) {
    const ctx = makeCtx();
    const ac = p.accent || "#6366f1";
    let stats, budget, done, log;
    const KEYS = [
      { k: "score", label: "Score produit" },
      { k: "copy", label: "Copy IA" },
      { k: "landing", label: "Landing page" },
      { k: "buzz", label: "Buzz / Ads" }
    ];
    const EVENTS = [
      { t: "Orchestrateur OpenAI → positionnement généré", boost: "score", v: [18, 30] },
      { t: "Claude rédige 3 variantes de headline", boost: "copy", v: [15, 28] },
      { t: "Générateur assemble la landing page", boost: "landing", v: [16, 30] },
      { t: "Gemini propose un angle publicitaire viral", boost: "buzz", v: [14, 26] },
      { t: "Scoring multi-critères : l'idée progresse", boost: "score", v: [10, 18] },
      { t: "Copy A/B testé — variante gagnante retenue", boost: "copy", v: [12, 22] },
      { t: "Landing optimisée (CTA + preuve sociale)", boost: "landing", v: [12, 20] },
      { t: "Budget ads réparti sur 2 canaux", boost: "buzz", v: [15, 25] }
    ];

    function reset() {
      stats = { score: 22, copy: 18, landing: 20, buzz: 15 };
      budget = 6; done = false; log = [];
      render();
    }

    function render() {
      container.innerHTML = "";
      container.appendChild(head("🚀 Lancement produit", "Objectif : chaque jauge à 70 % avant la fin du budget IA"));
      const bars = el("div", "dm-bars");
      KEYS.forEach((s) => { bars.insertAdjacentHTML("beforeend", bar(s.label, stats[s.k], ac)); });
      container.appendChild(bars);
      const budgetRow = el("div", "dm-budget", "Budget IA : ");
      for (let i = 0; i < 6; i++) budgetRow.insertAdjacentHTML("beforeend", '<span class="dm-pip' + (i < budget ? " on" : "") + '"></span>');
      budgetRow.insertAdjacentHTML("beforeend", " <b>" + budget + "</b> exécutions restantes");
      container.appendChild(budgetRow);
      const lg = el("div", "dm-log");
      lg.innerHTML = log.length ? log.slice(-5).map((l) => logLine(l.c, l.m)).join("") : logLine("dim", "&gt; En attente d'exécution…");
      container.appendChild(lg);
      const row = el("div", "dm-actions");
      if (done) {
        row.appendChild(el("button", "dm-btn", "↺ Rejouer"));
        row.firstChild.addEventListener("click", reset);
      } else {
        const b = el("button", "dm-btn primary", "▶ Exécuter l'orchestrateur IA");
        b.style.setProperty("--ac", ac);
        b.addEventListener("click", run);
        row.appendChild(b);
      }
      container.appendChild(row);
    }

    function run() {
      if (done || budget <= 0) return;
      budget--;
      const ev = pick(EVENTS);
      stats[ev.boost] = Math.min(100, stats[ev.boost] + rndi(ev.v[0], ev.v[1]));
      log.push({ c: "ok", m: "&gt; " + esc(ev.t) + " <b>+" + ev.v[1] + "</b>" });
      const win = KEYS.every((s) => stats[s.k] >= 70);
      if (win) {
        done = true;
        log.push({ c: "win", m: "🏆 PRODUIT LANCÉ — toutes les jauges sont au vert !" });
      } else if (budget === 0) {
        done = true;
        log.push({ c: "ko", m: "💸 Budget épuisé avant le lancement. Relance l'orchestrateur !" });
      }
      render();
    }

    reset();
    return () => ctx.clear();
  }

  /* ------------------------------------------------------------------ */
  /* 2. Automate Video IA — pipeline jouable                            */
  /* ------------------------------------------------------------------ */
  function demoVideo(container, p) {
    const ctx = makeCtx();
    const ac = p.accent || "#8b5cf6";
    const STAGES = ["Script (agent IA)", "Synthèse de la voix", "Montage FFmpeg", "Upload YouTube"];
    let prog, stage, running, boosted, boostLeft, views, msg;
    let tickId = null;

    function reset() {
      prog = [0, 0, 0, 0]; stage = 0; running = false; boosted = false; boostLeft = 3; views = 0; msg = "";
      render();
    }

    function render() {
      container.innerHTML = "";
      container.appendChild(head("🎬 Pipeline vidéo", "Un sujet en entrée — une vidéo publiée en sortie"));
      const stages = el("div", "dm-stages");
      STAGES.forEach((s, i) => {
        const st = i < stage ? "done" : i === stage && running ? "run" : "";
        stages.insertAdjacentHTML(
          "beforeend",
          '<div class="dm-stage ' + st + '"><div class="dm-stage-top"><span>' + (i < stage ? "✓ " : "") + esc(s) + "</span><b>" + Math.round(prog[i]) + '%</b></div>' +
          '<div class="dm-bar"><i style="width:' + prog[i] + "%;background:" + ac + '"></i></div></div>'
        );
      });
      container.appendChild(stages);
      if (msg) container.appendChild(el("div", "dm-banner " + (views ? "win" : ""), msg));
      const lg = el("div", "dm-log");
      lg.innerHTML = logStore.length ? logStore.slice(-4).map((l) => logLine(l.c, l.m)).join("") : logLine("dim", "&gt; File de jobs prête (BullMQ).");
      container.appendChild(lg);
      const row = el("div", "dm-actions");
      if (!running && !views) {
        const b = el("button", "dm-btn primary", "▶ Lancer le pipeline");
        b.style.setProperty("--ac", ac);
        b.addEventListener("click", start);
        row.appendChild(b);
      } else if (running) {
        const b = el("button", "dm-btn", "⚡ Boost x2 (" + boostLeft + ")");
        b.addEventListener("click", () => {
          if (boostLeft <= 0) return;
          boostLeft--; boosted = true;
          logStore.push({ c: "ok", m: "&gt; Boost activé — vitesse x2" });
          render();
        });
        row.appendChild(b);
      } else {
        const b = el("button", "dm-btn", "↺ Nouvelle vidéo");
        b.addEventListener("click", () => { logStore = []; reset(); });
        row.appendChild(b);
      }
      container.appendChild(row);
    }

    let logStore = [];

    function start() {
      running = true; boosted = false;
      logStore.push({ c: "ok", m: "&gt; Job accepté — sujet : « 5 automatisations IA »" });
      render();
      tickId = ctx.every(90, () => {
        const speed = (boosted ? 7.5 : 3.5) * rnd(0.7, 1.3);
        prog[stage] = Math.min(100, prog[stage] + speed);
        if (Math.random() < 0.03 && prog[stage] < 95) {
          logStore.push({ c: "warn", m: "⚠ Rate limit API — retry automatique (backoff 2 s)" });
          prog[stage] = Math.max(0, prog[stage] - 8);
        }
        if (prog[stage] >= 100) {
          logStore.push({ c: "ok", m: "✓ " + esc(STAGES[stage]) + " terminé" });
          stage++;
          if (stage >= STAGES.length) {
            clearInterval(tickId);
            running = false;
            msg = "✅ Vidéo publiée sur YouTube !";
            render();
            ctx.every(120, () => { views += rndi(3, 18); msg = "✅ Publiée — " + views + " vues en direct"; render(); });
            return;
          }
        }
        render();
      });
    }

    reset();
    return () => { if (tickId) clearInterval(tickId); ctx.clear(); };
  }

  /* ------------------------------------------------------------------ */
  /* 3. Mimi's — mini menu + panier WhatsApp                            */
  /* ------------------------------------------------------------------ */
  function demoRestaurant(container, p) {
    const ac = p.accent || "#f59e0b";
    const MENU = [
      { n: "Poulet braisé", p: 3000 },
      { n: "Burger Mimi's", p: 2500 },
      { n: "Pizza reine", p: 3500 },
      { n: "Milkshake fraise", p: 1500 }
    ];
    let cart = {};
    let sent = false;

    function render() {
      container.innerHTML = "";
      container.appendChild(head("🍔 Chez Mimi's", "Compose ta commande — envoi WhatsApp en 1 clic"));
      const list = el("div", "dm-menu");
      MENU.forEach((m, i) => {
        const q = cart[i] || 0;
        list.insertAdjacentHTML(
          "beforeend",
          '<div class="dm-item"><span class="dm-item-n">' + esc(m.n) + '</span><span class="dm-item-p">' + m.p.toLocaleString("fr-FR") + ' F</span>' +
          '<span class="dm-qty"><button data-i="' + i + '" data-d="-1">−</button><b>' + q + '</b><button data-i="' + i + '" data-d="1">+</button></span></div>'
        );
      });
      list.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-i]");
        if (!b) return;
        const i = +b.dataset.i, d = +b.dataset.d;
        cart[i] = Math.max(0, (cart[i] || 0) + d);
        sent = false; render();
      });
      container.appendChild(list);
      const total = Object.keys(cart).reduce((s, i) => s + cart[i] * MENU[i].p, 0);
      const count = Object.values(cart).reduce((s, q) => s + q, 0);
      container.appendChild(el("div", "dm-total", '<span>Panier (' + count + ' articles)</span><b style="color:' + ac + '">' + total.toLocaleString("fr-FR") + ' F CFA</b>'));
      if (sent) {
        const lines = Object.keys(cart).filter((i) => cart[i]).map((i) => "• " + cart[i] + "× " + MENU[i].n + " — " + (cart[i] * MENU[i].p).toLocaleString("fr-FR") + " F");
        container.appendChild(el("div", "dm-whatsapp", "💬 <b>Message WhatsApp pré-rempli :</b><br>Bonjour Mimi's ! Je souhaite commander :<br>" + lines.join("<br>") + "<br><b>Total : " + total.toLocaleString("fr-FR") + ' F</b><br><span class="dm-dim">Prototype — aucun message n\'est réellement envoyé.</span>'));
      }
      const row = el("div", "dm-actions");
      const b1 = el("button", "dm-btn primary", "💬 Commander sur WhatsApp");
      b1.style.setProperty("--ac", ac);
      b1.addEventListener("click", () => { if (count) { sent = true; render(); } });
      const b2 = el("button", "dm-btn", "Vider");
      b2.addEventListener("click", () => { cart = {}; sent = false; render(); });
      row.appendChild(b1); row.appendChild(b2);
      container.appendChild(row);
    }

    render();
    return () => {};
  }

  /* ------------------------------------------------------------------ */
  /* 4. Dropship — semaine de briefs + choix produit                     */
  /* ------------------------------------------------------------------ */
  function demoDropship(container, p) {
    const ctx = makeCtx();
    const ac = p.accent || "#10b981";
    const PRODUCTS = [
      ["Lampe LED projeteur", "Maison"], ["Montre connectée", "Tech"],
      ["Tapis de yoga", "Sport"], ["Diffuseur d'huiles", "Maison"],
      ["Sac anti-vol", "Voyage"], ["Brosse dentaire sonique", "Santé"]
    ];
    let phase, briefs, shown, offers, choice, result;

    function reset() { phase = "idle"; briefs = []; shown = 0; offers = []; choice = null; result = null; render(); }

    function render() {
      container.innerHTML = "";
      container.appendChild(head("📦 Semaine dropship", "Workflow n8n : 14 briefs + scoring produits IA"));
      if (phase === "idle" || phase === "briefs") {
        const grid = el("div", "dm-briefs");
        for (let i = 0; i < 14; i++) {
          const on = i < shown;
          grid.insertAdjacentHTML("beforeend", '<div class="dm-brief' + (on ? " on" : "") + '">' + (on ? esc(briefs[i]) : "J" + (Math.floor(i / 2) + 1)) + "</div>");
        }
        container.appendChild(grid);
        container.appendChild(el("div", "dm-progress-note", shown + " / 14 briefs générés (2 par jour)"));
      }
      if (phase === "scoring" || phase === "choose" || phase === "done") {
        const grid = el("div", "dm-offers");
        offers.forEach((o, i) => {
          const cls = choice === i ? "sel" : "";
          const disabled = phase === "done" ? "disabled" : "";
          grid.insertAdjacentHTML(
            "beforeend",
            '<button class="dm-offer ' + cls + '" data-i="' + i + '" ' + disabled + '>' +
            '<span class="dm-offer-n">' + esc(o.n) + "</span>" +
            '<span class="dm-offer-c">' + esc(o.c) + "</span>" +
            '<div class="dm-bar"><i style="width:' + o.score + "%;background:" + (o.score >= 70 ? ac : "#ef4444") + '"></i></div>' +
            '<span class="dm-offer-s">Score IA : ' + o.score + "</span></button>"
          );
        });
        container.appendChild(grid);
        grid.addEventListener("click", (e) => {
          const b = e.target.closest(".dm-offer");
          if (!b || phase === "done") return;
          choice = +b.dataset.i;
          const o = offers[choice];
          const roas = (o.score / 100) * rnd(1.6, 3.4);
          result = roas >= 2;
          result
            ? (result = " ROAS " + roas.toFixed(1) + "× — le produit est scalable !")
            : (result = " ROAS " + roas.toFixed(1) + "× — on coupe la pub (garde-fou budget).");
          phase = "done";
          render();
        });
      }
      if (result) container.appendChild(el("div", "dm-banner " + (result.indexOf("scalable") > -1 ? "win" : "ko"), "📊 " + esc(result)));
      const row = el("div", "dm-actions");
      if (phase === "idle") {
        const b = el("button", "dm-btn primary", "▶ Lancer la semaine (n8n)");
        b.style.setProperty("--ac", ac);
        b.addEventListener("click", startWeek);
        row.appendChild(b);
      } else if (phase === "done") {
        const b = el("button", "dm-btn", "↺ Semaine suivante");
        b.addEventListener("click", reset);
        row.appendChild(b);
      } else if (phase === "briefs") {
        container.appendChild(el("div", "dm-dim", "Génération en cours…"));
      } else {
        container.appendChild(el("div", "dm-dim", "Choisis le produit à scaler (budget 100 000 F)."));
      }
      container.appendChild(row);
    }

    function startWeek() {
      briefs = []; for (let i = 0; i < 14; i++) briefs.push(pick(PRODUCTS)[0]);
      shown = 0; phase = "briefs"; render();
      ctx.every(140, () => {
        shown++;
        if (shown >= 14) {
          offers = [];
          const used = [];
          while (offers.length < 3) {
            const pr = pick(PRODUCTS);
            if (used.indexOf(pr[0]) === -1) { used.push(pr[0]); offers.push({ n: pr[0], c: pr[1], score: rndi(35, 95) }); }
          }
          phase = "scoring";
        }
        render();
      });
    }

    reset();
    return () => ctx.clear();
  }

  /* ------------------------------------------------------------------ */
  /* 5. AI-BOS — MFA TOTP + RLS                                         */
  /* ------------------------------------------------------------------ */
  function demoMfa(container, p) {
    const ac = p.accent || "#0ea5e9";
    const TABLES = {
      Owner: ["users", "orders", "billing", "audit_logs", "secrets"],
      Admin: ["users", "orders", "audit_logs"],
      Member: ["users"]
    };
    let role, code, input, step, shake;

    function reset() { role = null; code = String(rndi(100000, 999999)); input = ""; step = "role"; shake = false; render(); }

    function render() {
      container.innerHTML = "";
      container.appendChild(head("🔐 AI-BOS — Identité", "MFA TOTP + Row Level Security multi-tenant"));
      if (step === "role") {
        container.appendChild(el("div", "dm-dim", "Choisis ton rôle (RBAC) :"));
        const row = el("div", "dm-chips");
        ["Owner", "Admin", "Member"].forEach((r) => {
          const b = el("button", "dm-chip", r);
          b.addEventListener("click", () => { role = r; step = "totp"; render(); });
          row.appendChild(b);
        });
        container.appendChild(row);
      } else if (step === "totp") {
        container.appendChild(el("div", "dm-totp", "Code TOTP de test : <b>" + code + "</b>"));
        container.appendChild(el("div", "dm-dim", "Entre le code à 6 chiffres (l'authenticator simulé) :"));
        const wrap = el("div", "dm-totp-wrap" + (shake ? " shake" : ""));
        wrap.innerHTML = '<input class="dm-input" maxlength="6" inputmode="numeric" value="' + esc(input) + '" placeholder="••••••" />';
        const btn = el("button", "dm-btn primary", "Vérifier");
        btn.style.setProperty("--ac", ac);
        btn.addEventListener("click", check);
        wrap.appendChild(btn);
        container.appendChild(wrap);
        const inp = wrap.querySelector("input");
        inp.addEventListener("input", () => { input = inp.value.replace(/\D/g, "").slice(0, 6); inp.value = input; });
        inp.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
        setTimeout(() => inp.focus(), 30);
      } else {
        container.appendChild(el("div", "dm-banner win", "✅ Session ouverte — rôle <b>" + esc(role) + "</b> (refresh token actif)"));
        container.appendChild(el("div", "dm-dim", "Row Level Security — tables visibles pour ce rôle :"));
        const list = el("div", "dm-tables");
        ["users", "orders", "billing", "audit_logs", "secrets"].forEach((t) => {
          const ok = TABLES[role].indexOf(t) > -1;
          list.insertAdjacentHTML("beforeend", '<div class="dm-table ' + (ok ? "ok" : "ko") + '"><span>' + esc(t) + "</span><b>" + (ok ? "✓ 2 lignes visibles" : "✗ accès refusé (RLS)") + "</b></div>");
        });
        container.appendChild(list);
      }
      const row = el("div", "dm-actions");
      const b = el("button", "dm-btn", "↺ Recommencer");
      b.addEventListener("click", reset);
      row.appendChild(b);
      container.appendChild(row);

      function check() {
        if (input === code) { step = "rls"; }
        else { shake = true; setTimeout(() => { shake = false; render(); }, 400); render(); return; }
        render();
      }
    }

    reset();
    return () => {};
  }

  /* ------------------------------------------------------------------ */
  /* 6. ATEMI — mini boutique                                            */
  /* ------------------------------------------------------------------ */
  function demoShop(container, p) {
    const ac = p.accent || "#e11d48";
    const PRODUCTS = [
      { n: "Robe wax premium", p: 12000, c: "Mode" },
      { n: "Sneakers urban", p: 18000, c: "Mode" },
      { n: "Sac cuir tressé", p: 9500, c: "Accessoires" },
      { n: "Montre minimaliste", p: 15000, c: "Accessoires" },
      { n: "Foulard soie", p: 4000, c: "Accessoires" },
      { n: "Casquette brodée", p: 3500, c: "Mode" }
    ];
    let filter, cart, ordered;

    function reset() { filter = "Tout"; cart = {}; ordered = false; render(); }

    function render() {
      container.innerHTML = "";
      const n = Object.values(cart).reduce((s, q) => s + q, 0);
      container.appendChild(head("🛍️ ATEMI", "Boutique en ligne — catalogue, panier, commande"));
      const chips = el("div", "dm-chips");
      ["Tout", "Mode", "Accessoires"].forEach((c) => {
        const b = el("button", "dm-chip" + (filter === c ? " on" : ""), c);
        b.addEventListener("click", () => { filter = c; render(); });
        chips.appendChild(b);
      });
      chips.insertAdjacentHTML("beforeend", '<span class="dm-badge">🛒 ' + n + "</span>");
      container.appendChild(chips);
      const grid = el("div", "dm-shop");
      PRODUCTS.filter((x) => filter === "Tout" || x.c === filter).forEach((x) => {
        const idx = PRODUCTS.indexOf(x);
        grid.insertAdjacentHTML(
          "beforeend",
          '<div class="dm-product"><span class="dm-product-n">' + esc(x.n) + "</span>" +
          '<span class="dm-product-p">' + x.p.toLocaleString("fr-FR") + ' F</span>' +
          '<button class="dm-btn sm" data-i="' + idx + '">+ Ajouter</button></div>'
        );
      });
      grid.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-i]");
        if (!b) return;
        const i = +b.dataset.i;
        cart[i] = (cart[i] || 0) + 1;
        ordered = false;
        render();
      });
      container.appendChild(grid);
      const total = Object.keys(cart).reduce((s, i) => s + cart[i] * PRODUCTS[i].p, 0);
      container.appendChild(el("div", "dm-total", "<span>Total panier</span><b style=\"color:" + ac + '">' + total.toLocaleString("fr-FR") + " F</b>"));
      if (ordered) container.appendChild(el("div", "dm-banner win", "🎉 Merci ! Commande confirmée (démo) — le panier a été vidé."));
      const row = el("div", "dm-actions");
      const b1 = el("button", "dm-btn primary", "Passer commande");
      b1.style.setProperty("--ac", ac);
      b1.addEventListener("click", () => { if (n) { cart = {}; ordered = true; render(); } });
      const b2 = el("button", "dm-btn", "Vider");
      b2.addEventListener("click", reset);
      row.appendChild(b1); row.appendChild(b2);
      container.appendChild(row);
    }

    reset();
    return () => {};
  }

  /* ------------------------------------------------------------------ */
  /* 7. DiasporaConnect — onboarding + matching                         */
  /* ------------------------------------------------------------------ */
  function demoDiaspora(container, p) {
    const ctx = makeCtx();
    const ac = p.accent || "#F0A500";
    const STEPS = [
      { q: "Qui es-tu ?", k: "profil", opts: ["Étudiant", "Entrepreneur", "Professionnel"] },
      { q: "Où es-tu au Bénin ?", k: "ville", opts: ["Cotonou", "Porto-Novo", "Parakou"] },
      { q: "Tes centres d'intérêt ?", k: "interet", opts: ["Tech", "Food", "Voyage"] }
    ];
    const NAMES = ["Aïcha", "Koffi", "Fatima", "Serge", "Mariam", "Yoann", "Clarisse", "Ibrahim"];
    const BIOS = {
      Étudiant: "Étudiant en informatique, ouvert aux projets collab.",
      Entrepreneur: "Fondateur d'une startup logistique, cherche des alliés.",
      Professionnel: "Ingénieure en génie civil, projets infrastructure au Bénin."
    };
    let step, ans, matching, match;

    function reset() { step = 0; ans = {}; matching = false; match = null; render(); }

    function render() {
      container.innerHTML = "";
      container.appendChild(head("🌍 DiasporaConnect", "Onboarding 3 étapes → matching de compatriotes"));
      if (step < STEPS.length) {
        const s = STEPS[step];
        container.appendChild(el("div", "dm-q", esc(s.q)));
        const row = el("div", "dm-chips");
        s.opts.forEach((o) => {
          const b = el("button", "dm-chip" + (ans[s.k] === o ? " on" : ""), o);
          b.addEventListener("click", () => {
            ans[s.k] = o;
            step++;
            render();
          });
          row.appendChild(b);
        });
        container.appendChild(row);
        const prog = el("div", "dm-onb");
        STEPS.forEach((_, i) => prog.insertAdjacentHTML("beforeend", '<span class="dm-onb-bar' + (i <= step ? " on" : "") + '"></span>'));
        container.appendChild(prog);
      } else if (matching) {
        container.appendChild(el("div", "dm-matching", '<span class="dm-spinner"></span> L\'assistant IA analyse ton profil…'));
      } else if (match) {
        container.appendChild(el("div", "dm-banner win", "👋 Salut " + esc(match.me) + " ! Tu viens de " + esc(ans.profil) + ", tu es à " + esc(ans.ville) + "."));
        const grid = el("div", "dm-matches");
        match.people.forEach((pr) => {
          grid.insertAdjacentHTML(
            "beforeend",
            '<div class="dm-match"><span class="dm-av">' + esc(pr.av) + "</span><div><b>" + esc(pr.n) + "</b><span>" + esc(pr.bio) + "</span><em>" + esc(pr.city) + " · " + esc(pr.status) + "</em></div></div>"
          );
        });
        container.appendChild(grid);
        container.appendChild(el("div", "dm-tip", "💡 <b>Conseil de l'assistant :</b> " + esc(match.tip)));
      }
      const row = el("div", "dm-actions");
      const b = el("button", "dm-btn", step >= STEPS.length && !matching ? "↺ Refaire l'onboarding" : "← Retour");
      b.addEventListener("click", () => {
        if (step >= STEPS.length && !matching) reset();
        else { step = Math.max(0, step - 1); render(); }
      });
      row.appendChild(b);
      if (step === STEPS.length && !matching && !match) {
        const b2 = el("button", "dm-btn primary", "🚀 Rejoindre DiasporaConnect");
        b2.style.setProperty("--ac", ac);
        b2.addEventListener("click", join);
        row.appendChild(b2);
      }
      container.appendChild(row);
    }

    function join() {
      matching = true; render();
      ctx.later(900, () => {
        const shuffled = NAMES.slice().sort(() => Math.random() - 0.5).slice(0, 2);
        match = {
          me: ans.profil === "Étudiant" ? "l'étudiant" : ans.profil === "Entrepreneur" ? "l'entrepreneur" : "le/la professionnel(le)",
          people: shuffled.map((n, i) => ({
            n, av: n.slice(0, 2).toUpperCase(),
            bio: BIOS[ans.interet === "Tech" ? "Entrepreneur" : ans.profil] || BIOS.Professionnel,
            city: i === 0 ? ans.ville : pick(["Cotonou", "Ouidah", "Porto-Novo"]),
            status: pick(["il y a 1 j", "il y a 2 j", "en ligne"])
          })),
          tip: ans.ville === "Cotonou"
            ? "Rendez-vous ce week-end au marché de Dantokpa — plusieurs membres y passent."
            : "Rejoins le groupe " + ans.ville + " pour des afterworks mensuels."
        };
        matching = false; render();
      });
    }

    reset();
    return () => ctx.clear();
  }

  /* ------------------------------------------------------------------ */
  /* 8. Ifri Comotorage — simulateur de covoiturage                     */
  /* ------------------------------------------------------------------ */
  function demoCovoiturage(container, p) {
    const ac = p.accent || "#14b8a6";
    let km = 40, seats = 3, fuel = 650, shared = false;

    function render() {
      container.innerHTML = "";
      container.appendChild(head("🚗 Comotorage", "Simulateur de partage de trajet — coût, split, économie"));
      const cost = (km / 100) * 8 * fuel;
      const perSeat = cost / seats;
      const solo = cost;
      const saved = solo - perSeat;
      const sliders = el("div", "dm-sliders");
      sliders.innerHTML =
        '<label>Distance : <b>' + km + ' km</b><input type="range" min="5" max="200" value="' + km + '" data-k="km"></label>' +
        '<label>Passagers : <b>' + seats + '</b><input type="range" min="1" max="4" value="' + seats + '" data-k="seats"></label>' +
        '<label>Carburant : <b>' + fuel + ' F/L</b><input type="range" min="600" max="900" step="10" value="' + fuel + '" data-k="fuel"></label>';
      sliders.addEventListener("input", (e) => {
        const k = e.target.dataset.k;
        if (!k) return;
        if (k === "km") km = +e.target.value;
        if (k === "seats") { seats = +e.target.value; shared = false; }
        if (k === "fuel") fuel = +e.target.value;
        render();
      });
      container.appendChild(sliders);
      const road = el("div", "dm-road");
      let cars = '<span class="dm-car' + (shared ? " go" : "") + '">🚗</span>';
      for (let i = 1; i < seats; i++) cars += '<span class="dm-car2' + (shared ? " go" : "") + '" style="animation-delay:' + i * 0.15 + 's">🚙</span>';
      road.innerHTML = '<div class="dm-road-line"></div>' + cars;
      container.appendChild(road);
      const out = el("div", "dm-out");
      out.innerHTML =
        '<div class="dm-out-row"><span>Coût total du trajet</span><b>' + cost.toLocaleString("fr-FR") + ' F</b></div>' +
        '<div class="dm-out-row"><span>Coût par passager</span><b style="color:' + ac + '">' + perSeat.toLocaleString("fr-FR") + " F</b></div>" +
        (seats > 1 ? '<div class="dm-out-row"><span>Économie vs trajet solo</span><b style="color:#22c55e">' + saved.toLocaleString("fr-FR") + " F / personne</b></div>" : '<div class="dm-out-row dim"><span>Ajoute des passagers pour partager les frais</span></div>');
      container.appendChild(out);
      const row = el("div", "dm-actions");
      const b1 = el("button", "dm-btn primary", shared ? "✓ Trajet partagé" : "🤝 Partager le trajet");
      b1.style.setProperty("--ac", ac);
      b1.disabled = shared || seats < 2;
      b1.addEventListener("click", () => { shared = true; render(); });
      const b2 = el("button", "dm-btn", "↺ Reset");
      b2.addEventListener("click", () => { km = 40; seats = 3; fuel = 650; shared = false; render(); });
      row.appendChild(b1); row.appendChild(b2);
      container.appendChild(row);
    }

    render();
    return () => {};
  }

  /* ------------------------------------------------------------------ */
  /* 9. Trading Journal — mini journal RSI + Bollinger                  */
  /* ------------------------------------------------------------------ */
  function demoTrading(container, p) {
    const ctx = makeCtx();
    const ac = p.accent || "#22c55e";
    const W = 320, H = 110;
    let price, hist, pos, trades, equity, tickN, msg, rsi;
    let canvas, c2d, tickId = null;

    function reset() {
      price = 1.0850; hist = [price]; pos = null; trades = []; equity = 100; tickN = 0; msg = "";
      render();
      startTick();
    }

    function startTick() {
      if (tickId) clearInterval(tickId);
      tickId = ctx.every(750, () => {
        price += rnd(-0.0016, 0.0016) + Math.sin(tickN / 9) * 0.0004;
        hist.push(price);
        if (hist.length > 90) hist.shift();
        tickN++;
        rsi = 50 + Math.sin(tickN / 7) * 32 + rnd(-8, 8);
        rsi = Math.max(2, Math.min(98, rsi));
        if (pos && tickN % 8 === 0) closePos("timeout");
        draw();
        updateReadouts();
      });
    }

    function closePos(reason) {
      if (!pos) return;
      const pips = (price - pos.entry) * (pos.side === "long" ? 1 : -1) * 10000;
      const won = pips >= 0;
      equity = Math.max(0, equity + pips * 0.5);
      trades.push({ side: pos.side, pips, won });
      msg = (won ? "✅ +" : "❌ ") + pips.toFixed(1) + " pips (" + pos.side + (reason === "timeout" ? ", clotûre auto" : "") + ")";
      pos = null;
      render();
    }

    function act(side) {
      if (pos && pos.side === side) return closePos("manual");
      if (pos) closePos("switch");
      pos = { side, entry: price };
      msg = (side === "long" ? "📈 Position ACHAT ouverte @ " : "📉 Position VENTE ouverte @ ") + price.toFixed(4);
      render();
    }

    function render() {
      container.innerHTML = "";
      container.appendChild(head("📈 Trading Journal", "EURUSD — RSI + Bollinger (démo jouable)"));
      canvas = el("canvas", "dm-canvas");
      canvas.width = W * 2; canvas.height = H * 2;
      canvas.style.width = "100%";
      canvas.style.height = H + "px";
      container.appendChild(canvas);
      c2d = canvas.getContext("2d");
      c2d.scale(2, 2);
      draw();
      const info = el("div", "dm-trade-info");
      info.innerHTML =
        '<span>Prix <b class="ro-price">' + price.toFixed(4) + "</b></span>" +
        '<span>RSI <b class="ro-rsi">' + (rsi || 50).toFixed(0) + "</b></span>" +
        '<span>Équity <b class="ro-eq" style="color:' + ac + '">' + equity.toFixed(1) + "</b></span>" +
        '<span>Trades <b class="ro-tr">' + trades.length + "/8</b></span>";
      container.appendChild(info);
      if (pos) container.appendChild(el("div", "dm-banner", "Position ouverte : <b>" + pos.side.toUpperCase() + "</b> @ " + pos.entry.toFixed(4) + " — re-clique pour clôturer"));
      if (msg) container.appendChild(el("div", "dm-banner " + (msg.indexOf("✅") === 0 ? "win" : msg.indexOf("❌") === 0 ? "ko" : ""), esc(msg)));
      if (trades.length >= 8) {
        const wins = trades.filter((t) => t.won).length;
        container.appendChild(el("div", "dm-banner " + (wins >= 5 ? "win" : "ko"), "🏁 Session terminée — " + wins + "/8 gagnants, équité finale " + equity.toFixed(1)));
      }
      const row = el("div", "dm-actions");
      if (trades.length >= 8) {
        const b = el("button", "dm-btn", "↺ Nouvelle session");
        b.addEventListener("click", () => { if (tickId) clearInterval(tickId); reset(); });
        row.appendChild(b);
      } else {
        const bl = el("button", "dm-btn long", "📈 Achat");
        bl.addEventListener("click", () => act("long"));
        const bs = el("button", "dm-btn short", "📉 Vente");
        bs.addEventListener("click", () => act("short"));
        row.appendChild(bl); row.appendChild(bs);
      }
      container.appendChild(row);
    }

    function updateReadouts() {
      const q = (s) => container.querySelector(s);
      if (q(".ro-price")) q(".ro-price").textContent = price.toFixed(4);
      if (q(".ro-rsi")) q(".ro-rsi").textContent = rsi.toFixed(0);
      if (q(".ro-eq")) q(".ro-eq").textContent = equity.toFixed(1);
      if (q(".ro-tr")) q(".ro-tr").textContent = trades.length + "/8";
    }

    function draw() {
      if (!c2d) return;
      c2d.clearRect(0, 0, W, H);
      const min = Math.min.apply(null, hist), max = Math.max.apply(null, hist);
      const span = max - min || 0.001;
      const y = (v) => H - 8 - ((v - min) / span) * (H - 16);
      const x = (i) => (i / (hist.length - 1 || 1)) * W;
      // Bollinger-ish band
      c2d.strokeStyle = "rgba(255,255,255,.12)";
      c2d.setLineDash([4, 4]);
      const mid = hist.reduce((s, v) => s + v, 0) / hist.length;
      c2d.beginPath(); c2d.moveTo(0, y(mid + span * 0.18)); c2d.lineTo(W, y(mid + span * 0.18)); c2d.stroke();
      c2d.beginPath(); c2d.moveTo(0, y(mid - span * 0.18)); c2d.lineTo(W, y(mid - span * 0.18)); c2d.stroke();
      c2d.setLineDash([]);
      // price line
      c2d.strokeStyle = ac;
      c2d.lineWidth = 1.6;
      c2d.beginPath();
      hist.forEach((v, i) => (i ? c2d.lineTo(x(i), y(v)) : c2d.moveTo(x(i), y(v))));
      c2d.stroke();
      // glow dot
      const last = hist[hist.length - 1];
      c2d.fillStyle = ac;
      c2d.beginPath(); c2d.arc(x(hist.length - 1), y(last), 3, 0, Math.PI * 2); c2d.fill();
      // entry marker
      if (pos) {
        c2d.fillStyle = pos.side === "long" ? "#22c55e" : "#ef4444";
        c2d.beginPath(); c2d.arc(W - 6, y(pos.entry), 4, 0, Math.PI * 2); c2d.fill();
      }
    }

    reset();
    return () => { if (tickId) clearInterval(tickId); ctx.clear(); };
  }

  /* ------------------------------------------------------------------ */
  /* Fallback — pipeline générique                                      */
  /* ------------------------------------------------------------------ */
  function demoFallback(container, p) {
    const ctx = makeCtx();
    const ac = p.accent || "#6366f1";
    const STAGES = ["npm install", "build", "tests", "déploiement"];
    let prog, i, run, tid = null;

    function reset() { prog = [0, 0, 0, 0]; i = 0; run = false; render(); }

    function render() {
      container.innerHTML = "";
      container.appendChild(head("⚙️ Aperçu interactif", "Pipeline de démonstration pour « " + (p.title || "projet") + " »"));
      const box = el("div", "dm-stages");
      STAGES.forEach((s, k) => {
        box.insertAdjacentHTML("beforeend", '<div class="dm-stage"><div class="dm-stage-top"><span>' + esc(s) + "</span><b>" + Math.round(prog[k]) + '%</b></div><div class="dm-bar"><i style="width:' + prog[k] + "%;background:" + ac + '"></i></div></div>');
      });
      container.appendChild(box);
      const row = el("div", "dm-actions");
      const b = el("button", "dm-btn primary", run ? "⏳ En cours…" : prog[3] >= 100 ? "↺ Relancer" : "▶ Exécuter");
      b.style.setProperty("--ac", ac);
      b.disabled = run;
      b.addEventListener("click", start);
      row.appendChild(b);
      container.appendChild(row);
    }

    function start() {
      if (run) return;
      if (prog[3] >= 100) reset();
      run = true; render();
      tid = ctx.every(80, () => {
        prog[i] = Math.min(100, prog[i] + rnd(4, 11));
        if (prog[i] >= 100) i++;
        if (i >= STAGES.length) {
          clearInterval(tid); run = false;
          container.querySelector(".dm-actions").innerHTML = '<div class="dm-banner win">✅ Déployé avec succès — projet prêt.</div>';
          const b = el("button", "dm-btn", "↺ Relancer");
          b.addEventListener("click", () => { reset(); start(); });
          container.querySelector(".dm-actions").appendChild(b);
          return;
        }
        render();
      });
    }

    reset();
    return () => { if (tid) clearInterval(tid); ctx.clear(); };
  }

  /* ------------------------------------------------------------------ */
  /* Registry                                                            */
  /* ------------------------------------------------------------------ */
  const DEMOS = {
    launch: { title: "Mini-jeu : lancement produit IA", create: demoLaunch },
    video: { title: "Pipeline vidéo jouable", create: demoVideo },
    restaurant: { title: "Menu + panier WhatsApp", create: demoRestaurant },
    dropship: { title: "Semaine n8n : briefs & scoring", create: demoDropship },
    mfa: { title: "MFA TOTP + RLS", create: demoMfa },
    shop: { title: "Boutique : catalogue & panier", create: demoShop },
    diaspora: { title: "Onboarding & matching IA", create: demoDiaspora },
    covoiturage: { title: "Simulateur de covoiturage", create: demoCovoiturage },
    trading: { title: "Journal de trade RSI/Bollinger", create: demoTrading },
    fallback: { title: "Pipeline générique", create: demoFallback }
  };

  let current = { destroy: null, name: null };

  window.Demos = {
    registry: DEMOS,
    list() { return Object.keys(DEMOS).filter((k) => k !== "fallback"); },
    mount(name, container, project) {
      window.Demos.unmount();
      const def = DEMOS[name] || DEMOS.fallback;
      const destroy = def.create(container, project || {}) || (() => {});
      current = { destroy, name };
      return def.title;
    },
    unmount() {
      if (current.destroy) { try { current.destroy(); } catch (e) { /* noop */ } }
      current = { destroy: null, name: null };
    },
    has(name) { return !!DEMOS[name]; }
  };
})();
