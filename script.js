// Slide-up animation for Projects & Volunteer
const cards = document.querySelectorAll(".project-card");
window.addEventListener("scroll", checkCards);
function checkCards() {
  const triggerBottom = window.innerHeight * 0.8;
  cards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;
    if (cardTop < triggerBottom) card.classList.add("show");
  });
}

// Add slide-up for about text + slides
const aboutElements = document.querySelectorAll(".about-text, .about-slide");

window.addEventListener("scroll", checkAbout);

function checkAbout() {
  const triggerBottom = window.innerHeight * 0.8;
  aboutElements.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < triggerBottom) {
      el.classList.add("show");
    }
  });
}


// --- Typing helpers ---
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

// --- Apply to hero: H1 types in overlay (no shift), tagline loops (no shift) ---
(async () => {
  const h1Typer = document.getElementById("h1-typer");
  const h1Text  = document.querySelector(".h1-placeholder").textContent;
  const p       = document.getElementById("tagline");

  // 1) Type H1 into overlay; placeholder reserves space so nothing moves
  await type(h1Typer, h1Text, 55);

  // 2) Reveal the reserved tagline line and loop phrases
  p.style.visibility = "visible";     // shows the line without changing height

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

// Collapse navbar after scrolling down
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("collapsed");
  } else {
    navbar.classList.remove("collapsed");
  }
});

