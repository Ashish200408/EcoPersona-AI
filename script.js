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
  BUILT_MODULES: new Set(['dashboard']),

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
   14. DASHBOARD — Orchestrator (init / destroy)
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
