#!/usr/bin/env python3
"""
Monthly portfolio & screener data generator for Mathew-Website.

Uses Yahoo Finance (yfinance) — free, no API key required.
Run from repo root:  python screener/generate_portfolio_data.py
Outputs: portfolio-data.js
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
import yfinance as yf

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT = REPO_ROOT / "portfolio-data.js"

FOLLOWER_START = 1000.0
PORTFOLIO_START = 2000.0
BENCHMARK_TICKER = "QQQ"
BENCHMARK_NAME = "Nasdaq-100 (QQQ)"
ALGO_STRATEGY_NAME = "Algorithm-Based (Top 3)"
ALGO_STRATEGY_SHORT = "Algorithm-based screener"
MANUAL_STRATEGY_NAME = "My Recommendation Holdings"
STATS_WINDOW_MONTHS = 12

# Two-year algorithm vs manual comparison window (Jun 2024 → present)
# Tickers traded historically + screener universe (liquid large/mid caps)
SCREENER_UNIVERSE = sorted(
    {
        "AAPL", "AMD", "AMZN", "AVGO", "CRM", "GOOGL", "META", "MSFT",
        "MU", "NVDA", "SMCI", "TSLA", "NFLX", "ORCL", "QCOM", "INTC",
        "LRCX", "KLAC", "ASML", "TSM", "PLTR", "COIN", "SHOP",
        "WDC", "SNDK",
    }
)

# Mathew's actual buy-and-hold — initial allocation at phase start only; weights drift with price
MANUAL_HOLDINGS = [
    {
        "fromYm": "2024-06",
        "toYm": "2025-05",
        "label": "Year 1 — AMD / NVDA",
        "initialWeights": {"AMD": 0.70, "NVDA": 0.30},
    },
    {
        "fromYm": "2025-06",
        "toYm": None,
        "label": "Year 2 — MU / WDC / SNDK",
        "initialWeights": {"MU": 0.90, "WDC": 0.05, "SNDK": 0.05},
    },
]

FIXED_COMPARISON_PERIODS = [
    {"id": "full", "label": "Jun 2024 – Present", "startYm": "2024-06", "endYm": None},
    {"id": "jan25_jan26", "label": "Jan 2025 – Jan 2026", "startYm": "2025-01", "endYm": "2026-01"},
    {"id": "jun24_jan25", "label": "Jun 2024 – Jan 2025", "startYm": "2024-06", "endYm": "2025-01"},
]

# Historical monthly trades (buy → sell, one position per month)
TRADE_HISTORY = [
    {"ym": "2023-01", "monthLabel": "Jan 2023", "ticker": "SMCI", "why": "AI infrastructure / server demand momentum.", "buy": 8.21, "sell": 7.23, "shares": 243.605359, "netPL": -238.73, "endBalance": 1761.27, "returnPct": -11.94},
    {"ym": "2023-02", "monthLabel": "Feb 2023", "ticker": "SMCI", "why": "Continuation trade after prior month volatility.", "buy": 7.23, "sell": 9.8, "shares": 243.605809, "netPL": 626.07, "endBalance": 2387.34, "returnPct": 35.55},
    {"ym": "2023-03", "monthLabel": "Mar 2023", "ticker": "AMD", "why": "Semis strength / upside participation in AI cycle.", "buy": 78.58, "sell": 98.01, "shares": 30.381013, "netPL": 590.3, "endBalance": 2977.64, "returnPct": 24.73},
    {"ym": "2023-04", "monthLabel": "Apr 2023", "ticker": "MU", "why": "Memory cycle setup; risk/reward for a rebound.", "buy": 59.48, "sell": 63.57, "shares": 50.061197, "netPL": 204.75, "endBalance": 3182.39, "returnPct": 6.88},
    {"ym": "2023-05", "monthLabel": "May 2023", "ticker": "MU", "why": "Follow-through on memory thesis.", "buy": 63.57, "sell": 67.36, "shares": 50.061192, "netPL": 189.73, "endBalance": 3372.12, "returnPct": 5.96},
    {"ym": "2023-06", "monthLabel": "Jun 2023", "ticker": "AVGO", "why": "Quality semi/infrastructure exposure.", "buy": 77.8, "sell": 83.98, "shares": 43.343419, "netPL": 267.86, "endBalance": 3639.98, "returnPct": 7.94},
    {"ym": "2023-07", "monthLabel": "Jul 2023", "ticker": "SMCI", "why": "AI/server momentum re-entry.", "buy": 24.92, "sell": 33.03, "shares": 146.066553, "netPL": 1184.6, "endBalance": 4824.58, "returnPct": 32.54},
    {"ym": "2023-08", "monthLabel": "Aug 2023", "ticker": "AVGO", "why": "Staying with semi leadership.", "buy": 87.0, "sell": 89.35, "shares": 55.454941, "netPL": 130.32, "endBalance": 4954.9, "returnPct": 2.7},
    {"ym": "2023-09", "monthLabel": "Sep 2023", "ticker": "MU", "why": "Memory position despite chop.", "buy": 69.21, "sell": 67.32, "shares": 71.592322, "netPL": -135.31, "endBalance": 4819.59, "returnPct": -2.73},
    {"ym": "2023-10", "monthLabel": "Oct 2023", "ticker": "SMCI", "why": "High beta AI infra bet (volatile).", "buy": 27.42, "sell": 23.95, "shares": 175.769083, "netPL": -609.92, "endBalance": 4209.67, "returnPct": -12.65},
    {"ym": "2023-11", "monthLabel": "Nov 2023", "ticker": "AVGO", "why": "Semi/infrastructure quality + momentum.", "buy": 81.9, "sell": 90.11, "shares": 51.400135, "netPL": 422.0, "endBalance": 4631.67, "returnPct": 10.02},
    {"ym": "2023-12", "monthLabel": "Dec 2023", "ticker": "SMCI", "why": "Year-end momentum attempt.", "buy": 27.35, "sell": 28.43, "shares": 169.347906, "netPL": 182.9, "endBalance": 4814.57, "returnPct": 3.95},
    {"ym": "2024-01", "monthLabel": "Jan 2024", "ticker": "SMCI", "why": "AI/server demand momentum breakout.", "buy": 28.43, "sell": 52.96, "shares": 169.347999, "netPL": 4154.11, "endBalance": 8968.68, "returnPct": 86.28},
    {"ym": "2024-02", "monthLabel": "Feb 2024", "ticker": "NVDA", "why": "AI compute leader momentum.", "buy": 61.49, "sell": 79.07, "shares": 145.855575, "netPL": 2564.15, "endBalance": 11532.83, "returnPct": 28.59},
    {"ym": "2024-03", "monthLabel": "Mar 2024", "ticker": "NVDA", "why": "Continuation in AI compute trend.", "buy": 79.07, "sell": 90.31, "shares": 145.855559, "netPL": 1639.42, "endBalance": 13172.25, "returnPct": 14.22},
    {"ym": "2024-04", "monthLabel": "Apr 2024", "ticker": "AVGO", "why": "AI infrastructure exposure; diversify within semis.", "buy": 130.16, "sell": 127.69, "shares": 101.19994, "netPL": -249.97, "endBalance": 12922.28, "returnPct": -1.9},
    {"ym": "2024-05", "monthLabel": "May 2024", "ticker": "AVGO", "why": "Hold/roll the same theme.", "buy": 127.69, "sell": 130.47, "shares": 101.199921, "netPL": 281.34, "endBalance": 13203.62, "returnPct": 2.18},
    {"ym": "2024-06", "monthLabel": "Jun 2024", "ticker": "MU", "why": "Memory cycle + AI server demand for HBM/DRAM.", "buy": 124.18, "sell": 130.67, "shares": 106.325736, "netPL": 690.06, "endBalance": 13893.68, "returnPct": 5.23},
    {"ym": "2024-07", "monthLabel": "Jul 2024", "ticker": "AVGO", "why": "Staying with quality infra exposure.", "buy": 158.17, "sell": 158.29, "shares": 87.840158, "netPL": 10.54, "endBalance": 13904.22, "returnPct": 0.08},
    {"ym": "2024-08", "monthLabel": "Aug 2024", "ticker": "SMCI", "why": "High beta AI infra (risk month).", "buy": 70.16, "sell": 43.77, "shares": 198.17875, "netPL": -5229.94, "endBalance": 8674.28, "returnPct": -37.61},
    {"ym": "2024-09", "monthLabel": "Sep 2024", "ticker": "MU", "why": "Memory rebound attempt after drawdown.", "buy": 95.69, "sell": 103.12, "shares": 90.649767, "netPL": 673.53, "endBalance": 9347.81, "returnPct": 7.76},
    {"ym": "2024-10", "monthLabel": "Oct 2024", "ticker": "SMCI", "why": "Re-entry into high beta AI infra.", "buy": 41.64, "sell": 29.11, "shares": 224.490758, "netPL": -2812.87, "endBalance": 6534.94, "returnPct": -30.09},
    {"ym": "2024-11", "monthLabel": "Nov 2024", "ticker": "NVDA", "why": "AI leader; tactical bounce.", "buy": 132.72, "sell": 138.2, "shares": 49.238461, "netPL": 269.83, "endBalance": 6804.77, "returnPct": 4.13},
    {"ym": "2024-12", "monthLabel": "Dec 2024", "ticker": "SMCI", "why": "Year-end trade; accepted volatility.", "buy": 32.64, "sell": 30.48, "shares": 208.478855, "netPL": -450.32, "endBalance": 6354.45, "returnPct": -6.62},
    {"ym": "2025-01", "monthLabel": "Jan 2025", "ticker": "AVGO", "why": "Quality AI infra; risk-managed exposure.", "buy": 229.76, "sell": 219.29, "shares": 27.656904, "netPL": -289.57, "endBalance": 6064.88, "returnPct": -4.56},
    {"ym": "2025-02", "monthLabel": "Feb 2025", "ticker": "MU", "why": "Memory cycle continuation.", "buy": 90.94, "sell": 93.32, "shares": 66.691004, "netPL": 158.72, "endBalance": 6223.6, "returnPct": 2.62},
    {"ym": "2025-03", "monthLabel": "Mar 2025", "ticker": "MU", "why": "Stayed with thesis; volatility month.", "buy": 93.32, "sell": 86.72, "shares": 66.690986, "netPL": -440.16, "endBalance": 5783.44, "returnPct": -7.07},
    {"ym": "2025-04", "monthLabel": "Apr 2025", "ticker": "MU", "why": "Held/rolled MU again; drawdown continued.", "buy": 86.72, "sell": 76.8, "shares": 66.690965, "netPL": -661.57, "endBalance": 5121.87, "returnPct": -11.44},
    {"ym": "2025-05", "monthLabel": "May 2025", "ticker": "SMCI", "why": "AI infra rebound trade.", "buy": 31.86, "sell": 40.02, "shares": 160.761768, "netPL": 1311.82, "endBalance": 6433.69, "returnPct": 25.61},
    {"ym": "2025-06", "monthLabel": "Jun 2025", "ticker": "AVGO", "why": "AI infra strength / quality compounding.", "buy": 240.62, "sell": 274.65, "shares": 26.738383, "netPL": 909.89, "endBalance": 7343.58, "returnPct": 14.14},
    {"ym": "2025-07", "monthLabel": "Jul 2025", "ticker": "AVGO", "why": "Continuation month.", "buy": 274.65, "sell": 292.64, "shares": 26.738399, "netPL": 481.02, "endBalance": 7824.6, "returnPct": 6.55},
    {"ym": "2025-08", "monthLabel": "Aug 2025", "ticker": "NVDA", "why": "AI leader; smaller tactical position.", "buy": 177.85, "sell": 174.16, "shares": 43.995502, "netPL": -162.34, "endBalance": 7662.26, "returnPct": -2.07},
    {"ym": "2025-09", "monthLabel": "Sep 2025", "ticker": "AVGO", "why": "Quality AI infra; momentum continuation.", "buy": 296.31, "sell": 329.28, "shares": 25.858932, "netPL": 852.57, "endBalance": 8514.83, "returnPct": 11.13},
    {"ym": "2025-10", "monthLabel": "Oct 2025", "ticker": "MU", "why": "Memory cycle breakout month.", "buy": 167.15, "sell": 223.68, "shares": 50.94125, "netPL": 2879.71, "endBalance": 11394.54, "returnPct": 33.82},
    {"ym": "2025-11", "monthLabel": "Nov 2025", "ticker": "AVGO", "why": "AI infra; steady leader.", "buy": 368.92, "sell": 402.19, "shares": 30.886208, "netPL": 1027.58, "endBalance": 12422.12, "returnPct": 9.02},
    {"ym": "2025-12", "monthLabel": "Dec 2025", "ticker": "MU", "why": "Memory strength into year-end.", "buy": 236.38, "sell": 285.41, "shares": 52.551485, "netPL": 2576.6, "endBalance": 14998.72, "returnPct": 20.74},
    {"ym": "2026-01", "monthLabel": "Jan 2026", "ticker": "MU", "why": "Memory momentum continued.", "buy": 285.41, "sell": 414.88, "shares": 52.551487, "netPL": 6803.84, "endBalance": 21802.56, "returnPct": 45.36},
    {"ym": "2026-02", "monthLabel": "Feb 2026", "ticker": "MU", "why": "Held MU; small pullback month.", "buy": 414.88, "sell": 409.14, "shares": 52.551487, "netPL": -301.65, "endBalance": 21500.91, "returnPct": -1.38},
]


def compute_rsi(series: pd.Series, period: int = 14) -> float:
    if len(series) < period + 1:
        return float("nan")
    delta = series.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    val = rsi.iloc[-1]
    return round(float(val), 1) if pd.notna(val) else float("nan")


def screen_ticker_at_date(
    close: pd.Series,
    volume: pd.Series,
    as_of: pd.Timestamp,
) -> dict | None:
    hist = close.loc[:as_of].dropna()
    vol = volume.loc[:as_of].dropna()
    if len(hist) < 25:
        return None

    price = float(hist.iloc[-1])
    mom20 = (price / float(hist.iloc[-21]) - 1) * 100 if len(hist) >= 21 else 0.0
    rsi = compute_rsi(hist, 14)
    if np.isnan(rsi):
        return None

    vol_avg = float(vol.tail(20).mean()) if len(vol) >= 5 else float(vol.iloc[-1])
    vol_ratio = float(vol.iloc[-1]) / vol_avg if vol_avg else 1.0

    # Rule-based filters
    passes = mom20 > 0 and 30 <= rsi <= 70 and vol_ratio >= 0.8
    score = (
        min(max(mom20, -20), 40) * 1.5
        + (70 - abs(rsi - 55)) * 0.8
        + min(vol_ratio, 3) * 8
    )

    return {
        "momentum20d": round(mom20, 2),
        "rsi": rsi,
        "volumeRatio": round(vol_ratio, 2),
        "score": round(score, 1),
        "passesFilters": passes,
        "price": round(price, 2),
    }


def month_end(ym: str) -> pd.Timestamp:
    year, month = map(int, ym.split("-"))
    if month == 12:
        return pd.Timestamp(year=year + 1, month=1, day=1) - pd.Timedelta(days=1)
    return pd.Timestamp(year=year, month=month + 1, day=1) - pd.Timedelta(days=1)


def month_start(ym: str) -> pd.Timestamp:
    year, month = map(int, ym.split("-"))
    return pd.Timestamp(year=year, month=month, day=1)


def ym_label(ym: str) -> str:
    return datetime.strptime(ym, "%Y-%m").strftime("%b %Y")


def month_abbrev(ym: str) -> str:
    return datetime.strptime(ym, "%Y-%m").strftime("%b")


def build_comparison_periods(end_ym: str) -> list[dict]:
    """Build period list with a YTD option whose label tracks the current month."""
    year = end_ym[:4]
    ytd_label = f"YTD {year} (Jan–{month_abbrev(end_ym)})"
    return [
        *FIXED_COMPARISON_PERIODS[:1],
        {"id": f"ytd{year}", "label": ytd_label, "startYm": f"{year}-01", "endYm": None},
        *FIXED_COMPARISON_PERIODS[1:],
    ]


def iter_months(start_ym: str, end_ym: str) -> list[str]:
    """Inclusive YYYY-MM range."""
    start = month_start(start_ym)
    end = month_start(end_ym)
    months: list[str] = []
    cur = start
    while cur <= end:
        months.append(cur.strftime("%Y-%m"))
        if cur.month == 12:
            cur = pd.Timestamp(year=cur.year + 1, month=1, day=1)
        else:
            cur = pd.Timestamp(year=cur.year, month=cur.month + 1, day=1)
    return months


def last_trading_day_on_or_before(series: pd.Series, date: pd.Timestamp) -> pd.Timestamp | None:
    sl = series.loc[:date].dropna()
    if sl.empty:
        return None
    return sl.index[-1]


def as_of_prev_month(close_df: pd.DataFrame, ym: str) -> pd.Timestamp:
    """Last trading day before the month opens — walk-forward screener date."""
    boundary = month_start(ym) - pd.Timedelta(days=1)
    ref = close_df.dropna(how="all").index
    if ref.empty:
        return boundary
    valid = ref[ref <= boundary]
    return valid[-1] if len(valid) else boundary


def month_return_pct(close: pd.Series, ym: str) -> float:
    start, end = month_start(ym), month_end(ym)
    sl = close.loc[start:end].dropna()
    if len(sl) < 2:
        return 0.0
    return (float(sl.iloc[-1]) / float(sl.iloc[0]) - 1) * 100


def rank_universe(
    close_df: pd.DataFrame,
    vol_df: pd.DataFrame,
    as_of: pd.Timestamp,
) -> list[dict]:
    ranked = []
    for ticker in SCREENER_UNIVERSE:
        if ticker not in close_df.columns:
            continue
        metrics = screen_ticker_at_date(close_df[ticker], vol_df[ticker], as_of)
        if not metrics:
            continue
        ranked.append({"ticker": ticker, **metrics})
    ranked.sort(key=lambda x: x["score"], reverse=True)
    for i, p in enumerate(ranked[:3], 1):
        p["rank"] = i
    return ranked[:3]


def comparison_end_ym(close_df: pd.DataFrame) -> str:
    last = close_df.dropna(how="all").index.max()
    return last.strftime("%Y-%m")


def simulate_ai_strategy(
    close_df: pd.DataFrame,
    vol_df: pd.DataFrame,
    months: list[str],
) -> tuple[list[dict], list[dict]]:
    """Top-3 screener picks, 33.3% each, rebalanced monthly using prior-month data."""
    balance = FOLLOWER_START
    curve: list[dict] = []
    monthly: list[dict] = []

    for ym in months:
        as_of = as_of_prev_month(close_df, ym)
        picks = rank_universe(close_df, vol_df, as_of)
        tickers = [p["ticker"] for p in picks]

        if len(tickers) < 3:
            port_return = 0.0
        else:
            rets = [month_return_pct(close_df[t], ym) for t in tickers]
            port_return = sum(rets) / len(rets)

        balance = round(balance * (1 + port_return / 100), 2)
        monthly.append({
            "ym": ym,
            "monthLabel": ym_label(ym),
            "picks": picks,
            "returnPct": round(port_return, 2),
            "balance": balance,
        })
        curve.append({
            "ym": ym,
            "label": ym_label(ym),
            "value": balance,
        })

    return curve, monthly


def market_calendar(close_df: pd.DataFrame) -> pd.Series:
    if close_df.empty:
        return pd.Series(dtype=float)
    filled = close_df.bfill(axis=1)
    return filled.iloc[:, 0] if len(filled.columns) else close_df.mean(axis=1)


def simulate_manual_strategy(
    close_df: pd.DataFrame,
    start_ym: str,
    end_ym: str,
) -> tuple[list[dict], list[dict]]:
    """Buy-and-hold: target weights applied only at phase/period start; allocation drifts with price."""
    months = iter_months(start_ym, end_ym)
    if not months:
        return [], []

    calendar = market_calendar(close_df)
    balance = FOLLOWER_START
    curve: list[dict] = []
    monthly: list[dict] = []
    shares: dict[str, float] = {}
    active_phase = None
    prev_balance = balance

    def phase_for(ym: str) -> dict:
        for phase in MANUAL_HOLDINGS:
            start_ok = ym >= phase["fromYm"]
            end_ok = phase["toYm"] is None or ym <= phase["toYm"]
            if start_ok and end_ok:
                return phase
        return MANUAL_HOLDINGS[-1]

    def buy_at_weights(cash: float, weights: dict[str, float], date: pd.Timestamp) -> dict[str, float]:
        out: dict[str, float] = {}
        for ticker, weight in weights.items():
            if ticker not in close_df.columns:
                continue
            day = last_trading_day_on_or_before(close_df[ticker], date)
            if day is None:
                continue
            price = float(close_df[ticker].loc[day])
            if price <= 0:
                continue
            out[ticker] = (cash * weight) / price
        return out

    def portfolio_value(date: pd.Timestamp) -> float:
        total = 0.0
        for ticker, qty in shares.items():
            if ticker not in close_df.columns or qty <= 0:
                continue
            day = last_trading_day_on_or_before(close_df[ticker], date)
            if day is None:
                continue
            total += qty * float(close_df[ticker].loc[day])
        return total

    for i, ym in enumerate(months):
        phase = phase_for(ym)
        start_day = last_trading_day_on_or_before(calendar, month_start(ym))
        if start_day is None:
            continue

        if i == 0 or phase != active_phase:
            shares = buy_at_weights(balance, phase["initialWeights"], start_day)
            active_phase = phase

        end_day = last_trading_day_on_or_before(calendar, month_end(ym))
        if end_day is None:
            continue

        balance = round(portfolio_value(end_day), 2)
        ret = (balance / prev_balance - 1) * 100 if prev_balance else 0.0
        prev_balance = balance

        holdings = []
        for ticker, qty in shares.items():
            if qty <= 0 or ticker not in close_df.columns:
                continue
            price = float(close_df[ticker].loc[last_trading_day_on_or_before(close_df[ticker], end_day)])
            value = round(qty * price, 2)
            holdings.append({
                "ticker": ticker,
                "shares": round(qty, 4),
                "value": value,
            })

        total_value = sum(h["value"] for h in holdings) or balance
        for h in holdings:
            h["actualWeight"] = round(h["value"] / total_value, 4) if total_value else 0.0
        holdings.sort(key=lambda h: h["actualWeight"], reverse=True)

        monthly.append({
            "ym": ym,
            "monthLabel": ym_label(ym),
            "phase": phase["label"],
            "holdings": holdings,
            "returnPct": round(ret, 2),
            "balance": balance,
        })
        curve.append({
            "ym": ym,
            "label": ym_label(ym),
            "value": balance,
        })

    return curve, monthly


def month_went_up(close: pd.Series, ym: str) -> bool | None:
    start, end = month_start(ym), month_end(ym)
    sl = close.loc[start:end].dropna()
    if len(sl) < 2:
        return None
    return float(sl.iloc[-1]) >= float(sl.iloc[0])


def screener_top_pick_won(picks: list[dict], close_df: pd.DataFrame, ym: str) -> bool:
    if not picks:
        return False
    ticker = picks[0]["ticker"]
    if ticker not in close_df.columns:
        return False
    return month_return_pct(close_df[ticker], ym) > 0


def screener_top_pick_directional(picks: list[dict], close_df: pd.DataFrame, ym: str) -> bool:
    """Top screener pick moved up during the month (close >= month-start close)."""
    if not picks:
        return False
    ticker = picks[0]["ticker"]
    if ticker not in close_df.columns:
        return False
    result = month_went_up(close_df[ticker], ym)
    return bool(result) if result is not None else False


def my_pick_directional(trade: dict, close_df: pd.DataFrame, ym: str) -> bool:
    """My pick moved up during the month (close >= month-start close)."""
    ticker = trade["ticker"]
    if ticker not in close_df.columns:
        return trade["returnPct"] >= 0
    result = month_went_up(close_df[ticker], ym)
    return bool(result) if result is not None else trade["returnPct"] >= 0


def compute_stats_12m(monthly_reports: list[dict], close_df: pd.DataFrame) -> dict:
    window = monthly_reports[-STATS_WINDOW_MONTHS:]
    n = len(window)
    if not n:
        return {
            "windowMonths": STATS_WINDOW_MONTHS,
            "monthsCounted": 0,
            "myWinRate": 0.0,
            "screenerWinRate": 0.0,
            "myDirectionalAccuracy": 0.0,
            "screenerDirectionalAccuracy": 0.0,
            "myWins": 0,
            "myLosses": 0,
            "screenerWins": 0,
            "screenerLosses": 0,
            "myDirectionalHits": 0,
            "screenerDirectionalHits": 0,
        }

    my_wins = my_losses = 0
    screener_wins = screener_losses = 0
    my_dir_hits = screener_dir_hits = 0

    for report in window:
        ym = report["ym"]
        trade = report["trade"]
        picks = report.get("picks") or []

        if trade["returnPct"] >= 0:
            my_wins += 1
        else:
            my_losses += 1

        if screener_top_pick_won(picks, close_df, ym):
            screener_wins += 1
        else:
            screener_losses += 1

        if my_pick_directional(trade, close_df, ym):
            my_dir_hits += 1
        if screener_top_pick_directional(picks, close_df, ym):
            screener_dir_hits += 1

    return {
        "windowMonths": STATS_WINDOW_MONTHS,
        "monthsCounted": n,
        "myWinRate": round(my_wins / n * 100, 1),
        "screenerWinRate": round(screener_wins / n * 100, 1),
        "myDirectionalAccuracy": round(my_dir_hits / n * 100, 1),
        "screenerDirectionalAccuracy": round(screener_dir_hits / n * 100, 1),
        "myWins": my_wins,
        "myLosses": my_losses,
        "screenerWins": screener_wins,
        "screenerLosses": screener_losses,
        "myDirectionalHits": my_dir_hits,
        "screenerDirectionalHits": screener_dir_hits,
    }


def build_benchmark_curve(
    close_df: pd.DataFrame,
    start_ym: str,
    months: list[str],
) -> list[dict]:
    curve = []
    if BENCHMARK_TICKER not in close_df.columns:
        return curve
    bench = close_df[BENCHMARK_TICKER]
    bench_start_day = last_trading_day_on_or_before(bench, month_start(start_ym))
    if bench_start_day is None:
        return curve
    bench_base = float(bench.loc[bench_start_day])
    for ym in months:
        end_day = last_trading_day_on_or_before(bench, month_end(ym))
        if end_day is None:
            continue
        curve.append({
            "ym": ym,
            "label": ym_label(ym),
            "value": round(FOLLOWER_START * float(bench.loc[end_day]) / bench_base, 2),
        })
    return curve


def build_period_comparison(
    close_df: pd.DataFrame,
    vol_df: pd.DataFrame,
    start_ym: str,
    end_ym: str,
    label: str,
) -> dict:
    months = iter_months(start_ym, end_ym)
    if not months:
        return {}

    ai_curve, ai_monthly = simulate_ai_strategy(close_df, vol_df, months)
    manual_curve, manual_monthly = simulate_manual_strategy(close_df, start_ym, end_ym)
    spy_curve = build_benchmark_curve(close_df, start_ym, months)

    ai_end = ai_curve[-1]["value"] if ai_curve else FOLLOWER_START
    manual_end = manual_curve[-1]["value"] if manual_curve else FOLLOWER_START
    spy_end = spy_curve[-1]["value"] if spy_curve else FOLLOWER_START
    ai_return = round((ai_end / FOLLOWER_START - 1) * 100, 2)
    manual_return = round((manual_end / FOLLOWER_START - 1) * 100, 2)
    winner = "algo" if ai_end > manual_end else "manual" if manual_end > ai_end else "tie"
    margin = round(abs(ai_end - manual_end), 2)

    return {
        "label": label,
        "period": {
            "startYm": start_ym,
            "endYm": end_ym,
            "startLabel": ym_label(start_ym),
            "endLabel": ym_label(end_ym),
            "startingCapital": FOLLOWER_START,
        },
        "algoStrategy": {
            "name": ALGO_STRATEGY_NAME,
            "description": (
                "Each month, rank the tracked universe using prior-month momentum, RSI, "
                "and volume data. Invest 33.3% in each of the top 3 picks; rebalance monthly."
            ),
            "endBalance": ai_end,
            "returnPct": ai_return,
            "equityCurve": ai_curve,
            "monthlyReports": ai_monthly,
        },
        "manualStrategy": {
            "name": MANUAL_STRATEGY_NAME,
            "description": (
                "Initial allocation at each phase start only — weights drift naturally as "
                "winners grow. Jun 2024 started 70% AMD / 30% NVDA; Jun 2025 started "
                "90% MU / 5% WDC / 5% SNDK. No rebalancing within a phase."
            ),
            "phases": MANUAL_HOLDINGS,
            "endBalance": manual_end,
            "returnPct": manual_return,
            "equityCurve": manual_curve,
            "monthlyReports": manual_monthly,
        },
        "benchmark": {
            "name": BENCHMARK_NAME,
            "ticker": BENCHMARK_TICKER,
            "endBalance": spy_end,
            "returnPct": round((spy_end / FOLLOWER_START - 1) * 100, 2),
            "equityCurve": spy_curve,
        },
        "verdict": {
            "winner": winner,
            "marginDollars": margin,
            "summary": (
                f"{ALGO_STRATEGY_SHORT.capitalize()} turned $1,000 into ${ai_end:,.2f} ({ai_return:+.2f}%) vs "
                f"{MANUAL_STRATEGY_NAME} at ${manual_end:,.2f} ({manual_return:+.2f}%) over "
                f"{ym_label(start_ym)}–{ym_label(end_ym)}."
            ),
        },
    }


def build_strategy_comparison(close_df: pd.DataFrame, vol_df: pd.DataFrame) -> dict:
    end_ym = comparison_end_ym(close_df)
    periods: dict[str, dict] = {}

    for spec in build_comparison_periods(end_ym):
        period_end = spec["endYm"] or end_ym
        if period_end < spec["startYm"]:
            continue
        periods[spec["id"]] = build_period_comparison(
            close_df,
            vol_df,
            spec["startYm"],
            period_end,
            spec["label"],
        )

    return {
        "defaultPeriod": "full",
        "periods": periods,
    }


def fetch_history() -> tuple[pd.DataFrame, pd.DataFrame]:
    start = "2022-11-01"
    end = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    print(f"Fetching {len(SCREENER_UNIVERSE)} tickers from Yahoo Finance...")
    raw = yf.download(
        SCREENER_UNIVERSE,
        start=start,
        end=end,
        group_by="ticker",
        auto_adjust=True,
        progress=False,
        threads=True,
    )
    if raw.empty:
        raise RuntimeError("No market data returned from Yahoo Finance.")

    closes, volumes = {}, {}
    if len(SCREENER_UNIVERSE) == 1:
        t = SCREENER_UNIVERSE[0]
        closes[t] = raw["Close"].dropna()
        volumes[t] = raw["Volume"].dropna()
    else:
        for t in SCREENER_UNIVERSE:
            if t not in raw.columns.get_level_values(0):
                continue
            closes[t] = raw[t]["Close"].dropna()
            volumes[t] = raw[t]["Volume"].dropna()

    close_df = pd.DataFrame(closes).sort_index()
    vol_df = pd.DataFrame(volumes).sort_index()
    return close_df, vol_df


def daily_prices_in_month(close: pd.Series, ym: str) -> list[dict]:
    start, end = month_start(ym), month_end(ym)
    sl = close.loc[start:end].dropna()
    return [{"date": d.strftime("%Y-%m-%d"), "price": round(float(p), 2)} for d, p in sl.items()]


def top_picks_for_month(
    close_df: pd.DataFrame,
    vol_df: pd.DataFrame,
    ym: str,
    executed_ticker: str,
) -> list[dict]:
    as_of = as_of_prev_month(close_df, ym)
    top3 = rank_universe(close_df, vol_df, as_of)

    if executed_ticker and not any(p["ticker"] == executed_ticker for p in top3):
        executed_metrics = screen_ticker_at_date(
            close_df[executed_ticker], vol_df[executed_ticker], as_of
        ) if executed_ticker in close_df.columns else None
        if executed_metrics:
            top3 = top3[:2] + [{"ticker": executed_ticker, **executed_metrics}]

    for i, p in enumerate(top3, 1):
        p["rank"] = i
    return top3


def directional_correct(picks: list[dict], trade: dict, close_df: pd.DataFrame) -> bool:
    """Top pick direction matched actual month return."""
    ym = trade["ym"]
    ticker = trade["ticker"]
    if ticker not in close_df.columns:
        return trade["returnPct"] >= 0
    start, end = month_start(ym), month_end(ym)
    sl = close_df[ticker].loc[start:end].dropna()
    if len(sl) < 2:
        return trade["returnPct"] >= 0
    actual_up = float(sl.iloc[-1]) >= float(sl.iloc[0])
    if picks:
        top = picks[0]["ticker"]
        if top in close_df.columns:
            top_sl = close_df[top].loc[start:end].dropna()
            if len(top_sl) >= 2:
                predicted_up = float(top_sl.iloc[-1]) >= float(top_sl.iloc[0])
                return predicted_up == actual_up
    return trade["returnPct"] >= 0


def build_output(close_df: pd.DataFrame, vol_df: pd.DataFrame) -> dict:
    monthly_reports = []

    for trade in TRADE_HISTORY:
        ym = trade["ym"]
        picks = top_picks_for_month(
            close_df, vol_df, ym, trade["ticker"],
        )
        monthly_reports.append({
            "ym": ym,
            "picks": picks,
            "trade": {
                "ticker": trade["ticker"],
                "returnPct": trade["returnPct"],
            },
        })

    last = TRADE_HISTORY[-1]
    follower_end = round(last["endBalance"] * (FOLLOWER_START / PORTFOLIO_START), 2)

    strategy_comparison = build_strategy_comparison(close_df, vol_df)
    stats_12m = compute_stats_12m(monthly_reports, close_df)

    return {
        "meta": {
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "dataSource": "Yahoo Finance (yfinance)",
            "portfolioStart": PORTFOLIO_START,
            "followerStart": FOLLOWER_START,
            "benchmark": BENCHMARK_NAME,
            "screenerFilters": {
                "momentum": "20-day return > 0%",
                "rsi": "30–70 range",
                "volume": "≥ 80% of 20-day average",
                "walkForward": "Signals use prior-month close (no look-ahead)",
            },
        },
        "stats12m": stats_12m,
        "strategyComparison": strategy_comparison,
        "summary": {
            "followerEnd": follower_end,
            "followerReturnPct": round((follower_end / FOLLOWER_START - 1) * 100, 2),
        },
    }


def write_js(data: dict) -> None:
    payload = json.dumps(data, indent=2)
    content = (
        "/* Auto-generated by screener/generate_portfolio_data.py — do not edit by hand */\n"
        f"/* Last run: {datetime.now().isoformat(timespec='seconds')} */\n"
        f"const portfolioData = {payload};\n"
    )
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Wrote {OUTPUT}")


def ensure_benchmark(close_df: pd.DataFrame, vol_df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    if BENCHMARK_TICKER in close_df.columns:
        return close_df, vol_df
    bench = yf.download(BENCHMARK_TICKER, start="2022-11-01", auto_adjust=True, progress=False)
    if bench.empty:
        return close_df, vol_df
    close_df = close_df.copy()
    vol_df = vol_df.copy()
    close_df[BENCHMARK_TICKER] = bench["Close"]
    vol_df[BENCHMARK_TICKER] = bench["Volume"]
    return close_df, vol_df


def main() -> None:
    close_df, vol_df = fetch_history()
    close_df, vol_df = ensure_benchmark(close_df, vol_df)

    data = build_output(close_df, vol_df)
    write_js(data)
    s = data["summary"]
    st = data.get("stats12m", {})
    cmp_ = data.get("strategyComparison") or {}
    full = (cmp_.get("periods") or {}).get("full", {})
    algo = full.get("algoStrategy", {})
    manual = full.get("manualStrategy", {})
    verdict = full.get("verdict", {})
    print(
        f"Done — 12M my win {st.get('myWinRate')}% | screener win {st.get('screenerWinRate')}% | "
        f"my dir {st.get('myDirectionalAccuracy')}% | screener dir {st.get('screenerDirectionalAccuracy')}%"
    )
    if algo and manual:
        period = full.get("period", {})
        print(
            f"Full comparison ({period.get('startLabel', '')}–{period.get('endLabel', '')}): "
            f"Algo ${algo.get('endBalance', 0):,.2f} ({algo.get('returnPct', 0):+.2f}%) vs "
            f"Manual ${manual.get('endBalance', 0):,.2f} ({manual.get('returnPct', 0):+.2f}%) vs "
            f"{BENCHMARK_NAME} ${full.get('benchmark', {}).get('endBalance', 0):,.2f} | "
            f"Winner: {verdict.get('winner', 'n/a')}"
        )


if __name__ == "__main__":
    main()
