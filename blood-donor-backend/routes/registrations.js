const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const BloodCamp = require('../models/BloodCamp');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');

// Get registrations by user ID (both /user/:userId and /:userId supported)
const getUserRegistrations = async (req, res) => {
  const userId = req.params.userId;
  try {
    const regs = await Registration.find({ userId })
      .populate('campId')
      .sort({ createdAt: -1 });

    // Format clean response handling deleted camp references gracefully
    const formatted = regs.map(reg => {
      const camp = reg.campId || {};
      return {
        _id: reg._id,
        id: reg._id,
        campId: camp._id || null,
        campTitle: camp.title || 'Blood Donation Camp',
        camp: camp.title || 'Blood Donation Camp', // Compatibility with frontend
        hostedBy: camp.hostedBy || 'Red Cross',
        location: camp.location || 'Central Clinic',
        date: camp.date ? new Date(camp.date).toLocaleDateString() : 'Scheduled Date',
        status: reg.status,
        certificateId: reg.certificateId,
        certificateIssuedAt: reg.certificateIssuedAt,
        createdAt: reg.createdAt
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ msg: err.message || 'Server error retrieving registrations.' });
  }
};

router.get('/user/:userId', getUserRegistrations);
router.get('/:userId', getUserRegistrations);

// Register for a blood camp with slot decrement and duplicate protection
router.post('/', optionalAuth, async (req, res) => {
  const { campId, userId } = req.body;

  if (!campId || !userId) {
    return res.status(400).json({ msg: 'campId and userId are required.' });
  }

  try {
    const camp = await BloodCamp.findById(campId);
    if (!camp) {
      return res.status(404).json({ msg: 'Blood camp not found.' });
    }

    if (camp.slots <= 0) {
      return res.status(400).json({ msg: 'Sorry, no slots are remaining for this blood camp.' });
    }

    const existingReg = await Registration.findOne({
      userId,
      campId,
      status: 'Registered'
    });

    if (existingReg) {
      return res.status(400).json({ msg: 'You are already registered for this blood donation camp.' });
    }

    // Create registration
    const reg = new Registration({
      userId,
      campId,
      status: 'Registered'
    });

    await reg.save();

    // Decrement camp slot count atomically
    camp.slots = Math.max(0, camp.slots - 1);
    await camp.save();

    const populated = await Registration.findById(reg._id).populate('campId');
    res.status(201).json({
      msg: 'Successfully registered for the blood camp!',
      registration: populated,
      remainingSlots: camp.slots
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: err.message || 'Server error processing camp registration.' });
  }
});

// Cancel registration and release slot
const cancelRegistration = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) {
      return res.status(404).json({ msg: 'Registration not found.' });
    }

    if (reg.status === 'Cancelled') {
      return res.status(400).json({ msg: 'This appointment is already cancelled.' });
    }

    reg.status = 'Cancelled';
    await reg.save();

    // Re-increment camp slot count
    if (reg.campId) {
      await BloodCamp.findByIdAndUpdate(reg.campId, { $inc: { slots: 1 } });
    }

    res.json({ msg: 'Appointment successfully cancelled. The slot has been released.', registration: reg });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ msg: err.message || 'Server error cancelling registration.' });
  }
};

router.delete('/:id', cancelRegistration);
router.put('/:id/cancel', cancelRegistration);

// Certificate data & verification
router.get('/:id/certificate', async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).populate('campId').populate('userId');
    if (!reg) {
      return res.status(404).json({ msg: 'Certificate record not found.' });
    }

    const donorName = reg.userId ? reg.userId.name : 'Donor';
    const campTitle = reg.campId ? reg.campId.title : 'Blood Donation Camp';
    const campDate = reg.campId && reg.campId.date ? new Date(reg.campId.date).toDateString() : new Date().toDateString();

    const certificateData = {
      certificateId: reg.certificateId || 'CERT-BDMS-' + reg._id.toString().substring(18),
      donorName,
      bloodType: reg.userId ? reg.userId.bloodType : 'Verified Donor',
      campTitle,
      date: campDate,
      issuedDate: reg.certificateIssuedAt ? new Date(reg.certificateIssuedAt).toDateString() : new Date().toDateString(),
      status: reg.status,
      authorizedBy: 'National Blood Transfusion & Donor Authority',
      verificationHash: Buffer.from(`${reg._id}-${donorName}`).toString('base64')
    };

    // If client requested HTML preview for direct printing / saving
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      res.setHeader('Content-Type', 'text/html');
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Blood Donation Certificate - ${donorName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; display: flex; justify-content: center; padding: 40px; background: #f0f2f5; }
            .cert-box { background: #fff; width: 800px; padding: 50px; border: 8px double #b71c1c; border-radius: 12px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
            h1 { color: #b71c1c; font-size: 32px; margin-bottom: 5px; text-transform: uppercase; }
            h3 { color: #555; font-weight: normal; margin-top: 0; }
            .name { font-size: 28px; font-weight: bold; color: #222; margin: 25px 0 10px; border-bottom: 2px solid #b71c1c; display: inline-block; padding: 0 30px 8px; }
            .details { font-size: 16px; color: #444; line-height: 1.8; margin: 20px 40px; }
            .cert-footer { margin-top: 40px; display: flex; justify-content: space-between; border-top: 1px dashed #ccc; padding-top: 20px; font-size: 14px; color: #777; }
            @media print { body { background: #fff; padding: 0; } .cert-box { box-shadow: none; border-width: 6px; } }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <h1>Certificate of Appreciation</h1>
            <h3>Blood Donation Management System</h3>
            <p>This certificate is proudly awarded to</p>
            <div class="name">${donorName}</div>
            <p class="details">
              In recognition of their noble and voluntary contribution as a registered blood donor at 
              <strong>${campTitle}</strong> on <strong>${campDate}</strong>. 
              Your generous gift brings hope and saves precious human lives.
            </p>
            <div class="cert-footer">
              <div><strong>Certificate ID:</strong> ${certificateData.certificateId}</div>
              <div><strong>Status:</strong> ${reg.status}</div>
              <div><strong>Authorized Signature:</strong> Chief Medical Officer</div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `);
    }

    res.json(certificateData);
  } catch (err) {
    console.error('Certificate error:', err);
    res.status(500).json({ msg: err.message || 'Server error retrieving certificate.' });
  }
});

module.exports = router;
