const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const { optionalAuth } = require('../middleware/auth');

// Seed default sample requests if none exist
const seedInitialRequestsIfEmpty = async () => {
  try {
    const count = await BloodRequest.countDocuments();
    if (count === 0) {
      const defaultRequests = [
        {
          patientName: 'Ramesh Verma',
          bloodType: 'O+',
          unitsNeeded: 2,
          hospitalName: 'Apollo Hospitals, Jubilee Hills',
          location: 'Hyderabad',
          pincode: '500033',
          contactNumber: '9876501234',
          urgency: 'Immediate',
          status: 'Pending',
          notes: 'Urgent requirement for scheduled cardiac surgery.'
        },
        {
          patientName: 'Priya Sharma',
          bloodType: 'B-',
          unitsNeeded: 1,
          hospitalName: 'Care Hospital, Nampally',
          location: 'Hyderabad',
          pincode: '500001',
          contactNumber: '9123456789',
          urgency: 'Critical',
          status: 'Pending',
          notes: 'Platelet transfusion support needed.'
        }
      ];
      await BloodRequest.insertMany(defaultRequests);
      console.log('Seeded initial emergency blood requests.');
    }
  } catch (err) {
    console.warn('Requests seed skipped:', err.message);
  }
};

// Get all blood requests with optional filters
router.get('/', async (req, res) => {
  try {
    await seedInitialRequestsIfEmpty();
    const { bloodType, location, status } = req.query;
    const filter = {};

    if (bloodType) filter.bloodType = bloodType;
    if (status) filter.status = status;
    if (location) {
      filter.$or = [
        { location: { $regex: location, $options: 'i' } },
        { hospitalName: { $regex: location, $options: 'i' } },
        { pincode: { $regex: location, $options: 'i' } }
      ];
    }

    const requests = await BloodRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching blood requests:', err);
    res.status(500).json({ msg: err.message || 'Server error retrieving blood requests.' });
  }
});

// Create a new emergency blood request
router.post('/', optionalAuth, async (req, res) => {
  const { patientName, bloodType, unitsNeeded, hospitalName, location, pincode, contactNumber, urgency, notes } = req.body;

  if (!patientName || !bloodType || !hospitalName || !location || !contactNumber) {
    return res.status(400).json({
      msg: 'Patient name, blood type, hospital name, location, and contact number are required.'
    });
  }

  try {
    const bloodReq = new BloodRequest({
      patientName: patientName.trim(),
      bloodType,
      unitsNeeded: unitsNeeded ? Number(unitsNeeded) : 1,
      hospitalName: hospitalName.trim(),
      location: location.trim(),
      pincode: pincode ? pincode.trim() : '500001',
      contactNumber: contactNumber.trim(),
      urgency: urgency && ['Normal', 'Critical', 'Immediate'].includes(urgency) ? urgency : 'Normal',
      notes: notes ? notes.trim() : '',
      requestedBy: req.user ? req.user.id : null
    });

    await bloodReq.save();
    res.status(201).json({
      msg: 'Emergency blood request created successfully!',
      bloodRequest: bloodReq
    });
  } catch (err) {
    console.error('Error creating blood request:', err);
    res.status(500).json({ msg: err.message || 'Server error creating blood request.' });
  }
});

// Update blood request status (e.g. Fulfilled or Cancelled)
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status || !['Pending', 'Fulfilled', 'Cancelled'].includes(status)) {
    return res.status(400).json({ msg: 'Valid status (Pending, Fulfilled, Cancelled) is required.' });
  }

  try {
    const updated = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ msg: 'Blood request not found.' });
    }
    res.json({ msg: `Request marked as ${status}`, bloodRequest: updated });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;

