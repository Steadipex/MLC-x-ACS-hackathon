/**
 * ML x ACS Hackathon - Main Application Entrypoint
 * Orchestrates card rendering, filtering by difficulty, search, modal dialogs,
 * URL parameter handling, and subtle hero canvas visual effects.
 */

import {
  problems,
  getProblemById,
  getProblemsByDifficulty,
  getDifficultyStats
} from "../data/problems.js";

import {
  createProblemCard
} from "./components/problemCard.js";

import {
  ProblemModal
} from "./components/problemModal.js";


/* =========================================================
   THREE.JS INTRO ANIMATION
   ========================================================= */

import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ==========================================
// TIMING
// ==========================================

const TIMING = {

  // VIT-AP appears immediately
  vitapIn: 0,

  // VIT-AP starts leaving
  vitapOut: 3000,

  // MLC × ACS appears
  organizersIn: 3000,

  // PRESENTS appears
  presentsIn: 4200,

  // Hackathon name appears
  hackathonIn: 5000,

  // Entire intro disappears
  introOut: 8500

};


// ==========================================
// DOM
// ==========================================

const canvas =
  document.getElementById("three-canvas");

const intro =
  document.getElementById("intro");

const vitap =
  document.getElementById("vitap");

const organizers =
  document.getElementById("organizers");

const presents =
  document.getElementById("presents");

const hackathonName =
  document.getElementById("hackathon-name");


// IMPORTANT:
// Original animation used:
// document.getElementById("website")
//
// The real website does not use #website.
// It uses .site-wrapper.
//
// This is the ONLY target change needed for the merge.

const website =
  document.querySelector(".site-wrapper");


// Keep the actual website hidden until the intro finishes.
if (website) {
  website.style.opacity = "0";
}


// ==========================================
// HACKATHON NAME
// ==========================================

hackathonName.textContent =
  "HACKATHON NAME";


// ==========================================
// THREE.JS SCENE
// ==========================================

const scene =
  new THREE.Scene();


// ==========================================
// CAMERA
// ==========================================

const camera =
  new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

camera.position.z = 5;


// ==========================================
// RENDERER
// ==========================================

const renderer =
  new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);


// ==========================================
// PARTICLES
// ==========================================

const particleCount = 1200;

const positions =
  new Float32Array(
    particleCount * 3
  );

for (
  let i = 0;
  i < particleCount;
  i++
) {

  const i3 = i * 3;

  positions[i3] =
    (Math.random() - 0.5) * 15;

  positions[i3 + 1] =
    (Math.random() - 0.5) * 10;

  positions[i3 + 2] =
    (Math.random() - 0.5) * 8;
}


const particleGeometry =
  new THREE.BufferGeometry();

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(
    positions,
    3
  )
);


const particleMaterial =
  new THREE.PointsMaterial({
    color: 0x4da6ff,
    size: 0.025,
    transparent: true,
    opacity: 0.7
  });


const particles =
  new THREE.Points(
    particleGeometry,
    particleMaterial
  );

scene.add(particles);


// ==========================================
// THREE.JS ANIMATION
// ==========================================

const clock =
  new THREE.Clock();

function animate() {

  requestAnimationFrame(
    animate
  );

  const elapsed =
    clock.getElapsedTime();

  particles.rotation.y =
    elapsed * 0.025;

  particles.rotation.x =
    Math.sin(
      elapsed * 0.1
    ) * 0.05;

  renderer.render(
    scene,
    camera
  );
}

animate();


// ==========================================
// VIT-AP INTRO
// ==========================================

setTimeout(() => {

  vitap.style.transition = `
    opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1),
    transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
    filter 1.2s ease
  `;

  vitap.style.opacity = "1";

  vitap.style.transform =
    "scale(1)";

  vitap.style.filter =
    "blur(0)";

}, TIMING.vitapIn);


// ==========================================
// VIT-AP EXIT
// ==========================================

setTimeout(() => {

  vitap.style.transition = `
    opacity 1.4s ease,
    transform 1.4s ease,
    filter 1.4s ease
  `;

  vitap.style.opacity = "0";

  vitap.style.transform =
    "scale(1.12)";

  // ORIGINAL BLUR
  vitap.style.filter =
    "blur(12px)";

}, TIMING.vitapOut);


