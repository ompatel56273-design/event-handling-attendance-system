const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    type: {
      type: String,
      enum: ['PARTICIPATION', 'WINNER_1ST', 'WINNER_2ND', 'WINNER_3RD', 'COORDINATOR'],
      default: 'PARTICIPATION',
    },
    title: {
      type: String,
      default: 'Certificate of Participation',
    },
    position: {
      type: String,
      default: '',
    },
    marks: {
      type: Number,
      default: null,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    issuedBy: {
      type: String,
      default: 'Campus Event Management Board',
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure unique certificate per student per event per type
certificateSchema.index({ userId: 1, eventId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
