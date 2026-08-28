const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const eventMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    default: 'EVENT_MEMBER',
    immutable: true,
  },
  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'DISABLED'],
    default: 'ACTIVE',
  },
}, {
  timestamps: true,
});

// Hash password before saving
eventMemberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
eventMemberSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields
eventMemberSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('EventMember', eventMemberSchema);