// ==========================================
// MLC × ACS
// ==========================================

setTimeout(() => {

  organizers.style.transition = `
    opacity 1s ease,
    transform 1s cubic-bezier(0.16, 1, 0.3, 1)
  `;

  organizers.style.opacity = "1";

  organizers.style.transform =
    "scale(1)";

}, TIMING.organizersIn);


// ==========================================
// PRESENTS
// ==========================================

setTimeout(() => {

  presents.style.transition = `
    opacity 0.8s ease,
    transform 0.8s ease
  `;

  presents.style.opacity = "1";

  presents.style.transform =
    "translateY(0)";

}, TIMING.presentsIn);


// ==========================================
// HACKATHON NAME
// ==========================================

setTimeout(() => {

  hackathonName.style.transition = `
    opacity 1s ease,
    transform 1s cubic-bezier(0.16, 1, 0.3, 1)
  `;

  hackathonName.style.opacity = "1";

  hackathonName.style.transform =
    "scale(1) translateY(0)";

}, TIMING.hackathonIn);


// ==========================================
// INTRO → WEBSITE
// ==========================================

setTimeout(() => {

  intro.style.transition =
    "opacity 1s ease";

  intro.style.opacity = "0";

  if (website) {

    website.style.transition =
      "opacity 1s ease";

    website.style.opacity = "1";

  }

}, TIMING.introOut);


// ==========================================
// REMOVE INTRO
// ==========================================

setTimeout(() => {

  intro.remove();

  canvas.remove();

  document.body.style.overflow =
    "auto";

}, TIMING.introOut + 1000);


// ==========================================
// RESIZE
// ==========================================

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

  }
);


// =========================================================
// ORIGINAL WEBSITE JAVASCRIPT
// =========================================================


// Application State
let activeDifficulty = "all";
let searchQuery = "";


// DOM Elements
const problemsGrid =
  document.getElementById(
    "problemsGrid"
  );

const difficultyNav =
  document.getElementById(
    "difficultyNav"
  );

const searchInput =
  document.getElementById(
    "searchInput"
  );

const problemDialog =
  document.getElementById(
    "problemDialog"
  );

const filterButtons =
  document.querySelectorAll(
    ".filter-btn"
  );

const currentFilterLabel =
  document.getElementById(
    "currentFilterLabel"
  );

const visibleCount =
  document.getElementById(
    "visibleCount"
  );

const mobileNavToggle =
  document.getElementById(
    "mobileNavToggle"
  );

const mainNav =
  document.getElementById(
    "mainNav"
  );


// Modal Instance
let modalInstance = null;


/**
 * Initializes the application
 */
function init() {

  if (problemDialog) {

    modalInstance =
      new ProblemModal(
        problemDialog
      );

  }

  updateStatsBadges();

  bindFilterEvents();

  bindSearchEvents();

  bindCardInteractions();

  bindMobileNav();

  initHeroCanvas();

  // Initial render
  renderProblems();

  // Check URL query parameter for deep link
  handleUrlDeepLink();

}


/**
 * Updates filter count badges in the UI
 */
function updateStatsBadges() {

  const stats =
    getDifficultyStats();

  const totalEl =
    document.getElementById(
      "statTotalProblems"
    );

  if (totalEl) {
    totalEl.textContent =
      stats.all;
  }

  const countAll =
    document.getElementById(
      "countAll"
    );

  const countEasy =
    document.getElementById(
      "countEasy"
    );

  const countMedium =
    document.getElementById(
      "countMedium"
    );

  const countHard =
    document.getElementById(
      "countHard"
    );


  if (countAll) {
    countAll.textContent =
      stats.all;
  }

  if (countEasy) {
    countEasy.textContent =
      stats.easy;
  }

  if (countMedium) {
    countMedium.textContent =
      stats.medium;
  }

  if (countHard) {
    countHard.textContent =
      stats.hard;
  }

}


/**
 * Filters problems according to current activeDifficulty and searchQuery
 */
