const puppeteer = require('puppeteer');

test('We can launch a browser', async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000');

    const logoElement = await page.$('a.brand-logo');
    if (!logoElement) throw new Error('Element a.brand-logo not found');

    const text = await page.$eval('a.brand-logo', (el) => el.innerHTML);
    expect(text).toEqual('Blogster');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (browser) await browser.close();
  }
});
