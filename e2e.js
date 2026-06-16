const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3300');
  await page.setViewport({width: 1080, height: 1024});

  console.log('Opened Dashboard');
  await page.screenshot({ path: 'dash_before_test.png' });

  // click on Lifestyle DNA link
  await page.click('a[data-module="assessment"]');
  console.log('Clicked Assessment module');
  
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'assessment_open.png' });
  
  // Start assessment
  await page.click('#assess-next');
  console.log('Started Assessment');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'assessment_step1.png' });
  
  // Try continuing without selection
  await page.click('#assess-next');
  console.log('Tried next without selection');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'assessment_step1_error.png' });
  
  // Select car
  await page.evaluate(() => {
    document.querySelector('label[for="opt-car"]').click();
  });
  console.log('Selected car');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'assessment_step1_selected.png' });

  // next
  await page.click('#assess-next');
  await new Promise(r => setTimeout(r, 500));
  
  // Select vegetarian
  await page.evaluate(() => { document.querySelector('label[for="opt-vegetarian"]').click(); });
  await page.click('#assess-next');
  await new Promise(r => setTimeout(r, 500));
  
  // Select low elec
  await page.evaluate(() => { document.querySelector('label[for="opt-elec-low"]').click(); });
  await page.click('#assess-next');
  await new Promise(r => setTimeout(r, 500));
  
  // Select low shopping
  await page.evaluate(() => { document.querySelector('label[for="opt-shop-low"]').click(); });
  await page.click('#assess-next');
  await new Promise(r => setTimeout(r, 500));

  // Select low waste
  await page.evaluate(() => { document.querySelector('label[for="opt-waste-low"]').click(); });
  await page.click('#assess-next'); // Go to results
  console.log('Finished assessment questions, viewing results');
  
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'assessment_results.png' });
  
  // Save profile
  await page.click('#results-save-btn');
  console.log('Saved profile');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'assessment_results_toast.png' });
  
  // Close
  await page.click('#assess-close');
  console.log('Closed assessment');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'assessment_closed.png' });

  await browser.close();
  console.log('Test completed successfully!');
})();
