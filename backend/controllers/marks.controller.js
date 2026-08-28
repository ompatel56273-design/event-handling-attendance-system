const Marks = require('../models/Marks');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

// POST /api/marks — Event Member enters marks
exports.createMarks = async (req, res, next) => {
  try {
    const { userId, eventId, criteria } = req.body;

    // Verify registration exists
    const registration = await EventRegistration.findOne({ userId, eventId });
    if (!registration) {
      return res.status(400).json({ message: 'User has not joined this event.' });
    }

    // Verify event exists and has marking criteria
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Calculate total marks
    const totalMarks = criteria.reduce((sum, c) => sum + (c.marks || 0), 0);

    // Validate marks don't exceed max
    for (const c of criteria) {
      if (c.marks > c.maxMarks) {
        return res.status(400).json({
          message: `Marks for "${c.name}" (${c.marks}) exceed maximum (${c.maxMarks}).`,
        });
      }
    }

    const givenByModel = req.userRole === 'SUPER_ADMIN' ? 'User' : 'EventMember';

    let marks = await Marks.findOne({ userId, eventId });
    if (marks) {
      marks.criteria = criteria;
      marks.totalMarks = totalMarks;
      marks.givenBy = req.user._id;
      marks.givenByModel = givenByModel;
      await marks.save();
      return res.json({ message: 'Marks updated successfully.', marks });
    }

    marks = new Marks({
      userId,
      eventId,
      criteria,
      totalMarks,
      givenBy: req.user._id,
      givenByModel,
    });

    await marks.save();

    res.status(201).json({ message: 'Marks submitted successfully.', marks });
  } catch (error) {
    next(error);
  }
};

// GET /api/marks/event/:eventId
exports.getMarksByEvent = async (req, res, next) => {
  try {
    const marks = await Marks.find({ eventId: req.params.eventId })
      .populate('userId', 'userId firstName lastName department year className rollNumber profileImage')
      .populate('eventId', 'eventId name')
      .sort({ totalMarks: -1 });

    res.json(marks);
  } catch (error) {
    next(error);
  }
};

// GET /api/marks/user/:userId/event/:eventId
exports.getMarksForUserEvent = async (req, res, next) => {
  try {
    const marks = await Marks.findOne({
      userId: req.params.userId,
      eventId: req.params.eventId,
    })
      .populate('userId', 'userId firstName lastName department year className rollNumber')
      .populate('eventId', 'eventId name markingCriteria');

    if (!marks) {
      return res.status(404).json({ message: 'No marks found.' });
    }

    res.json(marks);
  } catch (error) {
    next(error);
  }
};
