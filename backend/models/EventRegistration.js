const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  status: {
    type: String,
    enum: ['REGISTERED', 'ATTENDED', 'ABSENT', 'REMOVED_BY_ADMIN'],
    default: 'REGISTERED',
  },
  attendanceQrGenerated: {
    type: Boolean,
    default: false,
  },
  attendanceQrToken: {
    type: String,
    default: '',
  },
  checkInPin: {
    type: String,
    default: '',
  },
  isTeam: {
    type: Boolean,
    default: false,
  },
  teamName: {
    type: String,
    default: '',
  },
  teamRole: {
    type: String,
    enum: ['LEADER', 'MEMBER', null],
    default: null,
  },
  teamMembers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      userIdentifier: String,
      rollNumber: String,
      department: String,
    },
  ],
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound unique index: one registration per user per event
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
