const mongoose = require('mongoose');

const criteriaEntrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
}, { _id: false });

const marksSchema = new mongoose.Schema({
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
  criteria: [criteriaEntrySchema],
  totalMarks: {
    type: Number,
    default: 0,
  },
  givenBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'givenByModel',
  },
  givenByModel: {
    type: String,
    enum: ['User', 'EventMember'],
  },
}, {
  timestamps: true,
});

// One marks record per user per event
marksSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
