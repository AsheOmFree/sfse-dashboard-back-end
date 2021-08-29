const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const MemcachedStore = require('connect-memcached')(session);

/**
 * Routes
 */
const indexRoutes = require('./routes/index');
const gDriveRoutes = require('./routes/gdrive');

const config = dotenv.config();

const app = express();

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

app.use('/', indexRoutes);
app.use('/get_doc', gDriveRoutes);

module.exports = app;
