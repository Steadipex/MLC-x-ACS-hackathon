/**
 * Intro v2 — ported foreground animation from the approved standalone landing page.
 *
 * Isolated module: only animates elements inside `section#intro`. The team's dark
 * navy background, grid overlay, and Three.js particle canvas are owned by
 * `js/main.js` and `css/style.css` and are intentionally untouched here.
 *
 * Revert: delete this file + `css/intro-v2.css`, restore the old `#intro` markup
 * in `index.html`, and drop the import in `js/main.js`.
 */

/* The only place the event title lives. Change this string when the name is finalised. */
export const HACKATHON_NAME = "THE BYTE THE MOLE 2.0";

const MARKS = [
  {
    key: "mlc",
    // Higher-resolution copies; original team assets are left untouched.
    src: "assets/mlc-logo-v2.jpg",
    org: "The Machine Learning Club",
    alt: "Machine Learning Club logo",
    delay: 0,
  },
  {
    key: "acs",
    src: "assets/acs-logo-v2.png",
    org: "American Chemical Society",
    alt: "American Chemical Society logo",
    delay: 120,
  },
];

const VIT_SRC = "assets/vitap-logo-v2.png";

// Approved timings, preserved exactly from the standalone project.
const TIMING = {
  firstNodesAt: 350,
  buildDuration: 1450,
  dividerAt: 2320,
  orgAt: [2380, 2440],
  presentsAt: 3000,
  titleAt: 3500,
};

const VIT_OPEN_DURATION = 1150;
const VIT_DOCK_DURATION = 800;

// Completion math (all relative to the moment the text/logo choreography starts):
// the last class added is the title at TIMING.titleAt, whose longest CSS
// transition is letter-spacing 1.2s (css/intro-v2.css). True animation end is
// therefore titleAt + 1200ms; COMPLETE_HOLD_MS keeps the full composition
// (logos + both org names + PRESENTS + title) on screen before revealing.
const TITLE_TRANSITION_MS = 1200;
const COMPLETE_HOLD_MS = 1600;
const INSTANT_HOLD_MS = 1800;

const SAMPLE_RES = 96;
const NODE_SPACING = 7;
const EDGE_NEIGHBOURS = 3;
const EDGE_MAX_DIST = 0.15;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* Make near-white background pixels transparent so the real mark sits cleanly on dark navy. */
function keyOutWhite(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const lightest = Math.min(px[i], px[i + 1], px[i + 2]);
    let keep = px[i + 3] / 255;
    if (lightest >= 245) keep = 0;
    else if (lightest > 225) keep *= (245 - lightest) / 20;
    px[i + 3] = Math.round(keep * 255);
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

/* Sample the visible logo mask so every construction point belongs to the real mark. */
function sampleInkPixels(keyed) {
  const probe = document.createElement("canvas");
  probe.width = SAMPLE_RES;
  probe.height = SAMPLE_RES;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  const scale = Math.min(SAMPLE_RES / keyed.width, SAMPLE_RES / keyed.height);
  const w = keyed.width * scale;
  const h = keyed.height * scale;
  const left = (SAMPLE_RES - w) / 2;
  const top = (SAMPLE_RES - h) / 2;
  ctx.drawImage(keyed, left, top, w, h);
  const px = ctx.getImageData(0, 0, SAMPLE_RES, SAMPLE_RES).data;
  const mask = new Uint8Array(SAMPLE_RES * SAMPLE_RES);
  for (let i = 0; i < mask.length; i++) {
    mask[i] = px[i * 4 + 3] > 60 ? 1 : 0;
  }

  const nodes = [];
  for (let y = 0; y < SAMPLE_RES; y += NODE_SPACING) {
    for (let x = 0; x < SAMPLE_RES; x += NODE_SPACING) {
      const right = Math.min(x + NODE_SPACING, SAMPLE_RES);
      const bottom = Math.min(y + NODE_SPACING, SAMPLE_RES);
      const centerX = (x + right - 1) / 2;
      const centerY = (y + bottom - 1) / 2;
      let best = null;
      let bestDistance = Infinity;

      for (let py = y; py < bottom; py++) {
        for (let px = x; px < right; px++) {
          if (!mask[py * SAMPLE_RES + px]) continue;
          const distance = (px - centerX) ** 2 + (py - centerY) ** 2;
          if (distance < bestDistance) {
            best = { x: (px + 0.5) / SAMPLE_RES, y: (py + 0.5) / SAMPLE_RES };
            bestDistance = distance;
          }
        }
      }

      if (best) nodes.push(best);
    }
  }
  return { nodes, mask };
}

function buildEdges(nodes, mask) {
  const seen = new Set();
  const edges = [];
  const lineFollowsMark = (p, q) => {
    for (let step = 1; step < 4; step++) {
      const t = step / 4;
      const x = Math.floor((p.x + (q.x - p.x) * t) * SAMPLE_RES);
      const y = Math.floor((p.y + (q.y - p.y) * t) * SAMPLE_RES);
      if (!mask[y * SAMPLE_RES + x]) return false;
    }
    return true;
  };

  nodes.forEach((p, i) => {
    const near = [];
    nodes.forEach((q, j) => {
      if (i === j) return;
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < EDGE_MAX_DIST) near.push([d, j]);
    });
    near.sort((a, b) => a[0] - b[0]);
    let connected = 0;
    for (const [distance, j] of near) {
      if (connected >= EDGE_NEIGHBOURS) break;
      if (distance > EDGE_MAX_DIST || !lineFollowsMark(p, nodes[j])) continue;
      const id = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(id)) {
        seen.add(id);
        edges.push([i, j]);
        connected++;
      }
    }
  });
  return edges;
}

