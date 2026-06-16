/**
 * ═══════════════════════════════════════════════════════════
 *  ECOPERSONA AI — HOME DASHBOARD
 *  Modular Vanilla JavaScript  |  Version 1.0
 *
 *  Architecture:
 *    CONFIG        — App-wide constants & static data
 *    Store         — LocalStorage abstraction (read/write/update)
 *    EventBus      — Pub/Sub for decoupled module communication
 *    Utils         — Pure helper functions (date, format, escape)
 *    AnimUtils     — Counter animation, SVG ring animation
 *    Toast         — Non-blocking notification system
 *    AwarenessBanner — Auto-rotating awareness slides
 *    StatsCards    — Animated stat counter initialisation
 *    CarbonScore   — SVG progress ring + breakdown bar animation
 *    WeeklyChart   — Chart.js weekly trend with period switching
 *    DailyFact     — Daily eco fact with rotation & clipboard copy
 *    Navigation    — Sidebar collapse, mobile drawer, module links
 *    KeyboardNav   — Arrow-key navigation for nav items & tabs
 *    Dashboard     — Orchestrates all sub-modules (init/destroy)
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════
   1. CONFIG — App Constants & Static Data
═══════════════════════════════════════════════════ */
const CONFIG = Object.freeze({
  APP_NAME:         'EcoPersona AI',
  STORAGE_PREFIX:   'ecopersona_v1_',
  BANNER_INTERVAL:  6500,    // ms between auto-advances
  COUNTER_DURATION: 1400,    // ms for counting animation
  RING_SCORE:       42,      // demo carbon score (0–100)
  RING_CIRCUMFERENCE: 389.56 // 2π × r62 for the SVG ring

});

/** @type {Array<{emoji:string, category:string, text:string, source:string}>} */
const ECO_FACTS = [
  {
    emoji: '✈️', category: 'Transport',
    text: 'Shifting just one transatlantic flight to economy class saves as much CO₂ as going vegan for an entire year.',
    source: '— Our World in Data, 2023'
  },
  {
    emoji: '🥩', category: 'Food',
    text: 'Beef produces 20× more greenhouse gas per gram of protein than plant-based alternatives like tofu or lentils.',
    source: '— Science Magazine, 2018'
  },
  {
    emoji: '⚡', category: 'Energy',
    text: 'Switching your home to LED bulbs can reduce lighting energy use by up to 75%, saving around 400 kg of CO₂ annually.',
    source: '— International Energy Agency'
  },
  {
    emoji: '🛍️', category: 'Consumption',
    text: 'The fashion industry produces 10% of global carbon emissions — more than aviation and shipping combined.',
    source: '— UN Environment Programme'
  },
  {
    emoji: '🌳', category: 'Nature',
    text: 'A single mature tree absorbs up to 22 kg of CO₂ per year. You\'d need ~400 trees to offset an average American\'s footprint.',
    source: '— US Forest Service'
  },
  {
    emoji: '🚗', category: 'Transport',
    text: 'Electric vehicles emit on average 3× less CO₂ over their lifetime than petrol cars, even accounting for battery production.',
    source: '— Transport & Environment, 2021'
  },
  {
    emoji: '🌊', category: 'Nature',
    text: 'Oceans absorb 25% of the CO₂ humans emit each year — the world\'s largest carbon sink — but ocean acidification threatens this.',
    source: '— NOAA Ocean Acidification'
  },
  {
    emoji: '🏠', category: 'Energy',
    text: 'Home heating and cooling accounts for nearly half of residential energy use. Proper insulation can cut this by up to 40%.',
    source: '— US Department of Energy'
  },
  {
    emoji: '♻️', category: 'Consumption',
    text: 'Recycling one aluminium can saves enough energy to run a TV for 3 hours. Aluminium recycling uses 95% less energy than smelting new metal.',
    source: '— Aluminium Association'
  },
  {
    emoji: '🌡️', category: 'Climate',
    text: 'Every 0.1°C of warming we prevent matters. At 1.5°C vs 2°C, 6× fewer people face extreme heat stress.',
    source: '— IPCC Sixth Assessment Report'
  },
  {
    emoji: '🚿', category: 'Energy',
    text: 'A 5-minute shower saves 60% of the water (and heating energy) of a full bath. That\'s ~17 kg CO₂ saved per year.',
    source: '— Carbon Trust'
  },
  {
    emoji: '🥦', category: 'Food',
    text: 'A plant-rich diet is the #1 personal action to reduce carbon footprint — more impactful than going car-free for a year.',
    source: '— Project Drawdown, 2023'
  }
];

/** Chart data for each time period */
const CHART_DATA = {
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data:   [24.2,  18.8,  22.1,  26.5,  19.3,  15.7,  30.0]
  },
  month: {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
    data:   [158,    145,    162,    151]
  },
  year: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    data:   [680,  610,  590,  720,  650,  580,  560,  600,  640,  700,  670,  650]
  }
};


/* ═══════════════════════════════════════════════════
   2. STORE — LocalStorage Manager
═══════════════════════════════════════════════════ */
const Store = {
  /**
   * Read a value; returns null on missing/corrupt data.
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_PREFIX + key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Write a JSON-serialisable value.
   * @param {string} key
   * @param {*} value
   * @returns {boolean} success
   */
  set(key, value) {
    try {
      localStorage.setItem(CONFIG.STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[Store] Write failed:', key, e.message);
      return false;
    }
  },

  /**
   * Deep-merge a partial object into an existing stored object.
   * @param {string} key
   * @param {object} partial
   */
  update(key, partial) {
    const current = this.get(key) || {};
    return this.set(key, { ...current, ...partial });
  },

  /** Remove a single key. */
  remove(key) {
    localStorage.removeItem(CONFIG.STORAGE_PREFIX + key);
  }
};


/* ═══════════════════════════════════════════════════
   3. EVENT BUS — Pub/Sub Messaging
═══════════════════════════════════════════════════ */
const EventBus = {
  /** @type {Map<string, Set<Function>>} */
  _map: new Map(),

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} fn
   * @returns {Function} unsubscribe function
   */
  on(event, fn) {
    if (!this._map.has(event)) this._map.set(event, new Set());
    this._map.get(event).add(fn);
    return () => this._map.get(event)?.delete(fn);
  },

  /**
   * Publish an event with optional payload.
   * @param {string} event
   * @param {*} [payload]
   */
  emit(event, payload) {
    this._map.get(event)?.forEach(fn => {
      try { fn(payload); } catch (e) { console.error('[EventBus]', event, e); }
    });
  }
};


