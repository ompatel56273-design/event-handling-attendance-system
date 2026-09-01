const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { getEvents, getUpcomingEvents, getEvent, joinEvent, getEventParticipants } = require('../controllers/event.controller');

// Public routes for unauthenticated landing visitors
router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:eventId', getEvent);

// Protected user routes
router.get('/:eventId/participants', auth, getEventParticipants);
router.post('/:eventId/join', auth, authorize('USER'), joinEvent);

module.exports = router;
