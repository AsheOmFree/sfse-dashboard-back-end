const NodeCache = require('node-cache');

let cache;

function createCache() {
  console.log('Creating cache!');
  cache = new NodeCache();
  return cache;
}

function getCache() {
  if (cache) {
    return cache;
  }
}

module.exports = { createCache, getCache };