/* ═══════════════════════════════════════════════════
   4. UTILS — Pure Helper Functions
═══════════════════════════════════════════════════ */
const Utils = {
  /** Returns time-appropriate greeting string. */
  getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  },

  /**
   * Returns a deterministic index for "daily" content
   * (same fact all day, changes next day).
   * @returns {number}
   */
  getDayIndex() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    return dayOfYear % ECO_FACTS.length;
  },

  /**
   * Safely convert a string to HTML text (XSS prevention).
   * @param {string} str
   * @returns {string} escaped HTML
   */
  escape(str) {
    const el = document.createElement('div');
    el.textContent = String(str);
    return el.innerHTML;
  },

  /** Clamp a number between min and max. */
  clamp(v, min, max) { return Math.min(Math.max(v, min), max); },

  /**
   * Announce text to screen readers via the live region.
   * @param {string} text
   */
  announce(text) {
    const el = document.getElementById('aria-announcer');
    if (!el) return;
    el.textContent = '';                      // reset
    requestAnimationFrame(() => { el.textContent = text; });
  }
};


/* ═══════════════════════════════════════════════════
   5. ANIM UTILS — Animations & Transitions
═══════════════════════════════════════════════════ */
const AnimUtils = {
  /**
   * Animate a numeric counter from 0 → target using rAF.
   * @param {HTMLElement} el  - target element
   * @param {number}  target  - final value
   * @param {number}  [duration=1400] - ms
   * @param {number}  [decimals=1]
   */
  counter(el, target, duration = CONFIG.COUNTER_DURATION, decimals = 1) {
    if (!el || isNaN(target)) return;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);          // ease-out cubic
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
      else        el.textContent = target.toFixed(decimals);
    };

    requestAnimationFrame(tick);
  },

  /**
   * Animate the SVG progress ring stroke-dashoffset.
   * @param {SVGCircleElement} el
   * @param {number} score - 0 to 100
   * @param {number} [delay=450] - ms before animation starts
   */
  ring(el, score, delay = 450) {
    if (!el) return;
    const offset = CONFIG.RING_CIRCUMFERENCE - (Utils.clamp(score, 0, 100) / 100) * CONFIG.RING_CIRCUMFERENCE;
    setTimeout(() => { el.style.strokeDashoffset = offset; }, delay);
  },

  /**
   * Animate breakdown bars width from 0% to their target.
   * @param {number} [baseDelay=650]
   */
  breakdownBars(baseDelay = 650) {
    document.querySelectorAll('.bk-fill').forEach((bar, i) => {
      const target = bar.style.getPropertyValue('--w') || '0%';
      bar.style.setProperty('--w', '0%');
      setTimeout(() => { bar.style.setProperty('--w', target); }, baseDelay + i * 90);
    });
  },

  /**
   * Run fn when element enters viewport (once).
   * @param {Element} el
   * @param {Function} fn
   * @param {number} [threshold=0.3]
   */
  onVisible(el, fn, threshold = 0.3) {
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { fn(); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
  }
};


/* ═══════════════════════════════════════════════════
   6. TOAST — Notification System
═══════════════════════════════════════════════════ */
const Toast = {
  /** @type {HTMLElement|null} */
  _container: null,

  init() {
    this._container = document.getElementById('toast-container');
  },

  /**
   * Display a toast notification.
   * @param {string} title
   * @param {string} [message='']
   * @param {'info'|'success'|'warning'|'error'|'eco'} [type='info']
   * @param {number} [duration=4200]
   */
  show(title, message = '', type = 'info', duration = 4200) {
    if (!this._container) return;

    const ICONS = {
      info:    '💡', success: '✅', warning: '⚠️',
      error:   '❌', eco:     '🌿'
    };
    const ACCENTS = {
      info:    'hsl(191,91%,52%)',
      success: 'hsl(142,71%,49%)',
      warning: 'hsl(38,92%,52%)',
      error:   'hsl(4,86%,58%)',
      eco:     'hsl(142,71%,49%)'
    };

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.style.setProperty('--toast-accent', ACCENTS[type] || ACCENTS.info);

    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${ICONS[type] || ICONS.info}</span>
      <div class="toast-body">
        <div class="toast-title">${Utils.escape(title)}</div>
        ${message ? `<div class="toast-msg">${Utils.escape(message)}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Dismiss notification" type="button">×</button>
    `;

    const dismiss = () => this._remove(toast);
    toast.querySelector('.toast-close').addEventListener('click', dismiss);
    const timer = window.setTimeout(dismiss, duration);
    toast._timerId = timer;

    this._container.appendChild(toast);
  },

  /** @param {HTMLElement} toast */
  _remove(toast) {
    window.clearTimeout(toast._timerId);
    toast.classList.add('toast--removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }
};


/* ═══════════════════════════════════════════════════
   7. AWARENESS BANNER — Auto-rotating Slides
═══════════════════════════════════════════════════ */
const AwarenessBanner = {
  _slides: /** @type {NodeListOf<HTMLElement>} */ ([]),
  _dots:   /** @type {NodeListOf<HTMLElement>} */ ([]),
  _current: 0,
  _timerId: null,

  init() {
    this._slides = document.querySelectorAll('.banner-slide');
    this._dots   = document.querySelectorAll('.banner-dot');

    document.getElementById('banner-prev')
      ?.addEventListener('click', () => { this.prev(); this._resetTimer(); });
    document.getElementById('banner-next')
      ?.addEventListener('click', () => { this.next(); this._resetTimer(); });

    this._dots.forEach(dot => {
      dot.addEventListener('click', () => {
        this.goTo(parseInt(dot.dataset.idx, 10));
        this._resetTimer();
      });
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.goTo(parseInt(dot.dataset.idx, 10));
          this._resetTimer();
        }
      });
    });

    this._startTimer();
  },

  /**
   * Navigate to a specific slide index.
   * @param {number} idx
   */
  goTo(idx) {
    const prev = this._current;
    const next = ((idx % this._slides.length) + this._slides.length) % this._slides.length;
    if (prev === next) return;

    // Exit current
    this._slides[prev].classList.add('exit-left');
    this._slides[prev].classList.remove('active');
    this._slides[prev].setAttribute('aria-hidden', 'true');
    setTimeout(() => this._slides[prev]?.classList.remove('exit-left'), 380);

    // Enter next
    this._current = next;
    this._slides[next].classList.add('active');
    this._slides[next].setAttribute('aria-hidden', 'false');

    // Dots
    this._dots.forEach((d, i) => {
      d.classList.toggle('active', i === next);
      d.setAttribute('aria-selected', i === next ? 'true' : 'false');
    });

    // Screen reader announcement
    const text = this._slides[next]?.querySelector('.banner-text')?.textContent || '';
    Utils.announce(`Awareness: ${text}`);
  },

  next() { this.goTo(this._current + 1); },
  prev() { this.goTo(this._current - 1); },

  _startTimer() {
    this._timerId = setInterval(() => this.next(), CONFIG.BANNER_INTERVAL);
  },
  _resetTimer() {
    clearInterval(this._timerId);
    this._startTimer();
  },

  destroy() { clearInterval(this._timerId); }
};


