const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const FF = "C:\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe";
const ROOT = path.join(__dirname, "..");
const OUTDIR = path.join(ROOT, "assets", "img");
const MOCK = path.join(ROOT, "mockups", "out");
const FPS = 30;
const DUR = 12;
const SEG = DUR / 5;
const FADES = 0.7;
const ZOOM = 1.15;

const NUM = { "ai-product-launch": "01", "automate-video-ia": "02", "mimis-2.0": "03", "dropship-system": "04", "ai-bos": "05" };
const SLUGS = Object.keys(NUM);

const PANC = { "ai-product-launch": [0, 2, 3, 4], "automate-video-ia": [1, 1, 2, 3], "mimis-2.0": [2, 4, 0, 3], "dropship-system": [3, 0, 2, 1], "ai-bos": [4, 3, 1, 0] };

function zexpr(k) { if (k === 1) return "max(zoom-0.0019,1.0)"; return "min(zoom+0.0019," + ZOOM + ")"; }
function xexpr(k) { const c = "iw/2-(iw/zoom/2)"; if (k === 2) return c + "+(iw*0.04*on)"; if (k === 3) return c + "-(iw*0.04*on)"; return c; }
function yexpr(k) { const c = "ih/2-(ih/zoom/2)"; if (k === 4) return c + "+(ih*0.04*on)"; return c; }

function apply(slug) {
  const num = NUM[slug];
  const views = ["cover", "g1", "g2", "g3", "cover"];
  const ins = [];
  const files = views.map((v, i) => path.join(MOCK, slug + (i === 0 || i === 4 ? "-cover" : "-" + i) + ".png"));
  files.forEach((f) => { if (!fs.existsSync(f)) throw new Error("MISSING " + f); });
  const ffl = [];
  const d = Math.round(SEG * FPS);
  files.forEach((f, i) => {
    const k = PANC[slug][i % 4];
    ins.push("-i", f);
    ffl.push(
      "[" + i + ":v]scale=1920:1080:flags=lanczos,setsar=1,zoompan=z='" + zexpr(k) +
        "':x='" + xexpr(k) + "':y='" + yexpr(k) + "':d=" + d +
        ":s=1920x1080:fps=" + FPS + "[s" + i + "]"
    );
  });
  let off = 0;
  let prev = "s0";
  for (let i = 1; i < 5; i++) {
    off += (SEG - FADES);
    const out = i === 4 ? "vout" : "x" + i;
    ffl.push("[" + prev + "][s" + i + "]xfade=transition=fade:duration=" + FADES +
      ":offset=" + off.toFixed(2) + "[" + out + "]");
    prev = out;
  }
  ffl.push("[vout]format=yuv420p[v]");
  const args = ["-y", "-hide_banner", "-loglevel", "error"]
    .concat(ins)
    .concat(["-filter_complex", ffl.join(";"), "-map", "[v]", "-r", String(FPS),
      "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
      "-movflags", "+faststart", path.join(OUTDIR, "project-" + num + "-demo.mp4")]);
  return args;
}

const slug = process.argv[2];
if (!slug) { console.error("usage: reel.js <slug>"); process.exit(1); }
const r = spawnSync(FF, apply(slug), { encoding: "utf8", maxBuffer: 2e7 });
if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
const outF = path.join(OUTDIR, "project-" + NUM[slug] + "-demo.mp4");
console.log("OK", outF, (fs.statSync(outF).size / 1e6).toFixed(1) + "MB");