const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { getWinners, getWinnersByEvent } = require('../controllers/winners.controller');

router.use(auth);

router.get('/', getWinners);
router.get('/event/:eventId', getWinnersByEvent);

module.exports = router;
