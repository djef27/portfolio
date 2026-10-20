(function () {
  "use strict";

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const SITE = window.SITE || {};
  const Store = window.Store;
  const Demos = window.Demos;

  let PROJECTS = Store ? Store.getAll() : window.PROJECTS || [];
  let visibleProjects = PROJECTS.slice();
  let activeCategory = "Tous";
  let currentIndex = 0;
  let activeTab = "overview";
  let lastFocused = null;

  const SKILLS = [
    {
      title: "Frontend",
      desc: "Interfaces modernes, responsives et interactives, pensées pour la conversion.",
      color: "#22d3ee",
      icon: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
      tags: ["React", "Next.js", "HTML5", "CSS3", "Tailwind", "JavaScript"]
    },
    {
      title: "Backend",
      desc: "APIs robustes, authentification, logique métier et architecture maintenable.",
      color: "#6366f1",
      icon: '<rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><path d="M6 6.5h.01M6 17.5h.01"/>',
      tags: ["NestJS", "Express", "Node.js", "TypeScript", "Prisma", "REST"]
    },
    {
      title: "IA & Automatisation",
      desc: "Intégrer l'IA dans vos produits et automatiser les tâches répétitives.",
      color: "#a855f7",
      icon: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
      tags: ["OpenAI", "Anthropic", "Gemini", "n8n", "Prompting", "Workflows"]
    },
    {
      title: "Data & Infra",
      desc: "Bases de données, files de jobs asynchrones et déploiement conteneurisé.",
      color: "#10b981",
      icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
      tags: ["PostgreSQL", "Redis", "Docker", "Temporal", "BullMQ", "Prisma"]
    }
  ];

  function techList() {
    return Array.from(
      new Set(
        PROJECTS.reduce((acc, p) => acc.concat(p.technologies || []), ["TypeScript", "React", "NestJS", "Next.js"])
      )
    );
  }

  function cover(p) {
    if (p.image) {
      return (
        '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy"' +
        (p.mockup ? ' class="mockup-img"' : "") + " />"
      );
    }
    const initials = String(p.title || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase();
    return (
      '<div class="project-cover" style="--pc:' + esc(p.accent || "#6366f1") + ';--pc2:' + esc(p.accent2 || "#22d3ee") + '">' +
      '<span class="project-cover-initials">' + esc(initials) + "</span>" +
      '<span class="project-cover-cat">' + esc(p.category || "") + "</span></div>"
    );
  }

  function applySite() {
    $$("[data-site]").forEach((el) => {
      const key = el.getAttribute("data-site");
      if (SITE[key] != null) el.textContent = SITE[key];
    });
    const emailLink = $("#contactEmail");
    if (emailLink && SITE.email) emailLink.setAttribute("href", "mailto:" + SITE.email);
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
    document.title = (SITE.name || "Portfolio") + " — " + (SITE.role || "Développeur");
    const services = $("#heroServices");
    if (services && SITE.services && SITE.services.length) {
      services.innerHTML = SITE.services.map((s) => '<span class="service-chip">' + esc(s) + "</span>").join("");
    }
  }

  function initTyped() {
    const el = $("#typed");
    if (!el) return;
    const words = SITE.roles && SITE.roles.length ? SITE.roles : [SITE.role || "Développeur"];
    let w = 0, c = 0, deleting = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.textContent = words[0]; return; }
    (function tick() {
      const word = words[w];
      el.textContent = word.slice(0, c);
      if (!deleting) {
        if (c < word.length) { c++; setTimeout(tick, 65); }
        else { deleting = true; setTimeout(tick, 1600); }
      } else {
        if (c > 0) { c--; setTimeout(tick, 30); }
        else { deleting = false; w = (w + 1) % words.length; setTimeout(tick, 320); }
      }
    })();
  }

  function initMarquee() {
    const track = $("#marqueeTrack");
    if (!track) return;
    const chips = techList().map((t) => '<span class="tech-chip">' + esc(t) + "</span>").join("");
    track.innerHTML = chips + chips;
  }

  function initSkills() {
    const grid = $("#skillsGrid");
    if (!grid) return;
    grid.innerHTML = SKILLS.map(
      (s, i) =>
        '<article class="skill-card reveal" data-delay="' + i * 70 + '" style="--sc:' + s.color + '">' +
        '<div class="skill-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + s.icon + "</svg></div>" +
        "<h3>" + esc(s.title) + "</h3>" +
        "<p>" + esc(s.desc) + "</p>" +
        '<div class="skill-tags">' + s.tags.map((t) => "<span>" + esc(t) + "</span>").join("") + "</div>" +
        "</article>"
    ).join("");
  }

  function renderFilters() {
    const wrap = $("#filterChips");
    if (!wrap) return;
    const cats = ["Tous"].concat(Array.from(new Set(PROJECTS.map((p) => p.category))));
    if (cats.indexOf(activeCategory) === -1) activeCategory = "Tous";
    wrap.innerHTML = cats
      .map((cat) => '<button class="filter' + (cat === activeCategory ? " active" : "") + '" role="tab" data-cat="' + esc(cat) + '">' + esc(cat) + "</button>")
      .join("");
  }

  function applyFilter() {
    visibleProjects =
      activeCategory === "Tous" ? PROJECTS.slice() : PROJECTS.filter((p) => p.category === activeCategory);
    renderProjects();
  }

  function techTags(list, max) {
    return (list || [])
      .slice(0, max || 4)
      .map((t) => "<span>" + esc(t) + "</span>")
      .join("");
  }

  function renderProjects() {
    const grid = $("#projectsGrid");
    if (!grid) return;
    if (!visibleProjects.length) {
      grid.innerHTML = '<div class="projects-empty">Aucun projet dans cette catégorie.</div>';
      return;
    }
    grid.innerHTML = visibleProjects
      .map((p, i) => {
        const idx = PROJECTS.indexOf(p);
        const demoBadge = p.demo && Demos && Demos.has(p.demo)
          ? '<span class="img-tag play">▶ Démo jouable</span>'
          : "";
        return (
          '<article class="project-card" data-index="' + idx + '" style="--pc:' + esc(p.accent) + ';animation-delay:' + i * 70 + 'ms">' +
          '<div class="project-media">' +
          cover(p) +
          (p.mockup ? '<span class="img-tag">UI Render</span>' : "") +
          demoBadge +
          '<div class="project-overlay"><span class="view-btn">Voir le projet' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div>' +
          "</div>" +
          '<div class="project-body">' +
          '<span class="project-cat">' + esc(p.category) + "</span>" +
          "<h3>" + esc(p.title) + "</h3>" +
          "<p>" + esc(p.tagline) + "</p>" +
          '<div class="project-tech">' + techTags(p.technologies, 4) + "</div>" +
          '<span class="project-more">Étude de cas complète' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
          "</div></article>"
        );
      })
      .join("");
  }

  function mockup(p, view) {
    const mc = p.accent;
    let body = "";
    if (view === "overview") {
      body =
        '<div class="mock-title"></div>' +
        '<div class="mock-row"><div class="mock-col acc"></div><div class="mock-col"></div><div class="mock-col"></div></div>' +
        '<div class="mock-chart"><span style="height:45%"></span><span style="height:75%"></span><span style="height:55%"></span><span style="height:90%"></span><span style="height:65%"></span><span style="height:80%"></span></div>' +
        '<div class="mock-line w80"></div><div class="mock-line w60"></div>';
    } else if (view === "board") {
      body =
        '<div class="mock-title"></div>' +
        '<div class="mock-line w80"></div><div class="mock-line w60"></div><div class="mock-line w45"></div>' +
        '<div class="mock-row"><div class="mock-col"></div><div class="mock-col acc"></div></div>' +
        '<div class="mock-line w80"></div><div class="mock-line w60"></div>';
    } else {
      body =
        '<div class="mock-title"></div>' +
        '<div class="mock-col acc" style="height:26px"></div>' +
        '<div class="mock-col" style="height:26px"></div>' +
        '<div class="mock-col" style="height:26px"></div>' +
        '<div class="mock-chart"><span style="height:60%"></span><span style="height:85%"></span><span style="height:50%"></span><span style="height:72%"></span></div>';
    }
    return (
      '<figure class="gallery-item" style="--mc:' + mc + '">' +
      '<div class="mock"><div class="mock-bar"><i></i><i></i><i></i><span>' + esc(p.slug) + ".app</span></div>" +
      '<div class="mock-body">' + body + "</div>" +
      '<figcaption class="mock-caption">' + esc(view === "overview" ? "Vue d'ensemble" : view === "board" ? "Tableau de bord" : "Interface principale") + "</figcaption>" +
      "</div></figure>"
    );
  }

  function tabOverview(p) {
    return (
      '<div class="case-grid">' +
      '<div class="case-block"><h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>Le besoin</h4><p>' + esc(p.challenge) + "</p></div>" +
      '<div class="case-block"><h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg>La solution</h4><p>' + esc(p.solution) + "</p></div>" +
      '<div class="case-block wide"><h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>Fonctionnalités clés</h4><ul class="feature-list">' +
      (p.features || []).map((f) => "<li>" + esc(f) + "</li>").join("") +
      "</ul></div></div>" +
      '<p class="marketing-line">« ' + esc(p.marketing) + " »</p>"
    );
  }

  function tabGallery(p) {
    const note = p.mockup && p.image
      ? '<p class="gallery-note">UI renders du projet — remplaçables par des captures de production sur demande.</p>'
      : "";
    let body;
    if (p.gallery && p.gallery.length) {
      body =
        '<div class="gallery-grid real">' +
        p.gallery
          .map(
            (src, i) =>
              '<figure class="gallery-shot"><img src="' + esc(src) + '" alt="' + esc(p.title) + " — vue " + (i + 1) + '" loading="lazy" /></figure>'
          )
          .join("") +
        "</div>";
    } else {
      body = '<div class="gallery-grid">' + mockup(p, "overview") + mockup(p, "board") + mockup(p, "form") + "</div>";
    }
    return note + body;
  }

  function tabDemo(p, holder) {
    const name = p.demo || "";
    const has = Demos && Demos.has(name);
    const title = Demos && has ? Demos.registry[name].title : "Aperçu interactif";
    const note = has
      ? ""
      : '<p class="gallery-note">Pas de démo dédiée pour ce projet — voici un aperçu interactif générique.</p>';
    holder.innerHTML = note + '<div class="demo-frame" style="--pc:' + esc(p.accent) + '"><div class="demo-mount" id="demoMount"></div></div>';
    if (Demos) {
      const mount = $("#demoMount", holder);
      Demos.mount(has ? name : "fallback", mount, p);
    }
    return title;
  }

  function tabSpecs(p) {
    const links = [];
    if (p.liveUrl) links.push('<a class="btn btn-primary btn-sm" href="' + esc(p.liveUrl) + '" target="_blank" rel="noopener">Voir la démo</a>');
    if (p.githubUrl) links.push('<a class="btn btn-ghost btn-sm" href="' + esc(p.githubUrl) + '" target="_blank" rel="noopener">Code source (GitHub)</a>');
    if (!links.length) links.push('<span class="btn btn-ghost btn-sm" style="cursor:default;opacity:.7">Code source disponible sur demande</span>');
    return (
      '<div class="spec-grid">' +
      '<div class="spec-block"><h4>Technologies</h4><div class="spec-tech">' + (p.technologies || []).map((t) => "<span>" + esc(t) + "</span>").join("") + "</div></div>" +
      '<div class="spec-block"><h4>Informations</h4><dl class="spec-dl">' +
      "<div><dt>Catégorie</dt><dd>" + esc(p.category) + "</dd></div>" +
      (p.status ? "<div><dt>Statut</dt><dd>" + esc(p.status) + "</dd></div>" : "") +
      "<div><dt>Rôle</dt><dd>" + esc(p.role) + "</dd></div>" +
      "<div><dt>Type</dt><dd>Projet personnel / freelance</dd></div>" +
      (p.localPath ? "<div><dt>Repo local</dt><dd class=\"mono small\">" + esc(p.localPath) + "</dd></div>" : "") +
      "</dl></div>" +
      '<div class="spec-block wide"><h4>Liens</h4><div class="spec-links">' + links.join("") + "</div></div>" +
      "</div>"
    );
  }

  function renderTab() {
    const p = PROJECTS[currentIndex];
    const content = $("#modalContent");
    if (!p || !content) return;
    if (Demos) Demos.unmount();
    content.classList.remove("fade");
    void content.offsetWidth;
    let html;
    if (activeTab === "demo") {
      html = "";
      content.innerHTML = "";
      const sub = document.createElement("div");
      content.appendChild(sub);
      tabDemo(p, sub);
    } else {
      html = activeTab === "gallery" ? tabGallery(p) : activeTab === "specs" ? tabSpecs(p) : tabOverview(p);
      content.innerHTML = html;
    }
    content.classList.add("fade");
    $$("#modalTabs .tab").forEach((t) => t.classList.toggle("active", t.getAttribute("data-tab") === activeTab));
  }

  function renderModal() {
    const p = PROJECTS[currentIndex];
    if (!p) return;
    $("#modalTitle").textContent = p.title;
    $("#modalTagline").textContent = p.tagline;
    $("#modalCategory").textContent = p.category;
    $("#modalHero").innerHTML =
      cover(p) +
      (p.mockup && p.image ? '<span class="img-tag">UI Render</span>' : "") +
      '<span class="modal-category" id="modalCategory">' + esc(p.category) + "</span>";
    $("#modalHero").style.setProperty("--pc", p.accent);
    $("#projCount").textContent = currentIndex + 1 + " / " + PROJECTS.length;
    renderTab();
  }

  function openModal(index) {
    currentIndex = index;
    activeTab = "overview";
    lastFocused = document.activeElement;
    const modal = $("#modal");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    renderModal();
    setTimeout(() => $("#modalClose").focus(), 60);
  }

  function closeModal() {
    const modal = $("#modal");
    if (Demos) Demos.unmount();
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function step(dir) {
    currentIndex = (currentIndex + dir + PROJECTS.length) % PROJECTS.length;
    activeTab = "overview";
    renderModal();
  }

  function initModal() {
    const modal = $("#modal");
    document.addEventListener("click", (e) => {
      const card = e.target.closest(".project-card");
      if (card) { openModal(Number(card.getAttribute("data-index"))); return; }
      if (e.target.closest("[data-close]")) closeModal();
    });
    $("#modalTabs").addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      activeTab = tab.getAttribute("data-tab");
      renderTab();
    });
    $("#prevProject").addEventListener("click", () => step(-1));
    $("#nextProject").addEventListener("click", () => step(1));
    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "Tab") trapFocus(e, modal);
    });
  }

  function trapFocus(e, modal) {
    const focusable = $$('button, a[href], [tabindex]:not([tabindex="-1"])', modal).filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function initFilters() {
    const wrap = $("#filterChips");
    if (!wrap) return;
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      $$(".filter", wrap).forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-cat");
      applyFilter();
    });
  }

  function refreshAll() {
    PROJECTS = Store ? Store.getAll() : window.PROJECTS || [];
    const modal = $("#modal");
    if (modal && modal.classList.contains("open") && currentIndex >= PROJECTS.length) currentIndex = 0;
    renderFilters();
    applyFilter();
    initMarquee();
    if (modal && modal.classList.contains("open") && PROJECTS.length) renderModal();
    const counter = $("#projectsCount");
    if (counter) counter.textContent = PROJECTS.length + " projets";
  }

  function initStore() {
    if (!Store) return;
    Store.subscribe(refreshAll);
  }

  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const d = entry.target.getAttribute("data-delay") || 0;
            entry.target.style.transitionDelay = d + "ms";
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  function initScrollUI() {
    const progress = $("#progress");
    const nav = $("#nav");
    const links = $$(".nav-link");
    const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
    function onScroll() {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      if (progress) progress.style.width = scrolled * 100 + "%";
      if (nav) nav.classList.toggle("scrolled", h.scrollTop > 30);
      let active = null;
      sections.forEach((sec) => {
        if (sec.getBoundingClientRect().top <= 140) active = sec.id;
      });
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + active));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initMenu() {
    const toggle = $("#menuToggle");
    const menu = $("#navLinks");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest(".nav-link")) {
        menu.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initContact() {
    $$("[data-site='email']").forEach((el) => { if (SITE.email) el.textContent = SITE.email; });
    const copy = $("#copyEmail");
    const toast = $("#toast");
    if (copy && SITE.email) {
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(SITE.email);
          showToast("Email copié : " + SITE.email);
        } catch (err) {
          showToast(SITE.email);
        }
      });
    }
    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("show");
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
    }
    const socials = $("#socials");
    if (socials && SITE.links) {
      const labels = { github: "GitHub", fiverr: "Fiverr", upwork: "Upwork", linkedin: "LinkedIn" };
      const html = Object.keys(labels)
        .filter((k) => SITE.links[k])
        .map((k) => '<a class="social-link" href="' + esc(SITE.links[k]) + '" target="_blank" rel="noopener">' + labels[k] + "</a>")
        .join("");
      socials.innerHTML = html;
      if (!html) socials.style.display = "none";
    }
    const gh = SITE.links && SITE.links.github;
    if (!gh && socials) {
      const known = PROJECTS.map((p) => p.githubUrl).filter(Boolean);
      if (known.length) {
        socials.insertAdjacentHTML("beforeend", '<a class="social-link" href="' + esc(known[0]) + '" target="_blank" rel="noopener">GitHub</a>');
      }
    }
  }

  function init() {
    applySite();
    initStore();
    initTyped();
    initMarquee();
    initSkills();
    renderFilters();
    initFilters();
    renderProjects();
    initModal();
    initReveal();
    initScrollUI();
    initMenu();
    initContact();
    if (window.Admin && window.Admin.init) window.Admin.init();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
