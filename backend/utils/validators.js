const { body } = require('express-validator');

const signupValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('department').isIn(['BCA', 'BSc CA & IT']).withMessage('Invalid department'),
  body('year').isIn([1, 2, 3, 4]).withMessage('Year must be 1, 2, 3, or 4'),
  body('className').isIn(['A', 'B', 'C']).withMessage('Class must be A, B, or C'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('mobile').matches(/^\d{10}$/).withMessage('Mobile must be exactly 10 digits'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

const eventValidation = [
  body('name').trim().notEmpty().withMessage('Event name is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('registrationStart').isISO8601().withMessage('Valid registration start date is required'),
  body('registrationEnd').isISO8601().withMessage('Valid registration end date is required'),
  body('maxParticipants').isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
];

const eventMemberValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

module.exports = {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  eventValidation,
  eventMemberValidation,
};
