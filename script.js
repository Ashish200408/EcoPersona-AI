/**
 * ═══════════════════════════════════════════════════════════
 *  ECOPERSONA AI — Complete Application Script
 *  Version 2.0 — All 9 Modules
 *
 *  Architecture:
 *    CONFIG        — App-wide constants & static data
 *    Store         — LocalStorage abstraction
 *    EventBus      — Pub/Sub for decoupled communication
 *    Utils         — Pure helper functions
 *    AnimUtils     — Animations & transitions
 *    Toast         — Notification system
 *    AwarenessBanner — Auto-rotating awareness slides
 *    StatsCards    — Animated stat counters
 *    CarbonScore   — SVG ring + breakdown bars
 *    WeeklyChart   — Chart.js progress chart
 *    DailyFact     — Eco fact rotation & clipboard
 *    Navigation    — Sidebar, mobile drawer, module routing
 *    KeyboardNav   — Keyboard navigation
 *    Assessment    — Eco Personality Assessment (Module 1)
 *    BlindSpot     — Carbon Blind Spot Detector (Module 2)
 *    LearningHub   — Sustainability Learning Hub (Module 3)
 *    EcoStory      — EcoPersona Story Generator (Module 4)
 *    Missions      — Personalized Weekly Missions (Module 5)
 *    Simulator     — Sustainability Impact Simulator (Module 6)
 *    HabitTracker  — Sustainable Habit Tracker (Module 7)
 *    Challenges    — Eco Challenge Arena (Module 8)
 *    Dashboard     — Orchestrator (Module 9)
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════
   1. CONFIG — App Constants & Static Data
═══════════════════════════════════════════════════ */

/**
 * Milliseconds for the slide-exit CSS transition used across components.
 * @type {number}
 */
const SLIDE_EXIT_DURATION_MS = 380;

/**
 * Milliseconds to delay focus movement after a step transition.
 * @type {number}
 */
const STEP_FOCUS_DELAY_MS = 120;

/**
 * Milliseconds to delay the copy-button label reset after clipboard copy.
 * @type {number}
 */
const COPY_RESET_DELAY_MS = 2000;

/**
 * Milliseconds to delay focus movement after a module opens.
 * @type {number}
 */
const MODULE_FOCUS_DELAY_MS = 400;

/**
 * Number of DYK (Did You Know) cards displayed in the Learning Hub.
 * @type {number}
 */
const DYK_DISPLAY_COUNT = 4;

/**
 * Number of missions generated per week.
 * @type {number}
 */
const MISSIONS_PER_WEEK = 3;

/**
 * Number of days shown in the habit heatmap.
 * @type {number}
 */
const HEATMAP_DAYS = 30;

/**
 * CO₂ (kg) absorbed by one tree per year, used for equivalence calculations.
 * @type {number}
 */
const CO2_PER_TREE_KG = 22;

/**
 * Estimated cost per kg of CO₂ saved (£), used by the Impact Simulator.
 * @type {number}
 */
const MONEY_PER_KG_CO2 = 0.15;

/**
 * Application-wide frozen configuration constants.
 * @type {Readonly<{APP_NAME:string, STORAGE_PREFIX:string, BANNER_INTERVAL:number,
 *   COUNTER_DURATION:number, RING_SCORE:number, RING_CIRCUMFERENCE:number}>}
 */
const CONFIG = Object.freeze({
  APP_NAME:            'EcoPersona AI',
  STORAGE_PREFIX:      'ecopersona_v2_',
  BANNER_INTERVAL:     7000,
  COUNTER_DURATION:    1400,
  RING_SCORE:          62,
  RING_CIRCUMFERENCE:  389.56
});

/** @type {Array<{emoji:string, category:string, text:string, source:string}>} */
const ECO_FACTS = [
  { emoji: '✈️', category: 'transport',  text: 'Shifting just one transatlantic flight to economy class saves as much CO₂ as going vegan for an entire year.', source: '— Our World in Data, 2023' },
  { emoji: '🥩', category: 'food',       text: 'Beef produces 20× more greenhouse gas per gram of protein than plant-based alternatives like tofu or lentils.', source: '— Science Magazine, 2018' },
  { emoji: '⚡', category: 'energy',     text: 'Switching your home to LED bulbs can reduce lighting energy use by up to 75%, saving around 400 kg of CO₂ annually.', source: '— International Energy Agency' },
  { emoji: '🛍️', category: 'waste',     text: 'The fashion industry produces 10% of global carbon emissions — more than aviation and shipping combined.', source: '— UN Environment Programme' },
  { emoji: '🌳', category: 'nature',     text: 'A single mature tree absorbs up to 22 kg of CO₂ per year. You\'d need ~400 trees to offset an average American\'s footprint.', source: '— US Forest Service' },
  { emoji: '🚗', category: 'transport',  text: 'Electric vehicles emit on average 3× less CO₂ over their lifetime than petrol cars, even accounting for battery production.', source: '— Transport & Environment, 2021' },
  { emoji: '🌊', category: 'nature',     text: 'Oceans absorb 25% of the CO₂ humans emit each year — but ocean acidification threatens this vital carbon sink.', source: '— NOAA Ocean Acidification' },
  { emoji: '🏠', category: 'energy',     text: 'Home heating and cooling accounts for nearly half of residential energy use. Proper insulation can cut this by up to 40%.', source: '— US Department of Energy' },
  { emoji: '♻️', category: 'waste',      text: 'Recycling one aluminium can saves enough energy to run a TV for 3 hours. Aluminium recycling uses 95% less energy than smelting new metal.', source: '— Aluminium Association' },
  { emoji: '🌡️', category: 'nature',    text: 'Every 0.1°C of warming we prevent matters. At 1.5°C vs 2°C, 6× fewer people face extreme heat stress.', source: '— IPCC Sixth Assessment Report' },
  { emoji: '🚿', category: 'water',      text: 'A 5-minute shower saves 60% of the water (and heating energy) of a full bath. That\'s ~17 kg CO₂ saved per year.', source: '— Carbon Trust' },
  { emoji: '🥦', category: 'food',       text: 'A plant-rich diet is the #1 personal action to reduce carbon footprint — more impactful than going car-free for a year.', source: '— Project Drawdown, 2023' },
  { emoji: '💧', category: 'water',      text: 'Producing 1 kg of beef requires 15,400 litres of water — more than 2 months of daily showers for the average person.', source: '— Water Footprint Network' },
  { emoji: '🌾', category: 'food',       text: 'Producing food for one person\'s daily diet requires more land than 2 tennis courts. Plant-based diets use 50% less land.', source: '— Our World in Data' },
  { emoji: '📱', category: 'energy',     text: 'The internet generates 3.7% of global greenhouse gas emissions — similar to the airline industry. Streaming in HD uses 3x more energy than SD.', source: '— Carbon Brief, 2020' },
  { emoji: '🚌', category: 'transport',  text: 'Taking the bus instead of a car for a 10km commute saves over 1.5 tonnes of CO₂ per year — equal to planting 68 trees.', source: '— European Environment Agency' },
  { emoji: '🏭', category: 'energy',     text: 'Just 20 companies are responsible for 35% of all energy-related CO₂ and methane emissions since 1965.', source: '— CDP Carbon Majors Report' },
  { emoji: '🌿', category: 'nature',     text: 'Restoring global forests could provide 18% of the CO₂ mitigation needed by 2030 to meet climate targets.', source: '— Nature Climate Change, 2019' },
  { emoji: '🛒', category: 'waste',      text: 'The average American generates 4.4 lbs of trash per day. Composting and recycling can reduce this by over 50%.', source: '— US EPA' },
  { emoji: '🌻', category: 'food',       text: 'Community gardens can reduce food-related carbon emissions by 6× compared to conventionally grown food.', source: '— Nature Cities, 2023' }
];

/** Did You Know facts */
const DYK_FACTS = [
  { emoji: '🧴', text: 'Your bathroom products — shampoo, conditioner, soap — collectively create up to 120 billion plastic packaging units globally each year.' },
  { emoji: '☕', text: 'Making one cup of coffee generates about 21g of CO₂. If you drink 2 cups a day, that\'s 15kg of CO₂ per year just from coffee.' },
  { emoji: '🎮', text: 'Gaming consoles in the US consume as much electricity as all the homes in Houston, Texas — about 34 terawatt-hours per year.' },
  { emoji: '🍕', text: 'Food waste accounts for 8-10% of global greenhouse gas emissions. If food waste were a country, it would be the third-largest emitter.' },
  { emoji: '👕', text: 'The fashion industry uses 93 billion cubic metres of water annually — enough to meet the needs of 5 million people for a year.' },
  { emoji: '🚢', text: 'A single large cargo ship burns 150+ tonnes of fuel daily and emits more carbon than 50,000 cars. There are 90,000+ cargo ships globally.' }
];

/** Sustainability Tips */
const ECO_TIPS = [
  { icon: '🛒', title: 'Shop with a list', text: 'Planning meals and making a grocery list reduces food waste by up to 25%, saving both money and carbon emissions.' },
  { icon: '🔌', title: 'Unplug when idle', text: 'Electronics on standby still use power. Unplugging chargers, TVs, and appliances when not in use saves up to 10% on electricity bills.' },
  { icon: '🚶', title: 'Walk short trips', text: 'For journeys under 2km, walking produces zero emissions and also improves your health. A 15-minute walk replaces 5 min drive.' },
  { icon: '🌡️', title: 'Adjust your thermostat', text: 'Lowering your heating by 1°C saves about 10% of your heating bill and reduces carbon emissions by 300kg per year.' },
  { icon: '♻️', title: 'Recycle right', text: 'Contaminated recycling can\'t be processed. Learn your local recycling rules — clean, dry recyclables make a real difference.' },
  { icon: '🌱', title: 'Grow your own food', text: 'Even a small balcony herb garden reduces packaging waste and food miles. Homegrown food can offset up to 85kg CO₂ yearly.' },
  { icon: '💡', title: 'Switch to LEDs', text: 'LED bulbs use 75% less energy and last 25x longer than incandescent bulbs. A full home switch saves £100+ per year on energy.' },
  { icon: '🎁', title: 'Give experiences, not things', text: 'Experience gifts (concerts, classes, trips) generate far less carbon than physical products and create lasting memories.' }
];

/** Blind Spot Comparison Data */
const BLIND_SPOTS = {
  comparisons: [
    {
      myth: { title: 'Plastic bags are the #1 problem', text: 'People think avoiding plastic bags is the most impactful eco action they can take.' },
      reality: { title: 'Transportation is 6x more impactful', text: 'A single week of car commuting produces more CO₂ than a year\'s worth of plastic bag use.' }
    },
    {
      myth: { title: 'Recycling solves waste problems', text: 'Many believe recycling eliminates the environmental impact of consumption.' },
      reality: { title: 'Only 9% of plastic is ever recycled', text: 'Reducing consumption in the first place is 10x more effective than recycling. "Reduce" comes first.' }
    },
    {
      myth: { title: 'Local food is always greener', text: '\'Locally sourced\' feels environmentally superior in every situation.' },
      reality: { title: 'WHAT you eat matters more than WHERE it\'s from', text: 'Choosing plant-based food reduces your food footprint more than buying local beef.' }
    }
  ],
  contributors: [
    { rank: 1, title: '🚗 Daily Driving', text: 'Transportation is the #1 carbon source for most individuals. A petrol car emits ~2.3kg CO₂ per 10km. Many people underestimate their driving impact.', impact: 'high' },
    { rank: 2, title: '🥩 Meat & Dairy Diet', text: 'A beef-heavy diet generates 7.2kg CO₂ equivalent per day — 3x more than a vegan diet. Most people believe food is a minor part of their footprint.', impact: 'high' },
    { rank: 3, title: '✈️ Air Travel', text: 'One return flight London-New York generates 1.8 tonnes CO₂ — equivalent to 3 months of average daily emissions. Underestimated because flights feel occasional.', impact: 'high' },
    { rank: 4, title: '🏠 Home Heating', text: 'Gas boilers account for 14% of UK carbon emissions. Many people focus on electricity but ignore the gas they burn for heating.', impact: 'med' },
    { rank: 5, title: '🛍️ Fast Fashion', text: 'Buying 2 fewer new clothing items per month saves ~600kg CO₂ annually. The fashion industry emits more than aviation and shipping combined.', impact: 'med' },
    { rank: 6, title: '📦 Online Shopping', text: 'Next-day delivery has a 35% higher carbon footprint than standard delivery. Packaging, returns, and delivery vehicles add up significantly.', impact: 'med' }
  ],
  tips: [
    '💡 You\'d need to recycle for 10 years to offset the carbon of one transatlantic flight. Avoiding the flight is 1000x more effective.',
    '💡 Streaming 4K video for 1 hour emits as much carbon as driving 800 metres. Switching to 1080p reduces streaming emissions by 86%.',
    '💡 The carbon footprint of owning a dog is similar to driving a medium-sized car. The carbon of a cat is equivalent to a small car.',
    '💡 Buying one less new smartphone per decade saves more carbon than switching to renewable energy for 2 years.',
    '💡 The global food system generates 34% of all greenhouse gases. Your food choices have more power than many people realise.',
    '💡 Sending 65 emails per day for a year produces about 10kg of CO₂. Unsubscribing from newsletters can help, but a single car trip matters far more.'
  ]
};

