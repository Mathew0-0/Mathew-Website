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
    "Accounting Student",
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

// ==================== POPUP AFTER FORM SUBMIT ====================
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("submitted") === "true") {
    const popup = document.getElementById("popup");
    if (popup) {
      popup.classList.add("show");
      setTimeout(() => {
        popup.classList.remove("show");
      }, 8000); // hide after 8 seconds
    }
  }
});

/* ==================== STOCKS SECTION ==================== */
let performanceChart = null;

function initStocksSection() {
  const yearSelect = document.getElementById("year-select");
  const monthSelect = document.getElementById("month-select");
  
  // Set default to current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  yearSelect.value = currentYear;
  monthSelect.value = currentMonth;
  
  // Event listeners
  yearSelect.addEventListener("change", updateStocksDisplay);
  monthSelect.addEventListener("change", updateStocksDisplay);
  
  // Initial display
  updateStocksDisplay();
}

function updateStocksDisplay() {
  const yearSelect = document.getElementById("year-select");
  const monthSelect = document.getElementById("month-select");
  const year = parseInt(yearSelect.value);
  const month = parseInt(monthSelect.value);
  
  const monthData = stocksData[year]?.[month];
  if (!monthData) return;
  
  // Update title
  document.getElementById("stock-month-title").textContent = `${monthData.month} ${year}`;
  
  // Update prediction
  document.getElementById("stock-prediction").textContent = monthData.prediction;
  
  // Update scorecard
  updateScorecard(monthData);
  
  // Update chart
  updatePerformanceChart(monthData);
  
  // Update simulator
  updateGainSimulator(monthData);
}

function updateScorecard(monthData) {
  const container = document.getElementById("scorecard-container");
  const content = document.getElementById("scorecard-content");
  
  if (!monthData.scorecard) {
    container.classList.add("scorecard-hidden");
    return;
  }
  
  container.classList.remove("scorecard-hidden");
  content.innerHTML = "";
  
  Object.entries(monthData.scorecard).forEach(([ticker, return_pct]) => {
    const isPositive = return_pct >= 0;
    const item = document.createElement("div");
    item.className = "scorecard-item";
    item.innerHTML = `
      <span class="scorecard-ticker">${ticker}</span>
      <span class="scorecard-return ${isPositive ? "positive" : "negative"}">
        ${isPositive ? "+" : ""}${return_pct.toFixed(2)}%
      </span>
    `;
    content.appendChild(item);
  });
}

function updatePerformanceChart(monthData) {
  const canvas = document.getElementById("performanceChart");
  const ctx = canvas.getContext("2d");
  
  // Get stocks to display (filter out 0 values)
  const stocks = Object.entries(monthData.stocks)
    .filter(([ticker, return_pct]) => return_pct !== 0)
    .sort((a, b) => b[1] - a[1]); // Sort by return descending
  
  if (stocks.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ccc";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("No data available for this month", canvas.width / 2, canvas.height / 2);
    return;
  }
  
  const labels = stocks.map(s => s[0]);
  const returns = stocks.map(s => s[1]);
  
  // Destroy old chart if exists
  if (performanceChart) {
    performanceChart.destroy();
  }
  
  // Start with zero data for animation
  const zeroData = new Array(returns.length).fill(0);
  
  performanceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Return %",
        data: zeroData,
        backgroundColor: returns.map(r => r >= 0 ? "#51cf66" : "#ff6b6b"),
        borderColor: returns.map(r => r >= 0 ? "#2f8a3f" : "#cc5555"),
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#00bcd4",
          borderWidth: 1,
          padding: 12,
          titleFont: { size: 14, weight: "bold" },
          callbacks: {
            label: (context) => `Return: ${context.parsed.y >= 0 ? "+" : ""}${context.parsed.y.toFixed(2)}%`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#ccc" },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          title: { display: true, text: "Return %", color: "#fff" }
        },
        x: {
          ticks: { color: "#ccc" },
          grid: { display: false }
        }
      }
    }
  });
  
  // Animate bars charging up
  animateChartBars(returns, 4000);
}

function animateChartBars(targetValues, duration) {
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Animate values
    const currentData = targetValues.map(val => val * progress);
    performanceChart.data.datasets[0].data = currentData;
    performanceChart.update();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}

function updateGainSimulator(monthData) {
  const container = document.getElementById("simulator-results");
  container.innerHTML = "";
  
  // Get stocks with actual returns
  const stocks = Object.entries(monthData.stocks)
    .filter(([ticker, return_pct]) => return_pct !== 0)
    .sort((a, b) => b[1] - a[1]);
  
  if (stocks.length === 0) {
    container.innerHTML = "<p style=\"color: #ccc;\">No prediction data available for this month.</p>";
    return;
  }
  
  stocks.forEach(([ticker, returnPct]) => {
    const gain = calculateGains(returnPct, 1000);
    const finalValue = 1000 + gain;
    const isPositive = returnPct >= 0;
    
    const card = document.createElement("div");
    card.className = `simulator-stock ${isPositive ? "positive" : "negative"}`;
    card.innerHTML = `
      <h4>${ticker}</h4>
      <p>Return: ${isPositive ? "+" : ""}${returnPct.toFixed(2)}%</p>
      <p>Initial: $1,000</p>
      <p>Final Value: $${finalValue.toFixed(2)}</p>
      <div class="gain-amount ${isPositive ? "positive" : "negative"}">
        ${isPositive ? "+" : ""}$${gain.toFixed(2)}
      </div>
    `;
    container.appendChild(card);
  });
}

// Initialize stocks section when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStocksSection);
} else {
  initStocksSection();
}
