const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Event = require('../models/Event');
const { generateAttendanceToken, verifyAttendanceToken } = require('../services/qr.service');

// POST /api/attendance/generate-qr — SuperAdmin generates attendance QR
exports.generateAttendanceQR = async (req, res, next) => {
  try {
    const { registrationId } = req.body;

    const registration = await EventRegistration.findById(registrationId)
      .populate('userId')
      .populate('eventId');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    if (registration.status === 'REMOVED_BY_ADMIN') {
      return res.status(400).json({ message: 'This registration has been removed.' });
    }

    // Generate attendance token
    const token = generateAttendanceToken(
      registration._id,
      registration.userId._id,
      registration.eventId._id
    );

    registration.attendanceQrGenerated = true;
    registration.attendanceQrToken = token;
    await registration.save();

    res.json({
      message: 'Attendance QR generated successfully.',
      attendanceQrToken: token,
      user: {
        userId: registration.userId.userId,
        firstName: registration.userId.firstName,
        lastName: registration.userId.lastName,
        department: registration.userId.department,
        year: registration.userId.year,
        className: registration.userId.className,
        rollNumber: registration.userId.rollNumber,
        profileImage: registration.userId.profileImage,
      },
      event: {
        eventId: registration.eventId.eventId,
        name: registration.eventId.name,
        date: registration.eventId.date,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance/scan — Event Member or SuperAdmin scans attendance QR
exports.scanAttendanceQR = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Verify the attendance token
    let decoded;
    try {
      decoded = verifyAttendanceToken(token);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired attendance QR code.' });
    }

    // Verify registration exists
    const registration = await EventRegistration.findById(decoded.registrationId)
      .populate('userId')
      .populate('eventId');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    if (registration.status === 'REMOVED_BY_ADMIN') {
      return res.status(400).json({ message: 'This registration has been removed.' });
    }

    // Verify the user+event relationship matches
    if (
      registration.userId._id.toString() !== decoded.userId ||
      registration.eventId._id.toString() !== decoded.eventId
    ) {
      return res.status(400).json({ message: 'QR data does not match registration.' });
    }

    // Check for existing attendance
    const existingAttendance = await Attendance.findOne({
      userId: decoded.userId,
      eventId: decoded.eventId,
    });

    if (existingAttendance && existingAttendance.status !== 'PENDING') {
      return res.json({
        message: `Attendance already processed: ${existingAttendance.status}`,
        alreadyProcessed: true,
        attendance: existingAttendance,
        registrationId: registration._id,
        user: {
          _id: registration.userId._id,
          userId: registration.userId.userId,
          firstName: registration.userId.firstName,
          lastName: registration.userId.lastName,
          department: registration.userId.department,
          year: registration.userId.year,
          className: registration.userId.className,
          rollNumber: registration.userId.rollNumber,
          mobile: registration.userId.mobile,
          email: registration.userId.email,
          profileImage: registration.userId.profileImage,
        },
        event: {
          _id: registration.eventId._id,
          eventId: registration.eventId.eventId,
          name: registration.eventId.name,
          date: registration.eventId.date,
          location: registration.eventId.location,
        },
      });
    }

    res.json({
      message: 'QR scanned successfully.',
      alreadyProcessed: false,
      registrationId: registration._id,
      user: {
        _id: registration.userId._id,
        userId: registration.userId.userId,
        firstName: registration.userId.firstName,
        lastName: registration.userId.lastName,
        department: registration.userId.department,
        year: registration.userId.year,
        className: registration.userId.className,
        rollNumber: registration.userId.rollNumber,
        mobile: registration.userId.mobile,
        email: registration.userId.email,
        profileImage: registration.userId.profileImage,
      },
      event: {
        _id: registration.eventId._id,
        eventId: registration.eventId.eventId,
        name: registration.eventId.name,
        date: registration.eventId.date,
        location: registration.eventId.location,
      },
      existingAttendance,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance/process — Accept or Decline attendance
exports.processAttendance = async (req, res, next) => {
  try {
    const { registrationId, userId, eventId, action } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(action)) {
      return res.status(400).json({ message: 'Action must be ACCEPTED or DECLINED.' });
    }

    // Verify registration
    const registration = await EventRegistration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    // Determine processor model
    const processedByModel = req.userRole === 'SUPER_ADMIN' ? 'User' : 'EventMember';

    // Create or update attendance record
    let attendance = await Attendance.findOne({ userId, eventId });

    if (attendance) {
      attendance.status = action;
      attendance.processedBy = req.user._id;
      attendance.processedByModel = processedByModel;
      attendance.processedByRole = req.userRole;
      attendance.processedAt = new Date();
    } else {
      attendance = new Attendance({
        userId,
        eventId,
        registrationId,
        processedBy: req.user._id,
        processedByModel,
        processedByRole: req.userRole,
        status: action,
        scannedAt: new Date(),
        processedAt: new Date(),
      });
    }

    await attendance.save();

    // Update registration status
    if (action === 'ACCEPTED') {
      registration.status = 'ATTENDED';
    } else if (action === 'DECLINED') {
      registration.status = 'ABSENT';
    }
    await registration.save();

    res.json({
      message: `Attendance ${action.toLowerCase()} successfully.`,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};