function getFilteredProblems() {

  let list =
    getProblemsByDifficulty(
      activeDifficulty
    );


  if (
    searchQuery.trim() !== ""
  ) {

    const q =
      searchQuery
        .toLowerCase()
        .trim();


    list =
      list.filter(p => {

        const titleMatch =
          p.title
            .toLowerCase()
            .includes(q);

        const codeMatch =
          p.code
            .toLowerCase()
            .includes(q);

        const catMatch =
          p.category
            .toLowerCase()
            .includes(q);

        const descMatch =
          p.shortDescription
            .toLowerCase()
            .includes(q);

        const tagMatch =
          (p.tags || [])
            .some(
              tag =>
                tag
                  .toLowerCase()
                  .includes(q)
            );

        return (
          titleMatch ||
          codeMatch ||
          catMatch ||
          descMatch ||
          tagMatch
        );

      });

  }

  return list;

}


/**
 * Renders problem cards into grid
 */
function renderProblems() {

  if (!problemsGrid) return;

  const filtered =
    getFilteredProblems();


  // Update visible counts & summary text
  if (visibleCount) {

    visibleCount.textContent =
      filtered.length;

  }


  if (currentFilterLabel) {

    const labelMap = {

      all:
        "All Challenges",

      easy:
        "Easy Challenges",

      medium:
        "Medium Challenges",

      hard:
        "Hard Challenges"

    };

    currentFilterLabel.textContent =
      labelMap[activeDifficulty]
      || "Challenges";

  }


  if (filtered.length === 0) {

    problemsGrid.innerHTML = `

      <div class="empty-state">

        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle
            cx="11"
            cy="11"
            r="8"
          ></circle>

          <line
            x1="21"
            y1="21"
            x2="16.65"
            y2="16.65"
          ></line>
        </svg>

        <h3>
          No matching problems
        </h3>

        <p>
          Try adjusting your search
          or difficulty filter.
        </p>

        <button
          type="button"
          class="btn-reset-filter"
          id="resetFilterBtn"
        >
          Reset Filters
        </button>

      </div>

    `;


    const resetBtn =
      document.getElementById(
        "resetFilterBtn"
      );


    if (resetBtn) {

      resetBtn.addEventListener(
        "click",
        () => {

          activeDifficulty =
            "all";

          searchQuery = "";

          if (searchInput) {
            searchInput.value = "";
          }


          filterButtons.forEach(
            btn => {

              const isAll =
                btn.dataset.filter ===
                "all";

              btn.classList.toggle(
                "active",
                isAll
              );

              btn.setAttribute(
                "aria-selected",
                isAll
                  ? "true"
                  : "false"
              );

            }
          );


          renderProblems();

        }
      );

    }

    return;

  }


  // Render cards
  problemsGrid.innerHTML =
    filtered
      .map(
        p => createProblemCard(p)
      )
      .join("");

}


function escapeHtml(str) {

  if (!str) return "";

  return String(str).replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[m]
  );

}


/**
 * Binds tab click events for difficulty filter
 */
function bindFilterEvents() {

  filterButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const filter =
            button.getAttribute(
              "data-filter"
            );


          if (
            filter ===
            activeDifficulty
          ) {
            return;
          }


          activeDifficulty =
            filter;


          // Update button visual & ARIA states
          filterButtons.forEach(
            btn => {

              const isCurrent =
                btn === button;

              btn.classList.toggle(
                "active",
                isCurrent
              );

              btn.setAttribute(
                "aria-selected",
                isCurrent
                  ? "true"
                  : "false"
              );

            }
          );


          renderProblems();

        }
      );

    }
  );

}


/**
 * Binds search input filtering
 */
function bindSearchEvents() {

  if (!searchInput) return;


  searchInput.addEventListener(
    "input",
    e => {

      searchQuery =
        e.target.value;

      renderProblems();

    }
  );

}


/**
 * Sets up click and keyboard triggers on problem cards
 */
function bindCardInteractions() {

  if (!problemsGrid) return;


  // Event delegation on grid for card clicks
  problemsGrid.addEventListener(
    "click",
    e => {

      const card =
        e.target.closest(
          ".problem-card"
        );

      if (!card) return;


      const id =
        card.getAttribute(
          "data-id"
        );

      const problem =
        getProblemById(id);


      if (
        problem &&
        modalInstance
      ) {

        modalInstance.open(
          problem,
          card
        );

      }

    }
  );


  // Keyboard accessibility
  problemsGrid.addEventListener(
    "keydown",
    e => {

      if (
        e.key === "Enter" ||
        e.key === " "
      ) {

        const card =
          e.target.closest(
            ".problem-card"
          );


        if (
          card &&
          e.target === card
        ) {

          e.preventDefault();


          const id =
            card.getAttribute(
              "data-id"
            );


          const problem =
            getProblemById(id);


          if (
            problem &&
            modalInstance
          ) {

            modalInstance.open(
              problem
            );

          }

        }

      }

    }
  );

}


