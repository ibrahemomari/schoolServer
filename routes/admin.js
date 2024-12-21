const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Admin login

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/admins', authMiddleware('admin'), async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword, name });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error });
  }
});

// CRUD operations for Teacher
router.post('/teachers', authMiddleware('admin'), async (req, res) => {
  const { email, password, firstName, lastName, nationalId } = req.body;

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
    res.status(201).json(teacher);
  } catch (err) {
    res.status(500).json({ message: 'Server error:', err });
  }
});

router.get('/teachers', authMiddleware('admin'), async (req, res) => {
  try {
    const teachers = await Teacher.find();
    console.log('🚀 ~ router.get ~ teachers:', teachers);
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server error:', err });
  }
});

router.put('/teachers/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: 'Server error:', err });
  }
});

router.delete('/teachers/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error:', err });
  }
});

// CRUD operations for students
router.post('/students', authMiddleware('admin'), async (req, res) => {
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
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error:', err });
  }
});

router.get('/students', authMiddleware('admin'), async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error:', err });
  }
});

router.put('/students/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error:', err });
  }
});

router.delete('/students/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error:', err });
  }
});

module.exports = router;
