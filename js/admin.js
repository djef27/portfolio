(function () {
  "use strict";

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const SITE = window.SITE || {};
  const STORE = () => window.Store;
  const DEMOS = () => window.Demos;

  const KEY_UNLOCK = "portfolio:admin:unlocked";
  let root = null;
  let open = false;
  let editingSlug = null; // null = liste, string = édition, "new" = création
  let lastFocused = null;

  function unlocked() {
    try { return sessionStorage.getItem(KEY_UNLOCK) === "1"; } catch (e) { return false; }
  }
  function unlock() {
    try { sessionStorage.setItem(KEY_UNLOCK, "1"); } catch (e) { /* noop */ }
  }
  function lock() {
    try { sessionStorage.removeItem(KEY_UNLOCK); } catch (e) { /* noop */ }
  }

  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function ensureRoot() {
    if (root) return root;
    root = document.createElement("div");
    root.id = "admin";
    root.setAttribute("aria-hidden", "true");
    document.body.appendChild(root);
    return root;
  }

  /* ---------------- lock screen ---------------- */
  function renderLock() {
    const r = ensureRoot();
    r.innerHTML =
      '<div class="adm-backdrop"></div>' +
      '<div class="adm-lock" role="dialog" aria-modal="true" aria-label="Accès administration">' +
      '<button class="adm-close" data-close aria-label="Fermer">✕</button>' +
      '<div class="adm-lock-icon">🔐</div>' +
      "<h2>Administration du portfolio</h2>" +
      "<p>Entre le mot de passe pour gérer les projets (ajout, mise à jour, suppression).</p>" +
      '<input class="adm-input adm-pass" type="password" placeholder="Mot de passe" autocomplete="off" />' +
      '<button class="adm-btn primary adm-go">Déverrouiller</button>' +
      '<p class="adm-hint">Astuce : raccourci <b>Ctrl + Maj + A</b> ou URL <b>#admin</b></p>' +
      "</div>";
    r.classList.add("open");
    r.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    const input = $(".adm-pass", r);
    setTimeout(() => input && input.focus(), 60);
    const tryUnlock = () => {
      const pass = SITE.adminPassword || "fabien2026";
      if (input.value === pass) {
        unlock();
        renderPanel();
      } else {
        input.value = "";
        input.placeholder = "Mot de passe incorrect";
        input.classList.add("err");
        setTimeout(() => input.classList.remove("err"), 600);
      }
    };
    $(".adm-go", r).addEventListener("click", tryUnlock);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") tryUnlock(); });
  }

  /* ---------------- panel ---------------- */
  function renderPanel() {
    const r = ensureRoot();
    const projects = STORE().getAll();
    r.innerHTML =
      '<div class="adm-backdrop"></div>' +
      '<div class="adm-panel" role="dialog" aria-modal="true" aria-label="Panneau d\'administration">' +
      '<header class="adm-head">' +
      "<div><h2>🛠️ Administration — Projets</h2><p>" + projects.length + " projet(s) · sauvegarde locale du navigateur</p></div>" +
      '<div class="adm-head-actions">' +
      '<button class="adm-btn" data-act="export">⬇ Exporter JSON</button>' +
      '<button class="adm-btn" data-act="import">⬆ Importer JSON</button>' +
      '<button class="adm-btn warn" data-act="reset">↺ Réinitialiser</button>' +
      '<button class="adm-btn ghost" data-act="lock">🔒</button>' +
      '<button class="adm-close" data-close aria-label="Fermer">✕</button>' +
      "</div></header>" +
      '<div class="adm-body">' +
      '<aside class="adm-list" id="admList"></aside>' +
      '<section class="adm-form" id="admForm"></section>' +
      "</div></div>";
    r.classList.add("open");
    r.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");

    renderList();
    if (editingSlug === "new") renderForm(STORE().normalize({}));
    else if (editingSlug) renderForm(STORE().getBySlug(editingSlug) || STORE().normalize({}));
    else renderEmpty();

    r.addEventListener("click", onPanelClick);
  }

  function renderEmpty() {
    $("#admForm").innerHTML =
      '<div class="adm-empty"><div class="adm-empty-icon">📋</div><h3>Sélectionne un projet</h3>' +
      "<p>Clique sur un projet de la liste pour le modifier, ou crée-en un nouveau.</p>" +
      '<button class="adm-btn primary" data-act="new">+ Ajouter un projet</button></div>';
  }

  function renderList() {
    const list = $("#admList");
    if (!list) return;
    const projects = STORE().getAll();
    list.innerHTML =
      '<button class="adm-btn primary adm-add" data-act="new">+ Ajouter un projet</button>' +
      projects
        .map(
          (p, i) =>
            '<div class="adm-item' + (editingSlug === p.slug ? " on" : "") + '" data-slug="' + esc(p.slug) + '">' +
            '<div class="adm-item-info"><b>' + esc(p.title || "(sans titre)") + "</b><span>" + esc(p.category) + "</span></div>" +
            '<div class="adm-item-actions">' +
            '<button data-act="up" title="Monter">↑</button>' +
            '<button data-act="down" title="Descendre">↓</button>' +
            '<button data-act="edit" title="Modifier">✎</button>' +
            '<button data-act="del" title="Supprimer" class="danger">🗑</button>' +
            "</div></div>"
        )
        .join("");
  }

  function field(label, name, value, opts) {
    opts = opts || {};
    if (opts.textarea) {
      const v = Array.isArray(value) ? value.join("\n") : value || "";
      return '<label class="adm-field"><span>' + esc(label) + '</span><textarea name="' + name + '" rows="' + (opts.rows || 3) + '">' + esc(v) + "</textarea></label>";
    }
    if (opts.color) {
      return '<label class="adm-field adm-field-color"><span>' + esc(label) + '</span><input type="color" name="' + name + '" value="' + esc(value || "#6366f1") + '" /></label>';
    }
    if (opts.select) {
      return (
        '<label class="adm-field"><span>' + esc(label) + '</span><select name="' + name + '">' +
        opts.select.map((o) => '<option value="' + esc(o) + '"' + (o === value ? " selected" : "") + ">" + esc(o || "— aucune —") + "</option>").join("") +
        "</select></label>"
      );
    }
    if (opts.check) {
      return '<label class="adm-field adm-field-check"><input type="checkbox" name="' + name + '"' + (value ? " checked" : "") + " /><span>" + esc(label) + "</span></label>";
    }
    return '<label class="adm-field"><span>' + esc(label) + '</span><input type="text" name="' + name + '" value="' + esc(value || "") + '" /></label>';
  }

  function renderForm(p) {
    const form = $("#admForm");
    if (!form) return;
    const isNew = editingSlug === "new";
    const demoList = [""].concat(DEMOS() ? DEMOS().list() : []);
    form.innerHTML =
      '<form id="admEdit" autocomplete="off">' +
      '<div class="adm-form-head"><h3>' + (isNew ? "➕ Nouveau projet" : "✎ Modifier : " + esc(p.title)) + "</h3></div>" +
      '<div class="adm-grid">' +
      field("Titre *", "title", p.title) +
      field("Catégorie *", "category", p.category) +
      field("Statut", "status", p.status) +
      field("Slug", "slug", p.slug) +
      field("Tagline *", "tagline", p.tagline, { textarea: true, rows: 2 }) +
      field("Résumé", "summary", p.summary, { textarea: true, rows: 3 }) +
      field("Besoin / challenge", "challenge", p.challenge, { textarea: true, rows: 2 }) +
      field("Solution", "solution", p.solution, { textarea: true, rows: 2 }) +
      field("Fonctionnalités (1 par ligne)", "features", p.features, { textarea: true, rows: 4 }) +
      field("Technologies (1 par ligne)", "technologies", p.technologies, { textarea: true, rows: 3 }) +
      field("Rôle", "role", p.role) +
      field("Marketing / accroche", "marketing", p.marketing, { textarea: true, rows: 2 }) +
      field("Image de couverture (chemin)", "image", p.image) +
      field("Galerie (1 chemin par ligne)", "gallery", p.gallery, { textarea: true, rows: 2 }) +
      field("Démo jouable", "demo", p.demo, { select: demoList }) +
      field("Couleur accent", "accent", p.accent, { color: true }) +
      field("Couleur accent 2", "accent2", p.accent2, { color: true }) +
      field("Lien démo live", "liveUrl", p.liveUrl) +
      field("Lien GitHub", "githubUrl", p.githubUrl) +
      field("Repo local (info propriétaire)", "localPath", p.localPath) +
      field("Afficher le badge « UI Render »", "mockup", p.mockup, { check: true }) +
      "</div>" +
      '<div class="adm-form-actions">' +
      '<button type="submit" class="adm-btn primary">' + (isNew ? "➕ Créer le projet" : "💾 Enregistrer") + "</button>" +
      '<button type="button" class="adm-btn" data-act="cancel">Annuler</button>' +
      "</div></form>";

    $("#admEdit").addEventListener("submit", (e) => {
      e.preventDefault();
      saveForm(new FormData(e.target), p);
    });
    setTimeout(() => { const t = form.querySelector('input[name="title"]'); if (t) t.focus(); }, 40);
  }

  function lines(v) {
    return String(v || "").split("\n").map((s) => s.trim()).filter(Boolean);
  }

  function saveForm(fd, original) {
    const data = {
      title: (fd.get("title") || "").toString().trim(),
      category: (fd.get("category") || "").toString().trim() || "Divers",
      status: (fd.get("status") || "").toString().trim(),
      tagline: (fd.get("tagline") || "").toString().trim(),
      summary: (fd.get("summary") || "").toString().trim(),
      challenge: (fd.get("challenge") || "").toString().trim(),
      solution: (fd.get("solution") || "").toString().trim(),
      features: lines(fd.get("features")),
      technologies: lines(fd.get("technologies")),
      role: (fd.get("role") || "").toString().trim(),
      marketing: (fd.get("marketing") || "").toString().trim(),
      image: (fd.get("image") || "").toString().trim(),
      gallery: lines(fd.get("gallery")),
      demo: (fd.get("demo") || "").toString().trim(),
      accent: (fd.get("accent") || "#6366f1").toString(),
      accent2: (fd.get("accent2") || "#22d3ee").toString(),
      liveUrl: (fd.get("liveUrl") || "").toString().trim(),
      githubUrl: (fd.get("githubUrl") || "").toString().trim(),
      localPath: (fd.get("localPath") || "").toString().trim(),
      mockup: !!fd.get("mockup")
    };
    const slugField = (fd.get("slug") || "").toString().trim();
    if (slugField) data.slug = slugField;
    if (!data.title) return toast("⚠ Le titre est obligatoire.");
    if (!data.tagline) return toast("⚠ La tagline est obligatoire.");

    if (editingSlug === "new") {
      const created = STORE().add(data);
      editingSlug = created.slug;
      toast("✅ Projet « " + created.title + " » créé.");
    } else {
      const updated = STORE().update(original.slug, data);
      if (!updated) return toast("⚠ Projet introuvable.");
      editingSlug = updated.slug;
      toast("✅ Projet mis à jour.");
    }
    renderPanel();
  }

  /* ---------------- events ---------------- */
  function onPanelClick(e) {
    const t = e.target;
    if (t.closest("[data-close]")) return close();
    const actBtn = t.closest("[data-act]");
    const act = actBtn && actBtn.getAttribute("data-act");
    const item = t.closest(".adm-item");
    const slug = item && item.getAttribute("data-slug");

    if (act === "new") { editingSlug = "new"; return renderPanel(); }
    if (act === "cancel") { editingSlug = null; return renderPanel(); }
    if (act === "export") {
      STORE().exportFile();
      return toast("⬇ Export téléchargé (portfolio-projects-export.json).");
    }
    if (act === "import") return importFlow();
    if (act === "reset") {
      if (confirm("Réinitialiser TOUS les projets depuis data/projects.js ? Tes ajouts/modifications locales seront perdus.")) {
        STORE().reset();
        editingSlug = null;
        toast("↺ Projets réinitialisés.");
        renderPanel();
      }
      return;
    }
    if (act === "lock") { lock(); return renderLock(); }
    if (slug && act === "edit") { editingSlug = slug; return renderPanel(); }
    if (slug && act === "up") { STORE().move(slug, -1); return renderList(); }
    if (slug && act === "down") { STORE().move(slug, 1); return renderList(); }
    if (slug && act === "del") {
      const p = STORE().getBySlug(slug);
      if (p && confirm("Supprimer définitivement « " + p.title + " » ?")) {
        STORE().remove(slug);
        if (editingSlug === slug) editingSlug = null;
        toast("🗑 Projet supprimé.");
        renderPanel();
      }
      return;
    }
    if (slug && !act) { editingSlug = slug; return renderPanel(); }
  }

  function importFlow() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", () => {
      const f = input.files && input.files[0];
      if (!f) return;
      STORE()
        .importFile(f)
        .then((n) => {
          editingSlug = null;
          toast("⬆ " + n + " projets importés.");
          renderPanel();
        })
        .catch((err) => toast("⚠ " + (err && err.message ? err.message : "Import impossible.")));
    });
    input.click();
  }

  function openAdmin() {
    if (open) return;
    open = true;
    lastFocused = document.activeElement;
    if (unlocked()) renderPanel();
    else renderLock();
  }

  function close() {
    if (!open) return;
    open = false;
    editingSlug = null;
    const r = ensureRoot();
    r.classList.remove("open");
    r.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function init() {
    if (init.done) return;
    init.done = true;
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        open ? close() : openAdmin();
      } else if (e.key === "Escape" && open) {
        close();
      }
    });
    if (location.hash === "#admin") setTimeout(openAdmin, 400);
    window.addEventListener("hashchange", () => { if (location.hash === "#admin") openAdmin(); });
  }

  window.Admin = { open: openAdmin, close, init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
