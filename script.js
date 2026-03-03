/* ==================== SLIDE-UP ANIMATIONS ==================== */
function revealOnScroll() {
  const triggerBottom = window.innerHeight * 0.8;

  document.querySelectorAll(
    ".project-card, .about-text, .about-slide, .resume-card, .selected-trade, .chart-container"
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
let profitsByCompanyChart = null;
let buySellChart = null;

function fmtMoney(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
function fmtPct(n) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}
function clsPosNeg(n) {
  return n >= 0 ? "positive" : "negative";
}
function getYear(row) {
  return parseInt(String(row.ym).slice(0, 4), 10);
}
function getMonth(row) {
  return parseInt(String(row.ym).slice(5, 7), 10);
}

function initStocksSection() {
  if (!Array.isArray(tradeLog) || tradeLog.length === 0) return;

  const yearSelect = document.getElementById("year-select");
  const monthSelect = document.getElementById("month-select");
  if (!yearSelect || !monthSelect) return;

  // Default to latest year/month in the data.
  const last = tradeLog[tradeLog.length - 1];
  const defaultYear = getYear(last);
  const defaultMonth = getMonth(last);
  yearSelect.value = String(defaultYear);
  monthSelect.value = String(defaultMonth);

  yearSelect.addEventListener("change", updateStocksDisplay);
  monthSelect.addEventListener("change", updateStocksDisplay);

  updateStocksDisplay();
}

function updateStocksDisplay() {
  if (!Array.isArray(tradeLog) || tradeLog.length === 0) return;

  const yearSelect = document.getElementById("year-select");
  const monthSelect = document.getElementById("month-select");
  const year = parseInt(yearSelect.value, 10);
  const month = parseInt(monthSelect.value, 10);

  const allRows = tradeLog.slice().sort((a, b) => (a.ym > b.ym ? 1 : -1));

  renderProfitsByCompanyStacked(allRows, year, month);
  renderBuySellLine(year, month);
  renderSelectedTrade(year, month);
}

function renderSelectedTrade(year, month) {
  const container = document.getElementById("selected-trade");
  if (!container) return;

  const trade = tradeLog.find(r => getYear(r) === year && getMonth(r) === month);
  if (!trade) {
    container.innerHTML = `<p style="color:#aaa;">No trade recorded for this month.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="selected-trade-row">
      <div><span class="muted">Month</span><div>${trade.monthLabel}</div></div>
      <div><span class="muted">Ticker</span><div><strong>${trade.ticker}</strong></div></div>
      <div class="selected-trade-why"><span class="muted">Why</span><div>${trade.why ?? ""}</div></div>
      <div><span class="muted">Buy</span><div>${fmtMoney(trade.buy)}</div></div>
      <div><span class="muted">Sell</span><div>${fmtMoney(trade.sell)}</div></div>
      <div><span class="muted">Shares</span><div>${Number(trade.shares).toLocaleString(undefined, { maximumFractionDigits: 6 })}</div></div>
      <div><span class="muted">Net P/L</span><div class="${clsPosNeg(trade.netPL)}">${fmtMoney(trade.netPL)}</div></div>
      <div><span class="muted">End Balance</span><div>${fmtMoney(trade.endBalance)}</div></div>
      <div><span class="muted">Return</span><div class="${clsPosNeg(trade.returnPct)}">${fmtPct(trade.returnPct)}</div></div>
    </div>
  `;
}

function renderBuySellLine(year, month) {
  const canvas = document.getElementById("buySellChart");
  const title = document.getElementById("buy-sell-title");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const trade = tradeLog.find(r => getYear(r) === year && getMonth(r) === month);
  if (!trade) {
    if (buySellChart) buySellChart.destroy();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (title) title.textContent = "Buy → Sell Price (selected month)";
    return;
  }

  if (title) title.textContent = `Buy → Sell Price — ${trade.monthLabel} (${trade.ticker})`;

  const labels = Array.from({ length: 20 }, (_, i) => `Day ${i + 1}`);
  const prices = buildZigZagSeries(trade.buy, trade.sell, 20, `${trade.ym}:${trade.ticker}`);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.15 || (max * 0.05) || 1;

  if (buySellChart) buySellChart.destroy();
  buySellChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Price",
          data: prices,
          borderColor: "#00bcd4",
          backgroundColor: "rgba(0, 188, 212, 0.15)",
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.25
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 10, right: 10, bottom: 30, left: 10 } },
      animation: {
        duration: 0
      },
      animations: {
        y: {
          type: "number",
          easing: "easeOutCubic",
          duration: 900,
          from: NaN,
          delay: ctx => ctx.dataIndex * 45
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.85)",
          borderColor: "#00bcd4",
          borderWidth: 1,
          titleColor: "#fff",
          bodyColor: "#fff",
          callbacks: {
            label: (context) => `Price: ${fmtMoney(context.parsed.y)}`
          }
        }
      },
      scales: {
        y: {
          min: min - pad,
          max: max + pad,
          ticks: { color: "#ccc", callback: (v) => fmtMoney(Number(v)) },
          grid: { color: "rgba(255,255,255,0.10)" },
          title: { display: true, text: "Price", color: "#fff" }
        },
        x: {
          ticks: { color: "#ccc", maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
          grid: { display: false }
        }
      }
    }
  });
}