/** Weekly Mission Templates */
const MISSION_TEMPLATES = [
  { id: 'm1', emoji: '🚌', title: 'Use public transport twice', desc: 'Replace 2 car journeys with bus, train, or metro this week.', category: 'Transport', difficulty: 'easy', impact: 'Saves ~4.5 kg CO₂', points: 20 },
  { id: 'm2', emoji: '🥗', title: 'Three meat-free meals', desc: 'Cook or order plant-based meals for 3 of your lunches or dinners.', category: 'Food', difficulty: 'easy', impact: 'Saves ~2.1 kg CO₂', points: 15 },
  { id: 'm3', emoji: '♻️', title: 'Zero food waste week', desc: 'Plan meals, use leftovers, and compost scraps to avoid throwing any food away.', category: 'Waste', difficulty: 'medium', impact: 'Saves ~3.0 kg CO₂', points: 25 },
  { id: 'm4', emoji: '💡', title: 'Unplug idle electronics', desc: 'Unplug chargers, TVs, and appliances at the wall when not in use for 7 days.', category: 'Energy', difficulty: 'easy', impact: 'Saves ~1.2 kg CO₂', points: 10 },
  { id: 'm5', emoji: '🚴', title: 'Active commute challenge', desc: 'Walk or cycle to work/school at least once this week.', category: 'Transport', difficulty: 'medium', impact: 'Saves ~2.8 kg CO₂', points: 20 },
  { id: 'm6', emoji: '💧', title: 'Short shower pledge', desc: 'Take showers of 5 minutes or less every day this week.', category: 'Water', difficulty: 'easy', impact: 'Saves ~3.5 kg CO₂', points: 15 },
  { id: 'm7', emoji: '🛍️', title: 'Buy nothing new', desc: 'Avoid buying any new non-essential items. Borrow, swap, or shop secondhand instead.', category: 'Shopping', difficulty: 'hard', impact: 'Saves ~5.0 kg CO₂', points: 35 },
  { id: 'm8', emoji: '🌿', title: 'Carry a reusable bottle', desc: 'Use a reusable water bottle all week — avoid single-use plastic bottles.', category: 'Waste', difficulty: 'easy', impact: 'Saves ~0.8 kg CO₂', points: 10 },
  { id: 'm9', emoji: '🌡️', title: 'Lower thermostat by 1°C', desc: 'Reduce your home heating temperature by 1°C for the entire week.', category: 'Energy', difficulty: 'easy', impact: 'Saves ~6.2 kg CO₂', points: 20 },
  { id: 'm10', emoji: '🍱', title: 'Meal prep Sunday', desc: 'Prep meals for the week to avoid food waste and reduce reliance on packaged convenience foods.', category: 'Food', difficulty: 'medium', impact: 'Saves ~4.0 kg CO₂', points: 25 }
];

/** Eco Challenges */
const CHALLENGE_DATA = [
  { id: 'c1', emoji: '🌱', title: 'Plastic-Free Week', desc: 'Go 7 full days without buying or using single-use plastic products.', duration: '7 days', difficulty: '⭐⭐⭐', impact: '🌍 High Impact', points: 100, badge: '🌿 Plastic Guardian', totalSteps: 7 },
  { id: 'c2', emoji: '🚴', title: 'Green Commute Challenge', desc: 'Use only eco-friendly transport (walk, cycle, public transit) for 5 consecutive working days.', duration: '5 days', difficulty: '⭐⭐', impact: '🚀 Medium Impact', points: 75, badge: '🚴 Green Commuter', totalSteps: 5 },
  { id: 'c3', emoji: '⚡', title: 'Energy Saver Challenge', desc: 'Reduce your home electricity usage by 20% for 2 weeks by switching off unused devices and lights.', duration: '14 days', difficulty: '⭐⭐⭐', impact: '💡 High Impact', points: 120, badge: '⚡ Energy Master', totalSteps: 14 },
  { id: 'c4', emoji: '💧', title: 'Water Conservation Challenge', desc: 'Track your water usage and reduce it by 30% for a week: shorter showers, fixing leaks, full dishwasher loads.', duration: '7 days', difficulty: '⭐⭐', impact: '💧 Medium Impact', points: 80, badge: '💧 Water Warrior', totalSteps: 7 },
  { id: 'c5', emoji: '🥦', title: 'Plant-Based Month', desc: 'Eat plant-based meals for all 30 days of this month. Discover delicious meat-free alternatives!', duration: '30 days', difficulty: '⭐⭐⭐⭐', impact: '🌍 Very High Impact', points: 200, badge: '🥗 Eco Foodie', totalSteps: 30 },
  { id: 'c6', emoji: '🛒', title: 'Zero Waste Shopping', desc: 'Shop with reusable bags, buy loose produce, and avoid packaged foods for 2 weeks.', duration: '14 days', difficulty: '⭐⭐', impact: '📦 Medium Impact', points: 90, badge: '♻️ Zero Waster', totalSteps: 14 }
];

/** All available badges (locked & unlocked) */
const ALL_BADGES = [
  { id: 'pioneer',   emoji: '🌱', name: 'Eco Pioneer',    desc: 'Completed your first assessment', challengeId: null },
  { id: 'commuter',  emoji: '🚴', name: 'Green Commuter', desc: 'Completed Green Commute Challenge', challengeId: 'c2' },
  { id: 'plastic',   emoji: '🌿', name: 'Plastic Guardian',desc: 'Completed Plastic-Free Week', challengeId: 'c1' },
  { id: 'energy',    emoji: '⚡', name: 'Energy Master',   desc: 'Completed Energy Saver Challenge', challengeId: 'c3' },
  { id: 'water',     emoji: '💧', name: 'Water Warrior',   desc: 'Completed Water Conservation', challengeId: 'c4' },
  { id: 'foodie',    emoji: '🥗', name: 'Eco Foodie',      desc: 'Completed Plant-Based Month', challengeId: 'c5' },
  { id: 'waster',    emoji: '♻️', name: 'Zero Waster',     desc: 'Completed Zero Waste Shopping', challengeId: 'c6' },
  { id: 'champion',  emoji: '🏆', name: 'Eco Champion',    desc: 'Earned Eco Champion persona', challengeId: null }
];

/** Habit definitions */
const HABIT_DEFINITIONS = [
  { id: 'h1', emoji: '🌱', name: 'Reduced Plastic Use', sub: 'Avoided single-use plastics today', impact: '~0.1 kg CO₂ saved' },
  { id: 'h2', emoji: '💧', name: 'Saved Water', sub: 'Shower under 5 min or fixed leaks', impact: '~0.2 kg CO₂ saved' },
  { id: 'h3', emoji: '⚡', name: 'Saved Electricity', sub: 'Unplugged idle devices & turned off lights', impact: '~0.3 kg CO₂ saved' },
  { id: 'h4', emoji: '🚌', name: 'Used Public Transport', sub: 'Bus, train, metro or cycled instead of car', impact: '~1.2 kg CO₂ saved' },
  { id: 'h5', emoji: '♻️', name: 'Recycled Waste', sub: 'Separated and recycled household waste', impact: '~0.15 kg CO₂ saved' },
  { id: 'h6', emoji: '🥦', name: 'Meat-Free Meal', sub: 'Chose plant-based for at least one meal', impact: '~0.8 kg CO₂ saved' },
  { id: 'h7', emoji: '🛍️', name: 'Avoided Fast Fashion', sub: 'No new clothing purchases today', impact: '~0.4 kg CO₂ saved' }
];

/** Chart data */
const CHART_DATA = {
  week:  { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],   data: [55,58,52,60,57,64,62] },
  month: { labels: ['Wk 1','Wk 2','Wk 3','Wk 4'],               data: [48, 53, 58, 62] },
  year:  { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], data: [38,42,45,44,50,52,55,57,58,60,61,62] }
};

/** Simulator configuration */
const SIMULATOR_CONFIG = [
  { id: 'transport',  emoji: '🚗', label: 'Car trips / week', min: 0, max: 14, default: 7,  step: 1,  co2PerUnit: 2.3,  unit: 'trips', desc: 'Each 10km car trip emits ~2.3 kg CO₂' },
  { id: 'meat',       emoji: '🥩', label: 'Meat meals / week', min: 0, max: 21, default: 10, step: 1,  co2PerUnit: 0.8,  unit: 'meals', desc: 'A meat meal emits ~0.8 kg CO₂ on average' },
  { id: 'ac',         emoji: '❄️', label: 'AC hours / day',   min: 0, max: 16, default: 6,  step: 0.5,co2PerUnit: 0.35, unit: 'hours', desc: 'Air conditioning emits ~0.35 kg CO₂/hour' },
  { id: 'shower',     emoji: '🚿', label: 'Shower minutes',   min: 2, max: 30, default: 12, step: 1,  co2PerUnit: 0.04, unit: 'min',   desc: 'Each shower minute uses heated water (~40g CO₂)' }
];


/* ═══════════════════════════════════════════════════
   2. STORE — LocalStorage Manager
═══════════════════════════════════════════════════ */
const Store = {
  /** @type {Map<string, *>} */
  _cache: new Map(),

  /**
   * Read a value; returns null on missing/corrupt data.
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    if (this._cache.has(key)) return this._cache.get(key);
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_PREFIX + key);
      const val = raw !== null ? JSON.parse(raw) : null;
      this._cache.set(key, val);
      return val;
    } catch {
      return null;
    }
  },

  /**
   * Write a JSON-serialisable value.
   * @param {string} key
   * @param {*} value
   * @returns {boolean}
   */
  set(key, value) {
    try {
      localStorage.setItem(CONFIG.STORAGE_PREFIX + key, JSON.stringify(value));
      this._cache.set(key, value);
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
   * @returns {boolean} true if the write succeeded
   */
  update(key, partial) {
    const current = this.get(key) || {};
    return this.set(key, { ...current, ...partial });
  },

  /**
   * Remove a single key from both the in-memory cache and localStorage.
   * @param {string} key
   */
  remove(key) {
    if (!key) return;
    localStorage.removeItem(CONFIG.STORAGE_PREFIX + key);
    this._cache.delete(key);
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
   * Returns a deterministic index for "daily" content.
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
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Clamp a number between min and max (inclusive).
   * @param {number} v   — value to clamp
   * @param {number} min — lower bound
   * @param {number} max — upper bound
   * @returns {number}
   */
  clamp(v, min, max) {
    if (typeof v !== 'number' || isNaN(v)) return min;
    return Math.min(Math.max(v, min), max);
  },

  /**
   * Announce text to screen readers.
   * @param {string} text
   */
  announce(text) {
    const el = document.getElementById('aria-announcer');
    if (!el) return;
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = text; });
  },

  /**
   * Format a date as a short readable string.
   * @param {Date} [date]
   * @returns {string}
   */
  formatDate(date = new Date()) {
    return date.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });
  },

  /**
   * Get today's date key as YYYY-MM-DD.
   * @returns {string}
   */
  todayKey() {
    return new Date().toISOString().slice(0, 10);
  },

  /**
   * Create a random integer between min and max (inclusive).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Shuffle an array (Fisher-Yates).
   * @param {Array} arr
   * @returns {Array}
   */
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
};


/* ═══════════════════════════════════════════════════
   5. ANIM UTILS — Animations & Transitions
═══════════════════════════════════════════════════ */
const AnimUtils = {
  /**
   * Animate a numeric counter from 0 → target using rAF.
   * @param {HTMLElement} el
   * @param {number} target
   * @param {number} [duration]
   * @param {number} [decimals]
   */
  counter(el, target, duration = CONFIG.COUNTER_DURATION, decimals = 1) {
    if (!el || isNaN(target)) return;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
      else        el.textContent = target.toFixed(decimals);
    };

    requestAnimationFrame(tick);
  },

  /**
   * Animate the SVG progress ring stroke-dashoffset.
   * @param {SVGCircleElement} el
   * @param {number} score 0–100
   * @param {number} [delay=450]
   */
  ring(el, score, delay = 450) {
    if (!el) return;
    const offset = CONFIG.RING_CIRCUMFERENCE - (Utils.clamp(score, 0, 100) / 100) * CONFIG.RING_CIRCUMFERENCE;
    setTimeout(() => { el.style.strokeDashoffset = offset; }, delay);
  },

  /**
   * Animate breakdown bars width from 0% to target.
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

  /** Initialise the Toast system by caching the container element. */
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

    const ICONS    = { info: '💡', success: '✅', warning: '⚠️', error: '❌', eco: '🌿' };
    const ACCENTS  = {
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

  /**
   * Animate a toast out of view and remove it from the DOM.
   * @param {HTMLElement} toast
   */
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
  _slides: [],
  _dots:   [],
  _current: 0,
  _timerId: null,

  /** Cache slide/dot elements, bind controls, and start the auto-rotate timer. */
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

    this._slides[prev].classList.add('exit-left');
    this._slides[prev].classList.remove('active');
    this._slides[prev].setAttribute('aria-hidden', 'true');
    setTimeout(() => this._slides[prev]?.classList.remove('exit-left'), SLIDE_EXIT_DURATION_MS);

    this._current = next;
    this._slides[next].classList.add('active');
    this._slides[next].setAttribute('aria-hidden', 'false');

    this._dots.forEach((d, i) => {
      d.classList.toggle('active', i === next);
      d.setAttribute('aria-selected', i === next ? 'true' : 'false');
    });

    const text = this._slides[next]?.querySelector('.banner-text')?.textContent || '';
    Utils.announce(`Awareness: ${text}`);
  },

  /** Advance to the next slide. */
  next() { this.goTo(this._current + 1); },

  /** Go back to the previous slide. */
  prev() { this.goTo(this._current - 1); },

  /** @private Start the auto-rotate interval. */
  _startTimer() { this._timerId = setInterval(() => this.next(), CONFIG.BANNER_INTERVAL); },

  /** @private Reset the auto-rotate interval. */
  _resetTimer() { clearInterval(this._timerId); this._startTimer(); },

  /** Stop the auto-rotate interval (call on component teardown). */
  destroy() { clearInterval(this._timerId); }
};


