const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const admin = require('../controllers/admin.controller');

router.use(auth);
router.use(authorize('SUPER_ADMIN'));

router.post('/', admin.createWinner);
router.put('/:id', admin.updateWinner);
router.delete('/:id', admin.deleteWinner);

module.exports = router;
