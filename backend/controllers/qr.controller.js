const User = require('../models/User');

// POST /api/qr/identity/scan — Event Member or SuperAdmin scans Identity QR
exports.scanIdentityQR = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const query = userId.trim();
    const user = await User.findOne({
      $or: [
        { userId: { $regex: `^${query}$`, $options: 'i' } },
        { rollNumber: { $regex: `^${query}$`, $options: 'i' } },
        { email: query.toLowerCase() },
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'Student / User not found.' });
    }

    res.json({
      message: 'User found successfully.',
      user: {
        _id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        year: user.year,
        className: user.className,
        rollNumber: user.rollNumber,
        mobile: user.mobile,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};
