/**
 * History Route
 */

const { Router } = require('express');
const { getHistory, getTrend } = require('../controllers/history.controller');

const router = Router();

router.get('/', getHistory);
router.get('/trend', getTrend);

module.exports = router;
