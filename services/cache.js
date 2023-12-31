const util = require('node:util');

const mongoose = require('mongoose');
const redis = require('redis');

const client = redis.createClient(process.env.REDIS_URI);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key ?? '');

  return this;
};

mongoose.Query.prototype.exec = async function (...args) {
  if (!this.useCache) {
    return exec.apply(this, args);
  }

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  });
  const cacheValue = await client.hget(this.hashKey, key);

  if (cacheValue) {
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc) ? doc.map((d) => new this.model(d)) : new this.model(doc);
  }

  const result = await exec.apply(this, args);
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
