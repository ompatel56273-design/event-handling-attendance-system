const jwt = require('jsonwebtoken');

const generateAttendanceToken = (registrationId, userId, eventId) => {
  const payload = {
    type: 'ATTENDANCE_QR',
    registrationId: registrationId.toString(),
    userId: userId.toString(),
    eventId: eventId.toString(),
  };
  // Attendance QR tokens are valid for 24 hours
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const verifyAttendanceToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'ATTENDANCE_QR') {
      throw new Error('Invalid QR type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired attendance QR');
  }
};

module.exports = { generateAttendanceToken, verifyAttendanceToken };