/* ═══════════════════════════════════════════════════
   8. STATS CARDS — Animated Counters
═══════════════════════════════════════════════════ */
const StatsCards = {
  _stats: [
    { id: 'val-score',      target: 62, dec: 0 },
    { id: 'val-streak',     target: 0,  dec: 0 },
    { id: 'val-missions',   target: 3,  dec: 0 },
    { id: 'val-challenges', target: 4,  dec: 0 }
  ],

  /** Load persisted data, update stat targets, and trigger animations on scroll-into-view. */
  init() {
    const habitData  = Store.get('habits_log') || {};
    const streakData = this._calculateStreak(habitData);
    this._stats[1].target = streakData.current;

    const badgesEarned  = Store.get('badges_earned') || [];
    const badgesCountEl = document.getElementById('badges-count');
    if (badgesCountEl) badgesCountEl.textContent = badgesEarned.length;

    const missionData       = Store.get('missions_state') || {};
    const completedMissions = Object.values(missionData).filter(m => m.completed).length;
    const missionSubEl      = document.querySelector('#lbl-missions')?.nextElementSibling;
    if (missionSubEl) missionSubEl.textContent = `${completedMissions} completed this week`;

    const section = document.querySelector('.stats-section');
    AnimUtils.onVisible(section, () => this._runAll(), 0.25);
  },

  /**
   * Calculate the current daily habit streak from the habit log.
   * @param {Object} habitData - Keyed by YYYY-MM-DD date strings.
   * @returns {{ current: number }}
   */
  _calculateStreak(habitData) {
    const today = new Date();
    let current = 0;
    /** Maximum days to check when calculating streak. */
    const MAX_STREAK_DAYS = 365;
    for (let i = 0; i < MAX_STREAK_DAYS; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (habitData[key] && Object.values(habitData[key]).some(Boolean)) {
        current++;
      } else if (i > 0) {
        break;
      }
    }
    return { current };
  },

  /**
   * Run all counter animations in sequence with staggered start delays.
   * @private
   */
  _runAll() {
    /** Stagger delay between each counter animation in milliseconds. */
    const STAGGER_MS = 80;
    this._stats.forEach(({ id, target, dec }, i) => {
      const el = document.getElementById(id);
      if (el) setTimeout(() => AnimUtils.counter(el, target, CONFIG.COUNTER_DURATION, dec), i * STAGGER_MS);
    });
  }
};


/* ═══════════════════════════════════════════════════
   9. CARBON SCORE — SVG Ring + Breakdown Bars
═══════════════════════════════════════════════════ */
const CarbonScore = {
  /**
   * Seed the ring score from persisted assessment data and register
   * an IntersectionObserver to trigger animations on first visibility.
   */
  init() {
    const result = Store.get('dna_assessment');
    if (result) {
      /** Score range: raw 6–18 mapped to display 0–100. */
      const score = CarbonScore._rawToDisplayScore(result.score);
      const ringScoreEl = document.getElementById('ring-score');
      const valScoreEl  = document.getElementById('val-score');
      if (ringScoreEl) ringScoreEl.textContent   = score;
      if (valScoreEl)  valScoreEl.dataset.target = score;
    }

    const card = document.querySelector('.card--score');
    AnimUtils.onVisible(card, () => this._animate(), 0.35);
  },

  /**
   * Convert a raw assessment score (6–18) to a 0–100 display score.
   * Lower raw scores (greener behaviour) map to higher display scores.
   * @param {number} rawScore
   * @returns {number}
   */
  _rawToDisplayScore(rawScore) {
    /** Raw score bounds defined by the Assessment scoring model. */
    const RAW_MIN = 6;
    const RAW_RANGE = 12;
    return Math.round(100 - ((rawScore - RAW_MIN) / RAW_RANGE) * 100);
  },

  /** @private Animate the SVG ring, score counter, and breakdown bars. */
  _animate() {
    /** Delay (ms) before starting the ring stroke animation. */
    const RING_DELAY_MS    = 300;
    /** Duration (ms) for the score counter animation. */
    const COUNTER_DURATION = 1300;
    /** Delay (ms) before animating breakdown bars. */
    const BAR_DELAY_MS     = 500;

    const assessResult = Store.get('dna_assessment');
    const score = assessResult
      ? CarbonScore._rawToDisplayScore(assessResult.score)
      : CONFIG.RING_SCORE;

    const ringEl = document.getElementById('ring-fill');
    AnimUtils.ring(ringEl, score, RING_DELAY_MS);

    const scoreEl = document.getElementById('ring-score');
    if (scoreEl) AnimUtils.counter(scoreEl, score, COUNTER_DURATION, 0);

    AnimUtils.breakdownBars(BAR_DELAY_MS);
  }
};


/* ═══════════════════════════════════════════════════
   10. WEEKLY CHART — Chart.js Integration
═══════════════════════════════════════════════════ */
const WeeklyChart = {
  /** @type {Chart|null} */
  _chart: null,
  _period: 'week',

  /** Build the Chart.js line chart and bind period-selector tabs. */
  init() {
    const canvas = document.getElementById('weekly-chart');
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
      // Chart.js not yet loaded — wait for window load event.
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

    const grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0,   'hsla(142,71%,49%,0.22)');
    grad.addColorStop(0.7, 'hsla(142,71%,49%,0.04)');
    grad.addColorStop(1,   'hsla(142,71%,49%,0)');

    const { labels, data } = CHART_DATA[this._period];

    this._chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Eco Score',
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
              label: (ctx) => ` Eco Score: ${ctx.parsed.y}/100`
            }
          }
        },
        scales: {
          x: {
            grid:   { color: 'hsla(222,15%,25%,0.45)' },
            ticks:  { color: 'hsl(220,13%,50%)', font: { family: 'Inter', size: 11 } },
            border: { display: false }
          },
          y: {
            grid:   { color: 'hsla(222,15%,25%,0.45)' },
            ticks:  { color: 'hsl(220,13%,50%)', font: { family: 'Inter', size: 11 }, callback: v => `${v}` },
            border: { display: false },
            min: 0, max: 100
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
    this._chart.data.labels           = labels;
    this._chart.data.datasets[0].data = data;
    this._chart.update('active');
  },

  /**
   * Populate the accessible data table beneath the chart.
   * @param {string} period - One of 'week' | 'month' | 'year'
   * @private
   */
  _buildTable(period) {
    const tbody = document.getElementById('chart-table');
    if (!tbody) return;
    const { labels, data } = CHART_DATA[period];
    tbody.innerHTML = labels
      .map((l, i) => `<tr><td>${Utils.escape(l)}</td><td>${data[i]}/100</td></tr>`)
      .join('');
  },

  /** Destroy the Chart.js instance to free memory (call on module teardown). */
  destroy() { this._chart?.destroy(); this._chart = null; }
};


