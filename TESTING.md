# Testing Documentation — EcoPersona AI

## Test Strategy

EcoPersona AI uses a combination of:
1. **Automated unit tests** — `test.js` covers all core modules with 50+ assertions (Utils, Store, EventBus, Assessment, CONFIG, ECO_FACTS, MISSION_TEMPLATES, CHALLENGE_DATA)
2. **End-to-end (E2E) tests** — `e2e.js` (Puppeteer) runs a full browser flow through all 6 assessment steps with pass/fail assertions
3. **Manual functional testing** — All 9 modules manually verified
4. **Accessibility testing** — ARIA, keyboard, screen reader
5. **Cross-browser testing** — Chrome, Firefox, Edge, Safari
6. **Responsive testing** — Mobile (320px), tablet (768px), desktop (1440px)

### Running Unit Tests
1. Open `index.html` in a browser
2. Open Developer Tools (F12 → Console)
3. Copy and paste the contents of `test.js` into the Console
4. Press Enter — results appear with ✅ / ❌ markers

### Running E2E Tests
```bash
npm test
# or
node e2e.js
```
Requires the app to be running at `http://localhost:3300`.

---

## Module Test Checklist

### ✅ Dashboard (Module 9)
- [x] Loads without JavaScript errors
- [x] Sidebar navigation visible with all 8 module links
- [x] Hero section renders with Earth globe animation
- [x] Awareness banner auto-rotates every 7 seconds
- [x] Previous/Next banner navigation works
- [x] Stats cards animate when scrolled into view
- [x] Carbon score ring animates from 0 to target score
- [x] Breakdown bars animate sequentially
- [x] Daily Fact card renders correct content
- [x] "Copy" button copies fact to clipboard
- [x] "Next Fact" rotates to next fact
- [x] Progress chart renders (Week/Month/Year tabs)
- [x] Chart period tabs switch datasets correctly
- [x] All 8 module quick-access cards render
- [x] Clicking module cards opens correct module
- [x] Greeting updates based on time of day
- [x] Sidebar collapse/expand works
- [x] Sidebar state persists across refresh

### ✅ Eco Personality Assessment (Module 1)
- [x] "Take Assessment" button opens modal
- [x] Modal has correct ARIA attributes
- [x] Introduction screen renders
- [x] "Start Assessment" advances to step 1
- [x] Step 1 — Transport: 3 options visible
- [x] Selecting an option marks it visually
- [x] "Continue" without selection shows error
- [x] "Continue" with selection advances to step 2
- [x] Progress bar fills correctly (0→16→33→50→66→83→100%)
- [x] Step dots update correctly
- [x] Step 2 — Food: 3 options visible
- [x] Step 3 — Electricity: 3 options visible
- [x] Step 4 — Shopping: 3 options visible
- [x] Step 5 — Waste: 3 options visible
- [x] Step 6 — Water: 3 options visible
- [x] "Back" button returns to previous step
- [x] "Skip" skips current question
- [x] "Close" button dismisses modal
- [x] Escape key closes modal
- [x] Results screen renders with correct persona
- [x] Score bar animates to correct percentage
- [x] Strengths and improvements render
- [x] Category breakdown renders all 6 categories
- [x] 3 personalized tips render
- [x] "Save My Profile" saves to localStorage and shows toast
- [x] "Retake" resets assessment from beginning
- [x] Results persist after modal close
- [x] Dashboard badge updates after save

### ✅ Carbon Blind Spot Detector (Module 2)
- [x] Module opens via sidebar/dashboard link
- [x] Myth vs. Reality comparisons render (3 pairs)
- [x] Top 6 hidden contributors render
- [x] "Next Insight" button rotates tips
- [x] Module closes via X button
- [x] Module closes via Escape key

### ✅ Sustainability Learning Hub (Module 3)
- [x] Module opens and renders
- [x] Featured Fact of the Day shows today's fact
- [x] "Did You Know?" shows 4 random facts
- [x] Facts grid shows all 20 facts
- [x] Clicking a fact marks it as "Viewed"
- [x] Category filter "Transport" shows only transport facts
- [x] Category filter "Food" shows only food facts
- [x] Count label updates on filter change
- [x] All 8 sustainability tips render
- [x] Filter selection updates `aria-selected`

### ✅ EcoPersona Story Generator (Module 4)
- [x] Without assessment: shows "Take Assessment First" state
- [x] CTA button opens assessment correctly
- [x] With assessment: story content renders
- [x] Story includes correct persona name
- [x] Story includes impact stats (CO₂, trees, improvement %)
- [x] "See My Missions" navigates to missions module
- [x] "Try Impact Simulator" navigates to simulator

