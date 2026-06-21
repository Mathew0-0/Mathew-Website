/* ==================== SLIDE-UP ANIMATIONS ==================== */
function revealOnScroll() {
  const triggerBottom = window.innerHeight * 0.8;

  document.querySelectorAll(
    ".project-card, .about-text, .about-slide, .resume-card, .selected-trade, .chart-container, .screener-picks, .stocks-kpis, .stocks-log, .strategy-comparison"
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

/* ==================== PORTFOLIO & SCREENER SECTION ==================== */
let strategyCompareChart = null;

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

function initPortfolioSection() {
  populateStrategyPeriodSelect();
  renderStrategyComparison();
}

function getStrategyComparisonRoot() {
  return portfolioData?.strategyComparison ?? null;
}

function getActiveStrategyPeriod() {
  const root = getStrategyComparisonRoot();
  if (!root?.periods) return null;
  const select = document.getElementById("strategy-period-select");
  const id = select?.value || root.defaultPeriod || Object.keys(root.periods)[0];
  return root.periods[id] ?? null;
}

function populateStrategyPeriodSelect() {
  const root = getStrategyComparisonRoot();
  const select = document.getElementById("strategy-period-select");
  if (!root?.periods || !select) return;

  const entries = Object.entries(root.periods);
  select.innerHTML = entries.map(([id, p]) => {
    const label = p.label || `${p.period?.startLabel} – ${p.period?.endLabel}`;
    return `<option value="${id}">${label}</option>`;
  }).join("");

  select.value = root.defaultPeriod || entries[0][0];
  if (!select.dataset.bound) {
    select.addEventListener("change", renderStrategyComparison);
    select.dataset.bound = "1";
  }
}

function renderStrategyComparison() {
  const cmp = getActiveStrategyPeriod();
  const root = document.getElementById("strategy-comparison");
  if (!cmp || !root) return;

  const ai = cmp.aiStrategy;
  const manual = cmp.manualStrategy;
  const bench = cmp.benchmark;
  const period = cmp.period;
  const verdict = cmp.verdict;
  const benchLabel = bench.name || "Nasdaq-100 (QQQ)";

  const titleEl = document.getElementById("strategy-comparison-title");
  if (titleEl) {
    titleEl.textContent = `AI Screener vs My Holdings — ${period.startLabel}–${period.endLabel}`;
  }

  const chartTitle = document.getElementById("strategy-chart-title");
  if (chartTitle) {
    chartTitle.textContent = `$1,000 Growth — AI vs My Holdings vs ${benchLabel}`;
  }

  const verdictEl = document.getElementById("strategy-verdict");
  if (verdictEl) {
    const winnerLabel = verdict.winner === "ai"
      ? "AI screener wins"
      : verdict.winner === "manual"
        ? "Your holdings win"
        : "Tie";
    verdictEl.innerHTML = `
      <strong>${winnerLabel}</strong> by ${fmtMoney(verdict.marginDollars)} over
      ${period.startLabel}–${period.endLabel}. ${verdict.summary}
    `;
  }

  const kpis = document.getElementById("strategy-kpis");
  if (kpis) {
    kpis.innerHTML = `
      <div class="stocks-kpi">
        <div class="stocks-kpi-label">${ai.name}</div>
        <div class="stocks-kpi-value ${clsPosNeg(ai.returnPct)}">${fmtMoney(ai.endBalance)}</div>
        <div class="muted">${fmtPct(ai.returnPct)} · Top 3 @ 33% each</div>
      </div>
      <div class="stocks-kpi">
        <div class="stocks-kpi-label">${manual.name}</div>
        <div class="stocks-kpi-value ${clsPosNeg(manual.returnPct)}">${fmtMoney(manual.endBalance)}</div>
        <div class="muted">${fmtPct(manual.returnPct)} · Buy &amp; hold (drifts)</div>
      </div>
      <div class="stocks-kpi">
        <div class="stocks-kpi-label">${benchLabel}</div>
        <div class="stocks-kpi-value ${clsPosNeg(bench.returnPct)}">${fmtMoney(bench.endBalance)}</div>
        <div class="muted">${fmtPct(bench.returnPct)} · Benchmark</div>
      </div>
      <div class="stocks-kpi">
        <div class="stocks-kpi-label">Starting Capital</div>
        <div class="stocks-kpi-value">${fmtMoney(period.startingCapital)}</div>
        <div class="muted">Walk-forward (no look-ahead)</div>
      </div>
    `;
  }

  const aiCard = document.getElementById("ai-strategy-card");
  if (aiCard) {
    aiCard.innerHTML = `
      <h4>${ai.name}</h4>
      <p class="muted">${ai.description}</p>
      <ul class="strategy-rules">
        <li>Momentum: 20-day return &gt; 0%</li>
        <li>RSI: 30–70 range</li>
        <li>Volume: ≥ 80% of 20-day average</li>
        <li>Signals use <em>prior-month</em> close only</li>
      </ul>
    `;
  }

  const manualCard = document.getElementById("manual-strategy-card");
  if (manualCard) {
    const phases = (manual.phases ?? []).map(p => {
      const weights = Object.entries(p.initialWeights ?? p.weights ?? {})
        .map(([t, w]) => `${Math.round(w * 100)}% ${t}`)
        .join(" · ");
      const range = p.toYm ? `${p.fromYm} → ${p.toYm}` : `${p.fromYm} → present`;
      return `<li><strong>${p.label}</strong> (${range}): started ${weights}</li>`;
    }).join("");
    manualCard.innerHTML = `
      <h4>${manual.name}</h4>
      <p class="muted">${manual.description}</p>
      <ul class="strategy-rules">${phases}</ul>
    `;
  }

  renderStrategyChart(cmp, benchLabel);
  renderStrategyTable(cmp);
}

function renderStrategyChart(cmp, benchLabel) {
  const canvas = document.getElementById("strategyCompareChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const ai = cmp.aiStrategy.equityCurve ?? [];
  const manual = cmp.manualStrategy.equityCurve ?? [];
  const bench = cmp.benchmark.equityCurve ?? [];
  const labels = ai.map(r => r.label);

  if (strategyCompareChart) strategyCompareChart.destroy();
  strategyCompareChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "AI Screener",
          data: ai.map(r => r.value),
          borderColor: "#00bcd4",
          backgroundColor: "rgba(0, 188, 212, 0.08)",
          borderWidth: 2.5,
          pointRadius: 0,
          tension: 0.2,
          fill: true
        },
        {
          label: "My Holdings",
          data: manual.map(r => r.value),
          borderColor: "#51cf66",
          borderWidth: 2.5,
          pointRadius: 0,
          tension: 0.2
        },
        {
          label: benchLabel,
          data: bench.map(r => r.value),
          borderColor: "#888",
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          tension: 0.2
        }
      ]
    },
    options: chartOptions(fmtMoney)
  });
}

