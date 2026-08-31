const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

// GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    } else {
      // Show only public-facing statuses for regular users
      filter.status = { $in: ['UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED'] };
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(filter).sort({ date: 1 });

    // Check user registrations if logged in
    const userRegistrations = (req.user && req.userRole === 'USER') ? await EventRegistration.find({
      userId: req.user._id,
      status: { $ne: 'REMOVED_BY_ADMIN' }
    }) : [];
    const userRegisteredEventIds = new Set(userRegistrations.map(r => r.eventId.toString()));

    // Get participant counts
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const participantCount = await EventRegistration.countDocuments({
          eventId: event._id,
          status: { $ne: 'REMOVED_BY_ADMIN' },
        });
        return {
          ...event.toObject(),
          participantCount,
          hasJoined: userRegisteredEventIds.has(event._id.toString()),
        };
      })
    );

    res.json(eventsWithCounts);
  } catch (error) {
    next(error);
  }
};

// GET /api/events/upcoming
exports.getUpcomingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      status: { $in: ['UPCOMING', 'REGISTRATION_OPEN'] },
    }).sort({ date: 1 });

    const userRegistrations = (req.user && req.userRole === 'USER') ? await EventRegistration.find({
      userId: req.user._id,
      status: { $ne: 'REMOVED_BY_ADMIN' }
    }) : [];
    const userRegisteredEventIds = new Set(userRegistrations.map(r => r.eventId.toString()));

    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const participantCount = await EventRegistration.countDocuments({
          eventId: event._id,
          status: { $ne: 'REMOVED_BY_ADMIN' },
        });
        return {
          ...event.toObject(),
          participantCount,
          hasJoined: userRegisteredEventIds.has(event._id.toString()),
        };
      })
    );

    res.json(eventsWithCounts);
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:eventId
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const participantCount = await EventRegistration.countDocuments({
      eventId: event._id,
      status: { $ne: 'REMOVED_BY_ADMIN' },
    });

    // Check if current user has joined
    let hasJoined = false;
    if (req.user && req.userRole === 'USER') {
      const registration = await EventRegistration.findOne({
        userId: req.user._id,
        eventId: event._id,
        status: { $ne: 'REMOVED_BY_ADMIN' },
      });
      hasJoined = !!registration;
    }

    res.json({ ...event.toObject(), participantCount, hasJoined });
  } catch (error) {
    next(error);
  }
};

// POST /api/events/:eventId/join
const User = require('../models/User');

exports.joinEvent = async (req, res, next) => {
  try {
    const { isTeam, teamName, memberIds } = req.body;
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check if registration is open
    if (event.status !== 'REGISTRATION_OPEN') {
      return res.status(400).json({ message: 'Registration is not open for this event.' });
    }

    const now = new Date();
    if ((event.registrationStart && now < event.registrationStart) || (event.registrationEnd && now > event.registrationEnd)) {
      return res.status(400).json({ message: 'Registration period is not active.' });
    }

    // Check capacity
    const participantCount = await EventRegistration.countDocuments({
      eventId: event._id,
      status: { $ne: 'REMOVED_BY_ADMIN' },
    });
    if (participantCount >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full. No more registrations available.' });
    }

    // Check for duplicate registration for leader
    const existingRegistration = await EventRegistration.findOne({
      userId: req.user._id,
      eventId: event._id,
    });
    if (existingRegistration) {
      return res.status(409).json({ message: 'You have already joined this event.' });
    }

    if (isTeam) {
      if (!teamName || !teamName.trim()) {
        return res.status(400).json({ message: 'Please provide a Team Name for team registration.' });
      }

      const teamMembersList = [
        {
          userId: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName || ''}`.trim(),
          userIdentifier: req.user.userId,
          rollNumber: req.user.rollNumber,
          department: req.user.department,
        },
      ];

      const additionalTeammates = [];

      if (Array.isArray(memberIds) && memberIds.length > 0) {
        for (const inputId of memberIds) {
          if (!inputId || !inputId.trim()) continue;
          const trimmed = inputId.trim();
          const teammate = await User.findOne({
            $or: [
              { userId: trimmed.toUpperCase() },
              { email: trimmed.toLowerCase() },
            ],
          });

          if (!teammate) {
            return res.status(400).json({
              message: `Student teammate "${trimmed}" was not found. Please verify the Student User ID or Email.`,
            });
          }

          if (teammate._id.toString() === req.user._id.toString()) continue;

          // Check if teammate is already registered
          const teammateReg = await EventRegistration.findOne({
            userId: teammate._id,
            eventId: event._id,
          });

          if (teammateReg) {
            return res.status(409).json({
              message: `Student ${teammate.firstName} ${teammate.lastName} (${teammate.userId}) is already registered for this event.`,
            });
          }

          teamMembersList.push({
            userId: teammate._id,
            name: `${teammate.firstName} ${teammate.lastName || ''}`.trim(),
            userIdentifier: teammate.userId,
            rollNumber: teammate.rollNumber,
            department: teammate.department,
          });

          additionalTeammates.push(teammate);
        }
      }

      // 1. Create Leader's Team Registration
      const leaderRegistration = new EventRegistration({
        userId: req.user._id,
        eventId: event._id,
        status: 'REGISTERED',
        isTeam: true,
        teamName: teamName.trim(),
        teamRole: 'LEADER',
        teamMembers: teamMembersList,
        joinedAt: new Date(),
      });
      await leaderRegistration.save();

      // 2. Create Registrations for each teammate
      for (const teammate of additionalTeammates) {
        const teammateReg = new EventRegistration({
          userId: teammate._id,
          eventId: event._id,
          status: 'REGISTERED',
          isTeam: true,
          teamName: teamName.trim(),
          teamRole: 'MEMBER',
          teamMembers: teamMembersList,
          joinedAt: new Date(),
        });
        await teammateReg.save();
      }

      return res.status(201).json({
        message: `Team "${teamName}" successfully registered with ${teamMembersList.length} members!`,
        registration: leaderRegistration,
      });
    }

    // Individual Registration
    const registration = new EventRegistration({
      userId: req.user._id,
      eventId: event._id,
      status: 'REGISTERED',
      isTeam: false,
      joinedAt: new Date(),
    });

    await registration.save();

    res.status(201).json({
      message: 'Successfully registered for event.',
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:eventId/participants
exports.getEventParticipants = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({
      eventId: req.params.eventId,
      status: { $ne: 'REMOVED_BY_ADMIN' },
    })
      .populate('userId', 'userId firstName lastName department year className rollNumber mobile email profileImage')
      .sort({ joinedAt: -1 });
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};
