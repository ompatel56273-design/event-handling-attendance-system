const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EventMember = require('../models/EventMember');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find in users collection first
    if (decoded.role === 'USER' || decoded.role === 'SUPER_ADMIN') {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid token. User not found.' });
      }
      if (user.accountStatus !== 'ACTIVE') {
        return res.status(403).json({ message: 'Account is suspended.' });
      }
      req.user = user;
      req.userRole = user.role;
    } else if (decoded.role === 'EVENT_MEMBER') {
      const member = await EventMember.findById(decoded.id).select('-password');
      if (!member) {
        return res.status(401).json({ message: 'Invalid token. Member not found.' });
      }
      if (member.accountStatus !== 'ACTIVE') {
        return res.status(403).json({ message: 'Account is disabled.' });
      }
      req.user = member;
      req.userRole = 'EVENT_MEMBER';
    } else {
      return res.status(401).json({ message: 'Invalid token role.' });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    return res.status(500).json({ message: 'Authentication error.' });
  }
};

module.exports = auth;
