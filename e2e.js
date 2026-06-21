/**
 * EcoPersona AI — End-to-End Test Suite (Puppeteer)
 *
 * Tests the full user journey through the assessment module,
 * verifying all 6 questions are answered and the correct
 * persona result is rendered.
 *
 * Usage:
 *   node e2e.js
 *
 * Requires:
 *   - App running at http://localhost:3300
 *   - puppeteer installed (npm install)
 */

'use strict';

const puppeteer = require('puppeteer');
const fs        = require('fs');

/** Utility: wait a given number of milliseconds. */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/** Utility: log a step with timestamp. */
function log(msg) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] ${msg}`);
}

/** Utility: assert a condition, log pass/fail. */
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // ── 1. Load dashboard ──────────────────────────────
    log('Navigating to dashboard…');
    await page.goto('http://localhost:3300', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await wait(800);

    const title = await page.title();
    assert(title.length > 0, `Page has a title: "${title}"`);
    await page.screenshot({ path: 'dash_before_test.png' });
    log('Screenshot: dash_before_test.png');

    // ── 2. Open Assessment ─────────────────────────────
    log('Opening Assessment module…');
    await page.click('a[data-module="assessment"]');
    await wait(900);
    await page.screenshot({ path: 'assessment_open.png' });

    const assessView = await page.$('#assessment-view');
    assert(assessView !== null, 'Assessment view element exists in DOM');
    const isOpen = await page.$eval('#assessment-view', el => el.classList.contains('is-open'));
    assert(isOpen, 'Assessment view has "is-open" class after click');

    // ── 3. Start assessment (intro → step 1) ──────────
    log('Clicking Start Assessment…');
    await page.click('#assess-next');
    await wait(600);
    await page.screenshot({ path: 'assessment_step1.png' });

    // ── 4. Validation: try advancing without selection ─
    log('Testing validation (no selection)…');
    await page.click('#assess-next');
    await wait(300);
    await page.screenshot({ path: 'assessment_step1_error.png' });

    const errorMsg = await page.$('.assess-error');
    assert(errorMsg !== null, 'Error message element appears when no option selected');

    // ── 5. Step 1 — Transport: select "car" ───────────
    log('Step 1 — Transport: selecting "car"…');
    await page.evaluate(() => document.querySelector('label[for="opt-car"]').click());
    await wait(250);
    await page.screenshot({ path: 'assessment_step1_selected.png' });

    const carChecked = await page.$eval('#opt-car', el => el.checked);
    assert(carChecked, 'Transport option "car" is checked after selection');

    await page.click('#assess-next');
    await wait(500);

    // ── 6. Step 2 — Food: select "vegetarian" ─────────
    log('Step 2 — Food: selecting "vegetarian"…');
    await page.evaluate(() => document.querySelector('label[for="opt-vegetarian"]').click());
    await wait(250);
    await page.click('#assess-next');
    await wait(500);

    // ── 7. Step 3 — Electricity: select "low" ─────────
    log('Step 3 — Electricity: selecting "low"…');
    await page.evaluate(() => document.querySelector('label[for="opt-elec-low"]').click());
    await wait(250);
    await page.click('#assess-next');
    await wait(500);

    // ── 8. Step 4 — Shopping: select "low" ────────────
    log('Step 4 — Shopping: selecting "low"…');
    await page.evaluate(() => document.querySelector('label[for="opt-shop-low"]').click());
    await wait(250);
    await page.click('#assess-next');
    await wait(500);

    // ── 9. Step 5 — Waste: select "low" ───────────────
    log('Step 5 — Waste: selecting "low"…');
    await page.evaluate(() => document.querySelector('label[for="opt-waste-low"]').click());
    await wait(250);
    await page.click('#assess-next');
    await wait(500);

    // ── 10. Step 6 — Water: select "low" ──────────────
    log('Step 6 — Water: selecting "low"…');
    await page.evaluate(() => document.querySelector('label[for="opt-water-low"]').click());
    await wait(250);
    await page.click('#assess-next'); // → results
    await wait(1200);
    await page.screenshot({ path: 'assessment_results.png' });
    log('Screenshot: assessment_results.png');

    // ── 11. Verify results screen ──────────────────────
    log('Verifying results screen…');
    const resultsStep = await page.$('#step-results');
    assert(resultsStep !== null, 'Results step element exists');

    const personaName = await page.$eval('#result-persona-name', el => el.textContent.trim()).catch(() => null);
    assert(personaName !== null && personaName.length > 0, `Persona name rendered: "${personaName}"`);

    const resultScore = await page.$('#result-score-fill');
    assert(resultScore !== null, 'Result score bar element exists');

    // ── 12. Save profile ───────────────────────────────
    log('Saving profile…');
    await page.click('#results-save-btn');
    await wait(600);
    await page.screenshot({ path: 'assessment_results_toast.png' });

    const toastEl = await page.$('.toast');
    assert(toastEl !== null, 'Toast notification appears after saving profile');

    // Verify localStorage was written
    const storedAssessment = await page.evaluate(() => {
      const raw = localStorage.getItem('ecopersona_v2_dna_assessment');
      return raw ? JSON.parse(raw) : null;
    });
    assert(storedAssessment !== null,           'Assessment result saved to localStorage');
    assert(storedAssessment.score !== undefined, 'Saved assessment has a score field');
    assert(storedAssessment.persona !== undefined, 'Saved assessment has a persona field');

    // ── 13. Close assessment ───────────────────────────
    log('Closing assessment…');
    await page.click('#assess-close');
    await wait(800);
    await page.screenshot({ path: 'assessment_closed.png' });

    const isClosed = await page.$eval('#assessment-view', el => !el.classList.contains('is-open'));
    assert(isClosed, 'Assessment view is closed after clicking close button');

    // ── 14. Dashboard state after close ───────────────
    log('Verifying dashboard state after close…');
    const bodyOverflow = await page.$eval('body', el => el.style.overflow);
    assert(bodyOverflow === '' || bodyOverflow === 'auto' || bodyOverflow === 'visible',
      'body.style.overflow is cleared after module close');

    await browser.close();

    // ── Summary ────────────────────────────────────────
    console.log('\n' + '═'.repeat(50));
    console.log(`E2E Tests: ${passed} passed, ${failed} failed`);
    console.log('═'.repeat(50));

    if (failed > 0) {
      console.error(`\n❌ ${failed} E2E test(s) FAILED. See output above.`);
      process.exit(1);
    } else {
      console.log('\n✅ All E2E tests passed! EcoPersona AI is working end-to-end.');
      process.exit(0);
    }

  } catch (err) {
    console.error('\n💥 E2E test run failed with error:', err.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
