const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventRegistration',
    required: true,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'processedByModel',
  },
  processedByModel: {
    type: String,
    enum: ['User', 'EventMember'],
  },
  processedByRole: {
    type: String,
    enum: ['EVENT_MEMBER', 'SUPER_ADMIN'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
    default: 'PENDING',
  },
  scannedAt: {
    type: Date,
  },
  processedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// One attendance record per user per event
attendanceSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
