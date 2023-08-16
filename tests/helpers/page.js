const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class Page {
  static async build(mode) {
    const browser = await puppeteer.launch({
      headless: mode,
    });
    const page = await browser.newPage();
    const customPage = new Page(page);

    return new Proxy(customPage, {
      get: (target, property) => {
        return target[property] || browser[property] || page[property];
      },
    });
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('http://localhost:3000');

    await this.page.waitFor('a[href="/auth/logout"]');
  }

  constructor(page) {
    this.page = page;
  }
}

module.exports = Page;
