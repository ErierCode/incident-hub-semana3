const express = require('express');

function createDashboardRouter({ dashboard }) {
  const router = express.Router();

  router.get('/', async (_req, res) => {
    res.json(await dashboard.summary());
  });

  return router;
}

module.exports = { createDashboardRouter };
