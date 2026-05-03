// Quick puppeteer script to fetch Namecheap domain list
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navigate to login
  await page.goto('https://www.namecheap.com/myaccount/login/', { waitUntil: 'networkidle2' });
  
  // Fill in credentials
  await page.type('input[name="LoginUserName"]', 'DaneWalter');
  await page.type('input[name="LoginPassword"]', 'Scarface.1234');
  
  // Submit login
  await Promise.all([
    page.click('input[type="submit"].nc_login_submit'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 })
  ]);
  
  // Navigate to domain list
  await page.goto('https://ap.www.namecheap.com/domains/list/', { waitUntil: 'networkidle2' });
  
  // Extract domain list
  const domains = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[data-domain]'));
    return rows.map(row => ({
      domain: row.getAttribute('data-domain'),
      status: row.querySelector('.domain-status')?.textContent?.trim(),
      expiry: row.querySelector('.expiry-date')?.textContent?.trim()
    }));
  });
  
  console.log(JSON.stringify(domains, null, 2));
  
  await browser.close();
})();
