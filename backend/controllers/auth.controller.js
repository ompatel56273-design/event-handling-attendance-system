const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const EventMember = require('../models/EventMember');
const { generateUserId, generateToken } = require('../utils/generateId');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');

// Generate JWT token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    res.json({
      role: req.userRole,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, department, year, className, rollNumber, mobile, email, password } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    // Check if email already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // Generate unique userId
    let userId;
    let exists = true;
    while (exists) {
      userId = generateUserId();
      exists = await User.findOne({ userId });
    }

    // Generate verification token
    const emailVerificationToken = generateToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new User({
      userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      department,
      year: parseInt(year),
      className,
      rollNumber: rollNumber.trim(),
      mobile: mobile.trim(),
      email: cleanEmail,
      password,
      emailVerificationToken,
      emailVerificationExpires,
    });

    await user.save();

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    try {
      await sendVerificationEmail(cleanEmail, `${firstName} ${lastName}`, verificationLink);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
    }

    res.status(201).json({
      message: 'Account created successfully. Please check your email to verify your account.',
      userId: user.userId,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    // Check users collection first (USER and SUPER_ADMIN)
    let account = await User.findOne({ email: cleanEmail });
    let role = account?.role;
    let model = 'User';

    // If not found in users, check event members
    if (!account) {
      account = await EventMember.findOne({ email: cleanEmail });
      role = 'EVENT_MEMBER';
      model = 'EventMember';
    }

    if (!account) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check account status
    if (model === 'User' && account.accountStatus !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is suspended. Contact administrator.' });
    }
    if (model === 'EventMember' && account.accountStatus !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is disabled. Contact administrator.' });
    }

    // Check email verification for regular users
    if (model === 'User' && role === 'USER' && !account.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = signToken(account._id, role);

    const responseData = {
      token,
      role,
      user: model === 'User' ? {
        _id: account._id,
        userId: account.userId,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        department: account.department,
        year: account.year,
        className: account.className,
        rollNumber: account.rollNumber,
        mobile: account.mobile,
        profileImage: account.profileImage,
        role: account.role,
      } : {
        _id: account._id,
        name: account.name,
        email: account.email,
        role: 'EVENT_MEMBER',
      },
    };

    res.json(responseData);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    const resetToken = generateToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    try {
      await sendPasswordResetEmail(email, `${user.firstName} ${user.lastName}`, resetLink);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError.message);
    }

    res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    next(error);
  }
};
