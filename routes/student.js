const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Student signup (Optional, based on the use case)
router.post('/signup', async (req, res) => {
  const { name, nationalId, email, password, nationality, birthday, className, schoolName } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({
      name,
      nationalId,
      email,
      password: hashedPassword,
      nationality,
      birthday,
      className,
      schoolName,
    });
    await student.save();
    res.status(201).json({ message: 'Signup successful', student });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Student login
router.post('/login', async (req, res) => {
  const { nationalId, password } = req.body;

  try {
    const student = await Student.findOne({ nationalId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Fetch student profile
router.get('/profile', authMiddleware('student'), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update student profile
router.put('/profile', authMiddleware('student'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.user.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Fetch student exam results
router.get('/exam-results', authMiddleware('student'), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const {
      firstGradeExamResults,
      secondGradeExamResults,
      thirdGradeExamResults,
      finalGradeExamResults,
    } = student;
    res.json({
      firstGradeExamResults,
      secondGradeExamResults,
      thirdGradeExamResults,
      finalGradeExamResults,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
