const Page = require('./helpers/page');

let page;

beforeAll(async (done) => {
  page = await Page.build('new');
  done();
});

beforeEach(async () => {
  await page.goto('http://localhost:3000');
  await page.logout();
});

afterAll(async (done) => {
  await page.close();
  done();
});

test('Header logo has the correct text', async () => {
  const text = await page.getContentsOf('a.brand-logo');

  expect(text).toEqual('Blogster');
});

test('Clicking login starts oauth flow', async () => {
  await page.click('.right a');

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {
  await page.login();
  const text = await page.getContentsOf('a[href="/auth/logout"]');

  expect(text).toEqual('Logout');
});
