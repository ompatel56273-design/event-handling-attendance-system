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

// POST /api/attendance/scan — Event Member or SuperAdmin scans attendance QR or PIN
exports.scanAttendanceQR = async (req, res, next) => {
  try {
    const { token, pin, eventId } = req.body;

    let registration = null;

    // 1. PIN-based manual fallback check-in
    if (pin && pin.trim().length >= 4) {
      const pinQuery = { checkInPin: pin.trim() };
      if (eventId) pinQuery.eventId = eventId;

      registration = await EventRegistration.findOne(pinQuery)
        .populate('userId')
        .populate('eventId');

      if (!registration) {
        return res.status(404).json({ message: 'Invalid check-in PIN. No matching registration found.' });
      }
    } else if (token) {
      // 2. Token-based scanning
      try {
        const decoded = verifyAttendanceToken(token);
        registration = await EventRegistration.findById(decoded.registrationId)
          .populate('userId')
          .populate('eventId');

        if (!registration || registration.userId._id.toString() !== decoded.userId) {
          return res.status(400).json({ message: 'QR data does not match registration.' });
        }
      } catch (err) {
        // Fallback: Check if token is registration ID or student User ID directly
        const trimmedToken = token.trim();
        registration = await EventRegistration.findOne({
          $or: [
            { attendanceQrToken: trimmedToken },
            { _id: trimmedToken.match(/^[0-9a-fA-F]{24}$/) ? trimmedToken : null },
          ],
        })
          .populate('userId')
          .populate('eventId');

        if (!registration) {
          return res.status(400).json({ message: 'Invalid or expired attendance QR code.' });
        }
      }
    } else {
      return res.status(400).json({ message: 'Please provide either a QR token or a 6-digit PIN.' });
    }

    if (registration.status === 'REMOVED_BY_ADMIN') {
      return res.status(400).json({ message: 'This registration has been removed.' });
    }

    // Check for existing attendance
    const existingAttendance = await Attendance.findOne({
      userId: registration.userId._id,
      eventId: registration.eventId._id,
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
      message: 'Participant identified successfully.',
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

// GET /api/attendance/events/:eventId/turnout — Real-time turnout ticker
exports.getEventTurnout = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const [totalRegistered, checkedInCount] = await Promise.all([
      EventRegistration.countDocuments({ eventId, status: { $ne: 'REMOVED_BY_ADMIN' } }),
      Attendance.countDocuments({ eventId, status: 'ACCEPTED' }),
    ]);

    const turnoutPercentage = totalRegistered > 0
      ? Math.round((checkedInCount / totalRegistered) * 100)
      : 0;

    res.json({
      totalRegistered,
      checkedInCount,
      pendingCount: Math.max(totalRegistered - checkedInCount, 0),
      turnoutPercentage,
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
