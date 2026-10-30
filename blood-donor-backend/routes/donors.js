const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Blood Compatibility Matrix for whole red blood cells
const redCellCompatibility = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'] // Universal Donor
};

// Get all donors with flexible filters and safety sanitization
router.get('/', async (req, res) => {
  // Support both bloodType and bloodGroup query keys
  const bloodType = req.query.bloodType || req.query.bloodGroup;
  const location = req.query.location || req.query.pincode;
  const recipientBlood = req.query.recipientBlood;

  const filter = { role: 'donor' };

  if (recipientBlood && redCellCompatibility[recipientBlood]) {
    // Return compatible donor blood types
    filter.bloodType = { $in: redCellCompatibility[recipientBlood] };
  } else if (bloodType) {
    filter.bloodType = bloodType;
  }

  if (location) {
    // Match location or pincode case-insensitively
    filter.$or = [
      { location: { $regex: location, $options: 'i' } },
      { pincode: { $regex: location, $options: 'i' } }
    ];
  }

  try {
    const users = await User.find(filter).sort({ createdAt: -1 });

    // Map to sanitized objects with eligibility calculation
    const safeDonors = users.map(user => {
      const safe = user.toSafeObject();
      safe.eligibility = user.getEligibility();
      // Estimate coordinates if not set (defaulting around Hyderabad center with minor jitter for map)
      const baseLat = 17.3850;
      const baseLng = 78.4867;
      const hash = (user.name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      safe.lat = baseLat + ((hash % 100) - 50) * 0.001;
      safe.lng = baseLng + (((hash * 3) % 100) - 50) * 0.001;
      return safe;
    });

    res.json(safeDonors);
  } catch (err) {
    console.error('Error fetching donors:', err);
    res.status(500).json({ msg: err.message || 'Server error retrieving donors.' });
  }
});

// Check eligibility of a specific donor
router.get('/:id/eligibility', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'Donor not found.' });
    }
    const eligibility = user.getEligibility();
    res.json({
      donorId: user._id,
      donorName: user.name,
      bloodType: user.bloodType,
      lastDonation: user.lastDonation,
      eligibility
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
