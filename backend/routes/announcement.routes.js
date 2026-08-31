const router = require('express').Router();
const announcementController = require('../controllers/announcement.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.use(auth);

// All authenticated users can view and mark read
router.get('/', announcementController.getAnnouncements);
router.put('/read-all', announcementController.markAllAsRead);
router.put('/:id/read', announcementController.markAsRead);

// Only SuperAdmin and Event Members can broadcast and delete
router.post(
  '/',
  authorize('SUPER_ADMIN', 'EVENT_MEMBER'),
  announcementController.createAnnouncement
);

router.delete(
  '/:id',
  authorize('SUPER_ADMIN', 'EVENT_MEMBER'),
  announcementController.deleteAnnouncement
);

module.exports = router;