/* ═══════════════════════════════════════════════════
   11. DAILY FACT — Eco Fact Card
═══════════════════════════════════════════════════ */
const DailyFact = {
  _idx: 0,

  /** Set the initial fact index and bind navigation/copy controls. */
  init() {
    this._idx = Utils.getDayIndex();
    this._render();

    document.getElementById('refresh-fact')?.addEventListener('click', () => this._next());
    document.getElementById('next-fact')?.addEventListener('click', () => this._next());
    document.getElementById('copy-fact')?.addEventListener('click', () => this._copy());
  },

  _render() {
    const fact = ECO_FACTS[this._idx];
    if (!fact) return;

    const body = document.getElementById('fact-body');
    if (!body) return;

    /** Duration (ms) for the fade-out before swapping fact content. */
    const FACT_FADE_DELAY_MS = 190;

    body.style.opacity   = '0';
    body.style.transform = 'translateY(8px)';
    body.style.transition = 'opacity 0.18s ease, transform 0.18s ease';

    setTimeout(() => {
      const emojiEl  = document.getElementById('fact-emoji');
      const catEl    = document.getElementById('fact-cat');
      const quoteEl  = document.getElementById('fact-quote');
      const sourceEl = document.getElementById('fact-source');

      if (emojiEl)  emojiEl.textContent  = fact.emoji;
      if (catEl)    catEl.textContent    = fact.category.charAt(0).toUpperCase() + fact.category.slice(1);
      if (quoteEl)  quoteEl.textContent  = fact.text;
      if (sourceEl) sourceEl.textContent = fact.source;

      body.style.opacity   = '1';
      body.style.transform = 'translateY(0)';
    }, FACT_FADE_DELAY_MS);

    Utils.announce(`New fact: ${fact.text}`);
  },

  /** Advance to the next fact (wraps around). @private */
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
              btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy`;
            }, COPY_RESET_DELAY_MS);
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
  /** Modules that open full-screen views. */
  MODULE_VIEWS: {
    assessment: 'assessment-view',
    blindspot:  'blindspot-view',
    learning:   'learning-view',
    story:      'story-view',
    missions:   'missions-view',
    simulator:  'simulator-view',
    habits:     'habits-view',
    challenges: 'challenges-view'
  },

  /** Set up greeting, sidebar, mobile drawer, module link routing, and user profile display. */
  init() {
    this._setGreeting();
    this._bindSidebarToggle();
    this._bindMobileDrawer();
    this._bindModuleLinks();
    this._loadUserProfile();
  },

  _setGreeting() {
    const el = document.getElementById('hero-greeting');
    if (!el) return;
    const name = Store.get('user_name') || 'EcoUser';
    el.innerHTML = `${Utils.escape(Utils.getGreeting())}, <span class="hero-name">${Utils.escape(name)}</span> 👋`;
    el.setAttribute('aria-label', `${Utils.getGreeting()}, ${name}`);
  },

  _loadUserProfile() {
    const profile = Store.get('user_profile');
    if (!profile) return;

    const levelEl = document.getElementById('user-level-display');
    if (levelEl && profile.personaDisplay) {
      levelEl.textContent = profile.personaDisplay;
    }
  },

  _bindSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggle  = document.getElementById('sidebar-toggle');
    if (!sidebar || !toggle) return;

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

  _bindMobileDrawer() {
    const sidebar   = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay   = document.getElementById('sidebar-overlay');
    if (!sidebar || !hamburger || !overlay) return;

    const open = () => {
      sidebar.classList.add('open');
      overlay.classList.add('visible');
      overlay.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
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

  _bindModuleLinks() {
    document.querySelectorAll('[data-module]').forEach(el => {
      const mod = el.dataset.module;
      if (mod === 'dashboard') return;

      el.addEventListener('click', (e) => {
        e.preventDefault();
        this._openModule(mod);
      });
    });
  },

  /**
   * Open a module view by ID.
   * @param {string} mod
   */
  _openModule(mod) {
    const viewId = this.MODULE_VIEWS[mod];
    if (!viewId) return;

    const view = document.getElementById(viewId);
    if (!view) return;

    // Close any open module first
    document.querySelectorAll('.module-view.is-open, [id$="-view"].is-open').forEach(v => {
      v.classList.remove('is-open');
      v.setAttribute('aria-hidden', 'true');
    });

    // Also close assessment view
    const assessView = document.getElementById('assessment-view');
    if (assessView?.classList.contains('is-open')) {
      Assessment.close();
    }

    if (mod === 'assessment') {
      Assessment.open();
      return;
    }

    view.classList.add('is-open');
    view.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Initialize the module's content
    switch (mod) {
      case 'blindspot':  BlindSpot.render(); break;
      case 'learning':   LearningHub.render(); break;
      case 'story':      EcoStory.render(); break;
      case 'missions':   Missions.render(); break;
      case 'simulator':  Simulator.render(); break;
      case 'habits':     HabitTracker.render(); break;
      case 'challenges': Challenges.render(); break;
    }

    setTimeout(() => {
      view.querySelector('h1,h2,.module-title')?.focus?.();
    }, MODULE_FOCUS_DELAY_MS);

    Utils.announce(`${mod} module opened.`);
    EventBus.emit('module:opened', { module: mod });
  },

  /**
   * Close a specific module view.
   * @param {string} viewId
   */
  closeModule(viewId) {
    const view = document.getElementById(viewId);
    if (!view) return;

    view.classList.remove('is-open');
    view.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    Utils.announce('Module closed. Returned to dashboard.');
  }
};


/* ═══════════════════════════════════════════════════
   13. KEYBOARD NAV — Arrow Key Navigation
═══════════════════════════════════════════════════ */
const KeyboardNav = {
  /** Bind arrow-key navigation for the sidebar and bottom tab bar. */
  init() {
    this._sidebarArrows();
    this._bottomTabArrows();
  },

  _sidebarArrows() {
    const items = document.querySelectorAll('.nav-item');
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
    const tabs = document.querySelectorAll('.tab-item');
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
   14. MODULE CLOSER — Bind close buttons
═══════════════════════════════════════════════════ */
const ModuleCloser = {
  /** Bind close buttons and the global Escape key handler for all module views. */
  init() {
    const closeBindings = [
      ['blindspot-close',   'blindspot-view'],
      ['learning-close',    'learning-view'],
      ['story-close',       'story-view'],
      ['missions-close',    'missions-view'],
      ['simulator-close',   'simulator-view'],
      ['habits-close',      'habits-view'],
      ['challenges-close',  'challenges-view']
    ];

    closeBindings.forEach(([btnId, viewId]) => {
      document.getElementById(btnId)?.addEventListener('click', () => {
        Navigation.closeModule(viewId);
      });
    });

    // ESC key closes any open module
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.module-view.is-open').forEach(view => {
          Navigation.closeModule(view.id);
        });
      }
    });
  }
};


/* ═══════════════════════════════════════════════════
   15. ASSESSMENT — Eco Personality Assessment (Module 1)
═══════════════════════════════════════════════════ */
const Assessment = {

  // State
  _step:      0,
  _isOpen:    false,
  _prevFocus: null,
  _answers: {
    transport:   null,
    food:        null,
    electricity: null,
    shopping:    null,
    waste:       null,
    water:       null
  },

  STEPS: [
    { id: 'step-0',       label: 'Introduction',  field: null },
    { id: 'step-1',       label: 'Transport',      field: 'transport'   },
    { id: 'step-2',       label: 'Food',           field: 'food'        },
    { id: 'step-3',       label: 'Electricity',    field: 'electricity' },
    { id: 'step-4',       label: 'Shopping',       field: 'shopping'    },
    { id: 'step-5',       label: 'Waste',          field: 'waste'       },
    { id: 'step-6',       label: 'Water',          field: 'water'       },
    { id: 'step-results', label: 'Your Results',   field: null }
  ],

  ALLOWED: {
    transport:   ['car', 'bike', 'public'],
    food:        ['vegetarian', 'mixed', 'nonvegetarian'],
    electricity: ['low', 'medium', 'high'],
    shopping:    ['low', 'medium', 'high'],
    waste:       ['low', 'medium', 'high'],
    water:       ['low', 'medium', 'high']
  },

  SCORES: {
    transport:   { car: 3, bike: 1, public: 2 },
    food:        { vegetarian: 1, mixed: 2, nonvegetarian: 3 },
    electricity: { low: 1, medium: 2, high: 3 },
    shopping:    { low: 1, medium: 2, high: 3 },
    waste:       { low: 1, medium: 2, high: 3 },
    water:       { low: 1, medium: 2, high: 3 }
  },

  PERSONAS: [
    {
      id: 'champion', min: 6, max: 9,
      name: 'Eco Champion', emoji: '🏆',
      gradient: 'linear-gradient(135deg,hsl(142,65%,26%),hsl(191,75%,24%))',
      headline: "You're leading the way to a sustainable future!",
      desc: "Your lifestyle choices are among the most eco-friendly. Low transport emissions, a plant-rich diet and conscious consumption make you a true carbon champion. Your habits save over 2 tonnes of CO₂ annually compared to the average.",
      strengths: ['Low-emission transport', 'Sustainable diet', 'Conscious consumption'],
      improvements: ['Advocacy & community influence', 'Carbon offsetting remaining emissions'],
      tips: [
        "Share your eco habits with friends and family — social influence multiplies your impact by up to 20x.",
        "Consider carbon-offsetting your remaining unavoidable emissions via certified programmes like Gold Standard.",
        "Advocate for sustainable policies in your workplace and local community — systemic change starts with individuals."
      ]
    },
    {
      id: 'aware', min: 10, max: 12,
      name: 'Eco Aware', emoji: '🌿',
      gradient: 'linear-gradient(135deg,hsl(191,75%,24%),hsl(217,65%,26%))',
      headline: "You're making conscious choices. Keep building!",
      desc: "You're above average in sustainability. A few targeted changes in transport or diet could significantly reduce your carbon footprint further. You're on the right path — now let's accelerate your impact.",
      strengths: ['Growing environmental awareness', 'Some sustainable habits established'],
      improvements: ['Transport choices', 'Reducing meat consumption'],
      tips: [
        "Reduce meat consumption by 2 days per week — that alone saves ~0.5 tCO₂ per year.",
        "Switch to a renewable energy tariff for your home electricity — often no more expensive than standard rates.",
        "Choose second-hand or repaired items before buying new — the best product is one already made."
      ]
    },
    {
      id: 'explorer', min: 13, max: 15,
      name: 'Eco Explorer', emoji: '🌍',
      gradient: 'linear-gradient(135deg,hsl(217,75%,24%),hsl(263,65%,26%))',
      headline: "You're aware, but there's meaningful room to grow.",
      desc: "Your footprint is close to the global average, but targeted changes in transport and diet can create an immediate, measurable difference. You're beginning your sustainability journey — every step counts.",
      strengths: ['Awareness growing', 'Occasional sustainable choices'],
      improvements: ['Daily transport habits', 'Food choices', 'Energy usage'],
      tips: [
        "Use public transport or cycle at least 3× per week — saves ~0.8 tCO₂ per year and improves health.",
        "Introduce one meat-free day per week as a starting habit — 'Meat Free Monday' is proven effective.",
        "Switch all home lighting to LED and use smart power strips — saves ~£120/year on energy bills."
      ]
    },
    {
      id: 'beginner', min: 16, max: 18,
      name: 'Eco Beginner', emoji: '🔥',
      gradient: 'linear-gradient(135deg,hsl(4,70%,24%),hsl(38,65%,24%))',
      headline: "Your footprint is significant. Every action counts.",
      desc: "Your current lifestyle has a high carbon impact, but every journey starts somewhere. Small, consistent changes compound into massive climate impact over time. The fact you're here shows you want to improve.",
      strengths: ['Taking the first step by completing this assessment'],
      improvements: ['Transport (highest priority)', 'Diet changes', 'Energy reduction', 'Waste management'],
      tips: [
        "Use public transport or cycle at least twice per week — the single highest-impact transport change you can make.",
        "Significantly reduce beef and lamb; these are the most carbon-intensive foods by far.",
        "Review your home energy usage and consider switching to a renewable energy supplier — often same price."
      ]
    }
  ],

  CATS: {
    transport:   { icon: '🚗', label: 'Transportation' },
    food:        { icon: '🍽️', label: 'Food & Diet' },
    electricity: { icon: '⚡', label: 'Home Electricity' },
    shopping:    { icon: '🛍️', label: 'Shopping' },
    waste:       { icon: '♻️', label: 'Waste Management' },
    water:       { icon: '💧', label: 'Water Usage' }
  },

  LABELS: {
    transport:   { car: 'Private Car', bike: 'Bicycle / Walk', public: 'Public Transit' },
    food:        { vegetarian: 'Vegetarian / Vegan', mixed: 'Mixed Diet', nonvegetarian: 'Non-Vegetarian' },
    electricity: { low: 'Low Usage', medium: 'Medium Usage', high: 'High Usage' },
    shopping:    { low: 'Minimal', medium: 'Moderate', high: 'Heavy Shopper' },
    waste:       { low: 'Low Waste', medium: 'Average Waste', high: 'High Waste' },
    water:       { low: 'Water Conscious', medium: 'Average Usage', high: 'High Usage' }
  },

  // ── PUBLIC: init ──
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

  // ── OPEN / CLOSE ──
  open() {
    const view = document.getElementById('assessment-view');
    if (!view || this._isOpen) return;

    this._prevFocus = document.activeElement;
    this._isOpen    = true;

    view.classList.add('is-open');
    view.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => { document.getElementById('assess-main')?.focus(); }, 420);

    Utils.announce('Eco Personality Assessment opened. Navigate through the steps using the buttons.');
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

  // ── NAVIGATION ──

  /**
   * Transition the assessment to a given step index.
   * Handles exit animation on the previous step and focus management on the next.
   * @param {number} nextIdx - Target step index (0-based, clamped to valid range).
   * @private
   */
  _goTo(nextIdx) {
    const steps   = this.STEPS;
    const prevIdx = this._step;
    nextIdx = Math.max(0, Math.min(nextIdx, steps.length - 1));
    if (nextIdx === prevIdx) return;

    const prevEl = document.getElementById(`assess-${steps[prevIdx].id}`);
    const nextEl = document.getElementById(`assess-${steps[nextIdx].id}`);

    if (prevEl) {
      prevEl.classList.add('is-exiting');
      prevEl.classList.remove('is-active');
      prevEl.setAttribute('aria-hidden', 'true');
      setTimeout(() => prevEl?.classList.remove('is-exiting'), SLIDE_EXIT_DURATION_MS);
    }

    this._step = nextIdx;
    if (nextEl) {
      nextEl.classList.add('is-active');
      nextEl.setAttribute('aria-hidden', 'false');
    }

    this._updateUI();

    setTimeout(() => {
      const heading = nextEl?.querySelector('h1,h2,.assess-intro-title');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    }, STEP_FOCUS_DELAY_MS);
  },

  /**
   * Advance to the next step, validating the current field first.
   * On the last question step (6), computes and displays results.
   * @private
   */
  _next() {
    /** Index of the last question step before results. */
    const LAST_QUESTION_STEP = 6;
    /** Index of the results step. */
    const RESULTS_STEP = 7;

    const field = this.STEPS[this._step]?.field;
    if (field && !this._validateField(field)) return;

    if (this._step === LAST_QUESTION_STEP) {
      this._computeResults();
      this._goTo(RESULTS_STEP);
    } else if (this._step < RESULTS_STEP) {
      this._goTo(this._step + 1);
    }
  },

  /**
   * Go back to the previous step, clearing any validation error.
   * @private
   */
  _back() {
    if (this._step <= 0) return;
    this._clearError(this.STEPS[this._step]?.field);
    this._goTo(this._step - 1);
  },

  /**
   * Skip the current question (records null answer) and advance.
   * @private
   */
  _skip() {
    /** Index of the last question step before results. */
    const LAST_QUESTION_STEP = 6;
    /** Index of the results step. */
    const RESULTS_STEP = 7;

    const field = this.STEPS[this._step]?.field;
    if (field) {
      this._answers[field] = null;
      this._clearError(field);
      this._savePartial();
    }
    if (this._step < LAST_QUESTION_STEP) {
      this._goTo(this._step + 1);
    } else if (this._step === LAST_QUESTION_STEP) {
      this._computeResults();
      this._goTo(RESULTS_STEP);
    }
  },

  // ── VALIDATION & SANITISATION ──
  _validateField(field) {
    const rawValue = this._getRadioValue(field);
    const clean    = this._sanitize(field, rawValue);

    if (!clean) {
      this._showError(field);
      document.querySelector(`input[name="${field}"]`)?.focus();
      return false;
    }

    this._answers[field] = clean;
    this._clearError(field);
    this._savePartial();
    return true;
  },

  _sanitize(field, value) {
    if (!value || typeof value !== 'string') return null;
    const allowed = this.ALLOWED[field];
    if (!Array.isArray(allowed)) return null;
    const cleaned = value.trim().toLowerCase().replace(/[^a-z]/g, '');
    return allowed.includes(cleaned) ? cleaned : null;
  },

  _getRadioValue(field) {
    const inputs = document.querySelectorAll(`input[name="${field}"]`);
    for (const input of inputs) {
      if (input.checked) return input.value;
    }
    return null;
  },

  // ── ERROR DISPLAY ──

  /**
   * Show a validation error for a specific assessment field.
   * Adds a shake animation that auto-removes after a short delay.
   * @param {string} field
   * @private
   */
  _showError(field) {
    /** Duration (ms) for the shake animation on a fieldset with an error. */
    const ERROR_SHAKE_DURATION_MS = 560;
    const errEl    = document.getElementById(`error-${field}`);
    const fieldset = document.getElementById(`fieldset-${field}`);
    if (errEl) errEl.hidden = false;
    if (fieldset) {
      fieldset.classList.add('has-error');
      setTimeout(() => fieldset?.classList.remove('has-error'), ERROR_SHAKE_DURATION_MS);
    }
  },

  /**
   * Clear the validation error for a specific assessment field.
   * @param {string} field
   * @private
   */
  _clearError(field) {
    if (!field) return;
    const errEl = document.getElementById(`error-${field}`);
    if (errEl) errEl.hidden = true;
    document.getElementById(`fieldset-${field}`)?.classList.remove('has-error');
  },

  // ── SCORE CALCULATION ──

  /**
   * Calculate the total assessment score and per-category breakdown.
   * Unanswered (null) fields default to a mid-range score of 2.
   * @returns {{ total: number, breakdown: Object<string, {answer:string|null, score:number}> }}
   */
  _calculateScore() {
    /** Default score applied when a question is skipped or unanswered. */
    const DEFAULT_SCORE = 2;
    let total = 0;
    const breakdown = {};

    for (const [field, scoreMap] of Object.entries(this.SCORES)) {
      const answer = this._answers[field];
      const score  = answer != null ? (scoreMap[answer] ?? DEFAULT_SCORE) : DEFAULT_SCORE;
      total += score;
      breakdown[field] = { answer, score };
    }

    return { total, breakdown };
  },

  /**
   * Find the persona matching a given total score.
   * Falls back to the last (highest-footprint) persona if no range matches.
   * @param {number} score
   * @returns {Object} Persona configuration object
   */
  _getPersona(score) {
    return this.PERSONAS.find(p => score >= p.min && score <= p.max)
           ?? this.PERSONAS[this.PERSONAS.length - 1];
  },

  // ── RESULTS RENDERING ──
  _computeResults() {
    const { total, breakdown } = this._calculateScore();
    const persona = this._getPersona(total);

    this._setText('results-emoji',    persona.emoji);
    this._setText('persona-name',     persona.name);
    this._setText('persona-headline', persona.headline);
    this._setText('persona-desc',     persona.desc);

    const card = document.getElementById('persona-card');
    if (card) {
      card.style.background = persona.gradient;
      card.dataset.personaId = persona.id;
    }

    // Score bar: map raw score 6–18 to a 0–100% width.
    const RAW_MIN   = 6;
    const RAW_RANGE = 12;
    const scorePct  = ((total - RAW_MIN) / RAW_RANGE) * 100;
    this._setText('results-score-num', `${total} / 18`);

    const barEl = document.getElementById('results-score-bar-el');
    if (barEl) {
      barEl.setAttribute('aria-valuenow', total);
      barEl.setAttribute('aria-valuetext', `${total} out of 18 — ${persona.name}`);
    }

    /** Thresholds (%) that determine the colour of the score bar. */
    const SCORE_GOOD_THRESHOLD = 33;
    const SCORE_MID_THRESHOLD  = 66;

    /** Delay (ms) before animating the score bar width (lets it enter the DOM first). */
    const SCORE_BAR_DELAY_MS = 350;

    const fill = document.getElementById('results-score-fill');
    if (fill) {
      fill.style.background = scorePct <= SCORE_GOOD_THRESHOLD
        ? 'hsl(142,71%,49%)'
        : scorePct <= SCORE_MID_THRESHOLD
        ? 'hsl(38,92%,52%)'
        : 'hsl(4,86%,58%)';
      setTimeout(() => { fill.style.width = `${scorePct}%`; }, SCORE_BAR_DELAY_MS);
    }

    this._renderStrengths(persona, breakdown);
    this._renderBreakdown(breakdown);
    this._renderTips(persona.tips);
    this._saveResult({ total, persona: persona.id, breakdown });

    // Award pioneer badge if first assessment
    const badges = Store.get('badges_earned') || [];
    if (!badges.includes('pioneer')) {
      badges.push('pioneer');
      Store.set('badges_earned', badges);
    }

    Utils.announce(`Assessment complete. Your Eco Persona is ${persona.name} with a carbon impact score of ${total} out of 18.`);
    EventBus.emit('assessment:completed', { score: total, personaId: persona.id, persona });
  },

  _renderStrengths(persona, breakdown) {
    const grid = document.getElementById('results-strengths-grid');
    if (!grid) return;

    const strengths    = persona.strengths || [];
    const improvements = persona.improvements || [];

    grid.innerHTML = `
      <div class="strength-card strength-card--good">
        <div class="strength-card-title">✅ Your Strengths</div>
        ${strengths.map(s => `<div class="strength-item">🌿 ${Utils.escape(s)}</div>`).join('')}
      </div>
      <div class="strength-card strength-card--improve">
        <div class="strength-card-title">📈 Areas to Improve</div>
        ${improvements.map(s => `<div class="strength-item">⚡ ${Utils.escape(s)}</div>`).join('')}
      </div>
    `;
  },

  _renderBreakdown(breakdown) {
    const grid = document.getElementById('results-bk-grid');
    if (!grid) return;

    const DOT_COLORS = [
      'hsl(142,71%,49%)',
      'hsl(38,92%,52%)',
      'hsl(4,86%,58%)'
    ];

    grid.innerHTML = Object.entries(breakdown)
      .map(([field, { answer, score }], rowIdx) => {
        const cat   = this.CATS[field];
        const lbl   = this.LABELS[field]?.[answer] ?? (answer ? answer : 'Skipped');
        const color = DOT_COLORS[score - 1] ?? DOT_COLORS[1];
        const delay = rowIdx * 60;

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

  // ── UI STATE ──

  /**
   * Synchronise all assessment UI elements with the current step state:
   * progress bar, step label, step dots, footer buttons, and radio selections.
   * @private
   */
  _updateUI() {
    const step    = this._step;
    /** Total number of question steps (not counting intro or results). */
    const TOTAL_Q = 6;
    /** Index of the results step. */
    const RESULTS_STEP = 7;

    const stepLabelEl = document.getElementById('assess-step-label');
    if (stepLabelEl) stepLabelEl.textContent = this.STEPS[step]?.label || '';

    const pct = step === 0 ? 0 : step === RESULTS_STEP ? 100 : ((step - 1) / TOTAL_Q) * 100;
    const fillEl = document.getElementById('assess-progress-fill');
    const barEl  = document.getElementById('assess-progress-bar');
    if (fillEl) fillEl.style.width  = `${pct}%`;
    if (barEl)  barEl.setAttribute('aria-valuenow', Math.round(pct));

    this._updateDots();

    const backBtn = document.getElementById('assess-back');
    if (backBtn) {
      backBtn.disabled = step <= 0;
      backBtn.setAttribute('aria-disabled', step <= 0 ? 'true' : 'false');
    }

    const footer  = document.getElementById('assess-footer');
    const nextBtn = document.getElementById('assess-next');
    const skipBtn = document.getElementById('assess-skip');

    /** Index of the last question step. */
    const LAST_QUESTION_STEP = 6;

    if (step === RESULTS_STEP) {
      if (footer) footer.hidden = true;
    } else {
      if (footer) footer.hidden = false;

      if (nextBtn) {
        const arrowSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
        nextBtn.innerHTML = step === 0
          ? `Start Assessment ${arrowSvg}`
          : step === LAST_QUESTION_STEP
          ? `See My Results ${arrowSvg}`
          : `Continue ${arrowSvg}`;
        nextBtn.setAttribute('aria-label',
          step === 0                    ? 'Start the assessment' :
          step === LAST_QUESTION_STEP   ? 'See your results' :
                                          'Continue to next question');
      }

      if (skipBtn) skipBtn.hidden = (step === 0);
    }

    this._restoreSelections();
  },

  _buildStepDots() {
    const container = document.getElementById('assess-step-dots');
    if (!container) return;
    container.innerHTML = [1,2,3,4,5,6]
      .map(i => `<span class="assess-dot" data-step="${i}"></span>`)
      .join('');
  },

  _updateDots() {
    document.querySelectorAll('.assess-dot').forEach(dot => {
      const ds = parseInt(dot.dataset.step, 10);
      dot.classList.toggle('is-active',    ds === this._step);
      dot.classList.toggle('is-completed', ds < this._step && this._step > 0);
    });
  },

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

  // ── EVENT BINDINGS ──
  _bindOpenTriggers() {
    document.querySelectorAll('[data-module="assessment"]').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); this.open(); });
    });
  },

  _bindHeaderControls() {
    document.getElementById('assess-back')      ?.addEventListener('click', () => this._back());
    document.getElementById('assess-close')     ?.addEventListener('click', () => this.close());
    document.getElementById('results-retake-btn')?.addEventListener('click', () => this._retake());
    document.getElementById('retake-from-intro') ?.addEventListener('click', () => this._retake());
    document.getElementById('results-save-btn')  ?.addEventListener('click', () => this._saveProfile());
    document.getElementById('results-story-btn') ?.addEventListener('click', () => {
      this.close();
      Navigation._openModule('story');
    });

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
      input.addEventListener('change', () => {
        const name = input.name;
        document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
          r.closest('.option-card')?.classList.remove('is-selected');
        });
        input.closest('.option-card')?.classList.add('is-selected');
        this._clearError(name);
      });

      input.addEventListener('focus', () => { input.closest('.option-card')?.classList.add('is-focused'); });
      input.addEventListener('blur',  () => { input.closest('.option-card')?.classList.remove('is-focused'); });
    });
  },

  // ── LOCALSTORAGE PERSISTENCE ──
  _savePartial() {
    Store.set('assessment_partial', {
      step:    this._step,
      answers: { ...this._answers },
      savedAt: new Date().toISOString()
    });
  },

  _loadSavedState() {
    const saved = Store.get('assessment_partial');
    if (!saved?.answers) return;

    const restored = {};
    for (const field of Object.keys(this.ALLOWED)) {
      const val = saved.answers[field];
      restored[field] = this._sanitize(field, val);
    }
    this._answers = restored;
  },

  _saveResult({ total, persona, breakdown }) {
    Store.set('dna_assessment', {
      score:       total,
      persona,
      breakdown,
      answers:     { ...this._answers },
      completedAt: new Date().toISOString()
    });
    Store.remove('assessment_partial');
  },

  _checkPreviousResult() {
    const prev = Store.get('dna_assessment');
    if (!prev) return;

    const personaCfg = this.PERSONAS.find(p => p.id === prev.persona);
    if (!personaCfg) return;

    const badge  = document.getElementById('prev-result');
    const nameEl = document.getElementById('prev-result-persona');
    if (badge && nameEl) {
      nameEl.textContent = `${personaCfg.emoji} ${personaCfg.name}`;
      badge.hidden = false;
    }
  },

  _saveProfile() {
    const result = Store.get('dna_assessment');
    if (!result) return;

    const personaCfg = this.PERSONAS.find(p => p.id === result.persona);

    Store.update('user_profile', {
      ecoPersona:      result.persona,
      assessmentScore: result.score,
      assessedAt:      result.completedAt,
      personaDisplay:  personaCfg ? `${personaCfg.emoji} ${personaCfg.name}` : undefined
    });

    const levelEl = document.getElementById('user-level-display');
    if (levelEl && personaCfg) {
      levelEl.textContent = `${personaCfg.emoji} ${personaCfg.name}`;
    }

    const ecoBadge = document.getElementById('eco-persona-badge');
    if (ecoBadge && personaCfg) {
      ecoBadge.textContent = personaCfg.name;
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

  // ── RETAKE ──
  _retake() {
    this._step    = 0;
    this._answers = { transport: null, food: null, electricity: null, shopping: null, waste: null, water: null };

    document.querySelectorAll('.option-input').forEach(i => { i.checked = false; });
    document.querySelectorAll('.option-card').forEach(c => { c.classList.remove('is-selected'); });
    document.querySelectorAll('.field-error').forEach(e => { e.hidden = true; });

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

  // ── Helpers ──

  /**
   * Set the textContent of a DOM element by ID.
   * No-ops silently if the element is not found.
   * @param {string} id  - Element ID
   * @param {string} text - Text to set
   * @private
   */
  _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
};


/* ═══════════════════════════════════════════════════
   16. BLIND SPOT DETECTOR (Module 2)
═══════════════════════════════════════════════════ */
const BlindSpot = {
  _tipIdx: 0,

  /**
   * Render all BlindSpot content and bind the tip rotation button.
   * Safe to call multiple times — inner renders guard against re-rendering.
   */
  render() {
    this._renderComparisons();
    this._renderContributors();
    this._renderTip();

    document.getElementById('bs-next-tip')?.addEventListener('click', () => {
      this._tipIdx = (this._tipIdx + 1) % BLIND_SPOTS.tips.length;
      this._renderTip();
    });
  },

  _renderComparisons() {
    const grid = document.getElementById('bs-compare-grid');
    if (!grid || grid.children.length > 0) return;

    grid.innerHTML = BLIND_SPOTS.comparisons.map(c => `
      <div class="bs-compare-item bs-compare-item--myth">
        <span class="bs-compare-badge">💭 Common Myth</span>
        <div class="bs-compare-title">${Utils.escape(c.myth.title)}</div>
        <p class="bs-compare-text">${Utils.escape(c.myth.text)}</p>
      </div>
      <div class="bs-compare-item bs-compare-item--reality">
        <span class="bs-compare-badge">⚡ Reality Check</span>
        <div class="bs-compare-title">${Utils.escape(c.reality.title)}</div>
        <p class="bs-compare-text">${Utils.escape(c.reality.text)}</p>
      </div>
    `).join('<div style="grid-column:1/-1;height:1px;background:var(--border-sub)"></div>');
  },

  _renderContributors() {
    const container = document.getElementById('bs-cards');
    if (!container || container.children.length > 0) return;

    container.innerHTML = BLIND_SPOTS.contributors.map(c => `
      <div class="bs-card" tabindex="0">
        <div class="bs-card-rank">${c.rank}</div>
        <div class="bs-card-content">
          <div class="bs-card-title">${Utils.escape(c.title)}</div>
          <p class="bs-card-text">${Utils.escape(c.text)}</p>
          <span class="bs-card-impact impact--${c.impact}">
            ${c.impact === 'high' ? '🔥 High Impact' : c.impact === 'med' ? '⚠️ Medium Impact' : '✅ Lower Impact'}
          </span>
        </div>
      </div>
    `).join('');
  },

  /**
   * Render the current rotating insight tip with a fade animation.
   * @private
   */
  _renderTip() {
    /** Delay (ms) for the fade-out before swapping tip text. */
    const TIP_FADE_DELAY_MS = 150;
    const el = document.getElementById('bs-tip-content');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = BLIND_SPOTS.tips[this._tipIdx];
        el.style.opacity = '1';
        el.style.transition = 'opacity 0.3s ease';
      }, TIP_FADE_DELAY_MS);
    }
  }
};


/* ═══════════════════════════════════════════════════
   17. LEARNING HUB (Module 3)
═══════════════════════════════════════════════════ */
const LearningHub = {
  _activeFilter: 'all',
  _viewedFacts:  new Set(),

  /**
   * Render all Learning Hub content and restore viewed-fact state from storage.
   * Safe to call on every module open.
   */
  render() {
    this._viewedFacts = new Set(Store.get('viewed_facts') || []);
    this._renderFeatured();
    this._renderDYK();
    this._renderFacts();
    this._renderTips();
    this._bindFilters();
  },

  _renderFeatured() {
    const card = document.getElementById('hub-featured-card');
    if (!card || card.children.length > 0) return;

    const fact = ECO_FACTS[Utils.getDayIndex()];
    card.innerHTML = `
      <div class="featured-emoji" aria-hidden="true">${Utils.escape(fact.emoji)}</div>
      <div class="featured-content">
        <div class="featured-category">${Utils.escape(fact.category.toUpperCase())}</div>
        <p class="featured-text">${Utils.escape(fact.text)}</p>
        <span class="featured-source">${Utils.escape(fact.source)}</span>
      </div>
    `;
  },

  /** @private Render a random selection of Did-You-Know fact cards. */
  _renderDYK() {
    const grid = document.getElementById('dyk-grid');
    if (!grid || grid.children.length > 0) return;

    const picks = Utils.shuffle(DYK_FACTS).slice(0, DYK_DISPLAY_COUNT);
    grid.innerHTML = picks.map(f => `
      <div class="dyk-card">
        <div class="dyk-card-emoji" aria-hidden="true">${Utils.escape(f.emoji)}</div>
        <p class="dyk-card-text">${Utils.escape(f.text)}</p>
      </div>
    `).join('');
  },

  _renderFacts(filter = 'all') {
    const grid  = document.getElementById('hub-facts-grid');
    const count = document.getElementById('hub-facts-count');
    if (!grid) return;

    const filtered = filter === 'all'
      ? ECO_FACTS
      : ECO_FACTS.filter(f => f.category === filter);

    if (count) count.textContent = `${filtered.length} facts`;

    grid.innerHTML = filtered.map((f, idx) => {
      const isViewed = this._viewedFacts.has(f.text.slice(0, 30));
      return `
        <div class="hub-fact-card ${isViewed ? 'viewed' : ''}"
          role="button" tabindex="0"
          aria-label="Eco fact: ${Utils.escape(f.text.slice(0, 60))}…${isViewed ? ' (viewed)' : ''}"
          data-fact-idx="${ECO_FACTS.indexOf(f)}">
          <div class="hub-fact-icon" aria-hidden="true">${Utils.escape(f.emoji)}</div>
          <div class="hub-fact-content">
            <div class="hub-fact-cat">${Utils.escape(f.category)}</div>
            <p class="hub-fact-text">${Utils.escape(f.text)}</p>
            <span class="hub-fact-viewed">${isViewed ? '✓ Viewed' : ''}</span>
          </div>
        </div>`;
    }).join('');

    // Bind clicks to mark as viewed
    grid.querySelectorAll('.hub-fact-card').forEach(card => {
      const onClick = () => {
        const idx  = parseInt(card.dataset.factIdx, 10);
        const fact = ECO_FACTS[idx];
        if (!fact) return;

        const key = fact.text.slice(0, 30);
        this._viewedFacts.add(key);
        Store.set('viewed_facts', [...this._viewedFacts]);
        card.classList.add('viewed');
        card.querySelector('.hub-fact-viewed').textContent = '✓ Viewed';
      };
      card.addEventListener('click', onClick);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
      });
    });
  },

  _renderTips() {
    const grid = document.getElementById('hub-tips-grid');
    if (!grid || grid.children.length > 0) return;

    grid.innerHTML = ECO_TIPS.map(t => `
      <div class="hub-tip-card">
        <div class="hub-tip-icon" aria-hidden="true">${Utils.escape(t.icon)}</div>
        <div class="hub-tip-content">
          <div class="hub-tip-title">${Utils.escape(t.title)}</div>
          <p class="hub-tip-text">${Utils.escape(t.text)}</p>
        </div>
      </div>
    `).join('');
  },

  _bindFilters() {
    const filters = document.querySelectorAll('.hub-filter');
    if (filters.length === 0 || filters[0]._bound) return;
    filters[0]._bound = true;

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        this._activeFilter = btn.dataset.cat;
        const factsGrid = document.getElementById('hub-facts-grid');
        if (factsGrid) factsGrid.innerHTML = '';
        this._renderFacts(this._activeFilter);
      });
    });
  }
};


/* ═══════════════════════════════════════════════════
   18. ECO STORY GENERATOR (Module 4)
═══════════════════════════════════════════════════ */
const EcoStory = {
  render() {
    const result = Store.get('dna_assessment');
    const noData = document.getElementById('story-no-data');
    const content = document.getElementById('story-content');

    if (!result) {
      if (noData) noData.hidden = false;
      if (content) content.hidden = true;

      // Bind the CTA
      document.getElementById('story-cta-assessment')?.addEventListener('click', (e) => {
        e.preventDefault();
        Navigation.closeModule('story-view');
        Assessment.open();
      });
      return;
    }

    if (noData) noData.hidden = true;
    if (content) { 
      content.hidden = false; 
      
      // AI Processing Simulation
      content.innerHTML = `
        <div style="text-align:center; padding: 4rem 2rem;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.8;">🧠</div>
          <h3 style="margin-top: 1rem; color: var(--brand-light);">EcoPersona AI is analyzing your data...</h3>
          <p style="color: var(--t3); margin-top: 0.5rem;">Generating your personalized sustainability narrative.</p>
          <div style="width: 200px; height: 4px; background: var(--bg-card); margin: 2rem auto; border-radius: 4px; overflow: hidden;">
            <div style="width: 100%; height: 100%; background: var(--brand); animation: indet 1.5s infinite ease-in-out;"></div>
          </div>
        </div>
        <style>@keyframes indet { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }</style>
      `;

      setTimeout(() => {
        this._generateStory(result, content);
      }, 1800);
    }
  },

  _generateStory(result, container) {
    const personas = Assessment.PERSONAS;
    const persona  = personas.find(p => p.id === result.persona) || personas[2];
    const breakdown = result.breakdown || {};

    // Find strongest & weakest categories
    const cats = Object.entries(breakdown).sort((a, b) => a[1].score - b[1].score);
    const strongest = cats[0];
    const weakest   = cats[cats.length - 1];

    const strongCat  = strongest ? Assessment.CATS[strongest[0]] : { label: 'waste management', icon: '♻️' };
    const weakCat    = weakest   ? Assessment.CATS[weakest[0]]   : { label: 'transportation',    icon: '🚗' };

    // Generate personalized story paragraphs
    const story = this._buildStory(persona, strongCat, weakCat, result.score);
    const co2Saved  = Math.round((18 - result.score) * 180);
    const treeEquiv = Math.round(co2Saved / CO2_PER_TREE_KG);

    container.innerHTML = `
      <div class="story-header">
        <div class="story-persona-emoji" aria-hidden="true">${Utils.escape(persona.emoji)}</div>
        <h2 class="story-persona-name">${Utils.escape(persona.name)}</h2>
        <p class="story-tagline">"Know Your Impact. Shape Your Future."</p>
      </div>

      <div class="story-body-text" aria-live="polite">
        ${story.map(p => `<p>${p}</p>`).join('')}
      </div>

      <div class="story-impact-summary">
        <h3 class="section-title">Your Annual Impact Potential</h3>
        <div class="sim-results-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="sim-result-card sim-result-card--positive">
            <div class="sim-result-icon" aria-hidden="true">🌳</div>
            <div class="sim-result-val sim-result-val--positive">${treeEquiv}</div>
            <div class="sim-result-label">Trees Equivalent</div>
            <div class="sim-result-sub">if you follow recommendations</div>
          </div>
          <div class="sim-result-card sim-result-card--positive">
            <div class="sim-result-icon" aria-hidden="true">🌿</div>
            <div class="sim-result-val sim-result-val--positive">${co2Saved} kg</div>
            <div class="sim-result-label">CO₂ Reduction Possible</div>
            <div class="sim-result-sub">estimated annual savings</div>
          </div>
          <div class="sim-result-card">
            <div class="sim-result-icon" aria-hidden="true">📈</div>
            <div class="sim-result-val">${Math.round((18 - result.score) * 6)}%</div>
            <div class="sim-result-label">Score Improvement</div>
            <div class="sim-result-sub">achievable with actions</div>
          </div>
        </div>
      </div>

      <div class="story-actions-section">
        <button class="btn btn--primary" id="story-view-missions">🎯 See My Missions</button>
        <button class="btn btn--ghost" id="story-view-simulator">⚗️ Try Impact Simulator</button>
        <button class="btn btn--ghost" id="story-retake">Retake Assessment</button>
      </div>
    `;

    document.getElementById('story-view-missions')?.addEventListener('click', () => {
      Navigation.closeModule('story-view');
      Navigation._openModule('missions');
    });
    document.getElementById('story-view-simulator')?.addEventListener('click', () => {
      Navigation.closeModule('story-view');
      Navigation._openModule('simulator');
    });
    document.getElementById('story-retake')?.addEventListener('click', () => {
      Navigation.closeModule('story-view');
      Assessment.open();
      Assessment._retake();
    });
  },

  /**
   * Build the array of story paragraph strings for the EcoPersona narrative.
   * @param {Object} persona   - Persona configuration object from Assessment.PERSONAS
   * @param {Object} strongCat - Category object ({ icon, label }) with the lowest raw score
   * @param {Object} weakCat   - Category object ({ icon, label }) with the highest raw score
   * @param {number} score     - Raw assessment score (6–18)
   * @returns {string[]} Array of paragraph HTML strings
   */
  _buildStory(persona, strongCat, weakCat, score) {
    const month = new Date().toLocaleDateString('en-GB', { month: 'long' });
    return [
      `You are a <strong class="story-highlight">${persona.name}</strong>. ${persona.headline}`,
      `This ${month}, your lifestyle assessment reveals a thoughtful picture of your environmental footprint. Your ${strongCat.icon} <strong>${strongCat.label}</strong> habits stand out as a genuine strength — an area where your daily choices are making a real, measurable difference to our planet.`,
      `At the same time, your biggest opportunity for growth lies in ${weakCat.icon} <strong>${weakCat.label}</strong>. This isn't a criticism — it's a spotlight on where your next chapter of impact can unfold. Every eco champion started exactly where you are now.`,
      persona.desc,
      `By committing to the personalized recommendations below — and completing your weekly missions — you have the power to transform your environmental story significantly over the next 12 months. The planet doesn't need a few perfect eco-warriors. It needs millions of people making meaningful improvements. <strong class="story-highlight">You are one of those people.</strong>`,
      `Your journey continues. Every meal choice, every commute decision, every purchase made consciously writes the next paragraph of your Eco Story. What will yours say?`
    ];
  }
};


