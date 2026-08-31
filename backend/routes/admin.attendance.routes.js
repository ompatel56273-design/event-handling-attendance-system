const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const admin = require('../controllers/admin.controller');

router.use(auth);
router.use(authorize('SUPER_ADMIN'));

router.get('/export', admin.exportAttendance);
router.get('/', admin.getAllAttendance);
router.get('/event/:eventId', admin.getAttendanceByEvent);
router.put('/:id', admin.updateAttendance);

module.exports = router;
