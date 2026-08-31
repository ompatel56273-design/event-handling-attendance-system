const Announcement = require('../models/Announcement');
const EventRegistration = require('../models/EventRegistration');

// GET /api/announcements — Fetch announcements for current user
exports.getAnnouncements = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    let filter = { isActive: true };

    if (userRole === 'USER') {
      // Find events user is registered for
      const myRegs = await EventRegistration.find({ userId }).select('eventId');
      const myEventIds = myRegs.map((r) => r.eventId);

      filter = {
        isActive: true,
        $or: [
          { targetAudience: 'ALL' },
          { targetAudience: 'STUDENTS' },
          { targetAudience: 'EVENT_SPECIFIC', eventId: { $in: myEventIds } },
        ],
      };
    } else if (userRole === 'EVENT_MEMBER') {
      filter = {
        isActive: true,
        $or: [
          { targetAudience: 'ALL' },
          { targetAudience: 'EVENT_MEMBERS' },
          { targetAudience: 'EVENT_SPECIFIC' },
        ],
      };
    }

    const announcements = await Announcement.find(filter)
      .populate('eventId', 'name date location')
      .sort({ createdAt: -1 })
      .limit(30);

    const formatted = announcements.map((a) => {
      const isRead = a.readBy.some((id) => id.toString() === userId.toString());
      return {
        _id: a._id,
        title: a.title,
        message: a.message,
        urgency: a.urgency,
        targetAudience: a.targetAudience,
        event: a.eventId ? { name: a.eventId.name, date: a.eventId.date } : null,
        createdByName: a.createdByName,
        createdAt: a.createdAt,
        isRead,
      };
    });

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// POST /api/announcements — Broadcast announcement (SuperAdmin & EventMember)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, urgency, targetAudience, eventId } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    const creatorName = req.user.firstName
      ? `${req.user.firstName} ${req.user.lastName || ''}`.trim()
      : req.user.name || 'Campus Administrator';

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      urgency: urgency || 'INFO',
      targetAudience: targetAudience || 'ALL',
      eventId: eventId || null,
      createdByName: creatorName,
      createdById: req.user._id,
      createdByModel: req.user.role === 'EVENT_MEMBER' ? 'EventMember' : 'User',
    });

    res.status(201).json({
      message: 'Announcement broadcasted successfully.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/announcements/:id/read — Mark announcement as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await Announcement.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId },
    });

    res.json({ message: 'Marked as read.' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/announcements/read-all — Mark all announcements as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Announcement.updateMany(
      { isActive: true, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    res.json({ message: 'All announcements marked as read.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/announcements/:id — Delete announcement
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.json({ message: 'Announcement deleted.' });
  } catch (error) {
    next(error);
  }
};
