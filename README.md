# Options Edge AI

OPTIONS EDGE AI — PERSONALIZED OPTIONS TRADING INTELLIGENCE PLATFORM

PROJECT OVERVIEW

Build a premium, modern, responsive web application called Options Edge AI.

This application is a personalized stock market intelligence and options education platform designed primarily for beginner options traders.

The user selects and monitors 10–15 companies. The application organizes each company's stock chart, news, earnings calendar, market catalysts, and technical analysis in one unified dashboard.

The long-term goal is to create an intelligent platform that helps users understand potential bullish Call setups, bearish Put setups, and situations where no trade is warranted.

For this initial build, focus on creating a polished, functional frontend shell with a scalable architecture for future API integrations.

Do not build a generic stock dashboard. Create a visually sophisticated, multi-panel trading terminal with a strong emphasis on usability, market intelligence, and beginner education.

1. DESIGN DIRECTION

Create a modern fintech interface inspired by professional trading terminals, institutional research dashboards, and premium financial SaaS applications.

Visual Style

Dark-mode-first interface

Deep charcoal and midnight navy backgrounds

Subtle borders and separators

Clean typography

Premium, minimalist financial aesthetic

Green for bullish/positive indicators

Red for bearish/negative indicators

Amber for warnings and upcoming catalysts

Muted gray for neutral information

Clear visual hierarchy

Compact but readable information density

Avoid excessive gradients, oversized cards, cartoonish illustrations, and unnecessary animations.

The interface should feel like a serious financial intelligence product, not a gaming application.

Use responsive layouts for desktop, tablet, and mobile. Prioritize desktop because the application will primarily be used for multi-panel market monitoring.

2. MAIN APPLICATION LAYOUT

Create a persistent application shell with:

Top Navigation Bar

Include:

Options Edge AI logo

Global market status

Market open/closed indicator

Search ticker input

Notifications icon

User profile/settings

Data connection status indicator

Left Sidebar

Include navigation items:

Trading Dashboard

My Watchlist

Market News

Earnings Calendar

AI Trade Analyzer

Options Lab (Coming Soon)

Learning Center

Settings

Clearly identify unfinished modules as coming soon.

Main Dashboard

Create a customizable, multi-panel dashboard divided into these sections:

A. My Watchlist — Left Panel

Display the user's selected stocks in a compact vertical list.

Each ticker row should include:

Company ticker symbol

Company name

Current or placeholder price

Daily percentage change

Small trend indicator

Earnings countdown badge when applicable

Selected ticker highlighting

Allow users to:

Add a ticker

Remove a ticker

Search for a company

Reorder tickers

Select a ticker to update the entire dashboard

Preload a sample watchlist containing AAPL, NVDA, TSLA, AMZN, MSFT, META, GOOGL, AMD, PLTR, and SPY.

Clearly identify any simulated market data. Never represent mock prices as live prices.

B. Main Chart Panel — Center

Create the largest dashboard panel for an interactive TradingView chart.

Include:

Selected ticker and company name

Current price placeholder

Daily percentage change

Timeframe selector

Chart type selector

Chart expand/fullscreen control

Indicator controls

Chart loading and error states

Prepare the chart component for TradingView integration.

Use an appropriate TradingView embeddable chart or widget where available and permitted. Keep chart functionality isolated in a reusable component.

Do not fabricate a successful TradingView API connection. If credentials or integration access are unavailable, display a polished integration placeholder with clear setup instructions.

The chart must update when the user selects a different ticker.

C. Market Intelligence / News Panel

Create a news feed that updates based on the selected ticker.

Each news item should support:

Headline

Source

Publication timestamp

Ticker association

News category

Short summary

Potential market impact label

Link to original article when available

News categories:

Earnings

Company announcements

Analyst ratings

Mergers and acquisitions

Legal/regulatory

Product launches

Macroeconomic events

Add filter tabs for All, High Impact, Earnings, and Company News.

For the shell, use clearly labeled sample news items. Build a reusable component ready for a future news API.

D. Earnings Monitor Panel

Display:

Next earnings date

Days until earnings

Before market / After market indicator

Estimated EPS

Reported EPS when available

Historical earnings reactions

Upcoming earnings-related news

Use sample data only where clearly labeled.

Provide an upcoming earnings calendar view as a future-ready component.

E. AI Trade Setup Analyzer Panel

Create a visually distinct analysis panel for the selected ticker.

Include:

