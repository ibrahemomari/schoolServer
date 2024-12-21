require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const initializeDefaultAdmin = require('./config/initializeDefaultAdmin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// start the server
const startServer = async () => {
  try {
    // connect to MongoDB
    await mongoose
      .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('MongoDB connected'))
      .catch((error) => console.log(error));
    // Initialize default admin
    await initializeDefaultAdmin();

    // start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
};

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// start the server
startServer();
