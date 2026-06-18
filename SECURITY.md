# Security Policy — EcoPersona AI

## Overview

EcoPersona AI is a **client-side-only** web application. No data leaves the user's browser. This document outlines the security measures implemented throughout the application.

---

## Data Handling

### What data is collected?
- **Nothing is transmitted** — the application makes zero network requests after initial asset load
- **No user accounts** — no authentication, no server-side data
- **LocalStorage only** — all persistence is in the user's browser

### What is stored locally?
- Assessment answers and results
- Habit completion logs
- Mission and challenge progress
- Badge/achievement state
- User display preferences

All stored data uses the prefix `ecopersona_v2_` in localStorage to avoid conflicts with other applications.

---

## XSS Prevention

All dynamic content rendered to the DOM is sanitized:

```javascript
// Utils.escape() — Used for ALL user-facing dynamic content
escape(str) {
  const el = document.createElement('div');
  el.textContent = String(str);
  return el.innerHTML;
}
```

- **`textContent`** is used instead of `innerHTML` for all user-controlled data
- `Utils.escape()` is applied to all data before rendering in template literals
- No `eval()`, `Function()`, or `document.write()` is used anywhere in the codebase

---

## Input Validation & Sanitization

Assessment input is validated on two layers:

### Layer 1 — Allowed-list validation
```javascript
ALLOWED: {
  transport:   ['car', 'bike', 'public'],
  food:        ['vegetarian', 'mixed', 'nonvegetarian'],
  electricity: ['low', 'medium', 'high'],
  // ...
}
```

### Layer 2 — Sanitize function
```javascript
_sanitize(field, value) {
  if (!value || typeof value !== 'string') return null;
  const allowed = this.ALLOWED[field];
  const cleaned = value.trim().toLowerCase().replace(/[^a-z]/g, '');
  return allowed.includes(cleaned) ? cleaned : null;
}
```

Only pre-approved string values from radio buttons can be processed. Any injection attempt returns `null` and is rejected.

---

## LocalStorage Security

- **Key prefixing** — all keys are prefixed with `ecopersona_v2_` to namespace the application
- **Try/catch parsing** — all `JSON.parse()` calls are wrapped to handle corrupt data gracefully
- **Storage quota** — write failures are caught and logged, never crash the app

```javascript
set(key, value) {
  try {
    localStorage.setItem(CONFIG.STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('[Store] Write failed:', key, e.message);
    return false;
  }
}
```

---

## Content Security Policy

The application is compatible with strict CSP. Recommended headers for production deployment:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net;
  style-src 'self' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'none';
  frame-src 'none';
  object-src 'none';
```

---

## Dependency Security

| Dependency | Version | Source | Purpose |
|---|---|---|---|
| Chart.js | 4.4.0 | jsdelivr CDN | Charts only |
| Google Fonts | N/A | fonts.googleapis.com | Typography |

- Chart.js is loaded from a pinned version on jsDelivr (high-integrity CDN)
- No npm dependencies — no supply chain attack surface from node_modules
- No dynamic `require()` or `import()` from user-controlled paths

**Recommended:** Add Subresource Integrity (SRI) for production:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
  integrity="sha384-[HASH]"
  crossorigin="anonymous">
</script>
```

---

## ARIA & Accessibility Security

- Dialog modals set `aria-modal="true"` and `aria-hidden="true"` when closed
- Focus is trapped within open modals to prevent focus leakage
- Screen reader live regions use `aria-live="polite"` (not `assertive` unless critical)

---

## Reporting Vulnerabilities

This project was built for a hackathon. To report security issues:

1. Do **not** open a public GitHub issue for security vulnerabilities
2. Contact the development team directly via the hackathon submission channel
3. Include: description, reproduction steps, potential impact

---

## Security Checklist

- [x] No `innerHTML` with user-controlled data
- [x] Input allowed-list validation
- [x] Sanitization function for all dynamic content
- [x] LocalStorage key namespacing
- [x] Try/catch on all localStorage operations
- [x] No external API calls or data transmission
- [x] No `eval()` or `Function()` constructors
- [x] No inline event handlers in HTML
- [x] CSP-compatible (no inline scripts)
- [x] Pinned CDN dependency versions
