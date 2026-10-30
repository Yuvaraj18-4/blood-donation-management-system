const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'User ID is required'] 
  },
  campId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BloodCamp',
    required: [true, 'Camp ID is required'] 
  },
  status: { 
    type: String, 
    enum: ['Registered', 'Attended', 'Cancelled'],
    default: 'Registered' 
  },
  attendedDate: {
    type: Date,
    default: null
  },
  certificateId: { 
    type: String,
    default: () => 'CERT-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  },
  certificateIssuedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate active registration for the same user and camp
RegistrationSchema.index({ userId: 1, campId: 1, status: 1 });

module.exports = mongoose.model('Registration', RegistrationSchema);
