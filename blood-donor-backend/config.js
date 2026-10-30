// config.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blood_donor_db';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    console.warn('Continuing without fatal exit so API health endpoints can report status.');
  }
};

module.exports = connectDB;
