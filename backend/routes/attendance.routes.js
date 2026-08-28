const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { generateAttendanceQR, scanAttendanceQR, processAttendance } = require('../controllers/attendance.controller');

router.use(auth);

router.post('/generate-qr', authorize('SUPER_ADMIN'), generateAttendanceQR);
router.post('/scan', authorize('EVENT_MEMBER', 'SUPER_ADMIN'), scanAttendanceQR);
router.post('/process', authorize('EVENT_MEMBER', 'SUPER_ADMIN'), processAttendance);

module.exports = router;
