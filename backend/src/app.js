const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'NOT SET');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  w: 'majority',
  family: 4 // Force IPv4
})
.then(() => {
  console.log('✓ MongoDB Connected Successfully');
})
.catch((error) => {
  console.error('✗ MongoDB Connection Error:', error.message);
  console.error('🔧 TROUBLESHOOTING STEPS:');
  console.error('1. Go to MongoDB Atlas Dashboard');
  console.error('2. Click Network Access (Security section)');
  console.error('3. Ensure 0.0.0.0/0 (Allow Access from Anywhere) is enabled');
  console.error('4. Or add your current IP address');
  process.exit(1);
});

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('✓ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('✗ Mongoose connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('✓ Mongoose reconnected to MongoDB');
});

// Create admin user if not exists
const createAdminUser = async () => {
  try {
    const adminExists = await mongoose.connection.db.collection('users').findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await mongoose.connection.db.collection('users').insertOne({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✓ Admin user created');
    } else {
      console.log('✓ Admin user already exists');
    }
  } catch (error) {
    console.error('✗ Error creating admin user:', error.message);
  }
};

mongoose.connection.once('open', () => {
  console.log('✓ MongoDB connection opened');
  createAdminUser();
});

// Routes
// Middleware to check database connection
app.use((req, res, next) => {
  const connectionState = mongoose.connection.readyState;
  
  if (connectionState === 0) {
    return res.status(503).json({
      success: false,
      message: 'Database is disconnected. Trying to reconnect...'
    });
  }
  
  if (connectionState === 2) {
    return res.status(503).json({
      success: false,
      message: 'Database is connecting. Please try again in a moment...'
    });
  }
  
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Debug routes
app.get('/debug/db-state', (req, res) => {
  res.json({
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  });
});

app.get('/debug/db-test', async (req, res) => {
  try {
    const ping = await mongoose.connection.db.admin().ping();
    res.json({
      success: true,
      message: 'Database ping successful',
      ping
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database ping failed',
      error: error.message
    });
  }
});

// Test Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Running Successfully'
  });
});

module.exports = app;