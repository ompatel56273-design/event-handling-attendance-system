const router = require('express').Router();
const { getWinners, getWinnersByEvent } = require('../controllers/winners.controller');

// Public routes for landing visitors
router.get('/', getWinners);
router.get('/event/:eventId', getWinnersByEvent);

module.exports = router;
