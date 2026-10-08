/**
 * ML x ACS Hackathon - Problem Details Modal Component
 * Manages native HTML <dialog> lifecycle, keyboard accessibility,
 * backdrop dismissal, and dynamic content injection.
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

export class ProblemModal {
  /**
   * @param {HTMLDialogElement} dialogElement - The dialog DOM element
   */
  constructor(dialogElement) {
    this.dialog = dialogElement;
    this.closeBtn = this.dialog.querySelector("#modalCloseBtn");
    this.modalBody = this.dialog.querySelector("#modalBody");
    this.lastFocusedElement = null;

    this.initEvents();
  }

  initEvents() {
    // Explicit close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    // Backdrop click detection
    this.dialog.addEventListener("click", (event) => {
      const rect = this.dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        this.close();
      }
    });

    // Native dialog cancel event (fires when Escape is pressed)
    this.dialog.addEventListener("cancel", (e) => {
      // Allow native cancel to close, then clean up focus
      this.handleClosed();
    });
  }

  /**
   * Populate modal and open it
   * @param {Object} problem - Problem details object
   * @param {HTMLElement} [triggerElement] - The element that triggered opening for focus restoration
   */
  open(problem, triggerElement = null) {
    if (!problem) return;
    this.lastFocusedElement = triggerElement || document.activeElement;

    this.renderContent(problem);
    
    // Lock background scroll smoothly
    document.body.classList.add("modal-open");

    // Show native top-layer modal
    if (typeof this.dialog.showModal === "function") {
      this.dialog.showModal();
    } else {
      this.dialog.setAttribute("open", "");
    }

    // Set focus to close button or first interactive element
    if (this.closeBtn) {
      this.closeBtn.focus();
    }
  }

  /**
   * Close modal and return focus
   */
  close() {
    if (this.dialog.hasAttribute("open")) {
      this.dialog.close();
      this.handleClosed();
    }
  }

  handleClosed() {
    document.body.classList.remove("modal-open");
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === "function") {
      this.lastFocusedElement.focus();
    }
  }

  /**
   * Renders structured problem content inside modal
   * @param {Object} problem
   */
  renderContent(problem) {
    const difficultyClass = `badge-${problem.difficulty.toLowerCase()}`;
    const difficultyLabel = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1);

    const objectivesHtml = (problem.objectives || [])
      .map(item => `<li><span class="bullet-marker" aria-hidden="true">▹</span><span>${escapeHtml(item)}</span></li>`)
      .join("");

    const constraintsHtml = (problem.constraints || [])
      .map(item => `<li><span class="bullet-marker" aria-hidden="true">■</span><span>${escapeHtml(item)}</span></li>`)
      .join("");

    const tagsHtml = (problem.tags || [])
      .map(tag => `<span class="tech-tag">${escapeHtml(tag)}</span>`)
      .join("");

    const dataset = problem.dataset || {};

    this.modalBody.innerHTML = `
      <div class="modal-header-meta">
        <div class="meta-left">
          <span class="modal-problem-code">${escapeHtml(problem.code)}</span>
          <span class="modal-category-pill">${escapeHtml(problem.category)}</span>
        </div>
        <span class="difficulty-badge ${difficultyClass}">
          <span class="difficulty-dot" aria-hidden="true"></span>
          ${difficultyLabel}
        </span>
      </div>

      <h2 id="modalTitle" class="modal-title">${escapeHtml(problem.title)}</h2>

      <div class="modal-section">
        <h4 class="section-heading">// CHALLENGE CONTEXT &amp; BACKGROUND</h4>
        <p id="modalDesc" class="modal-description">${escapeHtml(problem.fullDescription)}</p>
      </div>

      <div class="modal-grid-two">
        <div class="modal-section">
          <h4 class="section-heading">// CORE OBJECTIVES</h4>
          <ul class="spec-list objectives-list">
            ${objectivesHtml}
          </ul>
        </div>

        <div class="modal-section">
          <h4 class="section-heading">// TECHNICAL CONSTRAINTS</h4>
          <ul class="spec-list constraints-list">
            ${constraintsHtml}
          </ul>
        </div>
      </div>

      <div class="modal-section metric-box">
        <div class="metric-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          EVALUATION CRITERIA &amp; BENCHMARK
        </div>
        <p class="metric-text">${escapeHtml(problem.evaluationMetric)}</p>
      </div>

      <div class="modal-section dataset-box">
        <div class="dataset-info">
          <div class="dataset-title-row">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <div>
              <h5 class="dataset-name">${escapeHtml(dataset.name || "Challenge Dataset Repository")}</h5>
              <div class="dataset-meta-specs">
                <span>Size: ${escapeHtml(dataset.size || "Standard Repository")}</span>
                <span>•</span>
                <span>Format: ${escapeHtml(dataset.format || "Structured files")}</span>
              </div>
            </div>
          </div>
          <p class="dataset-desc">${escapeHtml(dataset.description || "")}</p>
        </div>
        <div class="dataset-action">
          <a href="${escapeHtml(dataset.url || "#")}" target="_blank" rel="noopener noreferrer" class="btn btn-dataset">
            <span>Access Dataset</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>

      <div class="modal-footer-meta">
        <div class="modal-tags">
          ${tagsHtml}
        </div>
        <button type="button" class="btn btn-secondary copy-link-btn" id="copyShareBtn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Share Problem</span>
        </button>
      </div>
    `;

    // Hook copy link button
    const copyBtn = this.modalBody.querySelector("#copyShareBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?id=${problem.id}`;
        navigator.clipboard?.writeText(shareUrl).then(() => {
          const span = copyBtn.querySelector("span");
          if (span) {
            const original = span.textContent;
            span.textContent = "Copied link!";
            setTimeout(() => { span.textContent = original; }, 2000);
          }
        }).catch(() => {
          // Fallback if clipboard API is unavailable
          prompt("Copy link to problem:", shareUrl);
        });
      });
    }
  }
}
