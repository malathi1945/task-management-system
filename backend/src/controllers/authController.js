const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  console.log('Register request received. Mongoose readyState =', mongoose.connection.readyState);
  console.log('Mongoose host =', mongoose.connection.host);
  console.log('Mongoose port =', mongoose.connection.port);

  try {
    const { name, email, password, adminCode } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Determine role for admin registration
    const role = adminCode && adminCode === process.env.ADMIN_CODE ? 'admin' : 'user';

    // Check existing user with timeout
    console.log('🔍 Checking for existing user with email:', email);

    let existingUser;
    try {
      existingUser = await User.findOne({ email }).maxTimeMS(5000);
    } catch (timeoutError) {
      console.error('⏱️ Timeout during user lookup:', timeoutError.message);
      return res.status(503).json({
        success: false,
        message: 'Database query timeout. Please check your MongoDB Atlas IP whitelist and ensure 0.0.0.0/0 is enabled.'
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    console.log('🔐 Hashing password for new user...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('👤 Creating new user...');
    let user;
    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });
    } catch (timeoutError) {
      console.error('⏱️ Timeout during user creation:', timeoutError.message);
      return res.status(503).json({
        success: false,
        message: 'Database operation timeout. Please verify your MongoDB Atlas configuration.'
      });
    }

    console.log('✅ User created successfully:', user._id);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    const taskCounts = await Task.aggregate([
      {
        $group: {
          _id: '$createdBy',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = taskCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const usersWithCounts = users.map((user) => ({
      ...user,
      taskCount: countMap[user._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      users: usersWithCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await Task.deleteMany({ createdBy: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and related tasks deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};