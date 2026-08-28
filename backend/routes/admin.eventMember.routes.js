const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { eventMemberValidation } = require('../utils/validators');
const admin = require('../controllers/admin.controller');

router.use(auth);
router.use(authorize('SUPER_ADMIN'));

router.get('/', admin.getAllEventMembers);
router.post('/', eventMemberValidation, validate, admin.createEventMember);
router.put('/:id', admin.updateEventMember);
router.put('/:id/password', admin.resetEventMemberPassword);
router.put('/:id/status', admin.updateEventMemberStatus);

module.exports = router;
