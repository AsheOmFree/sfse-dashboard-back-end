const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const MemcachedStore = require('connect-memcached')(session);

const GoogleDriveApi = require('./services/gdrive');
const { createCache } = require('./services/cache');
const Db = require('./db/config');

/**
 * Routes
 */
const indexRoutes = require('./routes/index');
const gDriveRoutes = require('./routes/gdrive');

const config = dotenv.config();

const cache = createCache();

const app = express();

/**
 * Cache database handle
 */
const dbHandle = new Db();
cache.set('db', dbHandle);

/**
 * Refresh spreadsheet if saved version is outdated
 */
const gDrive = new GoogleDriveApi();
gDrive.initialize().then(async (instance) => {
  cache.set('gDriveInstance', instance);
  const isUpdated = await gDrive.hasSpreadsheetBeenUpdated();
  if (isUpdated) {
    // Drop and create db with latest data
    gDrive.refreshSpreadsheet();
  }
});

/**
 * Session middleware
 */
const maxAge = 1000 * 60 * 60 * 2;
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'my-session-secret',
    cookie: { maxAge },
    store: new MemcachedStore({
      hosts: [process.env.MEMCACHE_URL || '127.0.0.1:11211'],
    }),
  })
);

/**
 * CORS middleware
 */
app.use(
  cors({
    origin: '*',
  })
);

/**
 * Configure routes
 */
app.use('/', indexRoutes);
app.use('/data', gDriveRoutes);

module.exports = app;
