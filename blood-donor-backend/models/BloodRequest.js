const mongoose = require('mongoose');

const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BloodRequestSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  bloodType: {
    type: String,
    required: [true, 'Blood type is required'],
    enum: validBloodTypes
  },
  unitsNeeded: {
    type: Number,
    required: [true, 'Units needed is required'],
    min: [1, 'Must request at least 1 unit'],
    default: 1
  },
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'City/Location is required'],
    trim: true
  },
  pincode: {
    type: String,
    trim: true,
    default: '500001'
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Critical', 'Immediate'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['Pending', 'Fulfilled', 'Cancelled'],
    default: 'Pending'
  },
  requiredDate: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

BloodRequestSchema.index({ bloodType: 1, location: 1, status: 1 });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);

