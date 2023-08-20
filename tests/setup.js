const mongoose = require('mongoose');
require('dotenv').config({
  path: '.env.dev',
});
require('../models/User');
const Page = require('./helpers/page');

mongoose.Promise = global.Promise;

mongoose.connection
  .once('open', () => console.log('Connected to MongoDB instance.'))
  .on('error', (error) => console.log('Error connecting to MongoDB:', error));

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

let page;

beforeEach(async () => {
  page = await Page.build('new');
  await page.goto('http://localhost:3000');
  global.page = page;
});

afterEach(async () => {
  await page.close();
});

afterAll(async () => {
  await mongoose.disconnect();
});
