const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { changePasswordValidation } = require('../utils/validators');
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  getIdentityECard,
  getMyEvents,
  getEventECard,
} = require('../controllers/user.controller');

router.use(auth);
router.use(authorize('USER', 'SUPER_ADMIN'));

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/me/password', changePasswordValidation, validate, changePassword);
router.post('/me/profile-image', upload.single('profileImage'), uploadProfileImage);
router.get('/me/e-card', getIdentityECard);
router.get('/me/events', getMyEvents);
router.get('/me/events/:eventId/e-card', getEventECard);

module.exports = router;
