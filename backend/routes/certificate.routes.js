const router = require('express').Router();
const certificateController = require('../controllers/certificate.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// Public verification route (no auth needed)
router.get('/verify/:certificateId', certificateController.verifyCertificate);

// Student protected route
router.get('/my-certificates', auth, certificateController.getMyCertificates);

// SuperAdmin & Event Member protected bulk issue route
router.post(
  '/events/:eventId/issue-all',
  auth,
  authorize('SUPER_ADMIN', 'EVENT_MEMBER'),
  certificateController.issueEventCertificates
);

module.exports = router;
