const User = require('../models/User');
const EventRegistration = require('../models/EventRegistration');
const { uploadImage, deleteImage } = require('../services/cloudinary.service');

// GET /api/users/me
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, mobile } = req.body;
    const updates = {};
    
    // Only allow certain fields to be updated by user
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (mobile) updates.mobile = mobile;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/me/profile-image
exports.uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    const user = await User.findById(req.user._id);

    // Delete old image from Cloudinary if exists
    if (user.profileImage && user.profileImage.publicId) {
      await deleteImage(user.profileImage.publicId);
    }

    // Upload new image
    const result = await uploadImage(req.file.buffer, 'event-handling/profiles');

    user.profileImage = {
      url: result.url,
      publicId: result.publicId,
    };
    await user.save();

    res.json({
      message: 'Profile image updated successfully.',
      profileImage: user.profileImage,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me/e-card
exports.getIdentityECard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      year: user.year,
      className: user.className,
      rollNumber: user.rollNumber,
      profileImage: user.profileImage,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me/events
exports.getMyEvents = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({ userId: req.user._id })
      .populate('eventId')
      .sort({ joinedAt: -1 });

    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me/events/:eventId/e-card
exports.getEventECard = async (req, res, next) => {
  try {
    const registration = await EventRegistration.findOne({
      userId: req.user._id,
      eventId: req.params.eventId,
    }).populate('eventId');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found for this event.' });
    }

    const user = await User.findById(req.user._id);

    res.json({
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        year: user.year,
        className: user.className,
        rollNumber: user.rollNumber,
        profileImage: user.profileImage,
      },
      event: {
        eventId: registration.eventId.eventId,
        name: registration.eventId.name,
        date: registration.eventId.date,
        location: registration.eventId.location,
        startTime: registration.eventId.startTime,
        endTime: registration.eventId.endTime,
      },
      registration: {
        _id: registration._id,
        status: registration.status,
        attendanceQrGenerated: registration.attendanceQrGenerated,
        attendanceQrToken: registration.attendanceQrToken,
        joinedAt: registration.joinedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