function renderStrategyTable(cmp) {
  const tbody = document.getElementById("strategy-table-body");
  if (!tbody) return;

  const aiByYm = new Map((cmp.aiStrategy.monthlyReports ?? []).map(r => [r.ym, r]));
  const manualByYm = new Map((cmp.manualStrategy.monthlyReports ?? []).map(r => [r.ym, r]));
  const months = [...aiByYm.keys()].reverse();

  tbody.innerHTML = months.map(ym => {
    const ai = aiByYm.get(ym);
    const manual = manualByYm.get(ym);
    const aiPicks = (ai?.picks ?? []).map(p => p.ticker).join(", ") || "—";
    const manualHoldings = (manual?.holdings ?? [])
      .map(h => `${(h.actualWeight * 100).toFixed(1)}% ${h.ticker}`)
      .join(" · ") || "—";
    return `
      <tr>
        <td>${ai?.monthLabel ?? ym}</td>
        <td>${aiPicks}</td>
        <td class="${clsPosNeg(ai?.returnPct ?? 0)}">${fmtPct(ai?.returnPct ?? 0)}</td>
        <td>${fmtMoney(ai?.balance ?? 0)}</td>
        <td>${manualHoldings}</td>
        <td class="${clsPosNeg(manual?.returnPct ?? 0)}">${fmtPct(manual?.returnPct ?? 0)}</td>
        <td>${fmtMoney(manual?.balance ?? 0)}</td>
      </tr>
    `;
  }).join("");
}

function chartOptions(yFormat) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { labels: { color: "#ccc" } },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.85)",
        borderColor: "#00bcd4",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${yFormat(ctx.parsed.y)}`
        }
      }
    },
    scales: {
      x: { ticks: { color: "#ccc", maxTicksLimit: 8 }, grid: { display: false } },
      y: {
        ticks: { color: "#ccc", callback: v => yFormat(Number(v)) },
        grid: { color: "rgba(255,255,255,0.08)" }
      }
    }
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPortfolioSection);
} else {
  initPortfolioSection();
}