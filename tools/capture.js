const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const ROOT = path.join(__dirname, "..");
const MOCK = path.join(ROOT, "mockups");
const OUT = path.join(ROOT, "mockups", "out");

const CHROME =
  process.env.CHROME ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const VIEWS = ["cover", "g1", "g2", "g3"];
const W = 1920;
const H = 1080;

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("usage: node capture.js <slug> [view]");
    process.exit(1);
  }
  const onlyView = process.argv[3] || null;
  const views = onlyView ? [onlyView] : VIEWS;
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
    args: [
      "--hide-scrollbars",
      "--force-color-profile=srgb",
      "--disable-lcd-text",
      "--no-sandbox",
    ],
  });

  for (const view of views) {
    const file = path.join(MOCK, slug, "index.html");
    if (!fs.existsSync(file)) {
      console.error("missing:", file);
      continue;
    }
    const page = await browser.newPage();
    const url = "file:///" + file.replace(/\\/g, "/") + "?view=" + view;
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluateHandle(() => window.__mockReady);
    await new Promise((r) => setTimeout(r, 350));
    const out = path.join(OUT, `${slug}-${view}.png`);
    const qa = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      const missingIcons = Array.from(document.querySelectorAll("[data-ic]")).filter(
        (el) => !el.querySelector("svg")
      ).length;
      const visible = Array.from(document.querySelectorAll(".view.active"))
        .map((v) => v.id)
        .join(",");
      const fonts = document.fonts
        ? Array.from(document.fonts).map((f) => f.family + ":" + f.status)
        : [];
      const textLen = body.innerText ? body.innerText.length : 0;
      const fams = ["Inter", "Space Grotesk", "JetBrains Mono"];
      const allFaces = document.fonts ? Array.from(document.fonts) : [];
      const fontReady = fams.map((f) => {
        const ok = allFaces.some((face) => face.family === f && face.status === "loaded");
        return f + (ok ? ":ok" : ":MISSING");
      });
      return {
        viewActive: visible,
        scrollW: root.scrollWidth,
        clientW: root.clientWidth,
        scrollH: root.scrollHeight,
        clientH: root.clientHeight,
        missingIcons,
        fonts: fontReady,
        fontStatus: fontReady.some((s) => s.endsWith(":MISSING")) ? fontReady.join("|") : "loaded",
        textLen,
        images: document.images.length,
      };
    });
    console.log("QA", slug, view, JSON.stringify(qa));
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
    console.log("saved", out);
    await page.close();
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});