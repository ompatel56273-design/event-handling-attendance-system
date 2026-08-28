const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { getEvents, getUpcomingEvents, getEvent, joinEvent, getEventParticipants } = require('../controllers/event.controller');

router.use(auth);

router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:eventId', getEvent);
router.get('/:eventId/participants', getEventParticipants);
router.post('/:eventId/join', authorize('USER'), joinEvent);

module.exports = router;