/* ═══════════════════════════════════════════════════
   8. STATS CARDS — Animated Counters
═══════════════════════════════════════════════════ */
const StatsCards = {
  /** @type {Array<{id:string, target:number, dec:number}>} */
  _stats: [
    { id: 'val-footprint', target: 8.2, dec: 1 },
    { id: 'val-saved',     target: 0.3, dec: 1 },
    { id: 'val-score',     target: 42,  dec: 0 },
    { id: 'val-streak',    target: 0,   dec: 0 }
  ],

  init() {
    const section = document.querySelector('.stats-section');
    AnimUtils.onVisible(section, () => this._runAll(), 0.25);
  },

  _runAll() {
    this._stats.forEach(({ id, target, dec }, i) => {
      const el = document.getElementById(id);
      if (el) setTimeout(() => AnimUtils.counter(el, target, CONFIG.COUNTER_DURATION, dec), i * 80);
    });
  }
};


/* ═══════════════════════════════════════════════════
   9. CARBON SCORE — SVG Ring + Breakdown Bars
═══════════════════════════════════════════════════ */
const CarbonScore = {
  init() {
    const card = document.querySelector('.card--score');
    AnimUtils.onVisible(card, () => this._animate(), 0.35);
  },

  _animate() {
    // Animate the ring
    const ringEl = document.getElementById('ring-fill');
    AnimUtils.ring(ringEl, CONFIG.RING_SCORE, 300);

    // Animate center score counter
    const scoreEl = document.getElementById('ring-score');
    if (scoreEl) AnimUtils.counter(scoreEl, CONFIG.RING_SCORE, 1300, 0);

    // Animate breakdown bars
    AnimUtils.breakdownBars(500);
  }
};


/* ═══════════════════════════════════════════════════
   10. WEEKLY CHART — Chart.js Integration
═══════════════════════════════════════════════════ */
const WeeklyChart = {
  /** @type {Chart|null} */
  _chart: null,
  _period: 'week',

  init() {
    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('weekly-chart'));
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
      // Chart.js not yet loaded — retry once it fires load
      window.addEventListener('load', () => this._build(canvas), { once: true });
    } else {
      this._build(canvas);
    }

    this._bindTabs();
  },

  /** @param {HTMLCanvasElement} canvas */
  _build(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Build gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0,   'hsla(142,71%,49%,0.22)');
    grad.addColorStop(0.7, 'hsla(142,71%,49%,0.04)');
    grad.addColorStop(1,   'hsla(142,71%,49%,0)');

    const { labels, data } = CHART_DATA[this._period];

    this._chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'CO₂ emissions (kg)',
          data,
          borderColor:      'hsl(142,71%,49%)',
          backgroundColor:  grad,
          borderWidth:      2.5,
          pointRadius:      5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'hsl(142,71%,49%)',
          pointBorderColor:     'hsl(222,18%,13%)',
          pointBorderWidth:     2,
          tension: 0.42,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'hsl(222,18%,17%)',
            borderColor:     'hsl(222,15%,26%)',
            borderWidth: 1,
            titleColor: 'hsl(210,40%,96%)',
            bodyColor:  'hsl(215,20%,70%)',
            padding: 12,
            cornerRadius: 10,
            displayColors: false,
            titleFont: { family: 'Outfit', weight: '600', size: 13 },
            bodyFont:  { family: 'Inter',  size: 12 },
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y.toFixed(1)} kg CO₂e`
            }
          }
        },
        scales: {
          x: {
            grid:   { color: 'hsla(222,15%,25%,0.45)', drawBorder: false },
            ticks:  { color: 'hsl(220,13%,50%)', font: { family: 'Inter', size: 11 } },
            border: { display: false }
          },
          y: {
            grid:   { color: 'hsla(222,15%,25%,0.45)', drawBorder: false },
            ticks:  { color: 'hsl(220,13%,50%)', font: { family: 'Inter', size: 11 }, callback: v => `${v}kg` },
            border: { display: false }
          }
        }
      }
    });

    this._buildTable(this._period);
  },

  _bindTabs() {
    const tabs = document.querySelectorAll('.period-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.dataset.period === this._period) return;

        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        this._period = tab.dataset.period;
        this._update(this._period);
        this._buildTable(this._period);
      });

      // Keyboard: left/right arrows between tabs
      tab.addEventListener('keydown', (e) => {
        const allTabs = [...tabs];
        const idx = allTabs.indexOf(tab);
        if (e.key === 'ArrowRight') { e.preventDefault(); allTabs[(idx + 1) % allTabs.length].focus(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); allTabs[(idx - 1 + allTabs.length) % allTabs.length].focus(); }
      });
    });
  },

  /** @param {string} period */
  _update(period) {
    if (!this._chart) return;
    const { labels, data } = CHART_DATA[period];
    this._chart.data.labels             = labels;
    this._chart.data.datasets[0].data   = data;
    this._chart.update('active');
  },

  /** Populate the accessible data table (screen readers). */
  _buildTable(period) {
    const tbody = document.getElementById('chart-table');
    if (!tbody) return;
    const { labels, data } = CHART_DATA[period];
    tbody.innerHTML = labels
      .map((l, i) => `<tr><td>${Utils.escape(l)}</td><td>${data[i]} kg CO₂e</td></tr>`)
      .join('');
  },

  destroy() { this._chart?.destroy(); this._chart = null; }
};


/* ═══════════════════════════════════════════════════
   11. DAILY FACT — Eco Fact Card
═══════════════════════════════════════════════════ */
const DailyFact = {
  _idx: 0,

  init() {
    // Daily: use day-of-year so fact is consistent all day
    this._idx = Utils.getDayIndex();
    this._render();

    document.getElementById('refresh-fact')
      ?.addEventListener('click', () => this._next());
    document.getElementById('next-fact')
      ?.addEventListener('click', () => this._next());
    document.getElementById('copy-fact')
      ?.addEventListener('click', () => this._copy());
  },

  _render() {
    const fact = ECO_FACTS[this._idx];
    if (!fact) return;

    const body = document.getElementById('fact-body');
    if (!body) return;

    // Fade out → swap content → fade in
    body.style.opacity = '0';
    body.style.transform = 'translateY(8px)';
    body.style.transition = 'opacity 0.18s ease, transform 0.18s ease';

    setTimeout(() => {
      const emoji  = document.getElementById('fact-emoji');
      const cat    = document.getElementById('fact-cat');
      const quote  = document.getElementById('fact-quote');
      const source = document.getElementById('fact-source');

      if (emoji)  emoji.textContent  = fact.emoji;
      if (cat)    cat.textContent    = fact.category;
      if (quote)  quote.textContent  = fact.text;
      if (source) source.textContent = fact.source;

      body.style.opacity   = '1';
      body.style.transform = 'translateY(0)';
    }, 190);

    Utils.announce(`New fact: ${fact.text}`);
  },

  _next() {
    this._idx = (this._idx + 1) % ECO_FACTS.length;
    this._render();
  },

  _copy() {
    const fact = ECO_FACTS[this._idx];
    const text = `"${fact.text}" ${fact.source} — EcoPersona AI`;

    const btn = document.getElementById('copy-fact');

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          Toast.show('Fact copied!', 'Share it to spread climate awareness 🌍', 'eco');
          if (btn) {
            btn.classList.add('copied');
            btn.textContent = '✓ Copied';
            setTimeout(() => {
              btn.classList.remove('copied');
              btn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg> Copy`;
            }, 2000);
          }
        })
        .catch(() => Toast.show('Copy failed', 'Please copy the text manually.', 'warning'));
    } else {
      Toast.show('Not supported', 'Your browser does not support clipboard access.', 'warning');
    }
  }
};


