/* ==================== STOCKS DATA ==================== */
const stocksData = {
  2024: {
    1: {
      month: "January",
      year: 2024,
      prediction: "For January, I'm leaning into \"AI beta\" and megacap momentum: NVDA and META should lead on continued enthusiasm around compute and advertising efficiency. I'm also expecting TSLA to underperform on headline sensitivity (pricing narrative, delivery chatter, and CEO-driven volatility), while SPY likely grinds higher unless rates spike abruptly.",
      scorecard: { NVDA: 24, META: 10, TSLA: -24, SPY: 1.6 },
      stocks: { NVDA: 24, META: 10, TSLA: -24, SPY: 1.6 }
    },
    2: {
      month: "February",
      year: 2024,
      prediction: "For February, I'm staying bullish on NVDA and META (momentum tends to persist after strong Januaries). I also expect TSLA to bounce somewhat (oversold snapback potential), while AMD participates but may lag NVDA if the market keeps rewarding the clear \"AI winner\" trade.",
      scorecard: { NVDA: 24.24, META: 10.22, TSLA: -24.63, SPY: 1.59 },
      stocks: { NVDA: 24.24, META: 10.22, TSLA: -24.63, AMD: 0, SPY: 1.59 }
    },
    3: {
      month: "March",
      year: 2024,
      prediction: "For March, I'm rotating slightly: MU looks positioned for a \"memory cycle optimism\" move (AI servers pull through DRAM/HBM narratives), while NVDA can still outperform even if the pace cools. I'm cautious on TSLA again—if anything spooks risk appetite, it tends to show up there first.",
      scorecard: { NVDA: 28.58, META: 25.76, TSLA: 7.79, AMD: 14.81 },
      stocks: { NVDA: 28.58, META: 25.76, TSLA: 7.79, AMD: 14.81, MU: 0, SPY: 0 }
    },
    4: {
      month: "April",
      year: 2024,
      prediction: "For April, I'm expecting a volatility reset: after a hot Q1, NVDA and META look vulnerable to a digestion/pullback month, and the broad market (SPY/QQQ) could wobble if rates or positioning becomes the story. I'd rather be defensive into April and re-add on weakness.",
      scorecard: { MU: 30.23, NVDA: 14.22, TSLA: -12.92, SPY: 3.27 },
      stocks: { MU: 30.23, NVDA: 14.22, TSLA: -12.92, SPY: 3.27, META: 0 }
    },
    5: {
      month: "May",
      year: 2024,
      prediction: "For May, I'm looking for a rebound after April's air pocket: I like NVDA to reassert leadership, with META stabilizing and AMD modestly positive if risk appetite returns. If the tape turns \"AI momentum\" again, May should look meaningfully better than April.",
      scorecard: { NVDA: -4.38, META: -11.41, SPY: -4.03 },
      stocks: { NVDA: -4.38, META: -11.41, SPY: -4.03, AMD: 0, TSLA: 0 }
    },
    6: {
      month: "June",
      year: 2024,
      prediction: "For June, I'm broadening semis: AVGO looks attractive as a \"picks-and-shovels\" AI infrastructure winner, while NVDA remains a core momentum name. I also expect TSLA to do better than people think if the market stays constructive—when the tape is green, it can rip quickly.",
      scorecard: { NVDA: 26.89, META: 8.52, AMD: 5.38, TSLA: -2.84 },
      stocks: { NVDA: 26.89, META: 8.52, AMD: 5.38, TSLA: -2.84, AVGO: 0, SPY: 0 }
    },
    7: {
      month: "July",
      year: 2024,
      prediction: "For July, I'm calling for a choppier month under the surface: I expect MU and WDC to cool (crowded cyclicals can unwind fast), with NVDA also at risk of a breather. I still think the index level (SPY) can be okay even if leadership rotates.",
      scorecard: { AVGO: 21.23, NVDA: 12.69, TSLA: 11.12, MU: 5.22 },
      stocks: { AVGO: 21.23, NVDA: 12.69, TSLA: 11.12, MU: 5.22, WDC: 0, SPY: 0 }
    },
    8: {
      month: "August",
      year: 2024,
      prediction: "For August, I like META as a \"quality growth\" catch-up if the tape stays firm, and I'm expecting TSLA to slip back into volatility (these moves rarely travel in straight lines). I also think NVDA stabilizes—less fireworks, more grind.",
      scorecard: { META: 9.79, TSLA: -7.74, NVDA: 2.01, SPY: 2.34 },
      stocks: { META: 9.79, TSLA: -7.74, NVDA: 2.01, SPY: 2.34, WDC: 0 }
    },
    9: {
      month: "September",
      year: 2024,
      prediction: "For September, I'm leaning into \"re-acceleration\": I like TSLA for a momentum swing (when sentiment turns, it can be violent), with AMD participating if growth re-prices higher. I also expect WDC to be positive if storage demand narratives re-emerge.",
      scorecard: { TSLA: 22.19, AMD: 10.45, WDC: 4.12, SPY: 2.10 },
      stocks: { TSLA: 22.19, AMD: 10.45, WDC: 4.12, SPY: 2.10, NVDA: 0, META: 0 }
    },
    10: {
      month: "October",
      year: 2024,
      prediction: "For October, I'm back to semis leadership: NVDA looks poised to lead again, while TSLA feels vulnerable to a down month if risk appetite fades. I'm also looking for the index (SPY) to be roughly flat-to-down—more chop than trend.",
      scorecard: { NVDA: 9.32, TSLA: -4.50, SPY: -0.89, META: -0.85 },
      stocks: { NVDA: 9.32, TSLA: -4.50, SPY: -0.89, META: -0.85, AMD: 0, WDC: 0 }
    },
    11: {
      month: "November",
      year: 2024,
      prediction: "For November, I'm calling for a broad risk-on push: SPY up, NVDA up, and (counterintuitively) TSLA potentially ripping on sentiment reversal. My one \"soft spot\" is AMD, which can lag if leadership narrows back to the very top winners.",
      scorecard: { TSLA: 38.15, SPY: 5.96, NVDA: 4.14, AMD: -4.78 },
      stocks: { TSLA: 38.15, SPY: 5.96, NVDA: 4.14, AMD: -4.78, META: 0 }
    },
    12: {
      month: "December",
      year: 2024,
      prediction: "For December, I'm expecting a year-end \"beta grab\": TSLA and AVGO look like candidates for outsized upside if risk-on accelerates, while SPY should be positive unless rates shock. I'm more cautious on AMD—it can be the odd one out if positioning is messy.",
      scorecard: { AVGO: 43.42, TSLA: 17.00, SPY: -2.41, AMD: -11.95 },
      stocks: { AVGO: 43.42, TSLA: 17.00, SPY: -2.41, AMD: -11.95, NVDA: 0, META: 0 }
    }
  },
  2025: {
    1: {
      month: "January",
      year: 2025,
      prediction: "For January, I'm positioning for a \"leadership shakeout\": I expect NVDA to pull back after extended strength, while META holds up better as a cash-flow compounder. I also like WDC for a storage-cycle momentum trade, with SPY modestly positive if the drawdowns stay contained.",
      scorecard: { NVDA: -10.59, META: 17.71, WDC: 9.22, SPY: 2.69 },
      stocks: { NVDA: -10.59, META: 17.71, WDC: 9.22, SPY: 2.69, TSLA: 0, AMD: 0 }
    },
    2: {
      month: "February",
      year: 2025,
      prediction: "For February, I'm calling TSLA downside again—too much headline risk, and when the market wants to punish sentiment names, it does it fast. I also expect AMD to struggle, while NVDA could bounce (even in corrections, leadership often mean-reverts upward).",
      scorecard: { TSLA: -27.59, AMD: -13.88, NVDA: 4.04, SPY: -1.27 },
      stocks: { TSLA: -27.59, AMD: -13.88, NVDA: 4.04, SPY: -1.27, META: 0, WDC: 0 }
    },
    3: {
      month: "March",
      year: 2025,
      prediction: "For March, I'm expecting a risk-off pocket: NVDA and META both look vulnerable to a correlated growth drawdown, and I'm bearish the index (SPY) as well. If this gets messy, storage cyclicals like WDC can also get hit.",
      scorecard: { NVDA: -13.23, META: -13.67, SPY: -5.57, WDC: -17.37 },
      stocks: { NVDA: -13.23, META: -13.67, SPY: -5.57, WDC: -17.37, TSLA: 0, AMD: 0 }
    },
    4: {
      month: "April",
      year: 2025,
      prediction: "For April, I'm looking for a relief rally led by high beta: TSLA up, AVGO up (AI infra remains resilient), while AMD stays soft. I'm still not expecting a big index surge—more like stabilization than a new melt-up.",
      scorecard: { TSLA: 8.87, AVGO: 14.96, AMD: -5.25, SPY: -0.87 },
      stocks: { TSLA: 8.87, AVGO: 14.96, AMD: -5.25, SPY: -0.87, NVDA: 0, META: 0 }
    },
    5: {
      month: "May",
      year: 2025,
      prediction: "For May, I'm flipping bullish: I expect NVDA to re-lead, META to rebound, and TSLA to participate aggressively if liquidity and risk appetite return. I also expect SPY to have a strong up month if the April stabilization thesis is right.",
      scorecard: { NVDA: 24.06, META: 17.94, TSLA: 22.79, SPY: 6.28 },
      stocks: { NVDA: 24.06, META: 17.94, TSLA: 22.79, SPY: 6.28, AMD: 0, AVGO: 0 }
    },
    6: {
      month: "June",
      year: 2025,
      prediction: "For June, I'm leaning into \"hardware leverage\": MU and WDC look set up for outsized upside (memory + storage are classic high-beta cycle plays), and I think AMD can finally catch a strong month. If this happens, NVDA likely remains positive as the umbrella trade.",
      scorecard: { MU: 30.48, AMD: 28.15, WDC: 24.36, NVDA: 16.93 },
      stocks: { MU: 30.48, AMD: 28.15, WDC: 24.36, NVDA: 16.93, META: 0, TSLA: 0 }
    },
    7: {
      month: "July",
      year: 2025,
      prediction: "For July, I expect momentum continuation in semis: AMD and NVDA should both remain strong, with WDC still benefiting from \"data growth\" tailwinds. I'm not expecting the index to be the story—more leadership-driven gains than broad euphoria.",
      scorecard: { AMD: 24.25, NVDA: 12.58, WDC: 22.97, SPY: 2.30 },
      stocks: { AMD: 24.25, NVDA: 12.58, WDC: 22.97, SPY: 2.30, META: 0, TSLA: 0 }
    },
    8: {
      month: "August",
      year: 2025,
      prediction: "For August, I'm calling for a leadership pause: I expect META and NVDA to be down (or at least meaningfully softer), while SPY can still be positive if rotation stays orderly. I also expect WDC to hold up better than the semis if storage sentiment stays firm.",
      scorecard: { META: -4.49, NVDA: -2.07, SPY: 2.05, WDC: 2.10 },
      stocks: { META: -4.49, NVDA: -2.07, SPY: 2.05, WDC: 2.10, AMD: 0, TSLA: 0 }
    },
    9: {
      month: "September",
      year: 2025,
      prediction: "For September, I'm leaning into \"cyclicals with torque\": WDC is my top boom candidate, and I also like TSLA and MU for upside (sentiment + beta). I expect SPY to be positive, but smaller than the high-beta names if this scenario plays out.",
      scorecard: { WDC: 49.61, TSLA: 33.20, MU: 40.59, SPY: 3.56 },
      stocks: { WDC: 49.61, TSLA: 33.20, MU: 40.59, SPY: 3.56, NVDA: 0, META: 0 }
    },
    10: {
      month: "October",
      year: 2025,
      prediction: "For October, I'm expecting a \"catch-up spike\" in AMD, with MU also strong if the hardware cycle stays hot. I'm bearish META this month (it can lag in a rotation toward higher-beta cyclicals), while NVDA should remain positive but not necessarily the top mover.",
      scorecard: { AMD: 58.30, MU: 33.82, NVDA: 8.53, META: -11.71 },
      stocks: { AMD: 58.30, MU: 33.82, NVDA: 8.53, META: -11.71, WDC: 0, TSLA: 0 }
    },
    11: {
      month: "November",
      year: 2025,
      prediction: "For November, I'm calling a sharp reversal: NVDA and AMD down (crowding/positioning unwind risk), while AVGO stays positive as a \"quality AI infra\" anchor. I expect SPY to be roughly flat—more rotation than crash.",
      scorecard: { NVDA: -12.59, AMD: -15.07, AVGO: 9.02, SPY: 0.19 },
      stocks: { NVDA: -12.59, AMD: -15.07, AVGO: 9.02, SPY: 0.19, META: 0, TSLA: 0 }
    },
    12: {
      month: "December",
      year: 2025,
      prediction: "For December (month-to-date), I'm expecting NVDA and TSLA to finish positive, while AVGO is a realistic downside candidate (profit-taking after a very strong run). I expect SPY to be mildly positive—steady, not spectacular.",
      scorecard: null,
      stocks: { NVDA: 0, TSLA: 0, AVGO: 0, SPY: 0, META: 0, AMD: 0 }
    }
  }
};

// Function to get all stocks from all periods
function getAllStocks(data) {
  const stocks = new Set();
  Object.values(data).forEach(year => {
    Object.values(year).forEach(month => {
      Object.keys(month.stocks).forEach(stock => {
        if (stock !== "SPY") stocks.add(stock);
      });
    });
  });
  return Array.from(stocks).sort();
}

// Function to calculate gains based on $1000 investment
function calculateGains(returnPercentage, initialInvestment = 1000) {
  return (returnPercentage / 100) * initialInvestment;
}
