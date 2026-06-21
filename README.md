# EcoPersona AI 🌿

> **Know Your Impact. Shape Your Future.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![WCAG 2.1](https://img.shields.io/badge/WCAG-2.1%20AA-green?style=flat)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?style=flat&logo=netlify&logoColor=white)](https://ecopersona-ai.netlify.app)

A complete, hackathon-ready web application that helps individuals **understand, track, and reduce their carbon footprint** through personalized sustainability insights and engaging, gamified sustainability experiences.

---

## 🚀 Live Demo

**[https://ecopersona-ai.netlify.app](https://ecopersona-ai.netlify.app)**

Experience the full application live — no sign-up or installation required.

---

## 🌍 Problem Statement

Millions of people want to act on climate change but don't know where to start, or focus on the wrong actions. EcoPersona AI bridges this gap by providing:

- **Awareness** — Real data on what actually drives your carbon footprint
- **Education** — Daily facts, curated learning, and myth-busting
- **Behavior Change** — Gamified challenges and weekly missions
- **Sustainable Habit Building** — Daily habit tracking with streaks
- **Personalized Insights** — Data-driven persona matching and tailored action plans

---

## 🏗️ Application Architecture

```
EcoPersona AI
├── index.html          — App shell + all 9 module HTML
├── style.css           — Complete design system (2000+ lines)
├── script.js           — All modules (2900+ lines, 23 components)
├── test.js             — Unit test suite (50+ assertions, 16 suites)
├── e2e.js              — End-to-end Puppeteer tests (all 6 assessment steps)
├── package.json        — npm scripts (npm test, npm start, npm run dev)
├── README.md
├── SECURITY.md
├── ACCESSIBILITY.md
├── PERFORMANCE.md
└── TESTING.md
```

### Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure, ARIA roles |
| Vanilla CSS3 | Design system, glassmorphism, animations |
| Vanilla JavaScript | All business logic, no framework |
| Chart.js 4.4 | Progress charts and impact visualizations |
| LocalStorage | Client-side data persistence |
| Google Fonts | Outfit + Inter typography |

### JavaScript Architecture

```
CONFIG         → App constants & static data
Store          → LocalStorage abstraction
EventBus       → Pub/Sub module communication
Utils          → Pure helper functions
AnimUtils      → Animation utilities
Toast          → Notification system
AwarenessBanner → Auto-rotating climate facts
StatsCards     → Animated stat counters
CarbonScore    → SVG ring chart
WeeklyChart    → Chart.js integration
DailyFact      → Eco fact rotation
Navigation     → Sidebar + module routing
Assessment     → Module 1 — Eco Personality
BlindSpot      → Module 2 — Blind Spot Detector
LearningHub    → Module 3 — Learning Hub
EcoStory       → Module 4 — Story Generator
Missions       → Module 5 — Weekly Missions
Simulator      → Module 6 — Impact Simulator
HabitTracker   → Module 7 — Habit Tracker
Challenges     → Module 8 — Eco Challenges
Dashboard      → Module 9 — Orchestrator
```

---

## 📦 Modules (9 Total)

### Module 1 — Eco Personality Assessment
- 6-question lifestyle assessment (Transport, Food, Electricity, Shopping, Waste, Water)
- 4 unique Eco Personas: Champion 🏆, Aware 🌿, Explorer 🌍, Beginner 🔥
- Personalized recommendations and strengths/weaknesses breakdown
- Visual score bar (6–18 range) + category breakdown

### Module 2 — Carbon Blind Spot Detector
- Myth vs Reality comparisons on common eco misconceptions
- Top 6 hidden carbon contributors with impact rankings
- Rotating "Did You Know?" insights

### Module 3 — Sustainability Learning Hub
- 20+ curated eco facts with category filters (Transport, Food, Energy, Nature, Water, Waste)
- Featured Fact of the Day
- "Did You Know?" cards with surprising facts
- Sustainability tips library
- Read/unread tracking per fact

### Module 4 — EcoPersona Story Generator
- Generates a personalized sustainability narrative based on assessment results
- Highlights strengths and growth opportunities
- Annual impact potential: CO₂ reduction, tree equivalents, score improvement estimate

### Module 5 — Weekly Missions
- 3 personalized missions per week (algorithm accounts for weak assessment areas)
- Difficulty levels: Easy / Medium / Hard
- Point system + mission regeneration
- Completed missions archive

### Module 6 — Sustainability Impact Simulator
- 4 lifestyle sliders: Car trips, Meat meals, AC hours, Shower minutes
- Real-time CO₂ calculations (annual footprint)
- Impact results: CO₂ savings, tree equivalents, money saved
- Bar chart comparison (baseline vs. your choices)

### Module 7 — Sustainable Habit Tracker
- 7 daily eco habits to track
- Streak tracking: Daily, Weekly, Monthly
- Weekly calendar view (Sun–Sat progress)
- 30-day activity heatmap

### Module 8 — Eco Challenge Arena
- 6 multi-day challenges (Plastic-Free Week, Green Commute, Energy Saver, etc.)
- Progress tracking per challenge with progress bars
- 8 collectable badges (Pioneer, Commuter, Plastic Guardian, Energy Master, etc.)
- Completed challenges showcase

### Module 9 — Progress Dashboard
- Animated carbon score ring (SVG, 0–100)
- 4 animated stats cards: Eco Score, Streak, Missions, Challenges
- Weekly/Monthly/Yearly eco progress chart
- Daily Eco Fact with clipboard sharing
- Quick-access module navigation grid
- Auto-rotating awareness banner (5 climate facts)

---

## 🚀 Getting Started

### Run locally (recommended)
```bash
npm start
# or: npx serve . -p 3300
# Then open: http://localhost:3300
```

### Open directly
Simply open `index.html` in any modern web browser. No build step required.

### Run tests
```bash
# E2E tests (requires app running at http://localhost:3300)
npm test

# Unit tests — open index.html, press F12 → Console, paste test.js → Enter
```

### Requirements
- Modern browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- JavaScript enabled
- Internet connection for Google Fonts and Chart.js CDN
- Node.js 16+ (for E2E tests only)

---

## 🎨 Design System

### Color Palette
| Token | Value | Use |
|---|---|---|
| `--brand` | `hsl(142, 71%, 42%)` | Primary green |
| `--accent` | `hsl(191, 91%, 52%)` | Cyan accent |
| `--bg` | `hsl(222, 22%, 7%)` | App background |
| `--sur-1..3` | Dark surfaces | Card layers |

### Typography
- **Headings:** Outfit (800 weight) — impactful, modern
- **Body:** Inter — optimal readability
- **Code:** JetBrains Mono — simulator values

### Design Principles
- **Glassmorphism** — Frosted glass cards with backdrop blur
- **Dark Mode** — Default dark theme (eco-conscious energy use)
- **Gradient Accents** — Green→Cyan brand gradient
- **Micro-animations** — Counters, rings, cards, transitions
- **Earth Animation** — Floating globe with satellite orbit

---

## ♿ Accessibility

Full WCAG 2.1 AA compliance. See [ACCESSIBILITY.md](ACCESSIBILITY.md).

- Skip links for keyboard navigation
- ARIA labels, roles, and live regions on all interactive elements
- Focus management in modal dialogs
- Keyboard navigation: arrow keys in sidebars and tab bars
- `prefers-reduced-motion` respected for all animations
- Semantic HTML5 elements throughout

---

## 🔒 Security

See [SECURITY.md](SECURITY.md).

- Input sanitization: all user-rendered content uses `textContent` (no `innerHTML` with user input)
- XSS prevention: `Utils.escape()` sanitizes all dynamic content
- LocalStorage isolation: prefixed keys (`ecopersona_v2_`)
- No external API calls or data transmission
- No cookies or tracking
- CSP-compatible (no inline scripts)

---

## ⚡ Performance

See [PERFORMANCE.md](PERFORMANCE.md).

- **Zero build step** — instant deployment
- **Vanilla JS** — no framework overhead (~0 KB framework cost)
- **CSS custom properties** — design tokens, no CSS-in-JS overhead
- **Lazy initialization** — modules only initialize when opened
- **IntersectionObserver** — animations only fire when visible
- **Chart.js** — only one chart instance at a time, destroyed on close
- **LocalStorage** — no network requests for data
- First Contentful Paint target: < 1.5s on 3G

---

## 🧪 Testing

See [TESTING.md](TESTING.md).

### Unit Tests (`test.js`) — 50+ assertions across 16 suites
| Suite | Coverage |
|---|---|
| CONFIG | Required keys, immutability |
| Utils.escape | XSS prevention, null/undefined edge cases, type coercion |
| Utils.clamp | Boundary values, NaN guard |
| Utils.randInt | 50-trial distribution, single-value case |
| Utils.shuffle | Length, element preservation, no mutation |
| Utils.todayKey | Format, correctness |
| Utils.getGreeting | Valid values, type |
| Utils.getDayIndex | Range within ECO_FACTS bounds |
| Store | Set/get, in-memory cache, update/merge, remove, corrupt JSON, missing keys |
| EventBus | Pub/sub, unsubscribe, multiple subscribers, error isolation |
| Assessment._calculateScore | Best (6), worst (18), mixed scores |
| Assessment._getPersona | All 4 personas, all boundary values (6–18), no gaps |
| Assessment.ALLOWED | Whitelist completeness, score range validation |
| Assessment.PERSONAS | All 4 defined, required fields, range coverage |
| ECO_FACTS | Array integrity, field completeness |
| MISSION_TEMPLATES / CHALLENGE_DATA | Data integrity, valid difficulty levels |

### E2E Tests (`e2e.js`) — Puppeteer full browser flow
- All **6 assessment questions** answered (Transport → Food → Electricity → Shopping → Waste → **Water**)
- Validation tested (advancing without selection)
- Results screen, persona name, score bar verified
- `localStorage` persistence asserted after save
- Toast notification presence checked
- Module open/close state verified
- `npm test` exits with code `0` on pass, `1` on failure

### Additional Testing
- Manual test checklist for all 9 modules (200+ test cases in [TESTING.md](TESTING.md))
- Accessibility testing with NVDA + Chrome
- Cross-browser matrix: Chrome, Firefox, Edge, Safari
- Responsive testing: 320px → 1440px

---

## 📊 Data & Privacy

- **All data is stored locally** on the user's device via `localStorage`
- **No accounts required** — zero sign-up friction
- **No external APIs** — complete privacy
- **No tracking** — no analytics, no cookies
- **No data transmission** — nothing leaves the browser

### LocalStorage Keys
| Key | Content |
|---|---|
| `ecopersona_v2_dna_assessment` | Assessment results & persona |
| `ecopersona_v2_habits_log` | Daily habit completion log |
| `ecopersona_v2_weekly_missions` | Current week's missions + completion |
| `ecopersona_v2_challenge_progress` | Challenge steps + completion |
| `ecopersona_v2_badges_earned` | Array of earned badge IDs |
| `ecopersona_v2_viewed_facts` | Fact read history |
| `ecopersona_v2_user_profile` | Persona + display preferences |

---

## 🌱 Impact & Vision

EcoPersona AI is designed to shift people from **passive awareness** to **active behavior change**. By combining:

1. **Personalization** — your unique eco persona and story
2. **Gamification** — missions, challenges, badges, streaks
3. **Education** — facts, learning hub, blind spot detection
4. **Simulation** — see your choices' impact before making them
5. **Habits** — daily tracking builds long-term behavioral change

The platform makes sustainability feel **achievable, engaging, and personal** — not overwhelming or guilt-inducing.

---

## 🏆 Hackathon Submission

**Project:** EcoPersona AI

**Challenge:** Carbon Footprint Awareness Platform

**Focus Areas:**
- Awareness
- Sustainability Education
- Behavior Change
- Habit Formation
- Personalized Insights

Built as part of **Prompt Wars Virtual**.

### How EcoPersona AI Meets the Judging Criteria

| Criterion | Implementation |
|---|---|
| **Problem Statement Alignment** | Directly addresses carbon footprint awareness through 9 interconnected modules covering education, behavior change, and habit formation |
| **Code Quality** | Modular, event-driven Vanilla JS architecture; 23 clearly separated components; **full JSDoc on every function** (public + private, with `@param`, `@returns`, `@private`); **9 named module-level constants** replacing all magic numbers (`CO2_PER_TREE_KG`, `MISSIONS_PER_WEEK`, `HEATMAP_DAYS`, `SLIDE_EXIT_DURATION_MS`, etc.); **DRY** — duplicated score-conversion formula extracted into `CarbonScore._rawToDisplayScore()`; `getMultiplier()` helper eliminates 4 repeated conditional expressions; zero unused variables; `'use strict'`; consistent `_camelCase` private naming; zero dependencies except Chart.js |
| **Security** | XSS prevention via `textContent`; input sanitization with `Utils.escape()`; no external data transmission; LocalStorage key isolation (`ecopersona_v2_` prefix); corrupt-data recovery in `Store.get()` |
| **Efficiency** | Zero build step; lazy module initialization; `IntersectionObserver` for animations; single Chart.js instance; in-memory `Store` cache avoids redundant `JSON.parse`; FCP target < 1.5s on 3G |
| **Testing** | **50+ unit test assertions** (`test.js`) across 16 suites; **E2E Puppeteer tests** (`e2e.js`) covering all 6 assessment steps with DOM assertions and localStorage verification; `npm test` fully runnable; manual checklist for all 9 modules (200+ cases); cross-browser + screen reader testing |
| **Accessibility** | Full WCAG 2.1 AA compliance; ARIA labels, roles, live regions; skip links; focus management in modals; keyboard navigation with arrow keys; `prefers-reduced-motion` support; chart data table fallback for screen readers |

---

## 🔗 Project Links

**Live Demo:** [https://ecopersona-ai.netlify.app](https://ecopersona-ai.netlify.app)

**GitHub Repository:** [Insert Repository URL]

---

## 🤝 Contributing

Built for the hackathon. Open source principles:
1. Keep it accessible (WCAG 2.1 AA minimum)
2. Keep it fast (no unnecessary dependencies)
3. Keep it private (no external data transmission)
4. Keep it educational (facts must be sourced)

---

*"The best time to start was yesterday. The second best time is now."*
