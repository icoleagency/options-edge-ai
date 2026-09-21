# Options Edge AI intelligence workstation upgrade

## Goal
Evolve the existing dashboard incrementally into a chart-first, explainable options intelligence workstation while preserving its shell, visual identity, watchlist behavior, shared ticker state, and honest prototype labeling.

## Build approach

### 1. Chart-first workspace
- Expand the center workspace and chart height so the active ticker and chart dominate the first screen.
- Replace the current timeframe controls with a compact trading toolbar for 1m, 5m, 15m, 30m, 1H, 4H, 1D, and 1W.
- Add indicator, drawing-tool, and fullscreen controls using the existing control system.
- Keep the reusable simulated chart and explicit “TradingView connection coming soon” status; toolbar controls will update prototype state without claiming a live integration.

### 2. Explainable AI Trade Setup
- Replace the disconnected analyzer summary with a structured, clearly labeled sample-analysis panel for overall bias, trend, momentum, volume, support, resistance, and catalyst categories.
- Add separate Potential Call Setup and Potential Put Setup sections covering status, met conditions, unmet conditions, confirmation, invalidation, and risks.
- Restrict outcomes to Potential Call, Potential Put, Watch, or No Setup—never buy/sell instructions.
- Keep a visible connection notice and educational disclaimer so sample classifications cannot be mistaken for live analysis.

### 3. Reusable “Why?” explanations
- Add a reusable explanation interaction for bias, momentum, impact, and potential setup classifications.
- Show concise beginner-friendly reasoning in an accessible popover/dialog tied to each classification.
- Centralize explanation copy with the sample data so future live analysis can replace it without changing panel UI.

### 4. Options Contract Lab preview
- Add a dashboard preview panel with Call/Put tabs, expiration, strike-range, and moneyness controls.
- Show a horizontally scrollable simulated contract table with Type, Expiration, Strike, Bid, Ask, Last, Volume, Open Interest, IV, Delta, Gamma, Theta, and Vega.
- Add plain-English tooltips for options metrics.
- “Analyze Contract” will open a clear disconnected state explaining that live options data is required.
- Reuse this panel on the existing Options Lab page so the preview and dedicated workspace share one component.

### 5. Catalyst Intelligence and Alert Center
- Upgrade the news panel title and sample records to include High/Medium/Low impact, the expanded category set, and “Why it matters” explanations.
- Expand alerts into structured rows with timestamp, ticker, alert type, trigger, status, and AI-analysis availability.
- Preserve ticker synchronization and future TradingView webhook language without implying connectivity.

### 6. Market regime and education
- Add a compact simulated Market Regime indicator near the top of the dashboard with Risk-On, Risk-Off, Neutral, and High Volatility-ready states.
- Explain that the future calculation will use broad-market inputs such as SPY, QQQ, and VIX.
- Extend existing beginner tooltips for IV, Delta, Gamma, Theta, Vega, Open Interest, Volume, Support, Resistance, Momentum, and Earnings Volatility.

## Technical details
- Extend existing TypeScript models and sample-data factories instead of embedding large data objects in panels.
- Keep `DashboardProvider` as the shared ticker/watchlist source; add only presentation state locally where appropriate.
- Split the growing dashboard into focused reusable panel modules if needed, while retaining current route and shell architecture.
- Use existing semantic color tokens, Button, Tabs, Select, Tooltip/Popover/Dialog components, and established compact panel styling.
- Preserve local-storage behavior and all existing navigation routes.

## Validation
- Verify ticker changes update chart, catalyst news, earnings, trade setup, alerts, and contract context together.
- Verify chart toolbar, Why explanations, contract filters/tabs, analysis placeholder, watchlist management, and fullscreen behavior.
- Check desktop-first layout at 1280px and mobile at 390px for overflow, readable tables, and non-overlapping controls.
- Confirm every value and analysis state remains visibly labeled simulated/sample and no live TradingView or market-data claim appears.
- Confirm zero browser console errors and retain unique route metadata.

## Not included
- Live or paid market-data providers, TradingView connection, webhook ingestion, AI generation, brokerage execution, authentication, or database work.
