const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  position: {
    type: String,
    enum: ['1st Place', '2nd Place', '3rd Place'],
    required: true,
  },
  marks: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// One position per event per user
winnerSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Winner', winnerSchema);
