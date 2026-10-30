const express = require('express');
const router = express.Router();
const BloodCamp = require('../models/BloodCamp');
const { optionalAuth } = require('../middleware/auth');

// Seed default initial camps if none exist
const seedInitialCampsIfEmpty = async () => {
  try {
    const count = await BloodCamp.countDocuments();
    if (count === 0) {
      const defaultCamps = [
        {
          title: 'City Center Mega Blood Drive',
          hostedBy: 'Indian Red Cross Society',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          slots: 25,
          initialSlots: 25,
          location: 'City Central Hall, Abids, Hyderabad',
          pincode: '500001',
          lat: 17.3850,
          lng: 78.4867,
          description: 'Join us for our monthly central donation camp. Free health checks provided.'
        },
        {
          title: 'Community Hospital Blood Donation Camp',
          hostedBy: 'Osmania Health Foundation',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          slots: 15,
          initialSlots: 20,
          location: 'Community Health Center, Banjara Hills',
          pincode: '500034',
          lat: 17.4156,
          lng: 78.4350,
          description: 'Emergency blood reserve collection camp for pediatric and trauma wards.'
        },
        {
          title: 'Tech Park Youth Blood Camp',
          hostedBy: 'Rotary Blood Bank',
          date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          slots: 40,
          initialSlots: 40,
          location: 'Cyber Gateway Auditorium, Hitech City',
          pincode: '500081',
          lat: 17.4474,
          lng: 78.3762,
          description: 'Annual IT park blood drive organized in collaboration with Rotary International.'
        }
      ];
      await BloodCamp.insertMany(defaultCamps);
      console.log('Seeded initial blood camps.');
    }
  } catch (err) {
    console.warn('Camp seed skipped or pending DB connection:', err.message);
  }
};

// Get all blood donation camps
router.get('/', async (req, res) => {
  try {
    await seedInitialCampsIfEmpty();
    const { pincode, search } = req.query;
    const filter = {};

    if (pincode) {
      filter.$or = [
        { pincode: { $regex: pincode, $options: 'i' } },
        { location: { $regex: pincode, $options: 'i' } }
      ];
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { hostedBy: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const camps = await BloodCamp.find(filter).sort({ date: 1 });
    res.json(camps);
  } catch (err) {
    console.error('Error fetching camps:', err);
    res.status(500).json({ msg: err.message || 'Server error retrieving blood camps.' });
  }
});

// Get camp details by ID
router.get('/:id', async (req, res) => {
  try {
    const camp = await BloodCamp.findById(req.params.id);
    if (!camp) {
      return res.status(404).json({ msg: 'Blood camp not found.' });
    }
    res.json(camp);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Add new blood camp
router.post('/', optionalAuth, async (req, res) => {
  const { title, hostedBy, date, slots, location, pincode, lat, lng, description } = req.body;

  if (!title || !hostedBy || !date || !location) {
    return res.status(400).json({ msg: 'Title, hostedBy, date, and location are required.' });
  }

  try {
    const slotCount = Number(slots) > 0 ? Number(slots) : 20;
    const camp = new BloodCamp({
      title: title.trim(),
      hostedBy: hostedBy.trim(),
      date: new Date(date),
      slots: slotCount,
      initialSlots: slotCount,
      location: location.trim(),
      pincode: pincode ? pincode.trim() : '500001',
      lat: lat ? Number(lat) : 17.3850,
      lng: lng ? Number(lng) : 78.4867,
      description: description ? description.trim() : 'Voluntary blood donation camp.'
    });

    await camp.save();
    res.status(201).json(camp);
  } catch (err) {
    console.error('Error creating camp:', err);
    res.status(500).json({ msg: err.message || 'Server error creating camp.' });
  }
});

module.exports = router;
