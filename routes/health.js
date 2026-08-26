const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * GET /health
 * Public health check endpoint — no auth required.
 * Returns overall status, uptime, and MongoDB connection state.
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;

  // 0 = disconnected | 1 = connected | 2 = connecting | 3 = disconnecting
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1;

  const payload = {
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    services: {
      server: 'up',
      database: {
        status: dbStateMap[dbState] ?? 'unknown',
        healthy: isHealthy,
      },
    },
  };

  return res.status(isHealthy ? 200 : 503).json(payload);
});

module.exports = router;
