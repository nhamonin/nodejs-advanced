const mongoose = require('mongoose');
require('dotenv').config({
  path: '.env.dev',
});
const Page = require('./helpers/page');

let page;

beforeAll(async () => {
  page = await Page.build('new');
});

beforeEach(async () => {
  await page.goto('http://localhost:3000');
});

afterAll(async () => {
  await page.close();
  await mongoose.disconnect();
});

test('Header logo has the correct text', async () => {
  const text = await page.$eval('a.brand-logo', (el) => el.innerHTML);

  expect(text).toEqual('Blogster');
});

test('Clicking login starts oauth flow', async () => {
  await page.click('.right a');

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {
  await page.login();
  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);

  expect(text).toEqual('Logout');
});
