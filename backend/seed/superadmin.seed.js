const User = require('../models/User');
const { generateUserId } = require('../utils/generateId');

const seedSuperAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (existingAdmin) {
      console.log('SuperAdmin already exists');
      return;
    }

    // Generate a unique userId
    let userId;
    let exists = true;
    while (exists) {
      userId = generateUserId();
      exists = await User.findOne({ userId });
    }

    const admin = new User({
      userId,
      firstName: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
      lastName: process.env.SUPER_ADMIN_LAST_NAME || 'Admin',
      department: 'BCA',
      year: 1,
      className: 'A',
      rollNumber: 'ADMIN-001',
      mobile: '0000000000',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@eventhandling.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456',
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
      accountStatus: 'ACTIVE',
    });

    await admin.save();
    console.log(`SuperAdmin created: ${admin.email}`);
  } catch (error) {
    console.error('Error seeding SuperAdmin:', error.message);
  }
};

module.exports = { seedSuperAdmin };
