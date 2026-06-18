/**
 * EcoPersona AI — Basic Test Suite
 * 
 * To run these tests:
 * 1. Open index.html in the browser
 * 2. Open Developer Tools (F12)
 * 3. Copy and paste the contents of this file into the Console
 * 4. Press Enter
 */

(function runTests() {
  console.log('%c🧪 Starting EcoPersona AI Tests...', 'color: #10b981; font-weight: bold; font-size: 14px');
  
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`%c[PASS]%c ${message}`, 'color: #10b981; font-weight: bold', 'color: inherit');
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // --- Test Suite 1: Utils.escape ---
  console.log('\n%c--- Testing Security (Utils.escape) ---', 'color: #3b82f6; font-weight: bold');
  
  const xssString = '<script>alert("xss")</script> & "quotes" \'single\'';
  const escaped = Utils.escape(xssString);
  
  assert(escaped.indexOf('<script>') === -1, 'Escapes < and > tags');
  assert(escaped.indexOf('"') === -1, 'Escapes double quotes');
  assert(escaped.indexOf('\'') === -1, 'Escapes single quotes');
  assert(escaped.indexOf('& ') === -1, 'Escapes ampersand');

  // --- Test Suite 2: Store In-Memory Cache ---
  console.log('\n%c--- Testing Efficiency (Store Cache) ---', 'color: #3b82f6; font-weight: bold');
  
  const TEST_KEY = 'test_cache_key';
  Store.set(TEST_KEY, { value: 123 });
  
  // Directly modify localStorage to bypass cache
  localStorage.setItem('ecopersona_v2_' + TEST_KEY, JSON.stringify({ value: 999 }));
  
  // Store.get should return the cached value (123), not the new localStorage value (999)
  const cachedValue = Store.get(TEST_KEY);
  assert(cachedValue.value === 123, 'Store returns from memory cache instead of parsing localStorage');
  
  // Clean up
  Store.remove(TEST_KEY);
  assert(Store.get(TEST_KEY) === null, 'Store.remove clears memory cache and localStorage');

  // --- Test Suite 3: Assessment Logic ---
  console.log('\n%c--- Testing Assessment Logic ---', 'color: #3b82f6; font-weight: bold');
  
  assert(typeof Assessment._calculateScore === 'function', 'Assessment logic is accessible');
  
  const mockAnswers = {
    transport: 'bike',
    food: 'vegetarian',
    electricity: 'low',
    shopping: 'low',
    waste: 'low',
    water: 'low'
  };
  
  Assessment._answers = mockAnswers;
  const { total } = Assessment._calculateScore();
  assert(total === 6, 'Perfect eco answers yield a score of 6 (Champion)');
  
  const persona = Assessment._getPersona(total);
  assert(persona.id === 'champion', 'Score of 6 correctly mapped to Champion persona');

  // --- Summary ---
  console.log(`\n%c🏁 Tests Complete: ${passed} Passed, ${failed} Failed`, 
    failed === 0 ? 'color: #10b981; font-weight: bold' : 'color: #ef4444; font-weight: bold');
})();