/* ═══════════════════════════════════════════════════
   12. NAVIGATION — Sidebar, Mobile Drawer, Module Links
═══════════════════════════════════════════════════ */
const Navigation = {
  /** Modules that are fully built; others show a "coming soon" toast. */
  BUILT_MODULES: new Set(['dashboard', 'assessment']),

  init() {
    this._setGreeting();
    this._bindSidebarToggle();
    this._bindMobileDrawer();
    this._bindModuleLinks();
  },

  /** Update hero greeting with current time of day + stored name. */
  _setGreeting() {
    const el = document.getElementById('hero-greeting');
    if (!el) return;
    const name = Store.get('user_name') || 'EcoUser';
    el.innerHTML = `${Utils.escape(Utils.getGreeting())}, <span class="hero-name">${Utils.escape(name)}</span> 👋`;
    el.setAttribute('aria-label', `${Utils.getGreeting()}, ${name}`);
  },

  /** Desktop sidebar collapse/expand. */
  _bindSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggle  = document.getElementById('sidebar-toggle');
    if (!sidebar || !toggle) return;

    // Restore saved state
    if (Store.get('sidebar_collapsed')) {
      sidebar.classList.add('collapsed');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Expand navigation');
    }

    toggle.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!isCollapsed));
      toggle.setAttribute('aria-label', isCollapsed ? 'Expand navigation' : 'Collapse navigation');
      Store.set('sidebar_collapsed', isCollapsed);
    });
  },

  /** Mobile hamburger → slide-in drawer. */
  _bindMobileDrawer() {
    const sidebar  = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay   = document.getElementById('sidebar-overlay');
    if (!sidebar || !hamburger || !overlay) return;

    const open = () => {
      sidebar.classList.add('open');
      overlay.classList.add('visible');
      overlay.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      sidebar.setAttribute('aria-hidden', 'false');
      // Move focus into sidebar
      sidebar.querySelector('.nav-item')?.focus();
    };

    const close = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    };

    hamburger.addEventListener('click', () => {
      sidebar.classList.contains('open') ? close() : open();
    });

    overlay.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) close();
    });
  },

  /** Click handler: non-built modules show "coming soon" toast. */
  _bindModuleLinks() {
    document.querySelectorAll('[data-module]').forEach(el => {
      const mod = el.dataset.module;
      if (this.BUILT_MODULES.has(mod)) return;

      el.addEventListener('click', (e) => {
        e.preventDefault();
        const name = el.querySelector('.nav-label, .action-name, h3')?.textContent?.trim()
          || mod.replace(/-/g, ' ');
        Toast.show(
          `${Utils.escape(name)} — Coming Soon`,
          'This module is under development. Stay tuned! 🚀',
          'info'
        );
      });
    });
  }
};


/* ═══════════════════════════════════════════════════
   13. KEYBOARD NAV — Arrow Key Navigation
═══════════════════════════════════════════════════ */
const KeyboardNav = {
  init() {
    this._sidebarArrows();
    this._bottomTabArrows();
  },

  _sidebarArrows() {
    const items = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.nav-item'));
    items.forEach((item, i) => {
      item.addEventListener('keydown', (e) => {
        let target;
        if      (e.key === 'ArrowDown') target = items[i + 1] || items[0];
        else if (e.key === 'ArrowUp')   target = items[i - 1] || items[items.length - 1];
        else if (e.key === 'Home')      target = items[0];
        else if (e.key === 'End')       target = items[items.length - 1];
        if (target) { e.preventDefault(); target.focus(); }
      });
    });
  },

  _bottomTabArrows() {
    const tabs = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.tab-item'));
    tabs.forEach((tab, i) => {
      tab.addEventListener('keydown', (e) => {
        let target;
        if      (e.key === 'ArrowRight') target = tabs[i + 1] || tabs[0];
        else if (e.key === 'ArrowLeft')  target = tabs[i - 1] || tabs[tabs.length - 1];
        if (target) { e.preventDefault(); target.focus(); }
      });
    });
  }
};


