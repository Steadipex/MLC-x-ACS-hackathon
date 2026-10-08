// Admin dashboard logic. The server only sends this file to a caller that
// presents a valid admin key, so regular visitors never receive it.

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[c]));

export function mount({ key, onLock }) {
  let teams = [];

  async function api(path, { method = "GET", body } = {}) {
    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const data = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (response.status === 401) { onLock(); throw new Error("Session expired"); }
    if (!response.ok) throw new Error(data?.error || "Request failed (" + response.status + ")");
    return data;
  }

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  async function refresh() {
    try {
      teams = await api("/api/teams");
      $("#pointsTeamSelect").innerHTML = '<option value="">Select team</option>' +
        teams.map((t) => '<option value="' + escapeHtml(t.id) + '">' + escapeHtml(t.name) + "</option>").join("");

      $("#adminTeams").innerHTML = teams.length
        ? teams.map((t) =>
            '<div class="admin-team-row">' +
            '<div class="admin-team-info"><strong>' + escapeHtml(t.name) + "</strong><span>" +
            t.totalPoints + " pts</span><small>" +
            (t.members.map((m) => escapeHtml(m.name)).join(", ") || "No members") + "</small></div>" +
            '<div class="admin-team-actions">' +
            '<button type="button" data-action="rename" data-team="' + escapeHtml(t.id) + '">Rename</button>' +
            '<button type="button" data-action="member" data-team="' + escapeHtml(t.id) + '">+ Member</button>' +
            '<button type="button" data-action="history" data-team="' + escapeHtml(t.id) + '">History</button>' +
            '<button type="button" data-action="delete" data-team="' + escapeHtml(t.id) + '">Delete</button>' +
            "</div>" +
            '<div class="admin-history" id="history-' + escapeHtml(t.id) + '" hidden></div></div>'
          ).join("")
        : '<div class="muted-cell">No teams created yet.</div>';
    } catch (error) {
      toast(error.message);
    }
  }

  $("#adminLogoutBtn").addEventListener("click", onLock);

  $("#createTeamForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const members = $("#teamMembersInput").value.split(/[,\n]/).map((v) => v.trim()).filter(Boolean);
    try {
      await api("/api/admin/teams", { method: "POST", body: { name: $("#teamNameInput").value, members } });
      event.target.reset();
      await refresh();
      toast("Team created");
    } catch (error) { toast(error.message); }
  });

  $("#pointsForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("/api/admin/teams/" + encodeURIComponent($("#pointsTeamSelect").value) + "/points", {
        method: "POST",
        body: {
          points: Number($("#pointsInput").value),
          difficulty: $("#difficultyInput").value,
          reason: $("#reasonInput").value,
          problem: $("#problemInput").value
        }
      });
      event.target.reset();
      await refresh();
      toast("Score recorded");
    } catch (error) { toast(error.message); }
  });

  $("#adminTeams").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const teamId = button.dataset.team;
    const teamPath = "/api/admin/teams/" + encodeURIComponent(teamId);

    try {
      if (action === "rename") {
        const team = teams.find((t) => t.id === teamId);
        const name = prompt("New team name:", team?.name || "");
        if (!name) return;
        await api(teamPath, { method: "PUT", body: { name } });
      } else if (action === "member") {
        const name = prompt("Member name:");
        if (!name) return;
        await api(teamPath + "/members", { method: "POST", body: { name } });
      } else if (action === "history") {
        const box = document.getElementById("history-" + teamId);
        if (!box.hidden) { box.hidden = true; return; }
        const team = await api("/api/teams/" + encodeURIComponent(teamId));
        box.innerHTML = team.history.length
          ? team.history.map((entry) =>
              '<div class="history-item"><span>' + (entry.points > 0 ? "+" : "") + entry.points +
              "</span><span>" + escapeHtml(entry.reason || entry.problem || "Score entry") +
              "</span><span>" + escapeHtml(entry.difficulty || "") +
              '</span><button type="button" data-action="undo" data-entry="' + escapeHtml(entry.id) +
              '" data-team="' + escapeHtml(teamId) + '">Undo</button></div>'
            ).join("")
          : "<div>No score history.</div>";
        box.hidden = false;
        return;
      } else if (action === "undo") {
        await api("/api/admin/points/" + encodeURIComponent(button.dataset.entry), { method: "DELETE" });
      } else if (action === "delete") {
        const team = teams.find((t) => t.id === teamId);
        if (!confirm('Delete "' + (team?.name || "this team") + '" and all scores?')) return;
        await api(teamPath, { method: "DELETE" });
      }
      await refresh();
    } catch (error) { toast(error.message); }
  });

  return refresh();
}