/* ═══════════════════════════════════════════════════
   19. WEEKLY MISSIONS (Module 5)
═══════════════════════════════════════════════════ */
const Missions = {
  _missions: [],
  _rendered: false,

  /**
   * Load or generate this week's missions, render all UI sections,
   * and bind the "Regenerate" button (idempotent — safe to call each time the module opens).
   */
  render() {
    this._loadOrGenerate();
    this._renderStats();
    this._renderMissions();
    this._renderCompleted();

    document.getElementById('regenerate-missions')?.addEventListener('click', () => {
      Store.remove('weekly_missions');
      this._rendered = false;
      const grid = document.getElementById('missions-grid');
      if (grid) grid.innerHTML = '';
      this.render();
      Toast.show('Missions refreshed!', 'New weekly missions generated for you.', 'eco');
    });
  },

  _loadOrGenerate() {
    const saved = Store.get('weekly_missions');
    const today = Utils.todayKey();

    if (saved && saved.weekOf === this._getWeekKey() && saved.missions?.length) {
      this._missions = saved.missions;
    } else {
      this._generateMissions();
    }
  },

  _getWeekKey() {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  },

  /**
   * Generate a personalised set of missions for the current week.
   * If assessment data is available, missions targeting the weakest categories
   * are prioritised (top 2 weak areas surfaced first).
   * @private
   */
  _generateMissions() {
    const result = Store.get('dna_assessment');
    let pool = Utils.shuffle(MISSION_TEMPLATES);

    if (result?.breakdown) {
      /** Map from assessment field names to mission category labels. */
      const FIELD_TO_CATEGORY = {
        transport: 'Transport', food: 'Food', electricity: 'Energy',
        shopping:  'Shopping',  waste: 'Waste', water: 'Water'
      };
      /** Number of weak categories to prioritise when selecting missions. */
      const WEAK_CATEGORY_COUNT = 2;

      const weakFields = Object.entries(result.breakdown)
        .sort((a, b) => b[1].score - a[1].score)
        .map(([field]) => field);

      const weakCategories = weakFields
        .slice(0, WEAK_CATEGORY_COUNT)
        .map(w => FIELD_TO_CATEGORY[w])
        .filter(Boolean);

      const prioritized = pool.filter(m =>  weakCategories.includes(m.category));
      const rest        = pool.filter(m => !weakCategories.includes(m.category));
      pool = [...prioritized, ...rest];
    }

    this._missions = pool.slice(0, MISSIONS_PER_WEEK).map(t => ({ ...t, completed: false }));
    Store.set('weekly_missions', { weekOf: this._getWeekKey(), missions: this._missions });
  },

  _renderStats() {
    const container = document.getElementById('missions-stats');
    if (!container || container.children.length > 0) return;

    const completed = this._missions.filter(m => m.completed).length;
    const totalPts  = this._missions.reduce((sum, m) => sum + (m.completed ? m.points : 0), 0);

    container.innerHTML = `
      <div class="mission-stat-card">
        <div class="mission-stat-val">${this._missions.length}</div>
        <div class="mission-stat-lbl">Active Missions</div>
      </div>
      <div class="mission-stat-card">
        <div class="mission-stat-val">${completed}</div>
        <div class="mission-stat-lbl">Completed</div>
      </div>
      <div class="mission-stat-card">
        <div class="mission-stat-val">${totalPts}</div>
        <div class="mission-stat-lbl">Points Earned</div>
      </div>
    `;
  },

  _renderMissions() {
    const grid = document.getElementById('missions-grid');
    if (!grid) return;

    const active = this._missions.filter(m => !m.completed);
    if (active.length === 0) {
      grid.innerHTML = '<p style="color:var(--t3);text-align:center;padding:2rem">🎉 All missions completed! Check back next week for new ones.</p>';
      return;
    }

    grid.innerHTML = active.map(m => `
      <div class="mission-card ${m.completed ? 'completed' : ''}" id="mission-${Utils.escape(m.id)}">
        <div class="mission-card-header">
          <div class="mission-emoji" aria-hidden="true">${Utils.escape(m.emoji)}</div>
          <div class="mission-info">
            <div class="mission-title">${Utils.escape(m.title)}</div>
            <p class="mission-desc">${Utils.escape(m.desc)}</p>
          </div>
        </div>
        <div class="mission-tags">
          <span class="mission-tag">${Utils.escape(m.category)}</span>
          <span class="mission-tag mission-tag--${Utils.escape(m.difficulty)}">${Utils.escape(m.difficulty.charAt(0).toUpperCase() + m.difficulty.slice(1))}</span>
        </div>
        <div class="mission-impact">🌍 ${Utils.escape(m.impact)} · 🏅 ${m.points} pts</div>
        <div class="mission-card-actions">
          <button class="mission-complete-btn" data-mission-id="${Utils.escape(m.id)}" aria-label="Mark '${Utils.escape(m.title)}' as complete">
            ✓ Mark Complete
          </button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.mission-complete-btn').forEach(btn => {
      btn.addEventListener('click', () => this._completeMission(btn.dataset.missionId));
    });
  },

  _completeMission(id) {
    const mission = this._missions.find(m => m.id === id);
    if (!mission || mission.completed) return;

    mission.completed = true;
    Store.set('weekly_missions', { weekOf: this._getWeekKey(), missions: this._missions });

    Toast.show(`Mission Complete! 🎉`, `"${mission.title}" — +${mission.points} pts earned!`, 'success');
    Utils.announce(`Mission complete: ${mission.title}`);

    // Re-render
    const grid = document.getElementById('missions-grid');
    if (grid) grid.innerHTML = '';
    const statsEl = document.getElementById('missions-stats');
    if (statsEl) statsEl.innerHTML = '';
    this._renderStats();
    this._renderMissions();
    this._renderCompleted();

    EventBus.emit('mission:completed', { mission });
  },

  _renderCompleted() {
    const container = document.getElementById('missions-completed');
    if (!container) return;

    const done = this._missions.filter(m => m.completed);
    if (done.length === 0) {
      container.innerHTML = '<p style="color:var(--t3);font-size:0.875rem">No missions completed yet this week.</p>';
      return;
    }

    container.innerHTML = done.map(m => `
      <div class="completed-mission-item">
        <span aria-hidden="true">${Utils.escape(m.emoji)}</span>
        <span style="color:var(--t1);font-weight:600">${Utils.escape(m.title)}</span>
        <span style="margin-left:auto;color:var(--brand-light);font-weight:700">+${m.points} pts</span>
      </div>
    `).join('');
  }
};


/* ═══════════════════════════════════════════════════
   20. IMPACT SIMULATOR (Module 6)
═══════════════════════════════════════════════════ */
const Simulator = {
  _values: {},
  _chart:  null,
  _rendered: false,

  render() {
    if (!this._rendered) {
      SIMULATOR_CONFIG.forEach(s => { this._values[s.id] = s.default; });
      this._rendered = true;
    }

    this._renderControls();
    this._renderResults();
    this._buildChart();
  },

  _renderControls() {
    const container = document.getElementById('sim-controls');
    if (!container) return;
    container.innerHTML = '';

    SIMULATOR_CONFIG.forEach(cfg => {
      const wrapper = document.createElement('div');
      wrapper.className = 'sim-slider-group';
      wrapper.innerHTML = `
        <div class="sim-slider-header">
          <label class="sim-slider-label" for="slider-${Utils.escape(cfg.id)}">
            <span class="sim-slider-emoji" aria-hidden="true">${Utils.escape(cfg.emoji)}</span>
            ${Utils.escape(cfg.label)}
          </label>
          <span class="sim-slider-value" id="val-${Utils.escape(cfg.id)}" aria-live="polite">
            ${this._values[cfg.id]} ${Utils.escape(cfg.unit)}
          </span>
        </div>
        <input type="range"
          id="slider-${Utils.escape(cfg.id)}"
          min="${cfg.min}" max="${cfg.max}" step="${cfg.step}"
          value="${this._values[cfg.id]}"
          aria-label="${Utils.escape(cfg.label)}: currently ${this._values[cfg.id]} ${Utils.escape(cfg.unit)}"
        >
        <div class="sim-slider-desc">${Utils.escape(cfg.desc)}</div>
      `;

      const input = wrapper.querySelector('input');
      const valEl = wrapper.querySelector(`#val-${cfg.id}`);

      input.addEventListener('input', () => {
        this._values[cfg.id] = parseFloat(input.value);
        valEl.textContent = `${this._values[cfg.id]} ${cfg.unit}`;
        input.setAttribute('aria-label', `${cfg.label}: currently ${this._values[cfg.id]} ${cfg.unit}`);
        this._renderResults();
        this._updateChart();
      });

      container.appendChild(wrapper);
    });
  },

  /**
   * Calculate annual CO₂ impact, savings, and equivalents from slider values.
   * Daily-rate sliders (AC, shower) are multiplied by 365; weekly sliders by 52.
   * @returns {{ annualCO2:number, saving:number, trees:number, money:number, score:number, baseline:number }}
   */
  _calcImpact() {
    /** IDs of sliders measured per day (all others are measured per week). */
    const DAILY_SLIDER_IDS = ['ac', 'shower'];
    /** Weeks per year for weekly-rate sliders. */
    const WEEKS_PER_YEAR = 52;
    /** Days per year for daily-rate sliders. */
    const DAYS_PER_YEAR  = 365;
    /** Score multiplier: maps fraction-of-baseline saved to an impact score. */
    const SCORE_MULTIPLIER = 30;

    /**
     * Return the correct annual multiplier for a given slider.
     * @param {string} id
     * @returns {number}
     */
    const getMultiplier = (id) => DAILY_SLIDER_IDS.includes(id) ? DAYS_PER_YEAR : WEEKS_PER_YEAR;

    let annualCO2 = 0;
    SIMULATOR_CONFIG.forEach(cfg => {
      const val = this._values[cfg.id] || 0;
      annualCO2 += val * cfg.co2PerUnit * getMultiplier(cfg.id);
    });

    const baseline = SIMULATOR_CONFIG.reduce((sum, cfg) => {
      return sum + cfg.default * cfg.co2PerUnit * getMultiplier(cfg.id);
    }, 0);

    const saving = Math.max(0, baseline - annualCO2);
    const trees  = Math.round(saving / CO2_PER_TREE_KG);
    const money  = Math.round(saving * MONEY_PER_KG_CO2);
    const score  = Math.round((saving / baseline) * SCORE_MULTIPLIER);

    return { annualCO2: Math.round(annualCO2), saving: Math.round(saving), trees, money, score, baseline: Math.round(baseline) };
  },

  _renderResults() {
    const grid = document.getElementById('sim-results-grid');
    if (!grid) return;

    const { annualCO2, saving, trees, money, score, baseline } = this._calcImpact();
    const isPositive = saving > 0;

    grid.innerHTML = `
      <div class="sim-result-card ${isPositive ? 'sim-result-card--positive' : ''}">
        <div class="sim-result-icon" aria-hidden="true">🌿</div>
        <div class="sim-result-val ${isPositive ? 'sim-result-val--positive' : ''}" aria-live="polite">
          ${saving > 0 ? '-' : ''}${saving} kg
        </div>
        <div class="sim-result-label">CO₂ Reduction / Year</div>
        <div class="sim-result-sub">vs your current baseline</div>
      </div>
      <div class="sim-result-card">
        <div class="sim-result-icon" aria-hidden="true">🌳</div>
        <div class="sim-result-val">${trees}</div>
        <div class="sim-result-label">Tree Equivalents</div>
        <div class="sim-result-sub">trees planted for same impact</div>
      </div>
      <div class="sim-result-card ${isPositive ? 'sim-result-card--positive' : ''}">
        <div class="sim-result-icon" aria-hidden="true">💰</div>
        <div class="sim-result-val ${isPositive ? 'sim-result-val--positive' : ''}">£${money}</div>
        <div class="sim-result-label">Money Saved</div>
        <div class="sim-result-sub">estimated annual savings</div>
      </div>
      <div class="sim-result-card">
        <div class="sim-result-icon" aria-hidden="true">📊</div>
        <div class="sim-result-val" aria-live="polite">${annualCO2} kg</div>
        <div class="sim-result-label">Annual Carbon Footprint</div>
        <div class="sim-result-sub">baseline: ${baseline} kg/year</div>
      </div>
    `;
  },

  _buildChart() {
    if (typeof Chart === 'undefined') return;

    const canvas = document.getElementById('sim-chart');
    if (!canvas) return;

    if (this._chart) { this._chart.destroy(); this._chart = null; }

    const ctx  = canvas.getContext('2d');
    const data = this._getChartData();

    this._chart = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'hsl(222,18%,17%)',
            titleColor: 'hsl(210,40%,96%)',
            bodyColor:  'hsl(215,20%,70%)',
            padding: 12,
            cornerRadius: 10,
            callbacks: { label: c => ` ${c.parsed.y} kg CO₂/year` }
          }
        },
        scales: {
          x: {
            grid:   { display: false },
            ticks:  { color: 'hsl(220,13%,50%)', font: { family: 'Inter', size: 11 } },
            border: { display: false }
          },
          y: {
            grid:   { color: 'hsla(222,15%,25%,0.45)' },
            ticks:  { color: 'hsl(220,13%,50%)', font: { family: 'Inter', size: 11 }, callback: v => `${v}kg` },
            border: { display: false }
          }
        }
      }
    });
  },

  /**
   * Build the Chart.js bar-chart dataset from current slider values and defaults.
   * @returns {Object} Chart.js data object with labels and two datasets.
   * @private
   */
  _getChartData() {
    /** IDs of sliders measured per day (all others are measured per week). */
    const DAILY_SLIDER_IDS = ['ac', 'shower'];
    const WEEKS_PER_YEAR   = 52;
    const DAYS_PER_YEAR    = 365;
    const getMultiplier    = (id) => DAILY_SLIDER_IDS.includes(id) ? DAYS_PER_YEAR : WEEKS_PER_YEAR;

    const labels   = SIMULATOR_CONFIG.map(c => c.label.split('/')[0].trim());
    const current  = SIMULATOR_CONFIG.map(cfg =>
      Math.round(this._values[cfg.id] * cfg.co2PerUnit * getMultiplier(cfg.id))
    );
    const defaults = SIMULATOR_CONFIG.map(cfg =>
      Math.round(cfg.default * cfg.co2PerUnit * getMultiplier(cfg.id))
    );

    return {
      labels,
      datasets: [
        { label: 'Baseline', data: defaults, backgroundColor: 'hsla(222,14%,30%,0.8)', borderRadius: 6 },
        { label: 'Your Choice', data: current, backgroundColor: 'hsla(142,71%,49%,0.75)', borderRadius: 6 }
      ]
    };
  },

  _updateChart() {
    if (!this._chart) return;
    const data    = this._getChartData();
    const current = data.datasets[1].data;
    this._chart.data.datasets[1].data = current;
    this._chart.update('active');
  }
};


