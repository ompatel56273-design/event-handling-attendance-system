const router = require('express').Router();
const feedbackController = require('../controllers/feedback.controller');
const auth = require('../middleware/auth.middleware');

// Public or auth event reviews breakdown
router.get('/event/:eventId', feedbackController.getEventFeedback);

// Authenticated user routes
router.post('/', auth, feedbackController.submitFeedback);
router.get('/my/:eventId', auth, feedbackController.getMyFeedback);

module.exports = router;
