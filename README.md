# EcoPersona AI 🌿

> **Know Your Impact. Shape Your Future.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![WCAG 2.1](https://img.shields.io/badge/WCAG-2.1%20AA-green?style=flat)](https://www.w3.org/WAI/WCAG21/quickref/)

A complete, hackathon-ready web application that helps individuals **understand, track, and reduce their carbon footprint** through personalized AI-powered insights and engaging, gamified sustainability experiences.

---

## 🌍 Problem Statement

Millions of people want to act on climate change but don't know where to start, or focus on the wrong actions. EcoPersona AI bridges this gap by providing:

- **Awareness** — Real data on what actually drives your carbon footprint
- **Education** — Daily facts, curated learning, and myth-busting
- **Behavior Change** — Gamified challenges and weekly missions
- **Sustainable Habit Building** — Daily habit tracking with streaks
- **Personalized Insights** — AI-matched persona and action plans

---

## 🏗️ Application Architecture

```
EcoPersona AI
├── index.html          — App shell + all 9 module HTML
├── style.css           — Complete design system (2000+ lines)
├── script.js           — All modules (2000+ lines, 23 components)
└── docs/
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

### Run locally (Node.js)
```bash
npx serve . --listen 3000
# Then open: http://localhost:3000
```

### Open directly
Simply open `index.html` in any modern web browser. No build step required.

### Requirements
- Modern browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- JavaScript enabled
- Internet connection for Google Fonts and Chart.js CDN

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

- End-to-end test coverage in `e2e.js`
- Manual test checklist for all 9 modules
- Accessibility testing with screen readers
- Cross-browser testing matrix

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

## 🤝 Contributing

Built for the hackathon. Open source principles:
1. Keep it accessible (WCAG 2.1 AA minimum)
2. Keep it fast (no unnecessary dependencies)
3. Keep it private (no external data transmission)
4. Keep it educational (facts must be sourced)

---

*"The best time to start was yesterday. The second best time is now."*
