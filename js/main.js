import {
  problems,
  getProblemById,
  getProblemsByDifficulty,
  getDifficultyStats
} from "../data/problems.js";

import { createProblemCard } from "./components/problemCard.js";
import { ProblemModal } from "./components/problemModal.js";
import { initIntroV2 } from "./intro-v2.js";

const API = "";
// Absolute backstop only: normal completion comes from the intro-v2 callback,
// which fires after the final title transition + hold. This must stay far
// beyond any real sequence length so it can never cut the animation early.
const INTRO_FAILSAFE_MS = 25000;
const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
}[c]));

let activeDifficulty = "all";
let searchQuery = "";

function initIntro() {
  const intro = $("#intro");
  const canvas = $("#three-canvas");
  const website = $(".site-wrapper");

  if (!intro) return;

  // The intro plays on every full page load/reload: no session/local storage
  // gating and no skip option. Completion comes from intro-v2.
  document.body.style.overflow = "hidden";

  // Particle background is cosmetic: if the CDN or WebGL is unavailable, the intro still plays.
  if (canvas) {
  import(THREE_URL).then((THREE) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);

    const positions = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x79a8c7,
      size: 0.022,
      transparent: true,
      opacity: 0.5
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const animate = () => {
      requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      particles.rotation.y = t * 0.018;
      particles.rotation.x = Math.sin(t * 0.08) * 0.04;
      renderer.render(scene, camera);
    };
    animate();

    addEventListener("resize", () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    });
  }).catch(() => canvas?.remove());
  }

  // Foreground logo/title choreography lives in the isolated intro-v2 module
  // (ported timings/transitions from the approved standalone landing page).
  // Background Three.js particles, gating, skip, and teardown stay here.
  // The intro finishes ONLY via the intro-v2 completion callback (after the
  // full sequence + hold) or the Skip button — never on a fixed estimate.
  let cancelIntroV2 = null;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    cancelIntroV2?.();
    intro.classList.add("intro-finished");
    setTimeout(() => intro.remove(), 750);
    canvas?.remove();
    website?.classList.remove("site-loading");
    document.body.style.overflow = "auto";
  };
  cancelIntroV2 = initIntroV2(intro, finish);

  setTimeout(finish, INTRO_FAILSAFE_MS);

}

function renderProblemArea() {
  const grid = $("#problemsGrid");
  if (!grid) return;

  let filtered = getProblemsByDifficulty(activeDifficulty);
  const query = searchQuery.trim().toLowerCase();

  if (query) {
    filtered = filtered.filter((p) =>
      [p.title, p.code, p.category, p.shortDescription, ...(p.tags || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }

  const stats = getDifficultyStats();
  $("#statTotalProblems").textContent = stats.all;
  $("#countAll").textContent = stats.all;
  $("#countEasy").textContent = stats.easy;
  $("#countMedium").textContent = stats.medium;
  $("#countHard").textContent = stats.hard;
  $("#visibleCount").textContent = filtered.length;

  const labels = {
    all: "All Challenges",
    easy: "Easy Challenges",
    medium: "Medium Challenges",
    hard: "Hard Challenges"
  };
  $("#currentFilterLabel").textContent = labels[activeDifficulty];

  grid.innerHTML = filtered.length
    ? filtered.map(createProblemCard).join("")
    : '<div class="empty-state"><h3>No matching challenges</h3><p>Try another search or difficulty.</p></div>';
}

function bindProblems() {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      activeDifficulty = button.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach((b) => {
        const current = b === button;
        b.classList.toggle("active", current);
        b.setAttribute("aria-selected", current ? "true" : "false");
      });
      renderProblemArea();
    });
  });

  $("#searchInput")?.addEventListener("input", (event) => {
    searchQuery = event.target.value;
    renderProblemArea();
  });

  const dialog = $("#problemDialog");
  const modal = dialog ? new ProblemModal(dialog) : null;

  $("#problemsGrid")?.addEventListener("click", (event) => {
    const card = event.target.closest(".problem-card");
    if (!card || !modal) return;
    modal.open(getProblemById(card.dataset.id), card);
  });
}

