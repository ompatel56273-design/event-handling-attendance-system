const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const admin = require('../controllers/admin.controller');

router.use(auth);
router.use(authorize('SUPER_ADMIN'));

router.get('/', admin.getAllRegistrations);
router.put('/:id', admin.updateRegistration);
router.delete('/:id', admin.deleteRegistration);

module.exports = router;
