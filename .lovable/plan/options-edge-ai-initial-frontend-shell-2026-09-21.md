# Options Edge AI — Initial Frontend Shell

## Goal
Build a desktop-first, responsive financial intelligence terminal with a working persistent watchlist, synchronized ticker selection, clearly labeled simulated data, and isolated integration boundaries for future market providers and AI analysis.

## What will be built

### 1. Application foundation
- Replace the starter screen with the Options Edge AI terminal.
- Establish a dark charcoal/midnight design system with restrained green, red, amber, and neutral status colors.
- Add compact typography, subtle borders, stable panel sizing, focus states, and responsive behavior for desktop, tablet, and mobile.
- Create shared navigation with market status, ticker search, connection status, notifications, profile controls, and a collapsible mobile menu.

### 2. Centralized ticker and watchlist experience
- Preload AAPL, NVDA, TSLA, AMZN, MSFT, META, GOOGL, AMD, PLTR, and SPY.
- Add ticker/company search, add, remove, select, and drag-or-button reorder interactions.
- Persist watchlist order, selected ticker, timeframe, and visible-panel preferences in local storage after hydration.
- Drive every ticker-dependent panel from one shared selected-ticker state.
- Label all sample prices, changes, news, earnings, and analysis as simulated or sample data.

### 3. Trading dashboard panels
- **Market overview:** SPY, QQQ, DIA, IWM, and VIX with simulated values and market status.
- **Watchlist:** compact rows, selected state, trend, earnings badges, news indicators, and management controls.
- **Chart workspace:** ticker header, timeframe and chart-type selectors, indicator controls, expand mode, plus polished disconnected/loading/error states. The shell will show a provider-ready chart visualization and honest TradingView connection messaging rather than claim a live feed.
- **Market intelligence:** ticker-specific sample stories with All, High Impact, Earnings, and Company News filters, impact labels, summaries, timestamps, and optional source links.
- **Earnings monitor:** next report, session timing, estimates, historical reactions, related items, and sample-data labels.
- **AI setup analyzer:** neutral/sample analysis structure for bias, trend, momentum, volume, levels, catalysts, Call/Put conditions, invalidation, risk, missing data, confidence, and setup status, with educational disclaimers and no fabricated recommendation.
- Add beginner-friendly term tooltips throughout.

### 4. Supporting pages and navigation
- Add distinct pages for Watchlist, Market News, Earnings Calendar, AI Trade Analyzer, Learning Center, and Settings.
- Mark Options Lab as coming soon and give it a dedicated informative empty state.
- Build Settings controls for watchlist management, default timeframe, notifications, visible panels, connection status, and theme preference.
- Give every page unique title, description, Open Graph, and social card metadata.

### 5. Future-ready architecture
- Separate static company/sample datasets from components.
- Add typed service contracts and disconnected placeholder adapters for market data, news, earnings, technical analysis, AI explanations, and options chains.
- Keep provider names and secrets out of presentation code; future secure integrations can replace adapters without redesigning panels.
- Add reusable loading, empty, error, and disconnected states for data-backed areas.

## Technical approach
- Use TanStack Start routes and the existing React/TypeScript/Tailwind component system.
- Use React context plus a hydration-safe local-storage hook for prototype state.
- Use reusable panel primitives and focused feature components rather than one large dashboard file.
- Use Recharts for the simulated chart shell; TradingView remains an isolated future adapter.
- Use Lucide icons and existing accessible controls/tooltips.
- No brokerage execution, authentication, database, paid APIs, or secret-bearing integrations in this phase.

## Validation
- Verify the desktop terminal at 1280px and a mobile layout in Chromium.
- Exercise ticker selection, add/remove/reorder, news filters, chart controls, panel visibility, and persistence after reload.
- Confirm every selected ticker updates chart, news, earnings, analyzer, and company header together.
- Check visible sample/disconnected labels, navigation, page metadata, and browser console errors.
