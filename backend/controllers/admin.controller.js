const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const EventMember = require('../models/EventMember');
const Winner = require('../models/Winner');
const { generateUserId, generateEventId } = require('../utils/generateId');
const { uploadImage, deleteImage } = require('../services/cloudinary.service');

// ============ USER MANAGEMENT ============

// POST /api/admin/users
exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, department, year, className, rollNumber, mobile, email, password } = req.body;

    if (!firstName || !lastName || !department || !year || !className || !rollNumber || !mobile || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
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

    const user = new User({
      userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      department,
      year: parseInt(year),
      className,
      rollNumber: rollNumber.trim(),
      mobile: mobile.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'USER',
      isEmailVerified: true,
      accountStatus: 'ACTIVE',
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, department, year, className, page = 1, limit = 20 } = req.query;
    const filter = { role: 'USER' };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);
    if (className) filter.className = className;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, department, year, className, rollNumber, mobile, accountStatus } = req.body;
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (department !== undefined) updates.department = department;
    if (year !== undefined) updates.year = year;
    if (className !== undefined) updates.className = className;
    if (rollNumber !== undefined) updates.rollNumber = rollNumber;
    if (mobile !== undefined) updates.mobile = mobile;
    if (accountStatus !== undefined) updates.accountStatus = accountStatus;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/password — SuperAdmin resets user password (no old password needed)
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = newPassword;
    await user.save(); // pre-save hook will hash it
    res.json({ message: 'User password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users/:id/events
exports.getUserEvents = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({ userId: req.params.id })
      .populate('eventId')
      .sort({ joinedAt: -1 });
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users/:id/attendance
exports.getUserAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ userId: req.params.id })
      .populate('eventId', 'eventId name date')
      .sort({ createdAt: -1 });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users/:id/marks
exports.getUserMarks = async (req, res, next) => {
  try {
    const marks = await Marks.find({ userId: req.params.id })
      .populate('eventId', 'eventId name date')
      .sort({ createdAt: -1 });
    res.json(marks);
  } catch (error) {
    next(error);
  }
};

// ============ EVENT MANAGEMENT ============

// POST /api/admin/events
exports.createEvent = async (req, res, next) => {
  try {
    let eventId;
    let exists = true;
    while (exists) {
      eventId = generateEventId();
      exists = await Event.findOne({ eventId });
    }

    const eventData = { ...req.body };
    if (req.body.imageUrl !== undefined) {
      eventData.image = { url: req.body.imageUrl, publicId: '' };
    }

    const event = new Event({
      eventId,
      ...eventData,
      createdBy: req.user._id,
    });
    await event.save();
    res.status(201).json({ message: 'Event created successfully.', event });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.body.imageUrl !== undefined) {
      updateData.image = { url: req.body.imageUrl, publicId: '' };
    }
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/events/:id/status
exports.updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/events/:id/image
exports.uploadEventImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided.' });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (event.image && event.image.publicId) {
      await deleteImage(event.image.publicId);
    }

    const result = await uploadImage(req.file.buffer, 'event-handling/events');
    event.image = { url: result.url, publicId: result.publicId };
    await event.save();

    res.json({ message: 'Event image updated.', image: event.image });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/events/:id/participants
exports.getEventParticipants = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({ eventId: req.params.id })
      .populate('userId', 'userId firstName lastName department year className rollNumber mobile email profileImage')
      .sort({ joinedAt: -1 });
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/events (all events for admin)
exports.getAllEvents = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (status) filter.status = status;

    const events = await Event.find(filter).sort({ createdAt: -1 });
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const participantCount = await EventRegistration.countDocuments({
          eventId: event._id,
          status: { $ne: 'REMOVED_BY_ADMIN' },
        });
        return { ...event.toObject(), participantCount };
      })
    );
    res.json(eventsWithCounts);
  } catch (error) {
    next(error);
  }
};

// ============ REGISTRATION MANAGEMENT ============

