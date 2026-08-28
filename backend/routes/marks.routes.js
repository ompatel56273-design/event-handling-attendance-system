const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { createMarks, getMarksByEvent, getMarksForUserEvent } = require('../controllers/marks.controller');

router.use(auth);

router.post('/', authorize('EVENT_MEMBER', 'SUPER_ADMIN'), createMarks);
router.get('/event/:eventId', authorize('EVENT_MEMBER', 'SUPER_ADMIN'), getMarksByEvent);
router.get('/user/:userId/event/:eventId', authorize('EVENT_MEMBER', 'SUPER_ADMIN'), getMarksForUserEvent);

module.exports = router;