function buildZigZagSeries(start, end, points, seedStr) {
  const s = Number(start);
  const e = Number(end);
  if (!Number.isFinite(s) || !Number.isFinite(e) || points <= 2) return [s, e];

  // Deterministic pseudo-random based on seed string.
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  const out = new Array(points);
  out[0] = s;
  out[points - 1] = e;

  const drift = (e - s) / (points - 1);
  const baseVol = Math.max(Math.abs(e - s) * 0.08, Math.max(s, e) * 0.01);

  for (let i = 1; i < points - 1; i++) {
    const t = i / (points - 1);
    const trend = s + drift * i;
    const wave = Math.sin(t * Math.PI * 3) * baseVol * 0.35;
    const noise = (rand() - 0.5) * baseVol;
    out[i] = trend + wave + noise;
  }

  // Keep within a reasonable band around endpoints.
  const lo = Math.min(s, e) - baseVol * 2.5;
  const hi = Math.max(s, e) + baseVol * 2.5;
  for (let i = 0; i < out.length; i++) out[i] = Math.min(hi, Math.max(lo, out[i]));

  // Ensure exact endpoints.
  out[0] = s;
  out[out.length - 1] = e;
  return out;
}

function renderProfitsByCompanyStacked(allRows, year, month) {
  const canvas = document.getElementById("profitsByCompanyChart");
  const title = document.getElementById("profits-by-company-title");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (!allRows || allRows.length === 0) {
    if (profitsByCompanyChart) profitsByCompanyChart.destroy();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (title) title.textContent = "Profits by Company (stacked)";
    return;
  }

  // All months up to selected (no yearly reset)
  const ymSelected = `${year}-${String(month).padStart(2, "0")}`;
  const rowsUpTo = allRows.filter(r => String(r.ym) <= ymSelected);
  if (!rowsUpTo.length) {
    if (profitsByCompanyChart) profitsByCompanyChart.destroy();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (title) title.textContent = "Profits by Company (stacked)";
    return;
  }

  // Cumulative gain per company (global, up to selected month)
  const totals = new Map(); // ticker -> cumulative netPL
  rowsUpTo.forEach(r => {
    totals.set(r.ticker, (totals.get(r.ticker) ?? 0) + r.netPL);
  });

  const tickers = Array.from(totals.keys());
  const gains = tickers.map(t => totals.get(t) ?? 0);

  const datasets = [
    {
      label: "Net P/L",
      data: gains,
      backgroundColor: gains.map(v => (v >= 0 ? "#51cf66" : "#ff6b6b")),
      borderColor: gains.map(v => (v >= 0 ? "#2f8a3f" : "#cc5555")),
      borderWidth: 2
    }
  ];

  if (profitsByCompanyChart) profitsByCompanyChart.destroy();
  profitsByCompanyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: tickers,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 10, right: 10, bottom: 30, left: 10 } },
      animation: {
        duration: 0
      },
      animations: {
        y: {
          type: "number",
          easing: "easeOutCubic",
          duration: 900,
          from: 0
        }
      },
      plugins: {
        legend: { labels: { color: "#ccc" } },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.85)",
          borderColor: "#00bcd4",
          borderWidth: 1,
          titleColor: "#fff",
          bodyColor: "#fff",
          callbacks: {
            label: (context) => `${context.dataset.label}: ${fmtMoney(context.parsed.y || 0)}`
          }
        }
      },
      scales: {
        x: { ticks: { color: "#ccc" }, grid: { display: false } },
        y: {
          ticks: { color: "#ccc", callback: (v) => fmtMoney(Number(v)) },
          grid: { color: "rgba(255,255,255,0.08)" }
        }
      }
    }
  });
}

function renderTradesTable(yearRows, month) {
  const tbody = document.getElementById("stocks-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (!yearRows || yearRows.length === 0) return;

  const filtered = yearRows.filter(r => getMonth(r) === month);
  const rows = filtered.length ? filtered : yearRows;

  rows
    .slice()
    .sort((a, b) => (a.ym > b.ym ? -1 : 1))
    .forEach(row => {
      const isSelected = getMonth(row) === month;
      const tr = document.createElement("tr");
      if (isSelected) tr.classList.add("selected-month-row");
      tr.innerHTML = `
        <td>${row.monthLabel}</td>
        <td><strong>${row.ticker}</strong></td>
        <td>${row.why ?? ""}</td>
        <td>${fmtMoney(row.buy)}</td>
        <td>${fmtMoney(row.sell)}</td>
        <td>${Number(row.shares).toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
        <td class="${clsPosNeg(row.netPL)}">${fmtMoney(row.netPL)}</td>
        <td>${fmtMoney(row.endBalance)}</td>
        <td class="${clsPosNeg(row.returnPct)}">${fmtPct(row.returnPct)}</td>
      `;
      tbody.appendChild(tr);
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStocksSection);
} else {
  initStocksSection();
}
