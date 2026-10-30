const mongoose = require('mongoose');

const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const validRoles = ['donor', 'recipient', 'admin'];

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: 6
  },
  bloodType: { 
    type: String,
    enum: {
      values: validBloodTypes,
      message: '{VALUE} is not a valid blood type'
    },
    default: 'O+'
  },
  location: { 
    type: String,
    trim: true,
    default: 'Hyderabad'
  },
  pincode: {
    type: String,
    trim: true,
    default: '500001'
  },
  lastDonation: { 
    type: Date,
    default: null
  },
  totalDonations: {
    type: Number,
    default: 0,
    min: 0
  },
  rewardPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  mobile: { 
    type: String,
    trim: true,
    default: ''
  },
  role: { 
    type: String, 
    enum: validRoles,
    default: 'donor' 
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Check clinical donation eligibility (90-day interval for whole blood donation)
UserSchema.methods.getEligibility = function() {
  if (!this.lastDonation) {
    return {
      eligible: true,
      daysRemaining: 0,
      nextEligibleDate: new Date(),
      message: 'Eligible to donate blood.'
    };
  }

  const intervalDays = 90; // Standard clinical rest period
  const lastDate = new Date(this.lastDonation);
  const nextEligible = new Date(lastDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const now = new Date();

  if (now >= nextEligible) {
    return {
      eligible: true,
      daysRemaining: 0,
      nextEligibleDate: nextEligible,
      message: 'Eligible to donate blood.'
    };
  } else {
    const diffTime = Math.abs(nextEligible - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      eligible: false,
      daysRemaining: diffDays,
      nextEligibleDate: nextEligible,
      message: `Next eligible to donate on ${nextEligible.toISOString().split('T')[0]} (${diffDays} days remaining).`
    };
  }
};

// Safe representation stripped of sensitive credentials
UserSchema.methods.toSafeObject = function() {
  const obj = this.toObject ? this.toObject() : { ...this };
  delete obj.password;
  obj.bloodGroup = obj.bloodType; // Frontend backwards-compatibility alias
  obj.phone = obj.mobile;         // Frontend backwards-compatibility alias
  obj.pincode = obj.pincode || obj.location;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
