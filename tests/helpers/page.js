const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class Page {
  static async build(mode) {
    const browser = await puppeteer.launch({
      headless: ['development', 'ci'].includes(process.env.NODE_ENV) ? mode : true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
    await this.page.goto('http://localhost:3000/blogs');

    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async logout() {
    await this.page.setCookie({ name: 'session', value: '' });
    await this.page.setCookie({ name: 'session.sig', value: '' });
    await this.page.goto('http://localhost:3000');
  }

  constructor(page) {
    this.page = page;
  }

  async getContentsOf(selector) {
    return await this.page.$eval(selector, (el) => el.innerHTML);
  }

  async get(path) {
    return await this.page.evaluate(async (_path) => {
      const result = await fetch(_path, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await result.json();
    }, path);
  }

  async post(path, body) {
    return await this.page.evaluate(
      async (_path, _body) => {
        const result = await fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: _body,
        });

        return await result.json();
      },
      path,
      JSON.stringify(body)
    );
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data);
      })
    );
  }
}

module.exports = Page;
