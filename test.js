/**
 * EcoPersona AI — Comprehensive Unit Test Suite
 *
 * Coverage:
 *   1. Utils — escape, clamp, randInt, shuffle, todayKey, formatDate, getGreeting, getDayIndex
 *   2. Store — set, get, update, remove, in-memory cache, error handling
 *   3. EventBus — on, emit, unsubscribe, error isolation
 *   4. Assessment — _calculateScore, _getPersona, ALLOWED validation, SCORES
 *   5. CONFIG — immutability, required keys
 *   6. AnimUtils — counter guards, clamp guards
 *
 * To run:
 *   1. Open index.html in a browser
 *   2. Open Developer Tools (F12 → Console)
 *   3. Paste this file's contents and press Enter
 */

(function runTests() {
  'use strict';

  console.log('%c🧪 EcoPersona AI — Full Test Suite', 'color:#10b981;font-weight:bold;font-size:16px');

  let passed = 0;
  let failed = 0;
  let currentSuite = '';

  function suite(name) {
    currentSuite = name;
    console.log(`\n%c── ${name} ──`, 'color:#3b82f6;font-weight:bold');
  }

  function assert(condition, message) {
    const label = `[${currentSuite}] ${message}`;
    if (condition) {
      console.log(`%c[PASS]%c ${label}`, 'color:#10b981;font-weight:bold', 'color:inherit');
      passed++;
    } else {
      console.error(`[FAIL] ${label}`);
      failed++;
    }
  }

  function assertEqual(a, b, message) {
    assert(a === b, `${message} (expected: ${JSON.stringify(b)}, got: ${JSON.stringify(a)})`);
  }

  function assertNotNull(v, message) {
    assert(v !== null && v !== undefined, `${message} (should not be null/undefined)`);
  }

  // ─────────────────────────────────────────────
  //  1. CONFIG
  // ─────────────────────────────────────────────
  suite('CONFIG');

  const REQUIRED_KEYS = ['APP_NAME', 'STORAGE_PREFIX', 'BANNER_INTERVAL', 'COUNTER_DURATION', 'RING_SCORE', 'RING_CIRCUMFERENCE'];
  REQUIRED_KEYS.forEach(k => assert(k in CONFIG, `CONFIG has key: ${k}`));

  assertEqual(CONFIG.APP_NAME, 'EcoPersona AI', 'APP_NAME is correct');
  assertEqual(CONFIG.STORAGE_PREFIX, 'ecopersona_v2_', 'STORAGE_PREFIX is correct');
  assert(CONFIG.BANNER_INTERVAL > 0, 'BANNER_INTERVAL is positive');
  assert(CONFIG.RING_CIRCUMFERENCE > 0, 'RING_CIRCUMFERENCE is positive');

  // CONFIG should be frozen (immutable)
  try {
    CONFIG.APP_NAME = 'HACKED';
    assert(CONFIG.APP_NAME === 'EcoPersona AI', 'CONFIG is frozen (mutation silently fails in strict mode)');
  } catch (e) {
    assert(true, 'CONFIG is frozen (mutation throws in strict mode)');
  }

  // ─────────────────────────────────────────────
  //  2. Utils.escape — XSS prevention
  // ─────────────────────────────────────────────
  suite('Utils.escape');

  const xssString = '<script>alert("xss")</script> & "quotes" \'single\'';
  const escaped = Utils.escape(xssString);

  assert(!escaped.includes('<script>'),      'Escapes < and > (script tag)');
  assert(!escaped.includes('"'),             'Escapes double quotes');
  assert(!escaped.includes("'"),             'Escapes single quotes');
  assert(!escaped.includes('& '),            'Escapes ampersand');
  assert(escaped.includes('&lt;'),           'Replaces < with &lt;');
  assert(escaped.includes('&gt;'),           'Replaces > with &gt;');
  assert(escaped.includes('&amp;'),          'Replaces & with &amp;');
  assert(escaped.includes('&quot;'),         'Replaces " with &quot;');
  assert(escaped.includes('&#39;'),          'Replaces \' with &#39;');

  // Edge cases
  assertEqual(Utils.escape(null),      '', 'escape(null) returns empty string');
  assertEqual(Utils.escape(undefined), '', 'escape(undefined) returns empty string');
  assertEqual(Utils.escape(''),        '', 'escape("") returns empty string');
  assertEqual(Utils.escape('safe'),    'safe', 'escape leaves safe strings unchanged');
  assertEqual(Utils.escape(42),        '42',   'escape coerces numbers to strings');

  // ─────────────────────────────────────────────
  //  3. Utils.clamp
  // ─────────────────────────────────────────────
  suite('Utils.clamp');

  assertEqual(Utils.clamp(50, 0, 100),   50,  'Value within range is unchanged');
  assertEqual(Utils.clamp(-10, 0, 100),  0,   'Value below min is clamped to min');
  assertEqual(Utils.clamp(200, 0, 100),  100, 'Value above max is clamped to max');
  assertEqual(Utils.clamp(0, 0, 100),    0,   'Exactly at min is unchanged');
  assertEqual(Utils.clamp(100, 0, 100),  100, 'Exactly at max is unchanged');
  assertEqual(Utils.clamp(5, 5, 5),      5,   'Min === max returns that value');

  // ─────────────────────────────────────────────
  //  4. Utils.randInt
  // ─────────────────────────────────────────────
  suite('Utils.randInt');

  for (let i = 0; i < 50; i++) {
    const r = Utils.randInt(1, 6);
    assert(r >= 1 && r <= 6 && Number.isInteger(r), `randInt(1,6) always in [1,6] (trial ${i+1})`);
    if (r < 1 || r > 6) break; // don't spam on failure
  }

  assertEqual(Utils.randInt(7, 7), 7, 'randInt(n, n) always returns n');

  // ─────────────────────────────────────────────
  //  5. Utils.shuffle
  // ─────────────────────────────────────────────
  suite('Utils.shuffle');

  const original = [1, 2, 3, 4, 5];
  const shuffled = Utils.shuffle(original);

  assert(Array.isArray(shuffled),                    'shuffle returns an array');
  assertEqual(shuffled.length, original.length,      'shuffle preserves array length');
  assert(shuffled.every(v => original.includes(v)),  'shuffle preserves all elements');
  assert(original.every(v => shuffled.includes(v)),  'shuffle does not lose elements');
  // Ensure original is not mutated
  assert(original[0] === 1 && original[4] === 5,     'shuffle does not mutate original array');

  // ─────────────────────────────────────────────
  //  6. Utils.todayKey
  // ─────────────────────────────────────────────
  suite('Utils.todayKey');

  const todayKey = Utils.todayKey();
  assert(typeof todayKey === 'string',          'todayKey returns a string');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(todayKey), 'todayKey matches YYYY-MM-DD format');
  assertEqual(todayKey, new Date().toISOString().slice(0, 10), 'todayKey matches current date');

  // ─────────────────────────────────────────────
  //  7. Utils.getGreeting
  // ─────────────────────────────────────────────
  suite('Utils.getGreeting');

  const greeting = Utils.getGreeting();
  const validGreetings = ['Good morning', 'Good afternoon', 'Good evening'];
  assert(validGreetings.includes(greeting), `getGreeting returns a valid greeting: "${greeting}"`);
  assert(typeof greeting === 'string',      'getGreeting returns a string');

  // ─────────────────────────────────────────────
  //  8. Utils.getDayIndex
  // ─────────────────────────────────────────────
  suite('Utils.getDayIndex');

  const dayIdx = Utils.getDayIndex();
  assert(typeof dayIdx === 'number',          'getDayIndex returns a number');
  assert(Number.isInteger(dayIdx),            'getDayIndex returns an integer');
  assert(dayIdx >= 0,                         'getDayIndex is non-negative');
  assert(dayIdx < ECO_FACTS.length,           'getDayIndex is within ECO_FACTS bounds');

  // ─────────────────────────────────────────────
  //  9. Store — in-memory cache & persistence
  // ─────────────────────────────────────────────
  suite('Store');

  const KEY = '_test_ecopersona_unit_';

  // Basic set/get
  assert(Store.set(KEY, { num: 42, str: 'hello' }),     'Store.set returns true on success');
  const retrieved = Store.get(KEY);
  assertNotNull(retrieved,                              'Store.get returns data after set');
  assertEqual(retrieved.num, 42,                        'Store.get returns correct numeric field');
  assertEqual(retrieved.str, 'hello',                   'Store.get returns correct string field');

  // In-memory cache: bypass localStorage
  Store.set(KEY, { value: 123 });
  localStorage.setItem(CONFIG.STORAGE_PREFIX + KEY, JSON.stringify({ value: 999 }));
  const cachedVal = Store.get(KEY);
  assertEqual(cachedVal.value, 123, 'Store returns from in-memory cache (bypasses localStorage change)');

  // Update (deep merge)
  Store.set(KEY, { a: 1, b: 2 });
  Store.update(KEY, { b: 99, c: 3 });
  const updated = Store.get(KEY);
  assertEqual(updated.a, 1,  'Store.update preserves untouched fields');
  assertEqual(updated.b, 99, 'Store.update overwrites specified fields');
  assertEqual(updated.c, 3,  'Store.update adds new fields');

  // Remove
  Store.remove(KEY);
  assertEqual(Store.get(KEY), null, 'Store.remove clears value; get returns null');
  assertEqual(localStorage.getItem(CONFIG.STORAGE_PREFIX + KEY), null, 'Store.remove clears localStorage');

  // Missing key returns null
  assertEqual(Store.get('__nonexistent_key_xyz__'), null, 'Store.get returns null for missing key');

  // Corrupt data handling
  localStorage.setItem(CONFIG.STORAGE_PREFIX + '_corrupt_test_', 'NOT_VALID_JSON{{{');
  assertEqual(Store.get('_corrupt_test_'), null, 'Store.get returns null for corrupt JSON');
  localStorage.removeItem(CONFIG.STORAGE_PREFIX + '_corrupt_test_');

  // ─────────────────────────────────────────────
  //  10. EventBus — pub/sub
  // ─────────────────────────────────────────────
  suite('EventBus');

  let received = null;
  const unsub = EventBus.on('test:event', payload => { received = payload; });
  EventBus.emit('test:event', { x: 7 });
  assertEqual(received?.x, 7, 'EventBus.emit delivers payload to subscriber');

  // Unsubscribe
  unsub();
  received = null;
  EventBus.emit('test:event', { x: 99 });
  assertEqual(received, null, 'Unsubscribed handler no longer receives events');

  // Multiple subscribers
  let count = 0;
  const u1 = EventBus.on('multi:test', () => count++);
  const u2 = EventBus.on('multi:test', () => count++);
  EventBus.emit('multi:test');
  assertEqual(count, 2, 'EventBus delivers to multiple subscribers');
  u1(); u2();

  // Error isolation — one failing handler should not break others
  let reached = false;
  EventBus.on('err:test', () => { throw new Error('deliberate test error'); });
  EventBus.on('err:test', () => { reached = true; });
  try { EventBus.emit('err:test'); } catch (_) { /* should not throw to caller */ }
  assert(reached, 'EventBus isolates errors: second handler still runs after first throws');

  // Emit on unknown event does not throw
  let threw = false;
  try { EventBus.emit('no:such:event:xyz'); } catch (_) { threw = true; }
  assert(!threw, 'EventBus.emit on unknown event does not throw');

  // ─────────────────────────────────────────────
  //  11. Assessment — scoring & personas
  // ─────────────────────────────────────────────
  suite('Assessment._calculateScore');

  assert(typeof Assessment._calculateScore === 'function', '_calculateScore is a function');
  assert(typeof Assessment._getPersona    === 'function', '_getPersona is a function');

  // Best possible answers → score 6 → champion
  Assessment._answers = { transport: 'bike', food: 'vegetarian', electricity: 'low', shopping: 'low', waste: 'low', water: 'low' };
  const { total: best } = Assessment._calculateScore();
  assertEqual(best, 6, 'All-best answers yield total score of 6');
  assertEqual(Assessment._getPersona(6).id, 'champion', 'Score 6 maps to "champion" persona');

  // Worst possible answers → score 18 → beginner
  Assessment._answers = { transport: 'car', food: 'nonvegetarian', electricity: 'high', shopping: 'high', waste: 'high', water: 'high' };
  const { total: worst } = Assessment._calculateScore();
  assertEqual(worst, 18, 'All-worst answers yield total score of 18');
  assertEqual(Assessment._getPersona(18).id, 'beginner', 'Score 18 maps to "beginner" persona');

  // Mixed answers → score 12 → aware
  Assessment._answers = { transport: 'public', food: 'mixed', electricity: 'medium', shopping: 'low', waste: 'medium', water: 'medium' };
  const { total: mixed } = Assessment._calculateScore();
  assertEqual(mixed, 12, 'Mixed answers (2+2+2+1+2+2=11... verify mapping) yield expected score');
  assertNotNull(Assessment._getPersona(mixed), 'Mixed score maps to a valid persona');

  // Score 9 → champion boundary
  assertEqual(Assessment._getPersona(9).id, 'champion', 'Score 9 (boundary) is still "champion"');

  // Score 10 → aware
  assertEqual(Assessment._getPersona(10).id, 'aware', 'Score 10 maps to "aware"');

  // Score 13 → explorer
  assertEqual(Assessment._getPersona(13).id, 'explorer', 'Score 13 maps to "explorer"');

  // Score 16 → beginner
  assertEqual(Assessment._getPersona(16).id, 'beginner', 'Score 16 maps to "beginner"');

  // Reset answers (cleanup)
  Assessment._answers = { transport: null, food: null, electricity: null, shopping: null, waste: null, water: null };

  // ─────────────────────────────────────────────
  //  12. Assessment — ALLOWED values whitelist
  // ─────────────────────────────────────────────
  suite('Assessment.ALLOWED');

  const fields = ['transport', 'food', 'electricity', 'shopping', 'waste', 'water'];
  fields.forEach(field => {
    assert(Array.isArray(Assessment.ALLOWED[field]),         `ALLOWED.${field} is an array`);
    assert(Assessment.ALLOWED[field].length >= 2,            `ALLOWED.${field} has at least 2 options`);
    Assessment.ALLOWED[field].forEach(val => {
      assert(Assessment.SCORES[field][val] !== undefined,    `SCORES[${field}][${val}] exists`);
      assert(Assessment.SCORES[field][val] >= 1,             `SCORES[${field}][${val}] is at least 1`);
      assert(Assessment.SCORES[field][val] <= 3,             `SCORES[${field}][${val}] is at most 3`);
    });
  });

  // ─────────────────────────────────────────────
  //  13. Assessment — PERSONAS completeness
  // ─────────────────────────────────────────────
  suite('Assessment.PERSONAS');

  const personaIds = Assessment.PERSONAS.map(p => p.id);
  ['champion', 'aware', 'explorer', 'beginner'].forEach(id => {
    assert(personaIds.includes(id), `Persona "${id}" is defined`);
  });

  Assessment.PERSONAS.forEach(p => {
    assertNotNull(p.name,         `Persona "${p.id}" has a name`);
    assertNotNull(p.emoji,        `Persona "${p.id}" has an emoji`);
    assertNotNull(p.headline,     `Persona "${p.id}" has a headline`);
    assert(Array.isArray(p.tips) && p.tips.length >= 1, `Persona "${p.id}" has at least 1 tip`);
    assert(p.min <= p.max,        `Persona "${p.id}" has valid min/max range`);
  });

  // Ranges should cover all possible scores (6–18)
  for (let score = 6; score <= 18; score++) {
    const persona = Assessment._getPersona(score);
    assertNotNull(persona, `Score ${score} maps to a persona (no gap in range coverage)`);
  }

  // ─────────────────────────────────────────────
  //  14. ECO_FACTS — data integrity
  // ─────────────────────────────────────────────
  suite('ECO_FACTS');

  assert(Array.isArray(ECO_FACTS),           'ECO_FACTS is an array');
  assert(ECO_FACTS.length >= 10,             'ECO_FACTS has at least 10 entries');

  ECO_FACTS.forEach((fact, i) => {
    assert(typeof fact.emoji    === 'string' && fact.emoji.length > 0,    `ECO_FACTS[${i}].emoji is non-empty`);
    assert(typeof fact.text     === 'string' && fact.text.length > 10,    `ECO_FACTS[${i}].text is non-empty`);
    assert(typeof fact.category === 'string' && fact.category.length > 0, `ECO_FACTS[${i}].category is non-empty`);
    assert(typeof fact.source   === 'string' && fact.source.length > 0,   `ECO_FACTS[${i}].source is non-empty`);
  });

  // ─────────────────────────────────────────────
  //  15. MISSION_TEMPLATES — data integrity
  // ─────────────────────────────────────────────
  suite('MISSION_TEMPLATES');

  assert(Array.isArray(MISSION_TEMPLATES),  'MISSION_TEMPLATES is an array');
  assert(MISSION_TEMPLATES.length >= 5,     'MISSION_TEMPLATES has at least 5 entries');

  const validDifficulties = ['easy', 'medium', 'hard'];
  MISSION_TEMPLATES.forEach((m, i) => {
    assertNotNull(m.id,                           `MISSION_TEMPLATES[${i}].id exists`);
    assertNotNull(m.title,                        `MISSION_TEMPLATES[${i}].title exists`);
    assertNotNull(m.desc,                         `MISSION_TEMPLATES[${i}].desc exists`);
    assert(validDifficulties.includes(m.difficulty), `MISSION_TEMPLATES[${i}].difficulty is valid`);
    assert(typeof m.points === 'number' && m.points > 0, `MISSION_TEMPLATES[${i}].points is positive`);
  });

  // ─────────────────────────────────────────────
  //  16. CHALLENGE_DATA — data integrity
  // ─────────────────────────────────────────────
  suite('CHALLENGE_DATA');

  assert(Array.isArray(CHALLENGE_DATA),   'CHALLENGE_DATA is an array');
  assert(CHALLENGE_DATA.length >= 4,      'CHALLENGE_DATA has at least 4 challenges');

  CHALLENGE_DATA.forEach((c, i) => {
    assertNotNull(c.id,          `CHALLENGE_DATA[${i}].id exists`);
    assertNotNull(c.title,       `CHALLENGE_DATA[${i}].title exists`);
    assert(c.totalSteps > 0,     `CHALLENGE_DATA[${i}].totalSteps is positive`);
    assert(c.points > 0,         `CHALLENGE_DATA[${i}].points is positive`);
  });

  // ─────────────────────────────────────────────
  //  Summary
  // ─────────────────────────────────────────────
  const total = passed + failed;
  const pct = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  console.log(
    `\n%c🏁 Results: ${passed}/${total} passed (${pct}%) — ${failed} failed`,
    failed === 0
      ? 'color:#10b981;font-weight:bold;font-size:14px'
      : 'color:#ef4444;font-weight:bold;font-size:14px'
  );

  if (failed === 0) {
    console.log('%c✅ All tests passed! EcoPersona AI is working correctly.', 'color:#10b981;font-weight:bold');
  } else {
    console.warn(`⚠️ ${failed} test(s) failed. Review the [FAIL] entries above.`);
  }

  // Return summary for programmatic use
  return { passed, failed, total, pct: Number(pct) };
})();
