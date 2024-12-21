const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const authMiddleware = require('../middlewares/authMiddleware');
require('../config/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName, nationalId } = req.body;

  if (!email || !password || !firstName || !lastName || !nationalId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      nationalId,
    });
    await teacher.save();
    res
      .status(201)
      .json({ message: 'Signup successful. Please verify your email to activate your account.' });
    // Send OTP via email (implement the email utility for this)
  } catch (error) {
    res.status(500).json({ message: `Server error ${error.message}` });
  }
});

// Initiate Google OAuth login
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate a JWT for the logged-in teacher
    const token = jwt.sign({ id: req.user._id, role: 'teacher' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Redirect or respond with the token
    res.json({ token });
  }
);

// Teacher login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: teacher._id, role: 'teacher' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CRUD operations for students
router.post('/students', authMiddleware('teacher'), async (req, res) => {
  const {
    name,
    nationalId,
    email,
    nationality,
    birthday,
    className,
    schoolName,
    firstGradeExamResults,
    secondGradeExamResults,
    thirdGradeExamResults,
    finalGradeExamResults,
  } = req.body;

  try {
    const student = new Student({
      name,
      nationalId,
      email,
      nationality,
      birthday,
      className,
      schoolName,
      firstGradeExamResults,
      secondGradeExamResults,
      thirdGradeExamResults,
      finalGradeExamResults,
    });
    await student.save();

    const teacher = await Teacher.findById(req.user.id);
    teacher.students.push(nationalId);
    await teacher.save();

    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/students', authMiddleware('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).populate('students');
    res.json(teacher.students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/students/:id', authMiddleware('teacher'), async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate({ nationalId: req.params.id }, req.body, {
      new: true,
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/students/:id', authMiddleware('teacher'), async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ nationalId: req.params.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const teacher = await Teacher.findById(req.user.id);
    teacher.students = teacher.students.filter((id) => id !== req.params.id);
    await teacher.save();

    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
