const mongoose = require('mongoose');

const BloodCampSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Camp title is required'],
    trim: true 
  },
  hostedBy: { 
    type: String, 
    required: [true, 'Host organization name is required'],
    trim: true 
  },
  date: { 
    type: Date, 
    required: [true, 'Camp date is required'] 
  },
  slots: { 
    type: Number, 
    required: [true, 'Slot count is required'],
    min: [0, 'Slots cannot be negative'],
    default: 20
  },
  initialSlots: {
    type: Number,
    default: 20
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'],
    trim: true 
  },
  pincode: {
    type: String,
    trim: true,
    default: '500001'
  },
  lat: { 
    type: Number, 
    default: 17.3850 
  },
  lng: { 
    type: Number, 
    default: 78.4867 
  },
  description: {
    type: String,
    trim: true,
    default: 'Voluntary blood donation camp organized to support local blood banks.'
  }
}, { timestamps: true });

module.exports = mongoose.model('BloodCamp', BloodCampSchema);
