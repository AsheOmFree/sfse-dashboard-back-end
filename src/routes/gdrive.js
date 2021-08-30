const express = require('express');
const DbHandle = require('./../db/config');

const { getCache } = require('./../services/cache');

const router = express.Router();

router.route('/').get(async (req, res) => {
  const cache = getCache();
  const db = cache ? cache.get('db') : new DbHandle();
  const results = await db.getData();
  res.send({ results });
});

module.exports = router;
