const mongoose = require('mongoose');

const markingCriteriaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  startTime: {
    type: String,
    default: '10:00 AM',
  },
  endTime: {
    type: String,
    default: '04:00 PM',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  registrationStart: {
    type: Date,
    default: () => new Date(),
  },
  registrationEnd: {
    type: Date,
    default: function() {
      return this.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    },
  },
  maxParticipants: {
    type: Number,
    required: true,
    default: 50,
    min: 1,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT',
  },
  markingCriteria: [markingCriteriaSchema],
  rules: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