/* ═══════════════════════════════════════════════════
   21. HABIT TRACKER (Module 7)
═══════════════════════════════════════════════════ */
const HabitTracker = {
  _log: {},    // { 'YYYY-MM-DD': { h1: true, h2: false, ... } }

  /**
   * Load today's habit log from storage and render all Habit Tracker UI sections.
   * Safe to call on every module open.
   */
  render() {
    this._log = Store.get('habits_log') || {};
    this._renderStreaks();
    this._renderDate();
    this._renderHabits();
    this._renderCalendar();
    this._renderHeatmap();
  },

  _getTodayHabits() {
    const key = Utils.todayKey();
    if (!this._log[key]) this._log[key] = {};
    return this._log[key];
  },

  _renderStreaks() {
    const container = document.getElementById('habit-streaks');
    if (!container) return;

    const { daily, weekly, monthly } = this._calcStreaks();

    container.innerHTML = `
      <div class="streak-card">
        <div class="streak-icon" aria-hidden="true">🔥</div>
        <div class="streak-number">${daily}</div>
        <div class="streak-label">Day Streak</div>
      </div>
      <div class="streak-card">
        <div class="streak-icon" aria-hidden="true">📅</div>
        <div class="streak-number">${weekly}</div>
        <div class="streak-label">Week Streak</div>
      </div>
      <div class="streak-card">
        <div class="streak-icon" aria-hidden="true">🌟</div>
        <div class="streak-number">${monthly}</div>
        <div class="streak-label">Days This Month</div>
      </div>
    `;
  },

  /**
   * Calculate daily streak, weekly streak, and total active days this month.
   * @returns {{ daily: number, weekly: number, monthly: number }}
   * @private
   */
  _calcStreaks() {
    /** Days to look back when calculating the daily streak. */
    const MAX_DAILY_LOOKBACK = 365;
    /** Weeks to look back when calculating the weekly streak. */
    const MAX_WEEKLY_LOOKBACK = 52;
    /** Days in a calendar week. */
    const DAYS_PER_WEEK = 7;

    const today = new Date();
    let daily   = 0;
    let weekly  = 0;
    let monthly = 0;

    // Daily streak: count consecutive days with any habit logged.
    for (let i = 0; i < MAX_DAILY_LOOKBACK; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (this._log[key] && Object.values(this._log[key]).some(Boolean)) {
        daily++;
      } else if (i > 0) {
        break;
      }
    }

    // Weekly streak: count consecutive weeks with at least one logged day.
    for (let w = 0; w < MAX_WEEKLY_LOOKBACK; w++) {
      let hasActivity = false;
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const day = new Date(today);
        day.setDate(day.getDate() - (w * DAYS_PER_WEEK + d));
        const key = day.toISOString().slice(0, 10);
        if (this._log[key] && Object.values(this._log[key]).some(Boolean)) {
          hasActivity = true; break;
        }
      }
      if (hasActivity) weekly++;
      else if (w > 0)  break;
    }

    // Monthly: count distinct active days since the start of the current month.
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let d = new Date(monthStart); d <= today; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      if (this._log[key] && Object.values(this._log[key]).some(Boolean)) monthly++;
    }

    return { daily, weekly, monthly };
  },

  _renderDate() {
    const el = document.getElementById('habit-date');
    if (el) el.textContent = Utils.formatDate();
  },

  _renderHabits() {
    const grid = document.getElementById('habits-grid');
    if (!grid) return;

    const today = this._getTodayHabits();
    grid.innerHTML = '';

    HABIT_DEFINITIONS.forEach(h => {
      const isDone = today[h.id] === true;
      const item   = document.createElement('div');
      item.className = `habit-item ${isDone ? 'done' : ''}`;
      item.innerHTML = `
        <button class="habit-checkbox" aria-label="${isDone ? 'Undo' : 'Complete'}: ${Utils.escape(h.name)}"
          data-habit-id="${Utils.escape(h.id)}" ${isDone ? 'aria-pressed="true"' : 'aria-pressed="false"'}>
          ${isDone ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </button>
        <div class="habit-icon" aria-hidden="true">${Utils.escape(h.emoji)}</div>
        <div class="habit-info">
          <div class="habit-name">${Utils.escape(h.name)}</div>
          <div class="habit-sub">${Utils.escape(h.sub)}</div>
        </div>
        <div class="habit-impact">${Utils.escape(h.impact)}</div>
      `;

      item.querySelector('.habit-checkbox').addEventListener('click', () => this._toggleHabit(h.id));
      grid.appendChild(item);
    });
  },

  _toggleHabit(habitId) {
    const today = this._getTodayHabits();
    today[habitId] = !today[habitId];

    const key = Utils.todayKey();
    this._log[key] = today;
    Store.set('habits_log', this._log);

    // Re-render affected parts
    this._renderHabits();
    this._renderStreaks();
    this._renderCalendar();
    this._renderHeatmap();

    const habit = HABIT_DEFINITIONS.find(h => h.id === habitId);
    const done  = today[habitId];
    if (done) {
      Toast.show(`Habit logged! 🌱`, `${habit?.name} — ${habit?.impact}`, 'eco', 3000);
      Utils.announce(`${habit?.name} marked as complete`);
      EventBus.emit('habit:completed', { habitId, habit });
    }
  },

  _renderCalendar() {
    const container = document.getElementById('habit-calendar');
    if (!container) return;

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    container.innerHTML = days.map((dayLabel, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const key      = d.toISOString().slice(0, 10);
      const dayLog   = this._log[key] || {};
      const done     = Object.values(dayLog).filter(Boolean).length;
      const total    = HABIT_DEFINITIONS.length;
      const isToday  = key === Utils.todayKey();
      const allDone  = done === total && total > 0;
      const hasAny   = done > 0;

      return `
        <div class="calendar-day">
          <div class="calendar-day-label">${dayLabel}</div>
          <div class="calendar-day-dot ${allDone ? 'all-done' : hasAny ? 'has-habits' : ''} ${isToday ? 'today' : ''}"
            aria-label="${dayLabel}: ${done}/${total} habits completed" title="${dayLabel}: ${done}/${total} habits">
            ${d.getDate()}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render the 30-day habit activity heatmap.
   * Each cell is colour-coded by completion level (0–4).
   * @private
   */
  _renderHeatmap() {
    const container = document.getElementById('habit-heatmap');
    if (!container) return;

    const today = new Date();
    const cells = [];

    for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key    = d.toISOString().slice(0, 10);
      const dayLog = this._log[key] || {};
      const done   = Object.values(dayLog).filter(Boolean).length;
      const total  = HABIT_DEFINITIONS.length;
      /** Completion level 0–4: maps fraction of habits done to a discrete heat level. */
      const level  = !total ? 0 : Math.ceil((done / total) * 4);

      cells.push(`
        <div class="heatmap-day"
          data-level="${level}"
          title="${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}: ${done}/${total} habits"
          aria-label="${done} of ${total} habits on ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}">
        </div>
      `);
    }

    container.innerHTML = cells.join('');
  }
};


/* ═══════════════════════════════════════════════════
   22. ECO CHALLENGES (Module 8)
═══════════════════════════════════════════════════ */
const Challenges = {
  _progress: {},   // { challengeId: { steps: n, completed: bool, startedAt: str } }
  _badges:   [],

  /**
   * Load persisted progress and badge data, then render all Challenge Arena sections.
   * Safe to call on every module open.
   */
  render() {
    this._progress = Store.get('challenge_progress') || {};
    this._badges   = Store.get('badges_earned')      || [];
    this._renderBadges();
    this._renderChallenges();
    this._renderCompleted();
  },

  _renderBadges() {
    const showcase = document.getElementById('badges-showcase');
    const progressText = document.getElementById('badges-progress-text');
    if (!showcase) return;

    showcase.innerHTML = ALL_BADGES.map(b => {
      const earned = this._badges.includes(b.id);
      return `
        <div class="badge-item ${earned ? 'earned' : ''}"
          aria-label="${Utils.escape(b.name)} badge — ${earned ? 'earned' : 'locked'}: ${Utils.escape(b.desc)}">
          <div class="badge-emoji" aria-hidden="true">${Utils.escape(b.emoji)}</div>
          <div class="badge-name">${Utils.escape(b.name)}</div>
          ${earned ? '<div class="badge-earned-label">✓ Earned</div>' : ''}
        </div>
      `;
    }).join('');

    if (progressText) {
      progressText.textContent = `${this._badges.length} of ${ALL_BADGES.length} badges earned`;
    }
  },

  _renderChallenges() {
    const grid = document.getElementById('challenges-grid');
    if (!grid) return;

    const incomplete = CHALLENGE_DATA.filter(c => {
      const p = this._progress[c.id];
      return !p?.completed;
    });

    if (incomplete.length === 0) {
      grid.innerHTML = '<p style="color:var(--t3);text-align:center;padding:2rem">🎉 You\'ve completed all challenges! Amazing work!</p>';
      return;
    }

    grid.innerHTML = incomplete.map(c => {
      const p       = this._progress[c.id] || { steps: 0, completed: false };
      const pct     = Math.min((p.steps / c.totalSteps) * 100, 100);
      const started = p.steps > 0;

      return `
        <div class="challenge-card ${started ? 'active-challenge' : ''}" id="challenge-${Utils.escape(c.id)}">
          <div class="challenge-header">
            <div class="challenge-icon-wrap" aria-hidden="true">${Utils.escape(c.emoji)}</div>
            <div class="challenge-info">
              <div class="challenge-title">${Utils.escape(c.title)}</div>
              <p class="challenge-desc">${Utils.escape(c.desc)}</p>
            </div>
          </div>
          <div class="challenge-meta">
            <span class="challenge-meta-tag">📅 ${Utils.escape(c.duration)}</span>
            <span class="challenge-meta-tag">${Utils.escape(c.difficulty)}</span>
            <span class="challenge-meta-tag">${Utils.escape(c.impact)}</span>
            <span class="challenge-meta-tag">🏅 ${c.points} pts</span>
          </div>
          <div class="challenge-progress-wrap">
            <div class="challenge-progress-header">
              <span>${p.steps} / ${c.totalSteps} ${c.totalSteps <= 7 ? 'days' : 'steps'} completed</span>
              <span>${Math.round(pct)}%</span>
            </div>
            <div class="challenge-progress-bar" role="progressbar" aria-valuenow="${p.steps}" aria-valuemax="${c.totalSteps}" aria-label="${c.title} progress">
              <div class="challenge-progress-fill" style="width:${pct}%"></div>
            </div>
          </div>
          <div class="challenge-actions">
            <button class="challenge-progress-btn ${p.steps >= c.totalSteps ? 'complete' : ''}"
              data-challenge-id="${Utils.escape(c.id)}"
              aria-label="${p.steps >= c.totalSteps ? c.title + ' — complete!' : 'Log progress for ' + c.title}">
              ${p.steps >= c.totalSteps ? '🏆 Claim Badge' : (started ? '✓ Log Today\'s Progress' : '🚀 Start Challenge')}
            </button>
          </div>
          <div class="challenge-badge-info" style="font-size:0.8rem;color:var(--t3);margin-top:var(--s3)">
            🎖️ Badge reward: ${Utils.escape(c.badge)}
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.challenge-progress-btn').forEach(btn => {
      btn.addEventListener('click', () => this._logProgress(btn.dataset.challengeId));
    });
  },

  _logProgress(challengeId) {
    const challenge = CHALLENGE_DATA.find(c => c.id === challengeId);
    if (!challenge) return;

    if (!this._progress[challengeId]) {
      this._progress[challengeId] = { steps: 0, completed: false, startedAt: new Date().toISOString() };
    }

    const p = this._progress[challengeId];

    if (p.steps >= challenge.totalSteps) {
      // Complete the challenge
      this._completeChallenge(challengeId);
      return;
    }

    p.steps = Math.min(p.steps + 1, challenge.totalSteps);
    Store.set('challenge_progress', this._progress);

    if (p.steps >= challenge.totalSteps) {
      Toast.show('Challenge ready to claim! 🏆', `${challenge.title} — click again to claim your badge!`, 'eco');
    } else {
      Toast.show('Progress logged! 💪', `${challenge.title}: ${p.steps}/${challenge.totalSteps} steps done`, 'success', 3000);
    }

    // Re-render
    const grid = document.getElementById('challenges-grid');
    if (grid) grid.innerHTML = '';
    this._renderChallenges();
  },

  _completeChallenge(challengeId) {
    const challenge = CHALLENGE_DATA.find(c => c.id === challengeId);
    if (!challenge) return;

    this._progress[challengeId].completed = true;
    Store.set('challenge_progress', this._progress);

    /** Map from challenge ID to the badge ID awarded on completion. */
    const CHALLENGE_BADGE_MAP = {
      c1: 'plastic', c2: 'commuter', c3: 'energy',
      c4: 'water',   c5: 'foodie',   c6: 'waster'
    };
    const badgeId = CHALLENGE_BADGE_MAP[challengeId];
    if (badgeId && !this._badges.includes(badgeId)) {
      this._badges.push(badgeId);
      Store.set('badges_earned', this._badges);
    }

    Toast.show(
      `Challenge Complete! 🏆`,
      `You earned the "${challenge.badge}" badge! +${challenge.points} points!`,
      'eco', 6000
    );
    Utils.announce(`Challenge completed: ${challenge.title}. Badge awarded: ${challenge.badge}`);

    // Re-render everything
    this._renderBadges();
    const grid = document.getElementById('challenges-grid');
    if (grid) grid.innerHTML = '';
    this._renderChallenges();
    this._renderCompleted();

    EventBus.emit('challenge:completed', { challenge, badgeId });
  },

  _renderCompleted() {
    const container = document.getElementById('completed-challenges');
    if (!container) return;

    const done = CHALLENGE_DATA.filter(c => this._progress[c.id]?.completed);

    if (done.length === 0) {
      container.innerHTML = '<p style="color:var(--t3);font-size:0.875rem">No challenges completed yet. Start one above!</p>';
      return;
    }

    container.innerHTML = done.map(c => `
      <div class="completed-challenge-item">
        <div class="completed-challenge-icon" aria-hidden="true">${Utils.escape(c.emoji)}</div>
        <div class="completed-challenge-info">
          <div class="completed-challenge-name">${Utils.escape(c.title)}</div>
          <div class="completed-challenge-date">Completed</div>
        </div>
        <span class="completed-challenge-badge">${Utils.escape(c.badge)}</span>
      </div>
    `).join('');
  }
};


