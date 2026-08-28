const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const admin = require('../controllers/admin.controller');

router.use(auth);
router.use(authorize('SUPER_ADMIN'));

router.get('/', admin.getAllUsers);
router.post('/', admin.createUser);
router.get('/:id', admin.getUserById);
router.put('/:id', admin.updateUser);
router.put('/:id/password', admin.resetUserPassword);
router.get('/:id/events', admin.getUserEvents);
router.get('/:id/attendance', admin.getUserAttendance);
router.get('/:id/marks', admin.getUserMarks);

module.exports = router;
