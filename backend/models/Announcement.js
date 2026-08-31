const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ['INFO', 'WARNING', 'URGENT'],
      default: 'INFO',
    },
    targetAudience: {
      type: String,
      enum: ['ALL', 'STUDENTS', 'EVENT_MEMBERS', 'EVENT_SPECIFIC'],
      default: 'ALL',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    createdByName: {
      type: String,
      default: 'Campus Administrator',
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdByModel',
    },
    createdByModel: {
      type: String,
      enum: ['User', 'EventMember'],
      default: 'User',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
