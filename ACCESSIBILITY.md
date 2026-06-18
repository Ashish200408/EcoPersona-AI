# Accessibility Statement — EcoPersona AI

EcoPersona AI is committed to being accessible to all users, including those who use assistive technologies such as screen readers, keyboard navigation, or have visual, motor, or cognitive disabilities.

**Target conformance level:** WCAG 2.1 Level AA

---

## Implemented Accessibility Features

### 1. Skip Navigation
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```
A visible-on-focus skip link appears when the user starts keyboard navigation, allowing them to bypass the navigation sidebar and jump directly to main content.

### 2. Semantic HTML5
- `<nav>` for sidebar and mobile navigation with descriptive `aria-label`
- `<header>`, `<main>`, `<footer>` landmarks throughout
- `<article>` for stat cards
- `<section>` with `aria-labelledby` linking to visible headings
- `<figure>` with `role="img"` and `aria-label` for the SVG ring chart
- `<blockquote>` and `<cite>` for eco fact quotations
- `<fieldset>` and `<legend>` for all radio button groups in assessment

### 3. ARIA Implementation
- **`aria-live="polite"`** on banner slides, fact cards, score displays for screen reader announcements
- **`aria-atomic="true"`** on fact rotator to announce complete updated content
- **`aria-label`** on all icon-only buttons and interactive SVG elements
- **`aria-expanded`** on sidebar toggle and hamburger button
- **`aria-current="page"`** on the active navigation item
- **`aria-modal="true"`** on all module dialogs
- **`aria-hidden="true"`** on decorative SVGs and emoji
- **`aria-selected`** on tab-like navigation elements (period tabs, filters)
- **`aria-valuenow/min/max/text`** on all progress bars and range inputs
- **`aria-pressed`** on habit toggle checkboxes
- **`aria-controls`** linking toggle buttons to their controlled elements

### 4. Keyboard Navigation
All interactive elements are fully keyboard accessible:

| Element | Keys |
|---|---|
| Sidebar navigation | `Tab`, `Arrow Up/Down`, `Home`, `End` |
| Assessment steps | `Tab`, `Enter`, `Space` for options |
| Period tabs (chart) | `Arrow Left/Right` |
| Category filters | `Arrow Left/Right` |
| Bottom nav tabs | `Arrow Left/Right` |
| Modal dialogs | `Escape` to close |
| Sliders (simulator) | `Arrow Left/Right`, `Home`, `End` |
| Fact cards (learning hub) | `Enter`, `Space` to mark read |
| Range inputs | All standard keyboard controls |

### 5. Focus Management
- Module dialogs trap focus within the dialog when open
- On dialog open, focus moves to the first interactive element
- On dialog close, focus returns to the element that triggered the dialog
- `tabindex="-1"` used on heading elements to receive programmatic focus without appearing in tab order

### 6. Screen Reader Announcements
A dedicated live region announces key state changes:
```html
<div id="aria-announcer" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
```

Used for:
- Module open/close events
- Assessment step navigation
- Assessment completion results
- Mission completion notifications
- Habit logging confirmations
- Banner slide content changes
- Challenge progress updates

### 7. Colour & Contrast
| Text/Background Combination | Contrast Ratio | Pass/Fail |
|---|---|---|
| Primary text on dark bg | 14.7:1 | ✅ AAA |
| Secondary text on dark bg | 7.2:1 | ✅ AAA |
| Muted text on dark bg | 4.8:1 | ✅ AA |
| Brand green on dark bg | 5.1:1 | ✅ AA |
| Danger red on dark bg | 5.3:1 | ✅ AA |
| White text on green btn | 7.9:1 | ✅ AAA |

### 8. Reduced Motion
All animations respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9. Form Accessibility (Assessment)
- All radio groups wrapped in `<fieldset>` with `<legend>`
- Error messages use `role="alert"` and `aria-live="assertive"`
- Errors are linked to their fieldset via `id` references
- Options have descriptive `aria-describedby` linking to impact tags
- Validation fires on "Continue" with focus moved to error message

### 10. Images & Media
- All SVG icons have `aria-hidden="true"` when decorative
- Meaningful SVGs have descriptive `aria-label` attributes
- The Earth globe SVG uses `class="earth-svg"` with containing `aria-hidden` on the scene
- No images without text alternatives

---

## Known Limitations

1. **Chart accessibility** — Chart.js charts are accompanied by a visually-hidden `<table>` with the same data for screen reader users. However, the chart itself may not be fully accessible to all AT users.

2. **Complex widgets** — The habit heatmap and streak calendar are visual-only components. The date information is available as `aria-label` on each cell but the heatmap is primarily a visual overview tool.

3. **Dynamic content** — Some complex module renders (Eco Story, Learning Hub facts grid) use `innerHTML` with sanitized content, which may not trigger live region updates in all screen readers unless focused manually.

---

## Browser & AT Testing

| Browser | Screen Reader | Tested |
|---|---|---|
| Chrome 120 | NVDA 2023.3 | ✅ |
| Chrome 120 | Chrome DevTools Accessibility Tree | ✅ |
| Edge 120 | Narrator | ✅ |
| Firefox 121 | NVDA 2023.3 | ✅ |
| Safari 17 | VoiceOver (macOS) | Partial |

---

## Testing Tools Used
- **axe DevTools** — automated accessibility scanning
- **Chrome DevTools Accessibility Panel** — accessibility tree inspection
- **WAVE** — Web Accessibility Evaluation Tool
- **Keyboard-only navigation** — manual testing
- **Color contrast checkers** — manual verification

---

## Feedback

If you experience accessibility barriers, please contact the development team through the hackathon submission channel. We're committed to resolving any issues promptly.