async function fetchJSON(path) {
  const response = await fetch(API + path);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed (" + response.status + ")");
  return data;
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderLeaderboard(rows) {
  const body = $("#leaderboardRows");
  const status = $("#leaderboardStatus");
  if (!body) return;

  body.innerHTML = rows.length
    ? rows.map((row) => [
        '<tr class="' + (row.rank <= 3 ? "rank-" + row.rank : "") + '">',
        '<td class="rank-cell">#' + String(row.rank).padStart(2, "0") + "</td>",
        "<td><strong>" + escapeHtml(row.name) + "</strong></td>",
        '<td class="member-cell">' + row.members.map(escapeHtml).join(", ") + "</td>",
        '<td class="points-cell">' + row.totalPoints + "</td>",
        '<td class="muted-cell">' + formatTime(row.lastScoredAt) + "</td>",
        "</tr>"
      ].join(""))
      .join("")
    : '<tr><td colspan="5" class="muted-cell">No teams yet.</td></tr>';

  const podium = $("#podium");
  if (podium) {
    const top = rows.slice(0, 3);
    podium.innerHTML = top.length
      ? '<div class="section-kicker">TOP TEAMS</div><div class="podium-list">' +
        top.map((row, index) =>
          '<div class="podium-row podium-' + (index + 1) + '">' +
          '<span class="podium-place">' + (index + 1) + "</span>" +
          '<div><strong>' + escapeHtml(row.name) + "</strong><div class=\"muted-cell\">" +
          row.totalPoints + " pts</div></div></div>"
        ).join("") +
        "</div>"
      : '<div class="muted-cell">Leaderboard is empty.</div>';
  }

  if (status) status.textContent = "Live";
}

function renderAnalytics(data) {
  const totals = data?.totals || [];
  const bars = $("#pointsBars");
  if (bars) {
    const max = Math.max(1, ...totals.map((t) => Math.max(0, Number(t.totalPoints) || 0)));
    bars.innerHTML = totals.length
      ? totals.map((t) =>
          '<div class="analytics-bar-row"><span title="' + escapeHtml(t.name) + '">' +
          escapeHtml(t.name) + '</span><div class="analytics-track"><i style="width:' +
          (Math.max(0, Number(t.totalPoints) || 0) / max * 100) + '%"></i></div><b>' +
          t.totalPoints + "</b></div>"
        ).join("")
      : '<div class="muted-cell">No scores yet.</div>';
  }

  const breakdown = $("#difficultyBreakdown");
  if (breakdown) {
    breakdown.innerHTML = totals.length
      ? (data.byDifficulty || []).map((team) =>
          '<div class="difficulty-row"><strong>' + escapeHtml(team.name) + "</strong>" +
          "<span>Easy " + team.easy + "</span><span>Medium " + team.medium +
          "</span><span>Hard " + team.hard + "</span></div>"
        ).join("")
      : '<div class="muted-cell">No scores yet.</div>';
  }

  const timeline = $("#scoreTimeline");
  if (timeline) {
    const events = (data.timeline || [])
      .flatMap((team) => team.series || [])
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    if (!events.length) {
      timeline.innerHTML = '<div class="muted-cell">No score history yet.</div>';
    } else {
      const max = Math.max(1, ...events.map((event) => Math.max(0, Number(event.total) || 0)));
      const recent = events.slice(-10);
      timeline.innerHTML =
        '<div class="timeline-summary"><strong>' + events.length +
        '</strong><span>score events recorded</span></div><div class="timeline-stacked">' +
        recent.map((event) =>
          '<div class="timeline-point"><span>' + formatTime(event.time) +
          '</span><i style="height:' + Math.max(14, ((Number(event.total) || 0) / max) * 100) +
          '%"></i><b>' + event.total + "</b></div>"
        ).join("") + "</div>";
    }
  }
}

async function refreshPublicData() {
  try {
    const [leaderboard, stats] = await Promise.all([
      fetchJSON("/api/leaderboard"),
      fetchJSON("/api/stats")
    ]);
    renderLeaderboard(leaderboard);
    renderAnalytics(stats);
    $("#leaderboardStatus").textContent = "Live";
  } catch (error) {
    $("#leaderboardStatus").textContent = "Offline";
  }
}

function connectLiveLeaderboard() {
  const stream = new EventSource(API + "/api/leaderboard/stream");
  stream.onopen = () => { $("#leaderboardStatus").textContent = "Live"; };
  stream.onerror = () => { $("#leaderboardStatus").textContent = "Reconnecting…"; };
  stream.onmessage = (event) => {
    try { renderLeaderboard(JSON.parse(event.data)); }
    catch {}
    refreshPublicData();
  };
}


document.addEventListener("DOMContentLoaded", () => {
  renderProblemArea();
  bindProblems();
  initIntro();
  refreshPublicData();
  connectLiveLeaderboard();
});