/* ═══════════════════════════════════════════════════
   15. ASSESSMENT — Lifestyle DNA Assessment Module
═══════════════════════════════════════════════════ */
const Assessment = {

  // ── State ──────────────────────────────────────
  _step:          0,
  _isOpen:        false,
  _prevFocus:     null,
  _answers: {
    transport:    null,
    food:         null,
    electricity:  null,
    shopping:     null,
    waste:        null
  },

  // ── Step Config ────────────────────────────────
  STEPS: [
    { id: 'step-0',       label: 'Introduction', field: null },
    { id: 'step-1',       label: 'Transport',    field: 'transport'   },
    { id: 'step-2',       label: 'Food',         field: 'food'        },
    { id: 'step-3',       label: 'Electricity',  field: 'electricity' },
    { id: 'step-4',       label: 'Shopping',     field: 'shopping'    },
    { id: 'step-5',       label: 'Waste',        field: 'waste'       },
    { id: 'step-results', label: 'Your Results', field: null }
  ],

  // ── Whitelist (sanitization) ───────────────────
  ALLOWED: {
    transport:   ['car', 'bike', 'public'],
    food:        ['vegetarian', 'mixed', 'nonvegetarian'],
    electricity: ['low', 'medium', 'high'],
    shopping:    ['low', 'medium', 'high'],
    waste:       ['low', 'medium', 'high']
  },

  // ── Score Weights ─────────────────────────────
  SCORES: {
    transport:   { car: 3, bike: 1, public: 2 },
    food:        { vegetarian: 1, mixed: 2, nonvegetarian: 3 },
    electricity: { low: 1, medium: 2, high: 3 },
    shopping:    { low: 1, medium: 2, high: 3 },
    waste:       { low: 1, medium: 2, high: 3 }
  },

  // ── Persona Definitions ────────────────────────
  PERSONAS: [
    {
      id: 'champion', min: 5, max: 7,
      name: 'Carbon Champion', emoji: '🏆',
      gradient: 'linear-gradient(135deg,hsl(142,65%,26%),hsl(191,75%,24%))',
      headline: "You're leading the way to a sustainable future!",
      desc: "Your lifestyle choices are among the most eco-friendly. Low transport emissions, a plant-rich diet and conscious consumption make you a true carbon champion.",
      tips: [
        "Share your eco habits with friends and family — social influence multiplies your impact.",
        "Consider carbon-offsetting your remaining unavoidable emissions via certified programmes.",
        "Advocate for sustainable policies in your workplace and local community."
      ]
    },
    {
      id: 'aware', min: 8, max: 10,
      name: 'Eco Aware', emoji: '🌿',
      gradient: 'linear-gradient(135deg,hsl(191,75%,24%),hsl(217,65%,26%))',
      headline: "You're making conscious choices. Keep building!",
      desc: "You're above average in sustainability. A few targeted changes in transport or diet could significantly reduce your carbon footprint further.",
      tips: [
        "Reduce meat consumption by 2 days per week — that alone saves ~0.5 tCO₂ per year.",
        "Switch to a renewable energy tariff for your home electricity.",
        "Choose second-hand or repaired items before buying new."
      ]
    },
    {
      id: 'mover', min: 11, max: 12,
      name: 'Conscious Mover', emoji: '⚡',
      gradient: 'linear-gradient(135deg,hsl(38,75%,24%),hsl(4,65%,24%))',
      headline: "You're aware, but there's meaningful room to grow.",
      desc: "Your footprint is above the global average, but targeted changes in transport and diet can create an immediate, measurable difference.",
      tips: [
        "Use public transport or cycle at least 3× per week — saves ~0.8 tCO₂ per year.",
        "Introduce one meat-free day per week as a starting habit.",
        "Switch all home lighting to LED and use smart power strips."
      ]
    },
    {
      id: 'heavy', min: 13, max: 15,
      name: 'Carbon Intensive', emoji: '🔥',
      gradient: 'linear-gradient(135deg,hsl(4,70%,24%),hsl(4,55%,18%))',
      headline: "Your footprint is significant. Every action counts.",
      desc: "Your current lifestyle has a high carbon impact, but every journey starts somewhere. Small, consistent changes compound into massive climate impact over time.",
      tips: [
        "Use public transport or cycle at least twice per week — the single highest-impact transport change.",
        "Significantly reduce beef and lamb; these are the most carbon-intensive foods.",
        "Review your home energy usage and consider switching to a renewable energy supplier."
      ]
    }
  ],

  // ── Category display config ────────────────────
  CATS: {
    transport:   { icon: '🚗', label: 'Transportation' },
    food:        { icon: '🍽️', label: 'Food & Diet' },
    electricity: { icon: '⚡', label: 'Home Electricity' },
    shopping:    { icon: '🛍️', label: 'Shopping' },
    waste:       { icon: '♻️', label: 'Waste Management' }
  },

  // ── Human-readable answer labels ───────────────
  LABELS: {
    transport:   { car: 'Private Car', bike: 'Bicycle', public: 'Public Transit' },
    food:        { vegetarian: 'Vegetarian', mixed: 'Mixed Diet', nonvegetarian: 'Non-Vegetarian' },
    electricity: { low: 'Low Usage', medium: 'Medium Usage', high: 'High Usage' },
    shopping:    { low: 'Minimal', medium: 'Moderate', high: 'Heavy Shopper' },
    waste:       { low: 'Low Waste', medium: 'Average Waste', high: 'High Waste' }
  },

  // ───────────────────────────────────────────────
  // PUBLIC: init
  // ───────────────────────────────────────────────
  init() {
    this._buildStepDots();
    this._bindOpenTriggers();
    this._bindHeaderControls();
    this._bindFooterControls();
    this._bindOptionCards();
    this._loadSavedState();
    this._checkPreviousResult();
    this._updateUI();
  },

  // ───────────────────────────────────────────────
  // OPEN / CLOSE
  // ───────────────────────────────────────────────
  open() {
    const view = document.getElementById('assessment-view');
    if (!view || this._isOpen) return;

    this._prevFocus = document.activeElement;
    this._isOpen   = true;

    view.classList.add('is-open');
    view.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus main area after animation
    setTimeout(() => {
      document.getElementById('assess-main')?.focus();
    }, 420);

    Utils.announce('Lifestyle DNA Assessment opened. Navigate through the steps using the buttons.');
    EventBus.emit('assessment:opened');
  },

  close() {
    const view = document.getElementById('assessment-view');
    if (!view || !this._isOpen) return;

    this._isOpen = false;
    view.classList.remove('is-open');
    view.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    this._prevFocus?.focus();
    this._prevFocus = null;

    Utils.announce('Assessment closed. Returned to dashboard.');
    EventBus.emit('assessment:closed');
  },

  // ───────────────────────────────────────────────
  // NAVIGATION
  // ───────────────────────────────────────────────
  _goTo(nextIdx) {
    const steps  = this.STEPS;
    const prevIdx = this._step;
    nextIdx = Math.max(0, Math.min(nextIdx, steps.length - 1));
    if (nextIdx === prevIdx) return;

    const prevEl = document.getElementById(`assess-${steps[prevIdx].id}`);
    const nextEl = document.getElementById(`assess-${steps[nextIdx].id}`);

    // Animate exit of current
    if (prevEl) {
      prevEl.classList.add('is-exiting');
      prevEl.classList.remove('is-active');
      prevEl.setAttribute('aria-hidden', 'true');
      setTimeout(() => prevEl?.classList.remove('is-exiting'), 380);
    }

    // Animate entrance of next
    this._step = nextIdx;
    if (nextEl) {
      nextEl.classList.add('is-active');
      nextEl.setAttribute('aria-hidden', 'false');
    }

    this._updateUI();

    // Shift focus to new step heading
    setTimeout(() => {
      const heading = nextEl?.querySelector('h1,h2,.assess-intro-title');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    }, 120);
  },

  _next() {
    const field = this.STEPS[this._step]?.field;

    // Validate required fields on question steps
    if (field && !this._validateField(field)) return;

    if (this._step === 5) {
      // Last question — calculate and jump to results
      this._computeResults();
      this._goTo(6);
    } else if (this._step < 6) {
      this._goTo(this._step + 1);
    }
  },

  _back() {
    if (this._step <= 0) return;
    this._clearError(this.STEPS[this._step]?.field);
    this._goTo(this._step - 1);
  },

  _skip() {
    const field = this.STEPS[this._step]?.field;
    if (field) {
      // Skipped answers treated as null (defaults to medium in scoring)
      this._answers[field] = null;
      this._clearError(field);
      this._savePartial();
    }
    if (this._step < 5) {
      this._goTo(this._step + 1);
    } else if (this._step === 5) {
      this._computeResults();
      this._goTo(6);
    }
  },

  // ───────────────────────────────────────────────
  // VALIDATION & SANITISATION
  // ───────────────────────────────────────────────

  /**
   * Validate that the current field has a selection.
   * @param {string} field
   * @returns {boolean}
   */
  _validateField(field) {
    const rawValue = this._getRadioValue(field);
    const clean    = this._sanitize(field, rawValue);

    if (!clean) {
      this._showError(field);
      // Move keyboard focus to the first option for usability
      const firstInput = document.querySelector(`input[name="${field}"]`);
      firstInput?.focus();
      return false;
    }

    // Store validated, sanitised answer
    this._answers[field] = clean;
    this._clearError(field);
    this._savePartial();
    return true;
  },

  /**
   * Sanitise input against the allowed-values whitelist.
   * Prevents unexpected values from being stored.
   * @param {string} field
   * @param {string|null} value
   * @returns {string|null}
   */
  _sanitize(field, value) {
    if (!value || typeof value !== 'string') return null;
    const allowed = this.ALLOWED[field];
    if (!Array.isArray(allowed)) return null;
    const cleaned = value.trim().toLowerCase().replace(/[^a-z]/g, '');
    return allowed.includes(cleaned) ? cleaned : null;
  },

  /** Get the currently checked radio value for a field. */
  _getRadioValue(field) {
    const inputs = document.querySelectorAll(`input[name="${field}"]`);
    for (const input of inputs) {
      if (input.checked) return input.value;
    }
    return null;
  },

  // ───────────────────────────────────────────────
  // ERROR DISPLAY
  // ───────────────────────────────────────────────
  _showError(field) {
    const errEl    = document.getElementById(`error-${field}`);
    const fieldset = document.getElementById(`fieldset-${field}`);

    if (errEl) errEl.hidden = false;
    if (fieldset) {
      fieldset.classList.add('has-error');
      // Remove shake class after animation completes
      setTimeout(() => fieldset?.classList.remove('has-error'), 560);
    }
  },

  _clearError(field) {
    if (!field) return;
    const errEl = document.getElementById(`error-${field}`);
    if (errEl) errEl.hidden = true;
    document.getElementById(`fieldset-${field}`)?.classList.remove('has-error');
  },

  // ───────────────────────────────────────────────
  // SCORE CALCULATION
  // ───────────────────────────────────────────────
  _calculateScore() {
    let total     = 0;
    const breakdown = {};

    for (const [field, scoreMap] of Object.entries(this.SCORES)) {
      const answer = this._answers[field];
      // Default to medium (2) when question was skipped
      const score  = answer != null ? (scoreMap[answer] ?? 2) : 2;
      total += score;
      breakdown[field] = { answer, score };
    }

    return { total, breakdown };
  },

  /** Match a total score (5–15) to a persona config. */
  _getPersona(score) {
    return this.PERSONAS.find(p => score >= p.min && score <= p.max)
           ?? this.PERSONAS[this.PERSONAS.length - 1];
  },

  // ───────────────────────────────────────────────
  // RESULTS RENDERING
  // ───────────────────────────────────────────────
  _computeResults() {
    const { total, breakdown } = this._calculateScore();
    const persona = this._getPersona(total);

    // ── Persona card ──
    this._setText('results-emoji',    persona.emoji);
    this._setText('persona-name',     persona.name);
    this._setText('persona-headline', persona.headline);
    this._setText('persona-desc',     persona.desc);

    const card = document.getElementById('persona-card');
    if (card) {
      card.style.background = persona.gradient;
      card.dataset.personaId = persona.id;
    }

    // ── Score bar (5–15 → 0–100%) ──
    const scorePct = ((total - 5) / 10) * 100;
    this._setText('results-score-num', `${total} / 15`);

    const barEl = document.getElementById('results-score-bar-el');
    if (barEl) {
      barEl.setAttribute('aria-valuenow', total);
      barEl.setAttribute('aria-valuetext', `${total} out of 15 — ${persona.name}`);
    }

    const fill = document.getElementById('results-score-fill');
    if (fill) {
      fill.style.background = scorePct <= 25
        ? 'hsl(142,71%,49%)'
        : scorePct <= 55
        ? 'hsl(38,92%,52%)'
        : 'hsl(4,86%,58%)';
      setTimeout(() => { fill.style.width = `${scorePct}%`; }, 350);
    }

    // ── Category breakdown ──
    this._renderBreakdown(breakdown);

    // ── Tips ──
    this._renderTips(persona.tips);

    // ── Persist result ──
    this._saveResult({ total, persona: persona.id, breakdown });

    Utils.announce(`Assessment complete. Your Eco Persona is ${persona.name} with a carbon impact score of ${total} out of 15.`);
    EventBus.emit('assessment:completed', { score: total, personaId: persona.id });
  },

  _renderBreakdown(breakdown) {
    const grid = document.getElementById('results-bk-grid');
    if (!grid) return;

    const DOT_COLORS = [
      'hsl(142,71%,49%)',   // score 1 — good (green)
      'hsl(38,92%,52%)',    // score 2 — medium (amber)
      'hsl(4,86%,58%)'     // score 3 — high (red)
    ];

    grid.innerHTML = Object.entries(breakdown)
      .map(([field, { answer, score }], rowIdx) => {
        const cat      = this.CATS[field];
        const lbl      = this.LABELS[field]?.[answer] ?? (answer ? answer : 'Skipped');
        const color    = DOT_COLORS[score - 1] ?? DOT_COLORS[1];
        const delay    = rowIdx * 60;

        const dots = [1, 2, 3].map(i => {
          const filled = i <= score;
          return `<span class="bk-dot ${filled ? 'bk-dot--filled' : ''}" style="${filled ? `background:${color}` : ''}"></span>`;
        }).join('');

        return `
          <div class="bk-row" style="animation-delay:${delay}ms" aria-label="${cat.label}: ${lbl}, score ${score} out of 3">
            <span class="bk-cat-icon" aria-hidden="true">${cat.icon}</span>
            <span class="bk-cat-name">${Utils.escape(cat.label)}</span>
            <span class="bk-answer">${Utils.escape(lbl)}</span>
            <div class="bk-dots" aria-hidden="true">${dots}</div>
          </div>`;
      }).join('');
  },

  _renderTips(tips) {
    const list = document.getElementById('results-tips-list');
    if (!list) return;

    list.innerHTML = tips.map((tip, i) => `
      <li class="tip-item" role="listitem">
        <span class="tip-number" aria-hidden="true">${i + 1}</span>
        <span class="tip-text">${Utils.escape(tip)}</span>
      </li>`
    ).join('');
  },

  // ───────────────────────────────────────────────
  // UI STATE
  // ───────────────────────────────────────────────
  _updateUI() {
    const step = this._step;
    const TOTAL_Q = 5;

    // Step label
    const stepLabelEl = document.getElementById('assess-step-label');
    if (stepLabelEl) stepLabelEl.textContent = this.STEPS[step]?.label || '';

    // Progress bar %
    const pct = step === 0 ? 0 : step === 6 ? 100 : ((step - 1) / TOTAL_Q) * 100;
    const fillEl = document.getElementById('assess-progress-fill');
    const barEl  = document.getElementById('assess-progress-bar');
    if (fillEl) fillEl.style.width  = `${pct}%`;
    if (barEl)  barEl.setAttribute('aria-valuenow', Math.round(pct));

    // Step dots
    this._updateDots();

    // Back button
    const backBtn = document.getElementById('assess-back');
    if (backBtn) {
      backBtn.disabled = step <= 0;
      backBtn.setAttribute('aria-disabled', step <= 0 ? 'true' : 'false');
    }

    // Footer visibility & labels
    const footer  = document.getElementById('assess-footer');
    const nextBtn = document.getElementById('assess-next');
    const skipBtn = document.getElementById('assess-skip');

    if (step === 6) {
      // Results — hide footer (results has own CTAs)
      if (footer) footer.hidden = true;
    } else {
      if (footer) footer.hidden = false;

      if (nextBtn) {
        const arrowSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
        nextBtn.innerHTML = step === 0
          ? `Start Assessment ${arrowSvg}`
          : step === 5
          ? `See My Results ${arrowSvg}`
          : `Continue ${arrowSvg}`;
        nextBtn.setAttribute('aria-label',
          step === 0 ? 'Start the assessment' :
          step === 5 ? 'See your results' :
          'Continue to next question');
      }

      if (skipBtn) skipBtn.hidden = (step === 0);
    }

    // Restore any previously stored answers into the radio inputs
    this._restoreSelections();
  },

  _buildStepDots() {
    const container = document.getElementById('assess-step-dots');
    if (!container) return;
    container.innerHTML = [1,2,3,4,5]
      .map(i => `<span class="assess-dot" data-step="${i}"></span>`)
      .join('');
  },

  _updateDots() {
    document.querySelectorAll('.assess-dot').forEach(dot => {
      const ds = parseInt(dot.dataset.step, 10);
      dot.classList.toggle('is-active',    ds === this._step);
      dot.classList.toggle('is-completed', ds <  this._step && this._step > 0);
    });
  },

  /** Re-check radio inputs from stored answers after step transitions. */
  _restoreSelections() {
    Object.entries(this._answers).forEach(([field, value]) => {
      if (!value) return;
      document.querySelectorAll(`input[name="${field}"]`).forEach(input => {
        const shouldCheck = input.value === value;
        input.checked = shouldCheck;
        input.closest('.option-card')?.classList.toggle('is-selected', shouldCheck);
      });
    });
  },

  // ───────────────────────────────────────────────
  // EVENT BINDINGS
  // ───────────────────────────────────────────────
  _bindOpenTriggers() {
    document.querySelectorAll('[data-module="assessment"]').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); this.open(); });
    });
  },

  _bindHeaderControls() {
    document.getElementById('assess-back')  ?.addEventListener('click', () => this._back());
    document.getElementById('assess-close') ?.addEventListener('click', () => this.close());
    document.getElementById('results-retake-btn')?.addEventListener('click', () => this._retake());
    document.getElementById('retake-from-intro') ?.addEventListener('click', () => { this._retake(); });
    document.getElementById('results-save-btn')  ?.addEventListener('click', () => this._saveProfile());

    // Escape key closes the assessment
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isOpen) { e.preventDefault(); this.close(); }
    });
  },

  _bindFooterControls() {
    document.getElementById('assess-next')?.addEventListener('click', () => this._next());
    document.getElementById('assess-skip')?.addEventListener('click', () => this._skip());
  },

  _bindOptionCards() {
    document.querySelectorAll('.option-input').forEach(input => {
      // Visual selection sync
      input.addEventListener('change', () => {
        const name = input.name;
        // Remove selection from siblings
        document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
          r.closest('.option-card')?.classList.remove('is-selected');
        });
        // Mark this one selected
        input.closest('.option-card')?.classList.add('is-selected');
        // Clear any error shown for this field
        this._clearError(name);
      });

      // Focus ring via JS for browsers not yet supporting :has()
      input.addEventListener('focus', () => {
        input.closest('.option-card')?.classList.add('is-focused');
      });
      input.addEventListener('blur', () => {
        input.closest('.option-card')?.classList.remove('is-focused');
      });
    });
  },

  // ───────────────────────────────────────────────
  // LOCALSTORAGE PERSISTENCE
  // ───────────────────────────────────────────────

  /** Persist in-progress answers so the user can resume later. */
  _savePartial() {
    Store.set('assessment_partial', {
      step:    this._step,
      answers: { ...this._answers },
      savedAt: new Date().toISOString()
    });
  },

  /** Load any previously saved partial answers on init. */
  _loadSavedState() {
    const saved = Store.get('assessment_partial');
    if (!saved?.answers) return;

    // Re-validate every answer against the whitelist before restoring
    const restored = {};
    for (const field of Object.keys(this.ALLOWED)) {
      const val = saved.answers[field];
      restored[field] = this._sanitize(field, val);
    }
    this._answers = restored;
  },

  /** Persist completed assessment result. */
  _saveResult({ total, persona, breakdown }) {
    Store.set('dna_assessment', {
      score:       total,
      persona,
      breakdown,
      answers:     { ...this._answers },
      completedAt: new Date().toISOString()
    });
    // Clear partial draft once complete
    Store.remove('assessment_partial');
  },

  /** Show previous result badge on the intro screen. */
  _checkPreviousResult() {
    const prev = Store.get('dna_assessment');
    if (!prev) return;

    const personaCfg = this.PERSONAS.find(p => p.id === prev.persona);
    if (!personaCfg) return;

    const badge = document.getElementById('prev-result');
    const nameEl = document.getElementById('prev-result-persona');
    if (badge && nameEl) {
      nameEl.textContent = `${personaCfg.emoji} ${personaCfg.name}`;
      badge.hidden = false;
    }
  },

  /** Save persona to user profile key for dashboard display. */
  _saveProfile() {
    const result = Store.get('dna_assessment');
    if (!result) return;

    const personaCfg = this.PERSONAS.find(p => p.id === result.persona);
    Store.update('user_profile', {
      ecoPersona:      result.persona,
      assessmentScore: result.score,
      assessedAt:      result.completedAt
    });

    // Update sidebar user level text
    const levelEl = document.querySelector('.user-level');
    if (levelEl && personaCfg) {
      levelEl.textContent = `${personaCfg.emoji} ${personaCfg.name}`;
    }

    Toast.show(
      'Profile saved! 🎉',
      personaCfg
        ? `Your Eco Persona — ${personaCfg.emoji} ${personaCfg.name} — is now in your profile.`
        : 'Assessment results saved to your profile.',
      'success'
    );

    EventBus.emit('assessment:profile-saved', result);
  },

  // ───────────────────────────────────────────────
  // RETAKE
  // ───────────────────────────────────────────────
  _retake() {
    // Reset in-memory state
    this._step    = 0;
    this._answers = { transport: null, food: null, electricity: null, shopping: null, waste: null };

    // Uncheck all radios and remove visual selection
    document.querySelectorAll('.option-input').forEach(i => { i.checked = false; });
    document.querySelectorAll('.option-card').forEach(c => { c.classList.remove('is-selected'); });

    // Hide all errors
    document.querySelectorAll('.field-error').forEach(e => { e.hidden = true; });

    // Reset step visibility
    document.querySelectorAll('.assess-step').forEach(s => {
      s.classList.remove('is-active', 'is-exiting');
      s.setAttribute('aria-hidden', 'true');
    });
    const intro = document.getElementById('assess-step-0');
    if (intro) { intro.classList.add('is-active'); intro.setAttribute('aria-hidden', 'false'); }

    Store.remove('assessment_partial');
    this._updateUI();
    Utils.announce('Assessment reset. Starting from the beginning.');
  },

  // ── Helpers ──────────────────────────────────
  _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

};


/* ═══════════════════════════════════════════════════
   16. DASHBOARD — Orchestrator (init / destroy)
═══════════════════════════════════════════════════ */
const Dashboard = {
  init() {
    // Boot all sub-modules in dependency order
    Toast.init();
    Navigation.init();
    AwarenessBanner.init();
    StatsCards.init();
    CarbonScore.init();
    DailyFact.init();
    WeeklyChart.init();
    KeyboardNav.init();
    Assessment.init();

    // Emit ready event so other future modules can listen
    EventBus.emit('dashboard:ready', { ts: Date.now() });

    // Dev console branding
    console.info(
      '%c🌿 EcoPersona AI  %cdashboard ready',
      'color:#22C55E;font-weight:800;font-size:13px;',
      'color:#6B7A99;font-size:12px;'
    );
  },

  destroy() {
    AwarenessBanner.destroy();
    WeeklyChart.destroy();
  }
};


/* ═══════════════════════════════════════════════════
   APP BOOT — Safe DOMContentLoaded guard
═══════════════════════════════════════════════════ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Dashboard.init());
} else {
  // DOMContentLoaded already fired
  Dashboard.init();
}
