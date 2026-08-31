const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const admin = require('../controllers/admin.controller');

router.use(auth);
router.use(authorize('SUPER_ADMIN'));

router.get('/export', admin.exportMarks);
router.get('/', admin.getAllMarks);
router.put('/:id', admin.updateMarks);

module.exports = router;
