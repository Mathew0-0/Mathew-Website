/* ==================== SLIDE-UP ANIMATIONS ==================== */
function revealOnScroll() {
  const triggerBottom = window.innerHeight * 0.8;

  document.querySelectorAll(
    ".project-card, .about-text, .about-slide, .resume-card"
  ).forEach(el => {
    const rect = el.getBoundingClientRect();

    if (rect.top < triggerBottom && rect.bottom > 0) {
      el.classList.add("show");   // reveal
    } else {
      el.classList.remove("show"); // reset when out of view
    }
  });
}
window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* ==================== TYPING EFFECT ==================== */
function type(el, text, speed = 50) {
  el.classList.add("type-cursor");
  el.textContent = "";
  return new Promise(resolve => {
    let i = 0;
    (function tick() {
      el.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(tick, speed);
      else { el.classList.remove("type-cursor"); resolve(); }
    })();
  });
}
function erase(el, speed = 30) {
  el.classList.add("type-cursor");
  return new Promise(resolve => {
    (function tick() {
      el.textContent = el.textContent.slice(0, -1);
      if (el.textContent.length) setTimeout(tick, speed);
      else { el.classList.remove("type-cursor"); resolve(); }
    })();
  });
}
const pause = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h1Typer = document.getElementById("h1-typer");
  const h1Text  = document.querySelector(".h1-placeholder").textContent;
  const p       = document.getElementById("tagline");

  // Type H1 once
  await type(h1Typer, h1Text, 55);

  // Loop tagline
  p.style.visibility = "visible";
  const phrases = [
    "Risk Management & Insurance Student",
    "Developer",
    "Problem Solver",
    "Part-time Joker"
  ];
  let idx = 0;
  while (true) {
    await type(p, phrases[idx], 45);
    await pause(1200);
    await erase(p, 30);
    idx = (idx + 1) % phrases.length;
  }
})();

/* ==================== NAVBAR COLLAPSE ==================== */
const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("collapsed");
  } else {
    navbar.classList.remove("collapsed");
  }
});

/* ==================== EASTER EGG ==================== */
const logo = document.getElementById("logo");
const gifs = ["images/batman-pondering.gif"];

logo.addEventListener("click", () => {
  const img = document.createElement("img");
  img.src = gifs[Math.floor(Math.random() * gifs.length)];
  img.className = "easter-egg";

  const x = Math.random() * (window.innerWidth - 100);
  const y = Math.random() * (window.innerHeight - 100);
  img.style.left = `${x}px`;
  img.style.top = `${y}px`;

  document.body.appendChild(img);
  setTimeout(() => img.remove(), 2000);
});

/* ==================== POPUP AFTER FORM SUBMIT ==================== */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("submitted") === "true") {
    const popup = document.getElementById("popup");
    if (popup) {
      popup.classList.add("show");
      setTimeout(() => {
        popup.classList.remove("show");
      }, 8000); // hide after 8s
    }
  }
});
