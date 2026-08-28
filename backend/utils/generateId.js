const { v4: uuidv4 } = require('uuid');

const generateUserId = () => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `USR-${num}`;
};

const generateEventId = () => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `EVT-${num}`;
};

const generateToken = () => {
  return uuidv4().replace(/-/g, '');
};

module.exports = { generateUserId, generateEventId, generateToken };
