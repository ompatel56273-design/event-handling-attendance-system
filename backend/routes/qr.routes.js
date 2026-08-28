const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { scanIdentityQR } = require('../controllers/qr.controller');

router.use(auth);
router.post('/identity/scan', authorize('EVENT_MEMBER', 'SUPER_ADMIN'), scanIdentityQR);

module.exports = router;
