(function () {
  "use strict";

  const STORAGE_KEY = "portfolio:projects:v1";
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const listeners = [];
  let projects = [];

  function defaults() {
    return clone(window.PROJECTS || []);
  }

  function normalize(p) {
    const out = Object.assign(
      {
        slug: "", title: "", category: "Divers", status: "", tagline: "", summary: "",
        challenge: "", solution: "", features: [], technologies: [], role: "",
        image: "", gallery: [], accent: "#6366f1", accent2: "#22d3ee",
        mockupType: "", mockup: false, demo: "", liveUrl: "", githubUrl: "",
        localPath: "", marketing: ""
      },
      p || {}
    );
    if (!out.slug) out.slug = slugify(out.title || "projet");
    ["features", "technologies", "gallery"].forEach((k) => {
      if (!Array.isArray(out[k])) out[k] = out[k] ? String(out[k]).split(",").map((s) => s.trim()).filter(Boolean) : [];
    });
    return out;
  }

  function slugify(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "projet";
  }

  function uniqueSlug(base, ignore) {
    let slug = base || "projet";
    let n = 2;
    while (projects.some((p) => p.slug === slug && p !== ignore)) slug = base + "-" + n++;
    return slug;
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch (e) { /* quota */ }
  }

  function emit() {
    listeners.forEach((cb) => { try { cb(getAll()); } catch (e) { console.error(e); } });
  }

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          projects = parsed.map(normalize);
          return;
        }
      } catch (e) { /* corrupted → defaults */ }
    }
    projects = defaults().map(normalize);
  }

  function getAll() { return projects.slice(); }

  function getBySlug(slug) { return projects.find((p) => p.slug === slug) || null; }

  function getByIndex(i) { return projects[i] || null; }

  function indexOf(slug) { return projects.findIndex((p) => p.slug === slug); }

  function add(data) {
    const p = normalize(data);
    p.slug = uniqueSlug(slugify(p.title));
    projects.push(p);
    persist(); emit();
    return p;
  }

  function update(slug, data) {
    const i = indexOf(slug);
    if (i === -1) return null;
    const merged = normalize(Object.assign({}, projects[i], data));
    merged.slug = uniqueSlug(slugify(merged.title || slug), merged);
    projects[i] = merged;
    persist(); emit();
    return merged;
  }

  function remove(slug) {
    const i = indexOf(slug);
    if (i === -1) return false;
    projects.splice(i, 1);
    persist(); emit();
    return true;
  }

  function move(slug, dir) {
    const i = indexOf(slug);
    const j = i + dir;
    if (i === -1 || j < 0 || j >= projects.length) return false;
    const tmp = projects[i];
    projects[i] = projects[j];
    projects[j] = tmp;
    persist(); emit();
    return true;
  }

  function reset() {
    projects = defaults().map(normalize);
    persist(); emit();
    return projects.length;
  }

  function exportJSON() {
    return JSON.stringify(projects, null, 2);
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportFile() { download("portfolio-projects-export.json", exportJSON()); }

  function importJSON(input) {
    let data = input;
    if (typeof input === "string") {
      try { data = JSON.parse(input); } catch (e) { throw new Error("JSON invalide : " + e.message); }
    }
    if (!Array.isArray(data)) throw new Error("Le fichier doit contenir un tableau de projets.");
    if (!data.length) throw new Error("Aucun projet dans le fichier.");
    const cleaned = data.map(normalize);
    cleaned.forEach((p) => { p.slug = uniqueSlug(slugify(p.title)); });
    projects = cleaned;
    persist(); emit();
    return projects.length;
  }

  function importFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => { try { resolve(importJSON(String(reader.result))); } catch (e) { reject(e); } };
      reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
      reader.readAsText(file);
    });
  }

  function subscribe(cb) {
    if (typeof cb === "function") listeners.push(cb);
    return () => { const i = listeners.indexOf(cb); if (i > -1) listeners.splice(i, 1); };
  }

  load();

  window.Store = {
    getAll, getBySlug, getByIndex, indexOf, add, update, remove, move,
    reset, exportJSON, exportFile, importJSON, importFile, subscribe, slugify, normalize
  };
})();