// GET /api/admin/registrations
exports.getAllRegistrations = async (req, res, next) => {
  try {
    const { eventId, search } = req.query;
    const filter = {};
    if (eventId) filter.eventId = eventId;

    let registrations = await EventRegistration.find(filter)
      .populate('userId', 'userId firstName lastName department year className rollNumber mobile email')
      .populate('eventId', 'eventId name date')
      .sort({ joinedAt: -1 });

    if (search) {
      registrations = registrations.filter(r =>
        r.userId &&
        (`${r.userId.firstName} ${r.userId.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          r.userId.email.toLowerCase().includes(search.toLowerCase()) ||
          r.userId.rollNumber.toLowerCase().includes(search.toLowerCase()))
      );
    }

    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/registrations/:id
exports.updateRegistration = async (req, res, next) => {
  try {
    const { status } = req.body;
    const registration = await EventRegistration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!registration) return res.status(404).json({ message: 'Registration not found.' });
    res.json(registration);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/registrations/:id
exports.deleteRegistration = async (req, res, next) => {
  try {
    const registration = await EventRegistration.findByIdAndUpdate(
      req.params.id,
      { status: 'REMOVED_BY_ADMIN' },
      { new: true }
    );
    if (!registration) return res.status(404).json({ message: 'Registration not found.' });
    res.json({ message: 'Registration removed.', registration });
  } catch (error) {
    next(error);
  }
};

// ============ ATTENDANCE MANAGEMENT ============

// GET /api/admin/attendance
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { eventId } = req.query;
    const filter = {};
    if (eventId) filter.eventId = eventId;

    const attendance = await Attendance.find(filter)
      .populate('userId', 'userId firstName lastName department year className rollNumber profileImage')
      .populate('eventId', 'eventId name date')
      .sort({ createdAt: -1 });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/attendance/event/:eventId
exports.getAttendanceByEvent = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ eventId: req.params.eventId })
      .populate('userId', 'userId firstName lastName department year className rollNumber profileImage')
      .sort({ createdAt: -1 });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/attendance/:id
exports.updateAttendance = async (req, res, next) => {
  try {
    const { status } = req.body;
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, processedBy: req.user._id, processedByRole: 'SUPER_ADMIN', processedAt: new Date() },
      { new: true }
    );
    if (!attendance) return res.status(404).json({ message: 'Attendance not found.' });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// ============ MARKS MANAGEMENT ============

// PUT /api/admin/marks/:id
exports.updateMarks = async (req, res, next) => {
  try {
    const { criteria } = req.body;
    const totalMarks = criteria.reduce((sum, c) => sum + (c.marks || 0), 0);
    const marks = await Marks.findByIdAndUpdate(
      req.params.id,
      { criteria, totalMarks },
      { new: true }
    );
    if (!marks) return res.status(404).json({ message: 'Marks not found.' });
    res.json(marks);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/marks
exports.getAllMarks = async (req, res, next) => {
  try {
    const { eventId } = req.query;
    const filter = {};
    if (eventId) filter.eventId = eventId;

    const marks = await Marks.find(filter)
      .populate('userId', 'userId firstName lastName department year className rollNumber')
      .populate('eventId', 'eventId name')
      .sort({ totalMarks: -1 });
    res.json(marks);
  } catch (error) {
    next(error);
  }
};

// ============ WINNERS MANAGEMENT ============

// POST /api/admin/winners
exports.createWinner = async (req, res, next) => {
  try {
    const { eventId, userId, position, marks } = req.body;

    // Verify the user registered for this event
    const registration = await EventRegistration.findOne({ userId, eventId });
    if (!registration) {
      return res.status(400).json({ message: 'User has not registered for this event.' });
    }

    const existing = await Winner.findOne({ eventId, userId });
    if (existing) {
      return res.status(409).json({ message: 'Winner already exists for this user and event.' });
    }

    const winner = new Winner({ eventId, userId, position, marks });
    await winner.save();
    res.status(201).json({ message: 'Winner created.', winner });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/winners/:id
exports.updateWinner = async (req, res, next) => {
  try {
    const winner = await Winner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!winner) return res.status(404).json({ message: 'Winner not found.' });
    res.json(winner);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/winners/:id
exports.deleteWinner = async (req, res, next) => {
  try {
    const winner = await Winner.findByIdAndDelete(req.params.id);
    if (!winner) return res.status(404).json({ message: 'Winner not found.' });
    res.json({ message: 'Winner deleted.' });
  } catch (error) {
    next(error);
  }
};

// ============ EVENT MEMBER MANAGEMENT ============

// GET /api/admin/event-members
exports.getAllEventMembers = async (req, res, next) => {
  try {
    const members = await EventMember.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/event-members
exports.createEventMember = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await EventMember.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use.' });

    const member = new EventMember({ name, email, password });
    await member.save();
    res.status(201).json({ message: 'Event member created.', member });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/event-members/:id
exports.updateEventMember = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const member = await EventMember.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ message: 'Event member not found.' });
    res.json(member);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/event-members/:id/password
exports.resetEventMemberPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const member = await EventMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Event member not found.' });

    member.password = newPassword;
    await member.save();
    res.json({ message: 'Event member password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/event-members/:id/status
exports.updateEventMemberStatus = async (req, res, next) => {
  try {
    const { accountStatus } = req.body;
    const member = await EventMember.findByIdAndUpdate(
      req.params.id,
      { accountStatus },
      { new: true }
    );
    if (!member) return res.status(404).json({ message: 'Event member not found.' });
    res.json(member);
  } catch (error) {
    next(error);
  }
};

// ============ DATA EXPORT ENGINE (.XLSX & .CSV) ============
const exportService = require('../services/export.service');

// GET /api/admin/attendance/export
exports.exportAttendance = async (req, res, next) => {
  try {
    const { eventId, format = 'xlsx' } = req.query;
    const filter = {};
    if (eventId) filter.eventId = eventId;

    const records = await Attendance.find(filter)
      .populate('userId', 'firstName lastName userId department year className rollNumber email mobile')
      .populate('eventId', 'name date location')
      .populate('scannedBy', 'name email role')
      .sort({ scannedAt: -1 });

    const formattedData = records.map((r, i) => ({
      '#': i + 1,
      'Student Name': `${r.userId?.firstName || ''} ${r.userId?.lastName || ''}`.trim(),
      'User ID': r.userId?.userId || 'N/A',
      'Roll Number': r.userId?.rollNumber || 'N/A',
      'Department': r.userId?.department || 'N/A',
      'Year': r.userId?.year ? `${r.userId.year} Year` : 'N/A',
      'Class': r.userId?.className || 'N/A',
      'Event Name': r.eventId?.name || 'N/A',
      'Event Date': r.eventId?.date ? new Date(r.eventId.date).toLocaleDateString('en-GB') : 'N/A',
      'Attendance Status': r.status || 'ACCEPTED',
      'Check-in Time': r.scannedAt ? new Date(r.scannedAt).toLocaleString('en-GB') : 'N/A',
      'Verified By': r.scannedBy?.name || 'System Admin',
      'Method': r.scanMethod || 'QR_CAMERA',
    }));

    const result = exportService.generateWorkbook(
      [{ sheetName: 'Attendance Records', data: formattedData }],
      format
    );

    const timestamp = new Date().toISOString().split('T')[0];
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=Attendance_${timestamp}.csv`);
      return res.send(result);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Attendance_${timestamp}.xlsx`
    );
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/registrations/export
exports.exportRegistrations = async (req, res, next) => {
  try {
    const { eventId, department, format = 'xlsx' } = req.query;
    const filter = {};
    if (eventId) filter.eventId = eventId;

    const records = await EventRegistration.find(filter)
      .populate('userId', 'firstName lastName userId department year className rollNumber email mobile')
      .populate('eventId', 'name date location category')
      .sort({ createdAt: -1 });

    const filtered = department
      ? records.filter((r) => r.userId?.department === department)
      : records;

    const formattedData = filtered.map((r, i) => ({
      '#': i + 1,
      'Student Name': `${r.userId?.firstName || ''} ${r.userId?.lastName || ''}`.trim(),
      'User ID': r.userId?.userId || 'N/A',
      'Email': r.userId?.email || 'N/A',
      'Mobile': r.userId?.mobile || 'N/A',
      'Department': r.userId?.department || 'N/A',
      'Year': r.userId?.year ? `${r.userId.year} Year` : 'N/A',
      'Class': r.userId?.className || 'N/A',
      'Roll Number': r.userId?.rollNumber || 'N/A',
      'Event Name': r.eventId?.name || 'N/A',
      'Category': r.eventId?.category || 'N/A',
      'Event Date': r.eventId?.date ? new Date(r.eventId.date).toLocaleDateString('en-GB') : 'N/A',
      'Registration Date': r.createdAt ? new Date(r.createdAt).toLocaleString('en-GB') : 'N/A',
      'Attendance Status': r.attendanceStatus || 'PENDING',
    }));

    const result = exportService.generateWorkbook(
      [{ sheetName: 'Event Registrations', data: formattedData }],
      format
    );

    const timestamp = new Date().toISOString().split('T')[0];
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=Registrations_${timestamp}.csv`);
      return res.send(result);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Registrations_${timestamp}.xlsx`
    );
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/marks/export
exports.exportMarks = async (req, res, next) => {
  try {
    const { eventId, format = 'xlsx' } = req.query;
    const filter = {};
    if (eventId) filter.eventId = eventId;

    const records = await Marks.find(filter)
      .populate('userId', 'firstName lastName userId department rollNumber className')
      .populate('eventId', 'name')
      .populate('enteredBy', 'name role')
      .sort({ totalScore: -1 });

    const formattedData = records.map((m, i) => {
      const criteriaStr = m.criteriaMarks
        ? m.criteriaMarks.map((c) => `${c.name}: ${c.marks}/${c.maxMarks}`).join(' | ')
        : 'N/A';

      return {
        'Rank': i + 1,
        'Student Name': `${m.userId?.firstName || ''} ${m.userId?.lastName || ''}`.trim(),
        'User ID': m.userId?.userId || 'N/A',
        'Roll No': m.userId?.rollNumber || 'N/A',
        'Department': m.userId?.department || 'N/A',
        'Class': m.userId?.className || 'N/A',
        'Event': m.eventId?.name || 'N/A',
        'Criteria Breakdown': criteriaStr,
        'Total Score': `${m.totalScore || 0} / ${m.totalMaxMarks || 100}`,
        'Evaluated By': m.enteredBy?.name || 'Evaluator',
        'Date': m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-GB') : 'N/A',
      };
    });

    const result = exportService.generateWorkbook(
      [{ sheetName: 'Marks & Evaluations', data: formattedData }],
      format
    );

    const timestamp = new Date().toISOString().split('T')[0];
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=Marks_${timestamp}.csv`);
      return res.send(result);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Marks_${timestamp}.xlsx`
    );
    res.send(result);
  } catch (error) {
    next(error);
  }
};

