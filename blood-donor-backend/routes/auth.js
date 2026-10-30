const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Register a new user / donor
router.post('/register', async (req, res) => {
  const { name, email, password, bloodType, location, pincode, mobile, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please provide name, email, and password.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ msg: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      bloodType: bloodType || 'O+',
      location: location ? location.trim() : 'Hyderabad',
      pincode: pincode ? pincode.trim() : '500001',
      mobile: mobile ? mobile.trim() : '',
      role: role && ['donor', 'recipient', 'admin'].includes(role) ? role : 'donor'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: user.toSafeObject(),
      msg: 'Registration successful!'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: err.message || 'Server error during registration.' });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: user.toSafeObject(),
      msg: 'Login successful!'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: err.message || 'Server error during login.' });
  }
});

// Get current user profile (Authenticated)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User profile not found.' });
    }
    const safeUser = user.toSafeObject();
    safeUser.eligibility = user.getEligibility();
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update profile / donation history
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User profile not found.' });
    }

    const { name, bloodType, location, pincode, mobile, lastDonation, isAvailable } = req.body;

    if (name) user.name = name.trim();
    if (bloodType) user.bloodType = bloodType;
    if (location) user.location = location.trim();
    if (pincode) user.pincode = pincode.trim();
    if (mobile !== undefined) user.mobile = mobile.trim();
    if (isAvailable !== undefined) user.isAvailable = Boolean(isAvailable);
    if (lastDonation) {
      user.lastDonation = new Date(lastDonation);
      user.totalDonations = (user.totalDonations || 0) + 1;
      user.rewardPoints = (user.rewardPoints || 0) + 25; // 25 points per recorded donation
    }

    await user.save();
    const safeUser = user.toSafeObject();
    safeUser.eligibility = user.getEligibility();

    res.json({
      msg: 'Profile updated successfully!',
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
