const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const admin = require('../controllers/admin.controller');

router.use(auth);
router.use(authorize('SUPER_ADMIN'));

router.get('/', admin.getAllEvents);
router.post('/', admin.createEvent);
router.put('/:id', admin.updateEvent);
router.put('/:id/status', admin.updateEventStatus);
router.post('/:id/image', upload.single('eventImage'), admin.uploadEventImage);
router.get('/:id/participants', admin.getEventParticipants);

module.exports = router;
