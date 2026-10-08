/**
 * ML x ACS Hackathon - Problem Card Component
 * Renders individual problem statement cards with responsive design,
 * difficulty badges, category tags, and interactive indicators.
 */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Creates an interactive problem card HTML element.
 * @param {Object} problem - The problem statement data object
 * @returns {string} HTML string representing the problem card
 */
export function createProblemCard(problem) {
  const difficultyClass = `badge-${problem.difficulty.toLowerCase()}`;
  const difficultyLabel = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1);
  
  const tagsHtml = (problem.tags || [])
    .slice(0, 3)
    .map(tag => `<span class="tech-tag">${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <article 
      class="problem-card" 
      data-id="${problem.id}" 
      data-difficulty="${problem.difficulty.toLowerCase()}"
      tabindex="0"
      role="button"
      aria-haspopup="dialog"
      aria-label="View details for ${escapeHtml(problem.code)}: ${escapeHtml(problem.title)}"
    >
      <div class="card-glow-layer" aria-hidden="true"></div>
      
      <div class="card-header">
        <div class="header-meta">
          <span class="problem-code">${escapeHtml(problem.code)}</span>
          <span class="category-pill">${escapeHtml(problem.category)}</span>
        </div>
        <span class="difficulty-badge ${difficultyClass}">
          <span class="difficulty-dot" aria-hidden="true"></span>
          ${difficultyLabel}
        </span>
      </div>

      <div class="card-content">
        <h3 class="problem-title">${escapeHtml(problem.title)}</h3>
        <p class="problem-summary">${escapeHtml(problem.shortDescription)}</p>
      </div>

      <div class="card-footer">
        <div class="card-tags" aria-label="Technologies used">
          ${tagsHtml}
        </div>
        <div class="card-action">
          <span class="action-label">Inspect specs</span>
          <span class="action-arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </div>
      </div>
    </article>
  `;
}