/* A clean diagonal scan traces the mark without adding unrelated motion. */
function revealRank(nodes) {
  const rank = new Array(nodes.length);
  nodes
    .map((p, i) => [p.y + p.x * 0.08, i])
    .sort((a, b) => a[0] - b[0])
    .forEach(([_, i], position) => {
      rank[i] = position;
    });
  return rank;
}

function drawFrame(art, geom, progress) {
  const { ctx, canvas, img, dpr } = art;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = "round";

  const count = geom.nodes.length;
  const shown = Math.floor(progress * count);
  const fade = 1 - smooth(0.7, 0.98, progress);

  if (fade > 0.01) {
    ctx.lineWidth = 0.85;
    for (const [a, b] of geom.edges) {
      if (geom.rank[a] < shown && geom.rank[b] < shown) {
        const late = Math.max(geom.rank[a], geom.rank[b]) / Math.max(1, count);
        ctx.strokeStyle = `rgba(167, 196, 242, ${(0.38 - late * 0.12) * fade})`;
        ctx.beginPath();
        ctx.moveTo(geom.nodes[a].x * w, geom.nodes[a].y * h);
        ctx.lineTo(geom.nodes[b].x * w, geom.nodes[b].y * h);
        ctx.stroke();
      }
    }

    for (let i = 0; i < count; i++) {
      const x = geom.nodes[i].x * w;
      const y = geom.nodes[i].y * h;
      if (geom.rank[i] < shown) {
        ctx.fillStyle = `rgba(213, 226, 250, ${0.82 * fade})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (geom.rank[i] < shown + 6) {
        ctx.fillStyle = `rgba(174, 200, 240, ${0.35 * fade})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.05, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const solid = smooth(0.58, 0.98, progress);
  img.style.opacity = String(solid);
  img.style.transform = `scale(${(0.984 + 0.016 * solid).toFixed(4)})`;
  canvas.style.opacity = String(fade);
}

/**
 * Run the foreground logo/title choreography inside `introEl`.
 * Background particles, session gating, skip, and teardown stay in `js/main.js`.
 * @param {HTMLElement} introEl - the `section#intro` element.
 * @param {() => void} [onComplete] - called once the full composition
 *   (logos + both org names + PRESENTS + title, plus hold) has finished.
 *   Never fires after cleanup/skip. The caller must keep its own failsafe.
 * @returns {() => void} cleanup that cancels pending timers/frames.
 */
export function initIntroV2(introEl, onComplete) {
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  let raf = 0;
  let cancelled = false;
  let completed = false;
  const complete = () => {
    if (completed || cancelled) return;
    completed = true;
    onComplete?.();
  };

  const vitLogo = introEl.querySelector(".intro-v2-vit");
  const separator = introEl.querySelector(".intro-v2-x");
  const presents = introEl.querySelector(".intro-v2-presents");
  const title = introEl.querySelector(".intro-v2-title");
  if (!vitLogo || !separator || !presents || !title) {
    // Broken markup: don't hang the page behind the intro forever.
    setTimeout(() => {
      if (!cancelled && !completed) {
        completed = true;
        onComplete?.();
      }
    }, 500);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }

  // Single source of truth for the event name; markup ships a fallback.
  title.textContent = HACKATHON_NAME;

  const markEls = [...introEl.querySelectorAll(".intro-v2-mark")];
  const marks = markEls.map((el, i) => ({
    el,
    canvas: el.querySelector("canvas"),
    img: el.querySelector("img"),
    ctx: el.querySelector("canvas").getContext("2d"),
    dpr: 1,
    ...MARKS[i],
  }));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fit = () => {
    for (const m of marks) {
      const rect = m.canvas.parentElement.getBoundingClientRect();
      m.dpr = Math.min(window.devicePixelRatio || 1, 2);
      m.canvas.width = Math.max(1, Math.round(rect.width * m.dpr));
      m.canvas.height = Math.max(1, Math.round(rect.height * m.dpr));
    }
  };

  const showFinal = () => {
    vitLogo.classList.add("is-docked");
    for (const m of marks) {
      m.img.style.opacity = "1";
      m.img.style.transform = "none";
      m.canvas.style.display = "none";
      m.el.querySelector(".intro-v2-org").classList.add("is-in");
    }
    separator.classList.add("is-in");
    presents.classList.add("is-in");
    title.classList.add("is-in");
  };

  const scheduleText = (instant) => {
    const at = (el, ms, cls = "is-in") =>
      instant ? el.classList.add(cls) : later(() => el.classList.add(cls), ms);
    at(separator, TIMING.dividerAt);
    marks.forEach((m, i) => at(m.el.querySelector(".intro-v2-org"), TIMING.orgAt[i]));
    at(presents, TIMING.presentsAt);
    at(title, TIMING.titleAt);
  };

  const onResize = () => fit();
  window.addEventListener("resize", onResize);

  (async () => {
    try {
      const arts = await Promise.all(
        marks.map(async (m) => {
          const keyed = keyOutWhite(await loadImage(m.src));
          const keyedSrc = keyed.toDataURL();
          await loadImage(keyedSrc);
          m.img.src = keyedSrc;
          const { nodes, mask } = sampleInkPixels(keyed);
          return {
            ...m,
            geom: { nodes, edges: buildEdges(nodes, mask), rank: revealRank(nodes) },
          };
        })
      );
      if (cancelled) return;
      fit();
      const vit = keyOutWhite(await loadImage(VIT_SRC));
      const vitData = vit.toDataURL();
      await loadImage(vitData);
      vitLogo.src = vitData;
      if (cancelled) return;

      if (reduced) {
        scheduleText(true);
        showFinal();
        later(complete, INSTANT_HOLD_MS);
        return;
      }

      requestAnimationFrame(() => vitLogo.classList.add("is-visible"));
      later(() => {
        vitLogo.classList.add("is-docked");
        later(() => {
          scheduleText(false);
          // Finish only after the final title transition + hold, timed from
          // this same moment so image-prep latency can't cut the sequence.
          later(complete, TIMING.titleAt + TITLE_TRANSITION_MS + COMPLETE_HOLD_MS);
          const t0 = performance.now();
          const tick = (now) => {
            if (cancelled) return;
            let done = true;
            for (const a of arts) {
              const raw = clamp01(
                (now - t0 - TIMING.firstNodesAt - a.delay) / TIMING.buildDuration
              );
              drawFrame(a, a.geom, easeInOut(raw));
              if (raw < 1) done = false;
            }
            if (done) {
              for (const a of arts) {
                a.img.style.opacity = "1";
                a.img.style.transform = "none";
                later(() => {
                  a.canvas.style.display = "none";
                }, 450);
              }
            } else {
              raf = requestAnimationFrame(tick);
            }
          };
          raf = requestAnimationFrame(tick);
        }, VIT_DOCK_DURATION);
      }, VIT_OPEN_DURATION);
    } catch (error) {
      console.error("Unable to prepare the logo construction animation.", error);
      showFinal();
      later(complete, INSTANT_HOLD_MS);
    }
  })();

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    window.removeEventListener("resize", onResize);
  };
}