Overall technical bias: Bullish / Bearish / Neutral

Trend strength

Momentum status

Volume confirmation

Key support levels

Key resistance levels

Upcoming catalysts

Potential Call setup conditions

Potential Put setup conditions

Risk factors

Setup status: Monitoring / Developing / Confirmed / No Setup

Display a clear educational disclaimer.

IMPORTANT: The initial shell must not generate fabricated live signals or claim to provide validated trading recommendations.

Use labeled sample analysis states or an empty state such as "Connect market data to generate analysis."

The future analysis engine should be designed to explain why a setup meets or fails its criteria, rather than outputting a direction without supporting evidence.

F. Market Overview Strip

Create a compact market overview showing:

SPY

QQQ

DIA

IWM

VIX

Display price, daily percentage change, and market status.

Use placeholders or explicitly labeled simulated data until a market data provider is connected.

3. TICKER MANAGEMENT

Build a functional watchlist management system.

Users should be able to:

Add and remove tickers

Search by ticker symbol or company name

Persist their watchlist between sessions

Select a ticker and update all ticker-dependent panels

View earnings badges and news indicators

Use local storage for the initial prototype.

Structure the application so that watchlists can later be associated with authenticated user accounts and stored in a database.

4. GLOBAL DASHBOARD BEHAVIOR

All ticker-dependent components must share a common selected-ticker state.

When a user selects a ticker:

Update the chart

Update the news feed

Update earnings information

Update the AI analysis panel

Update the company header

Update relevant catalyst indicators

Avoid requiring separate searches for each panel.

Create loading, empty, error, and disconnected states for all future API-driven components.

5. FUTURE DATA INTEGRATION ARCHITECTURE

Build the frontend so that real data providers can be connected without rewriting the interface.

Create modular service layers for:

Market data

Company news

Earnings data

Technical analysis

AI-generated explanations

Options chain data

Do not hardcode a single market data provider into the UI components.

API keys and secrets must never be exposed in frontend code. Future integrations should use secure server-side functions or backend services.

Do not invent API responses or imply that a live connection exists when it does not.

6. FUTURE AI ANALYSIS ENGINE

Prepare the application for an AI analysis engine that evaluates:

Trend direction

Price action

Support and resistance

Moving averages

RSI

MACD

Volume

Earnings proximity

News catalysts

Market conditions

The future engine should return structured analysis, including:

Observed market conditions

Bullish factors

Bearish factors

Potential Call setup criteria

Potential Put setup criteria

Invalidating conditions

Risk factors

Missing or stale data

Overall confidence and explanation

Do not treat AI-generated analysis as a guarantee of future stock movement.

Build the application to support neutral or no-trade outcomes.

7. BEGINNER EDUCATION

Add contextual educational tooltips for terms such as:

Call

Put

Implied volatility

Earnings

RSI

MACD

Support

Resistance

Volume

Bullish

Bearish

Use simple explanations accessible to someone learning options trading.

Add a future-ready Learning Center section.

8. SETTINGS AND CUSTOMIZATION

Create a Settings page with:

Watchlist management

Dashboard layout preferences

Default chart timeframe

Notification preferences

Data provider connection status

Theme preferences

Allow users to configure which dashboard panels they want visible.

9. TECHNICAL REQUIREMENTS

Use a modern React-based architecture with TypeScript and reusable components.

Use Tailwind CSS and a consistent component system.

Recommended components:

DashboardLayout

WatchlistPanel

TradingViewChartPanel

MarketNewsPanel

EarningsMonitorPanel

AITradeAnalyzerPanel

MarketOverviewStrip

TickerSearch

TickerDetailsHeader

MarketStatusIndicator

Keep state management clean and centralized.

Use realistic mock data only when necessary, and label all simulated information.

Ensure the interface works well at common desktop resolutions.

Build polished loading states, empty states, and responsive layouts.

Do not build brokerage execution or automated order placement in this phase.

10. FINAL BUILD OBJECTIVE

Deliver a visually impressive, functional dashboard prototype that feels like a real financial intelligence terminal.

The watchlist must work.

Ticker selection must work.

All ticker-dependent panels must update together.

The interface must be ready for future TradingView, news, earnings, and market data integrations.

Prioritize visual quality, functionality, component reusability, and scalability.

Build the initial application shell now. Do not spend this phase implementing features that require paid API subscriptions or unavailable credentials.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bc86db99-c31f-437a-b0aa-8d1744736496).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
