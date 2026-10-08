import {
  problems,
  getProblemById,
  getProblemsByDifficulty,
  getDifficultyStats
} from "../data/problems.js";

import { createProblemCard } from "./components/problemCard.js";
import { ProblemModal } from "./components/problemModal.js";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const API = "";
const INTRO_DURATION = 6500;
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
}[c]));

let activeDifficulty = "all";
let searchQuery = "";
let adminKey = sessionStorage.getItem("hackathonAdminKey") || "";
let teams = [];

function initIntro() {
  const intro = $("#intro");
  const canvas = $("#three-canvas");
  const website = $(".site-wrapper");
  const skip = $("#skipIntro");

  if (!intro) return;

  if (sessionStorage.getItem("hackathonIntroSeen")) {
    intro.remove();
    canvas?.remove();
    website?.classList.remove("site-loading");
    return;
  }

  sessionStorage.setItem("hackathonIntroSeen", "1");
  document.body.style.overflow = "hidden";

  if (!canvas || !window.THREE) return;

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

  const show = (el, transition, transform = "none") => {
    if (!el) return;
    el.style.transition = transition;
    el.style.opacity = "1";
    el.style.transform = transform;
    el.style.filter = "blur(0)";
  };

  const vitap = $("#vitap");
  const organizers = $("#organizers");
  const presents = $("#presents");
  const name = $("#hackathon-name");

  setTimeout(() => show(vitap, "opacity .9s ease,transform .9s ease,filter .9s ease", "scale(1)"), 150);
  setTimeout(() => {
    if (!vitap) return;
    vitap.style.transition = "opacity .9s ease,transform .9s ease,filter .9s ease";
    vitap.style.opacity = "0";
    vitap.style.transform = "scale(1.06)";
    vitap.style.filter = "blur(7px)";
  }, 2200);
  setTimeout(() => show(organizers, "opacity .8s ease,transform .8s ease", "scale(1)"), 2100);
  setTimeout(() => show(presents, "opacity .5s ease,transform .5s ease", "translateY(0)"), 3100);
  setTimeout(() => show(name, "opacity .8s ease,transform .8s ease", "translateY(0) scale(1)"), 3900);

  const finish = () => {
    intro.classList.add("intro-finished");
    setTimeout(() => intro.remove(), 750);
    canvas.remove();
    website?.classList.remove("site-loading");
    document.body.style.overflow = "auto";
  };

  setTimeout(finish, INTRO_DURATION);
  skip?.addEventListener("click", finish);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  });
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

