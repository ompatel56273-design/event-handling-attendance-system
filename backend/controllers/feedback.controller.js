const Feedback = require('../models/Feedback');
const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');

// POST /api/feedback — Submit student event review
exports.submitFeedback = async (req, res, next) => {
  try {
    const { eventId, overallRating, organizationRating, contentRating, comment, isAnonymous } = req.body;
    const userId = req.user._id;

    if (!eventId || !overallRating) {
      return res.status(400).json({ message: 'Event ID and overall star rating are required.' });
    }

    // Verify student actually registered for this event
    const registration = await EventRegistration.findOne({
      userId,
      eventId,
    });

    if (!registration) {
      return res.status(403).json({ message: 'Only participants registered for this event can submit feedback.' });
    }

    // Check for duplicate feedback
    const existing = await Feedback.findOne({ eventId, userId });
    if (existing) {
      return res.status(409).json({ message: 'You have already submitted feedback for this event.' });
    }

    const feedback = await Feedback.create({
      eventId,
      userId,
      overallRating: Math.min(Math.max(parseInt(overallRating), 1), 5),
      organizationRating: organizationRating ? Math.min(Math.max(parseInt(organizationRating), 1), 5) : 5,
      contentRating: contentRating ? Math.min(Math.max(parseInt(contentRating), 1), 5) : 5,
      comment: comment ? comment.trim() : '',
      isAnonymous: Boolean(isAnonymous),
    });

    res.status(201).json({
      message: 'Thank you for your feedback!',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/feedback/event/:eventId — Get feedback breakdown for an event
exports.getEventFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const feedbackList = await Feedback.find({ eventId })
      .populate('userId', 'firstName lastName department userId profileImage')
      .sort({ createdAt: -1 });

    if (feedbackList.length === 0) {
      return res.json({
        totalReviews: 0,
        averageRating: 0,
        averageOrg: 0,
        averageContent: 0,
        reviews: [],
      });
    }

    const total = feedbackList.length;
    const avgOverall = (feedbackList.reduce((acc, f) => acc + f.overallRating, 0) / total).toFixed(1);
    const avgOrg = (feedbackList.reduce((acc, f) => acc + f.organizationRating, 0) / total).toFixed(1);
    const avgContent = (feedbackList.reduce((acc, f) => acc + f.contentRating, 0) / total).toFixed(1);

    const formattedReviews = feedbackList.map((f) => ({
      _id: f._id,
      overallRating: f.overallRating,
      organizationRating: f.organizationRating,
      contentRating: f.contentRating,
      comment: f.comment,
      createdAt: f.createdAt,
      author: f.isAnonymous
        ? { name: 'Verified Attendee', department: 'Campus Student' }
        : {
            name: `${f.userId?.firstName || 'Student'} ${f.userId?.lastName || ''}`.trim(),
            department: f.userId?.department,
            userId: f.userId?.userId,
            avatar: f.userId?.profileImage?.url,
          },
    }));

    res.json({
      totalReviews: total,
      averageRating: parseFloat(avgOverall),
      averageOrg: parseFloat(avgOrg),
      averageContent: parseFloat(avgContent),
      reviews: formattedReviews,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/feedback/my/:eventId — Check if current user submitted feedback
exports.getMyFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const feedback = await Feedback.findOne({ eventId, userId });
    res.json({ hasSubmitted: Boolean(feedback), feedback });
  } catch (error) {
    next(error);
  }
};
