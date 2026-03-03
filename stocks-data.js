/* ==================== STOCKS (2023 → NOW) ==================== */
// Source: user-provided monthly trades (buy → sell, shares, P/L, end balance).
// "why" is intentionally editable. Update the text to reflect your real reasoning.

const tradesStartBalance = 2000;

const tradeLog = [
  // 2023
  { ym: "2023-01", monthLabel: "Jan 2023", ticker: "SMCI", why: "AI infrastructure / server demand momentum (update with your real thesis).", buy: 8.21, sell: 7.23, shares: 243.605359, netPL: -238.73, endBalance: 1761.27, returnPct: -11.94 },
  { ym: "2023-02", monthLabel: "Feb 2023", ticker: "SMCI", why: "Continuation trade after prior month volatility.", buy: 7.23, sell: 9.8, shares: 243.605809, netPL: 626.07, endBalance: 2387.34, returnPct: 35.55 },
  { ym: "2023-03", monthLabel: "Mar 2023", ticker: "AMD", why: "Semis strength / upside participation in AI cycle.", buy: 78.58, sell: 98.01, shares: 30.381013, netPL: 590.3, endBalance: 2977.64, returnPct: 24.73 },
  { ym: "2023-04", monthLabel: "Apr 2023", ticker: "MU", why: "Memory cycle setup; risk/reward for a rebound.", buy: 59.48, sell: 63.57, shares: 50.061197, netPL: 204.75, endBalance: 3182.39, returnPct: 6.88 },
  { ym: "2023-05", monthLabel: "May 2023", ticker: "MU", why: "Follow-through on memory thesis.", buy: 63.57, sell: 67.36, shares: 50.061192, netPL: 189.73, endBalance: 3372.12, returnPct: 5.96 },
  { ym: "2023-06", monthLabel: "Jun 2023", ticker: "AVGO", why: "Quality semi/infrastructure exposure.", buy: 77.8, sell: 83.98, shares: 43.343419, netPL: 267.86, endBalance: 3639.98, returnPct: 7.94 },
  { ym: "2023-07", monthLabel: "Jul 2023", ticker: "SMCI", why: "AI/server momentum re-entry.", buy: 24.92, sell: 33.03, shares: 146.066553, netPL: 1184.6, endBalance: 4824.58, returnPct: 32.54 },
  { ym: "2023-08", monthLabel: "Aug 2023", ticker: "AVGO", why: "Staying with semi leadership.", buy: 87.0, sell: 89.35, shares: 55.454941, netPL: 130.32, endBalance: 4954.9, returnPct: 2.7 },
  { ym: "2023-09", monthLabel: "Sep 2023", ticker: "MU", why: "Memory position despite chop (update with your rationale).", buy: 69.21, sell: 67.32, shares: 71.592322, netPL: -135.31, endBalance: 4819.59, returnPct: -2.73 },
  { ym: "2023-10", monthLabel: "Oct 2023", ticker: "SMCI", why: "High beta AI infra bet (volatile).", buy: 27.42, sell: 23.95, shares: 175.769083, netPL: -609.92, endBalance: 4209.67, returnPct: -12.65 },
  { ym: "2023-11", monthLabel: "Nov 2023", ticker: "AVGO", why: "Semi/infrastructure quality + momentum.", buy: 81.9, sell: 90.11, shares: 51.400135, netPL: 422.0, endBalance: 4631.67, returnPct: 10.02 },
  { ym: "2023-12", monthLabel: "Dec 2023", ticker: "SMCI", why: "Year-end momentum attempt.", buy: 27.35, sell: 28.43, shares: 169.347906, netPL: 182.9, endBalance: 4814.57, returnPct: 3.95 },

  // 2024
  { ym: "2024-01", monthLabel: "Jan 2024", ticker: "SMCI", why: "AI/server demand momentum breakout.", buy: 28.43, sell: 52.96, shares: 169.347999, netPL: 4154.11, endBalance: 8968.68, returnPct: 86.28 },
  { ym: "2024-02", monthLabel: "Feb 2024", ticker: "NVDA", why: "AI compute leader momentum.", buy: 61.49, sell: 79.07, shares: 145.855575, netPL: 2564.15, endBalance: 11532.83, returnPct: 28.59 },
  { ym: "2024-03", monthLabel: "Mar 2024", ticker: "NVDA", why: "Continuation in AI compute trend.", buy: 79.07, sell: 90.31, shares: 145.855559, netPL: 1639.42, endBalance: 13172.25, returnPct: 14.22 },
  { ym: "2024-04", monthLabel: "Apr 2024", ticker: "AVGO", why: "AI infrastructure exposure; diversify within semis.", buy: 130.16, sell: 127.69, shares: 101.19994, netPL: -249.97, endBalance: 12922.28, returnPct: -1.9 },
  { ym: "2024-05", monthLabel: "May 2024", ticker: "AVGO", why: "Hold/roll the same theme.", buy: 127.69, sell: 130.47, shares: 101.199921, netPL: 281.34, endBalance: 13203.62, returnPct: 2.18 },
  { ym: "2024-06", monthLabel: "Jun 2024", ticker: "MU", why: "Memory cycle + AI server demand for HBM/DRAM.", buy: 124.18, sell: 130.67, shares: 106.325736, netPL: 690.06, endBalance: 13893.68, returnPct: 5.23 },
  { ym: "2024-07", monthLabel: "Jul 2024", ticker: "AVGO", why: "Staying with quality infra exposure.", buy: 158.17, sell: 158.29, shares: 87.840158, netPL: 10.54, endBalance: 13904.22, returnPct: 0.08 },
  { ym: "2024-08", monthLabel: "Aug 2024", ticker: "SMCI", why: "High beta AI infra (risk month).", buy: 70.16, sell: 43.77, shares: 198.17875, netPL: -5229.94, endBalance: 8674.28, returnPct: -37.61 },
  { ym: "2024-09", monthLabel: "Sep 2024", ticker: "MU", why: "Memory rebound attempt after drawdown.", buy: 95.69, sell: 103.12, shares: 90.649767, netPL: 673.53, endBalance: 9347.81, returnPct: 7.76 },
  { ym: "2024-10", monthLabel: "Oct 2024", ticker: "SMCI", why: "Re-entry into high beta AI infra.", buy: 41.64, sell: 29.11, shares: 224.490758, netPL: -2812.87, endBalance: 6534.94, returnPct: -30.09 },
  { ym: "2024-11", monthLabel: "Nov 2024", ticker: "NVDA", why: "AI leader; tactical bounce.", buy: 132.72, sell: 138.2, shares: 49.238461, netPL: 269.83, endBalance: 6804.77, returnPct: 4.13 },
  { ym: "2024-12", monthLabel: "Dec 2024", ticker: "SMCI", why: "Year-end trade; accepted volatility.", buy: 32.64, sell: 30.48, shares: 208.478855, netPL: -450.32, endBalance: 6354.45, returnPct: -6.62 },

  // 2025
  { ym: "2025-01", monthLabel: "Jan 2025", ticker: "AVGO", why: "Quality AI infra; risk-managed exposure.", buy: 229.76, sell: 219.29, shares: 27.656904, netPL: -289.57, endBalance: 6064.88, returnPct: -4.56 },
  { ym: "2025-02", monthLabel: "Feb 2025", ticker: "MU", why: "Memory cycle continuation.", buy: 90.94, sell: 93.32, shares: 66.691004, netPL: 158.72, endBalance: 6223.6, returnPct: 2.62 },
  { ym: "2025-03", monthLabel: "Mar 2025", ticker: "MU", why: "Stayed with thesis; volatility month.", buy: 93.32, sell: 86.72, shares: 66.690986, netPL: -440.16, endBalance: 5783.44, returnPct: -7.07 },
  { ym: "2025-04", monthLabel: "Apr 2025", ticker: "MU", why: "Held/rolled MU again; drawdown continued.", buy: 86.72, sell: 76.8, shares: 66.690965, netPL: -661.57, endBalance: 5121.87, returnPct: -11.44 },
  { ym: "2025-05", monthLabel: "May 2025", ticker: "SMCI", why: "AI infra rebound trade.", buy: 31.86, sell: 40.02, shares: 160.761768, netPL: 1311.82, endBalance: 6433.69, returnPct: 25.61 },
  { ym: "2025-06", monthLabel: "Jun 2025", ticker: "AVGO", why: "AI infra strength / quality compounding.", buy: 240.62, sell: 274.65, shares: 26.738383, netPL: 909.89, endBalance: 7343.58, returnPct: 14.14 },
  { ym: "2025-07", monthLabel: "Jul 2025", ticker: "AVGO", why: "Continuation month.", buy: 274.65, sell: 292.64, shares: 26.738399, netPL: 481.02, endBalance: 7824.6, returnPct: 6.55 },
  { ym: "2025-08", monthLabel: "Aug 2025", ticker: "NVDA", why: "AI leader; smaller tactical position.", buy: 177.85, sell: 174.16, shares: 43.995502, netPL: -162.34, endBalance: 7662.26, returnPct: -2.07 },
  { ym: "2025-09", monthLabel: "Sep 2025", ticker: "AVGO", why: "Quality AI infra; momentum continuation.", buy: 296.31, sell: 329.28, shares: 25.858932, netPL: 852.57, endBalance: 8514.83, returnPct: 11.13 },
  { ym: "2025-10", monthLabel: "Oct 2025", ticker: "MU", why: "Memory cycle breakout month.", buy: 167.15, sell: 223.68, shares: 50.94125, netPL: 2879.71, endBalance: 11394.54, returnPct: 33.82 },
  { ym: "2025-11", monthLabel: "Nov 2025", ticker: "AVGO", why: "AI infra; steady leader.", buy: 368.92, sell: 402.19, shares: 30.886208, netPL: 1027.58, endBalance: 12422.12, returnPct: 9.02 },
  { ym: "2025-12", monthLabel: "Dec 2025", ticker: "MU", why: "Memory strength into year-end.", buy: 236.38, sell: 285.41, shares: 52.551485, netPL: 2576.6, endBalance: 14998.72, returnPct: 20.74 },

  // 2026
  { ym: "2026-01", monthLabel: "Jan 2026", ticker: "MU", why: "Memory momentum continued (update with your thesis).", buy: 285.41, sell: 414.88, shares: 52.551487, netPL: 6803.84, endBalance: 21802.56, returnPct: 45.36 },
  { ym: "2026-02", monthLabel: "Feb 2026", ticker: "MU", why: "Held MU; small pullback month.", buy: 414.88, sell: 409.14, shares: 52.551487, netPL: -301.65, endBalance: 21500.91, returnPct: -1.38 }
];

