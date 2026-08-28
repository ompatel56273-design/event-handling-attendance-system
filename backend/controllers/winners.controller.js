const Winner = require('../models/Winner');

// GET /api/winners
exports.getWinners = async (req, res, next) => {
  try {
    const { eventId } = req.query;
    const filter = {};
    if (eventId) filter.eventId = eventId;

    const winners = await Winner.find(filter)
      .populate('userId', 'userId firstName lastName department year className rollNumber profileImage')
      .populate('eventId', 'eventId name date image')
      .sort({ createdAt: -1 });

    res.json(winners);
  } catch (error) {
    next(error);
  }
};

// GET /api/winners/event/:eventId
exports.getWinnersByEvent = async (req, res, next) => {
  try {
    const winners = await Winner.find({ eventId: req.params.eventId })
      .populate('userId', 'userId firstName lastName department year className rollNumber profileImage')
      .populate('eventId', 'eventId name date image')
      .sort({ position: 1 });

    res.json(winners);
  } catch (error) {
    next(error);
  }
};