/* ═══════════════════════════════════════════════════
   23. DASHBOARD — Orchestrator
═══════════════════════════════════════════════════ */
const Dashboard = {
  /**
   * Boot the application in dependency order and register cross-module event listeners.
   * Called once on DOMContentLoaded (or immediately if the document is already ready).
   */
  init() {
    // Core UI modules first
    Toast.init();
    Navigation.init();
    ModuleCloser.init();

    // Dashboard widgets
    AwarenessBanner.init();
    StatsCards.init();
    CarbonScore.init();
    DailyFact.init();
    WeeklyChart.init();

    // Accessibility + assessment
    KeyboardNav.init();
    Assessment.init();

    // Update persona badge and score tag when assessment completes.
    EventBus.on('assessment:completed', ({ persona }) => {
      if (persona) {
        const ecoBadge = document.getElementById('eco-persona-badge');
        const scoreTag = document.getElementById('score-tag');
        if (ecoBadge && persona.name) ecoBadge.textContent = persona.name;
        if (scoreTag  && persona.name) scoreTag.textContent  = persona.name;
      }
    });

    // Refresh streak counter when a habit is logged.
    EventBus.on('habit:completed', () => { StatsCards.init(); });

    // Refresh badge counter when a challenge is completed.
    EventBus.on('challenge:completed', () => {
      const badgesCount = Store.get('badges_earned')?.length || 0;
      const badgesEl    = document.getElementById('badges-count');
      if (badgesEl) badgesEl.textContent = badgesCount;
    });

    EventBus.emit('dashboard:ready', { ts: Date.now() });

    console.info(
      '%c🌿 EcoPersona AI v2.0%c — Know Your Impact. Shape Your Future.\n9 Modules | Powered by Vanilla JS | LocalStorage | Chart.js',
      'color:#4ade80;font-weight:800;font-size:14px',
      'color:#94a3b8;font-size:11px'
    );
  }
};


/* ═══════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Dashboard.init());
} else {
  Dashboard.init();
}