async function fetchJSON(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const response = await fetch(API + path, { ...options, headers });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
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
          '<div><strong>' + escapeHtml(row.name) + "</strong><div class="muted-cell">" +
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

function setAdminVisibility(loggedIn = Boolean(adminKey)) {
  const section = $("#admin");
  if (!section) return;
  section.hidden = !loggedIn;
  $("#adminLoginView").hidden = loggedIn;
  $("#adminDashboardView").hidden = !loggedIn;
  $("#adminNavLink").hidden = !loggedIn;
  $("#footerAdminLink").hidden = !loggedIn;
}

async function restoreAdminSession() {
  if (!adminKey) {
    setAdminVisibility(false);
    return;
  }

  try {
    await verifyAdminKey(adminKey);
    setAdminVisibility(true);
    await refreshAdmin();
  } catch {
    adminKey = "";
    sessionStorage.removeItem("hackathonAdminKey");
    setAdminVisibility(false);
  }
}

async function verifyAdminKey(key) {
  return fetchJSON("/api/admin/verify", {
    method: "POST",
    headers: { "x-admin-key": key }
  });
}

async function refreshAdmin() {
  if (!adminKey) return;

  try {
    teams = await fetchJSON("/api/teams");
    const select = $("#pointsTeamSelect");
    select.innerHTML = '<option value="">Select team</option>' +
      teams.map((team) => '<option value="' + team.id + '">' + escapeHtml(team.name) + "</option>").join("");

    const container = $("#adminTeams");
    container.innerHTML = teams.length
      ? teams.map((team) =>
          '<div class="admin-team-row" data-team="' + team.id + '">' +
          '<div class="admin-team-info"><strong>' + escapeHtml(team.name) +
          '</strong><span>' + team.totalPoints + ' pts</span><small>' +
          (team.members.map((member) => escapeHtml(member.name)).join(", ") || "No members") +
          "</small></div>" +
          '<div class="admin-team-actions">' +
          '<button type="button" data-action="rename" data-team="' + team.id + '">Rename</button>' +
          '<button type="button" data-action="member" data-team="' + team.id + '">+ Member</button>' +
          '<button type="button" data-action="history" data-team="' + team.id + '">History</button>' +
          '<button type="button" data-action="delete" data-team="' + team.id + '">Delete</button>' +
          "</div>" +
          '<div class="admin-history" id="history-' + team.id + '" hidden></div>' +
          "</div>"
        ).join("")
      : '<div class="muted-cell">No teams created yet.</div>';
  } catch (error) {
    showToast(error.message);
  }
}

function showToast(message) {
  const toast = $("#toast") || (() => {
    const element = document.createElement("div");
    element.id = "toast";
    document.body.appendChild(element);
    return element;
  })();

  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function bindAdmin() {
  $("#adminLoginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const key = $("#adminKeyInput").value;

    try {
      await verifyAdminKey(key);
      adminKey = key;
      sessionStorage.setItem("hackathonAdminKey", key);
      $("#adminKeyInput").value = "";
      $("#adminLoginError").textContent = "";
      setAdminVisibility();
      await refreshAdmin();
    } catch {
      adminKey = "";
      sessionStorage.removeItem("hackathonAdminKey");
      $("#adminLoginError").textContent = "Invalid admin key.";
    }
  });

  $("#adminLogoutBtn")?.addEventListener("click", () => {
    adminKey = "";
    sessionStorage.removeItem("hackathonAdminKey");
    setAdminVisibility();
  });

  $("#createTeamForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const members = $("#teamMembersInput").value
      .split(/[,\n]/)
      .map((value) => value.trim())
      .filter(Boolean);

    try {
      await fetchJSON("/api/admin/teams", {
        method: "POST",
        headers: { "x-admin-key": adminKey },
        body: JSON.stringify({
          name: $("#teamNameInput").value,
          members
        })
      });
      event.target.reset();
      await refreshAdmin();
      await refreshPublicData();
      showToast("Team created");
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#pointsForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await fetchJSON("/api/admin/teams/" + $("#pointsTeamSelect").value + "/points", {
        method: "POST",
        headers: { "x-admin-key": adminKey },
        body: JSON.stringify({
          points: Number($("#pointsInput").value),
          difficulty: $("#difficultyInput").value,
          reason: $("#reasonInput").value,
          problem: $("#problemInput").value
        })
      });
      event.target.reset();
      await refreshAdmin();
      await refreshPublicData();
      showToast("Score recorded");
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#adminTeams")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const teamId = button.dataset.team;

    try {
      if (button.dataset.action === "rename") {
        const team = teams.find((item) => item.id === teamId);
        const name = prompt("New team name:", team?.name || "");
        if (name) {
          await fetchJSON("/api/admin/teams/" + teamId, {
            method: "PUT",
            headers: { "x-admin-key": adminKey },
            body: JSON.stringify({ name })
          });
        }
      }

      if (button.dataset.action === "member") {
        const name = prompt("Member name:");
        if (name) {
          await fetchJSON("/api/admin/teams/" + teamId + "/members", {
            method: "POST",
            headers: { "x-admin-key": adminKey },
            body: JSON.stringify({ name })
          });
        }
      }

      if (button.dataset.action === "history") {
        const box = document.getElementById("history-" + teamId);
        if (box.hidden) {
          const team = await fetchJSON("/api/teams/" + teamId);
          box.innerHTML = team.history.length
            ? team.history.map((entry) =>
                '<div class="history-item"><span>' +
                (entry.points > 0 ? "+" : "") + entry.points +
                '</span><span>' + escapeHtml(entry.reason || entry.problem || "Score entry") +
                '</span><span>' + escapeHtml(entry.difficulty || "") +
                '</span><button type="button" data-action="undo" data-entry="' +
                entry.id + '" data-team="' + teamId + '">Undo</button></div>'
              ).join("")
            : "<div>No score history.</div>";
          box.hidden = false;
        } else {
          box.hidden = true;
        }
        return;
      }

      if (button.dataset.action === "undo") {
        await fetchJSON("/api/admin/points/" + button.dataset.entry, {
          method: "DELETE",
          headers: { "x-admin-key": adminKey }
        });
      }

      if (button.dataset.action === "delete") {
        const team = teams.find((item) => item.id === teamId);
        if (!confirm('Delete "' + (team?.name || "this team") + '" and all scores?')) return;
        await fetchJSON("/api/admin/teams/" + teamId, {
          method: "DELETE",
          headers: { "x-admin-key": adminKey }
        });
      }

      await refreshAdmin();
      await refreshPublicData();
    } catch (error) {
      showToast(error.message);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProblemArea();
  bindProblems();
  bindAdmin();
  setAdminVisibility(false);
  initIntro();
  refreshPublicData();
  connectLiveLeaderboard();
  restoreAdminSession();
});
