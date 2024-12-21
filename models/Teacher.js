const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  }, // Required if no Google ID
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  nationalId: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    unique: true,
  }, // Required if no Google ID
  googleId: { type: String }, // Added for Google OAuth
  students: [{ type: String }], // Array of student national IDs
});

module.exports = mongoose.model('Teacher', TeacherSchema);
