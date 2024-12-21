const mongoose = require('mongoose');

const ExamResultSchema = new mongoose.Schema({
  materialName: { type: String, required: true },
  grade: { type: Number },
});

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstGradeExamResult: [ExamResultSchema],
  secondGradeExamResult: [ExamResultSchema],
  thirdGradeExamResult: [ExamResultSchema],
  finallyGradeExamResult: [ExamResultSchema],
  nationalId: { type: String, required: true, unique: true },
  email: { type: String },
  nationality: { type: String },
  birthday: { type: String },
  className: { type: String },
  schoolName: { type: String },
  password: { type: String, required: true },
});

module.exports = mongoose.model('Student', StudentSchema);
