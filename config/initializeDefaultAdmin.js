const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

const initializeDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10);
      const admin = new Admin({
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        name: 'Ibrahem Alomari',
      });
      await admin.save();
      console.log('Default Admin created successfully');
    } else {
      console.log('Default Admin already exists');
    }
  } catch (error) {
    console.error('Error initializing default admin:', error);
  }
};

module.exports = initializeDefaultAdmin;
