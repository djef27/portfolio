(function () {
  var ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    spark: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
    layers: '<path d="m12 2-9 5 9 5 9-5-9-5Z"/><path d="m3 12 9 5 9-5"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    write: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/>',
    log: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2M15 5l3 3"/>',
    server: '<rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><path d="M6 6.5h.01M6 17.5h.01"/>',
    play: '<path d="m6 3 14 9-14 9V3Z"/>',
    film: '<rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="M7 4v16M17 4v16M2 9h5M2 15h5M17 9h5M17 15h5"/>',
    tube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3V9Z"/>',
    signal: '<path d="M2 20h.01M6 20v-4M10 20v-8M14 20v-12M18 20V4"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/>',
    chat: '<path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    bolt: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 9v11h14V9"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    arch: '<path d="M3 17.5h18M3 17.5V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10.5M3 17.5l3 3M21 17.5l-3 3"/>',
    flow: '<circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12Z"/><path d="M4 22v-7"/>'
  };
  function inject(root) {
    (root || document).querySelectorAll("[data-ic]").forEach(function (el) {
      var k = el.getAttribute("data-ic");
      if (ICONS[k]) {
        el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[k] + "</svg>";
      }
    });
  }
  function activate() {
    var v = new URLSearchParams(location.search).get("view") || "cover";
    var target = document.getElementById("view-" + v);
    if (!target) target = document.getElementById("view-cover");
    document.querySelectorAll(".view").forEach(function (el) { el.classList.remove("active"); });
    if (target) target.classList.add("active");
    var w = document.getElementById("urlBar");
    if (w) w.textContent = location.origin + "/" + (document.body.getAttribute("data-app") || "") + (v === "cover" ? "" : "/" + v);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { inject(); activate(); });
  } else {
    inject(); activate();
  }
  if (new URLSearchParams(location.search).get("demo") === "1") {
    document.body.classList.add("demo");
    var bar = document.createElement("div");
    bar.className = "demo-bar";
    document.body.appendChild(bar);
    void bar.offsetWidth; document.body.classList.add("demo-run");
    var views = ["cover", "g1", "g2", "g3"];
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-nav]");
      if (!t) return;
      switchView(t.getAttribute("data-nav"));
    });
    function switchView(v) {
      var target = document.getElementById("view-" + v);
      if (!target) return;
      document.querySelectorAll(".view").forEach(function (el) { el.classList.add("demo-hide"); });
      target.classList.remove("demo-hide");
      target.classList.add("demo-show");
      var w = document.getElementById("urlBar");
      if (w) w.textContent = location.origin + "/" + (document.body.getAttribute("data-app") || "") + (v === "cover" ? "" : "/" + v);
    }
    var t = [0, 1800, 4800, 7800, 10800];
    views.forEach(function (v, i) { setTimeout(function () { switchView(v); }, t[i]); });
  }
  window.__mockReady = document.fonts ? document.fonts.ready : Promise.resolve();
})();