### ✅ Weekly Missions (Module 5)
- [x] Module renders with 3 active missions
- [x] Mission stats row shows correct counts
- [x] Each mission shows title, description, tags, impact
- [x] "Mark Complete" button completes a mission
- [x] Toast notification shown on completion
- [x] Completed mission moves to "Completed" section
- [x] "Regenerate" creates new missions
- [x] Mission stats update after completion
- [x] Missions persist across module close/reopen

### ✅ Sustainability Impact Simulator (Module 6)
- [x] Module renders with 4 sliders
- [x] Car trips slider: 0–14, default 7
- [x] Meat meals slider: 0–21, default 10
- [x] AC hours slider: 0–16, default 6
- [x] Shower minutes slider: 2–30, default 12
- [x] Moving slider updates value label in real time
- [x] Moving slider updates results in real time
- [x] CO₂ reduction/increase calculated correctly
- [x] Tree equivalents calculated correctly
- [x] Money saved calculated correctly
- [x] Annual footprint shown
- [x] Bar chart renders
- [x] Chart updates when sliders move

### ✅ Sustainable Habit Tracker (Module 7)
- [x] Module renders with today's date
- [x] 7 habit items visible
- [x] Clicking checkbox marks habit as done
- [x] Done habits show visual checkmark
- [x] Toast shown on habit completion
- [x] Streak cards update after habit completion
- [x] Weekly calendar shows today highlighted
- [x] 30-day heatmap renders 30 cells
- [x] Heatmap cells have correct color levels
- [x] Habit state persists across module close/reopen

### ✅ Eco Challenge Arena (Module 8)
- [x] Module renders with badges and challenges
- [x] Locked badges shown at 40% opacity
- [x] Earned badges (if any) shown at full opacity
- [x] 6 challenges render with progress bars
- [x] "Start Challenge" begins challenge (step 0→1)
- [x] "Log Today's Progress" increments step
- [x] Progress bar updates on each step
- [x] "Claim Badge" appears when all steps complete
- [x] Claiming badge awards badge, shows toast
- [x] Awarded badge becomes full opacity in showcase
- [x] Completed challenge moves to "Completed" section
- [x] All state persists across module close/reopen

---

## Accessibility Tests

### Keyboard Navigation
- [x] Skip link appears on first Tab press
- [x] All nav items reachable by Tab
- [x] Arrow Up/Down navigates sidebar
- [x] Arrow Left/Right navigates tabs and filters
- [x] Enter/Space activates buttons and links
- [x] Escape closes any open module
- [x] Focus visible on all interactive elements

### Screen Reader (NVDA + Chrome)
- [x] App landmark regions announced correctly
- [x] Nav items read with link role
- [x] Assessment progress announced on each step
- [x] Assessment results read correctly
- [x] Habit toggle reads "Mark as complete/Undo"
- [x] Live region announces state changes
- [x] Chart has fallback data table for screen readers

---

## Cross-Browser Testing

| Browser | Version | Pass |
|---|---|---|
| Chrome | 120+ | ✅ |
| Edge | 120+ | ✅ |
| Firefox | 121+ | ✅ |
| Safari | 17+ | ✅ |
| Chrome Mobile | Android | ✅ |
| Safari Mobile | iOS 17 | ✅ |

---

## Responsive Testing

| Breakpoint | Width | Pass |
|---|---|---|
| Mobile S | 320px | ✅ |
| Mobile M | 375px | ✅ |
| Mobile L | 425px | ✅ |
| Tablet | 768px | ✅ |
| Laptop | 1024px | ✅ |
| Desktop | 1440px | ✅ |

---

## End-to-End Test Flow

```
1. Open http://localhost:3000
2. Verify dashboard loads (hero, sidebar, stats)
3. Click "Take Assessment"
4. Select "Private Car" → Continue
5. Select "Vegetarian/Vegan" → Continue
6. Select "Low Usage" → Continue
7. Select "Minimal" → Continue
8. Select "Low Waste" → Continue
9. Select "Water Conscious" → "See My Results"
10. Verify results show "Eco Champion" persona
11. Click "Save My Profile"
12. Verify toast appears, level badge updates
13. Close assessment
14. Open "Blind Spot Detector" → verify content
15. Open "Learning Hub" → verify facts, filter Transport
16. Open "My Eco Story" → verify narrative generated
17. Open "Weekly Missions" → mark one complete → verify toast
18. Open "Impact Simulator" → move sliders → verify updates
19. Open "Habit Tracker" → check 2 habits → verify streaks
20. Open "Eco Challenges" → log progress → verify bar update
21. Verify localStorage has data for all modules
22. Refresh page → verify state persists
```

---

## Regression Test Checklist

Run after any code change:
- [ ] Dashboard loads without console errors
- [ ] Assessment completes full 6-step flow
- [ ] Results persona matches expected for inputs
- [ ] All module opens/closes work
- [ ] LocalStorage data persists across refresh
- [ ] No layout broken on mobile 375px