/**
 * Deep link support: opens modal if URL has ?id=<number>
 */
function handleUrlDeepLink() {

  const urlParams =
    new URLSearchParams(
      window.location.search
    );

  const requestedId =
    urlParams.get("id");


  if (requestedId) {

    const problem =
      getProblemById(
        requestedId
      );


    if (
      problem &&
      modalInstance
    ) {

      setTimeout(
        () => {

          modalInstance.open(
            problem
          );

        },
        100
      );

    }

  }

}


/**
 * Mobile navigation menu toggle
 */
function bindMobileNav() {

  if (
    !mobileNavToggle ||
    !mainNav
  ) {
    return;
  }


  mobileNavToggle.addEventListener(
    "click",
    () => {

      const isOpen =
        mainNav.classList.toggle(
          "mobile-open"
        );


      mobileNavToggle.setAttribute(
        "aria-expanded",
        isOpen
          ? "true"
          : "false"
      );

    }
  );

}


/**
 * Subtle AI/Robotics Neural Mesh Canvas
 * Lightweight 2D canvas effect representing connected neural nodes.
 * Designed to be clean, restrained, high performance, and respectful of prefers-reduced-motion.
 */
function initHeroCanvas() {

  const canvas =
    document.getElementById(
      "heroCanvas"
    );

  if (!canvas) return;


  // Check prefers-reduced-motion
  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    return;
  }


  const ctx =
    canvas.getContext("2d");


  let width;
  let height;
  let animationFrameId;


  // Node particle collection
  const nodes = [];

  const nodeCount = 38;

  const maxDistance = 140;


  function resize() {

    width =
      canvas.width =
        canvas.parentElement
          .offsetWidth;

    height =
      canvas.height =
        canvas.parentElement
          .offsetHeight;

  }


  window.addEventListener(
    "resize",
    resize,
    {
      passive: true
    }
  );


  resize();


  // Create nodes
  for (
    let i = 0;
    i < nodeCount;
    i++
  ) {

    nodes.push({

      x:
        Math.random() * width,

      y:
        Math.random() * height,

      vx:
        (Math.random() - 0.5)
        * 0.35,

      vy:
        (Math.random() - 0.5)
        * 0.35,

      radius:
        Math.random() * 1.5
        + 1.2

    });

  }


  function render() {

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    // Update & draw nodes
    for (
      let i = 0;
      i < nodes.length;
      i++
    ) {

      const node =
        nodes[i];


      node.x +=
        node.vx;

      node.y +=
        node.vy;


      // Wrap around bounds
      if (node.x < 0) {
        node.x = width;
      }

      if (node.x > width) {
        node.x = 0;
      }

      if (node.y < 0) {
        node.y = height;
      }

      if (node.y > height) {
        node.y = 0;
      }


      // Draw subtle node
      ctx.beginPath();

      ctx.arc(
        node.x,
        node.y,
        node.radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "rgba(56, 189, 248, 0.4)";

      ctx.fill();


      // Draw connections
      for (
        let j = i + 1;
        j < nodes.length;
        j++
      ) {

        const other =
          nodes[j];


        const dx =
          other.x -
          node.x;

        const dy =
          other.y -
          node.y;


        const dist =
          Math.sqrt(
            dx * dx +
            dy * dy
          );


        if (
          dist <
          maxDistance
        ) {

          const alpha =
            (
              1 -
              dist /
                maxDistance
            ) * 0.16;


          ctx.beginPath();

          ctx.moveTo(
            node.x,
            node.y
          );

          ctx.lineTo(
            other.x,
            other.y
          );


          ctx.strokeStyle =
            `rgba(56, 189, 248, ${alpha})`;

          ctx.lineWidth = 1;

          ctx.stroke();

        }

      }

    }


    animationFrameId =
      requestAnimationFrame(
        render
      );

  }


  render();

}


// Start application once DOM is ready
if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

} else {

  init();

}