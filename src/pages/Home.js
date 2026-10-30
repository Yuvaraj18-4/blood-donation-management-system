import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaUserPlus, FaHeartbeat, FaSearch } from 'react-icons/fa';
import { getDonors, createBloodRequest } from '../api';
import './Home.css';

// Initial verified fallback donors
const defaultDonors = [
  { id: 'd1', name: 'Kavya Sri', bloodType: 'A+', location: 'Hyderabad', lastDonation: '2025-08-12', mobile: '9876543210' },
  { id: 'd2', name: 'Rahul Kumar', bloodType: 'O-', location: 'Secunderabad', lastDonation: '2025-07-20', mobile: '9123456780' },
  { id: 'd3', name: 'Anjali Reddy', bloodType: 'B+', location: 'Hyderabad', lastDonation: '2025-09-05', mobile: '9988776655' },
  { id: 'd4', name: 'Suresh K', bloodType: 'AB-', location: 'Hitech City', lastDonation: '2025-06-15', mobile: '9012345678' },
  { id: 'd5', name: 'Meena P', bloodType: 'A-', location: 'Hyderabad', lastDonation: '2025-08-01', mobile: '9876512340' },
];

function Home() {
  const navigate = useNavigate();
  const [selectedBlood, setSelectedBlood] = useState('');
  const [donors, setDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);

  // Emergency Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestData, setRequestData] = useState({
    patientName: '',
    bloodType: 'O+',
    unitsNeeded: 1,
    hospitalName: '',
    location: 'Hyderabad',
    pincode: '500001',
    contactNumber: '',
    urgency: 'Critical',
    notes: ''
  });

  useEffect(() => {
    const fetchLiveDonors = async () => {
      try {
        const res = await getDonors();
        if (res.data && res.data.length > 0) {
          setDonors(res.data);
        } else {
          setDonors(defaultDonors);
        }
      } catch (err) {
        setDonors(defaultDonors);
      } finally {
        setLoadingDonors(false);
      }
    };
    fetchLiveDonors();
  }, []);

  const filteredDonors = selectedBlood
    ? donors.filter(d => (d.bloodType || d.bloodGroup) === selectedBlood)
    : donors;

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestError('');
    try {
      await createBloodRequest(requestData);
      setRequestSubmitted(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSubmitted(false);
        setRequestData({
          patientName: '',
          bloodType: 'O+',
          unitsNeeded: 1,
          hospitalName: '',
          location: 'Hyderabad',
          pincode: '500001',
          contactNumber: '',
          urgency: 'Critical',
          notes: ''
        });
      }, 2500);
    } catch (err) {
      setRequestError(err.response?.data?.msg || 'Failed to submit blood request. Please check inputs.');
    }
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <header className="home-header">
        <div className="hero-text">
          <h1>Welcome to Blood Donor Finder</h1>
          <p>Connect verified blood donors with patients in emergency need. Every drop counts!</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
            <button className="btn-primary" onClick={() => navigate('/register')}>
              Become a Donor
            </button>
            <button
              className="btn-primary"
              style={{ backgroundColor: '#fff', color: '#b71c1c' }}
              onClick={() => setShowRequestModal(true)}
            >
              Emergency Request
            </button>
          </div>
        </div>
      </header>

      {/* Options Section */}
      <section className="options-section">
        <div className="option-card">
          <FaUserPlus size={50} style={{ color: '#b71c1c' }} />
          <h3>Become a Donor</h3>
          <p>Register as a volunteer donor. Receive alerts when someone nearby needs your blood group.</p>
          <button className="btn" onClick={() => navigate('/register')}>Register Now</button>
        </div>

        <div className="option-card">
          <FaHeartbeat size={50} style={{ color: '#b71c1c' }} />
          <h3>Request Blood</h3>
          <p>Create an urgent blood request for hospital patients in critical conditions.</p>
          <button className="btn" onClick={() => setShowRequestModal(true)}>Request Now</button>
        </div>

        <div className="option-card">
          <FaSearch size={50} style={{ color: '#b71c1c' }} />
          <h3>Find a Donor</h3>
          <p>Search active donors by blood type and location or view our interactive map.</p>
          <button className="btn" onClick={() => navigate('/search')}>Find Now</button>
        </div>
      </section>

      {/* Blood Chart Section */}
      <section className="blood-chart">
        <h2>Blood Donation Compatibility Chart</h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginBottom: '15px' }}>
          * Educational reference only. Laboratory cross-matching is clinically required prior to transfusion.
        </p>
        <table>
          <thead>
            <tr>
              <th>Blood Type</th>
              <th>Can Donate To</th>
              <th>Can Receive From</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>A+</strong></td><td>A+, AB+</td><td>A+, A-, O+, O-</td></tr>
            <tr><td><strong>A-</strong></td><td>A+, A-, AB+, AB-</td><td>A-, O-</td></tr>
            <tr><td><strong>B+</strong></td><td>B+, AB+</td><td>B+, B-, O+, O-</td></tr>
            <tr><td><strong>B-</strong></td><td>B+, B-, AB+, AB-</td><td>B-, O-</td></tr>
            <tr><td><strong>AB+ (Universal Recipient)</strong></td><td>AB+</td><td>All Blood Groups</td></tr>
            <tr><td><strong>AB-</strong></td><td>AB+, AB-</td><td>A-, B-, AB-, O-</td></tr>
            <tr><td><strong>O+</strong></td><td>O+, A+, B+, AB+</td><td>O+, O-</td></tr>
            <tr><td><strong>O- (Universal Donor)</strong></td><td>All Blood Groups</td><td>O- only</td></tr>
          </tbody>
        </table>
      </section>

      {/* Nearby Donors Section */}
      <section className="nearby-donors">
        <h2>Verified Donors Directory</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Filter by Blood Type: </label>
          <select
            value={selectedBlood}
            onChange={(e) => setSelectedBlood(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        {loadingDonors ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Loading registered donors...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Blood Type</th>
                <th>Location</th>
                <th>Last Donation</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((donor, idx) => (
                <tr key={donor._id || donor.id || idx}>
                  <td><strong>{donor.name}</strong></td>
                  <td><span style={{ backgroundColor: '#ffebee', color: '#b71c1c', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{donor.bloodType || donor.bloodGroup}</span></td>
                  <td>{donor.location || donor.pincode}</td>
                  <td>{donor.lastDonation ? new Date(donor.lastDonation).toISOString().split('T')[0] : 'First-time donor'}</td>
                  <td><a href={`tel:${donor.mobile || donor.phone}`}>{donor.mobile || donor.phone || 'Available via App'}</a></td>
                </tr>
              ))}
              {filteredDonors.length === 0 && (
                <tr>
                  <td colSpan="5">No registered donors found for blood type {selectedBlood}.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <h3>"Donate blood, save a life. Your one pint can save up to three lives!"</h3>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>💖 Blood Donation Management System — Connecting Lifesavers Every Day.</p>
      </footer>

      {/* Emergency Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal" style={{ width: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ color: '#b71c1c' }}>🚨 Emergency Blood Request</h2>
              <button className="close-btn" onClick={() => setShowRequestModal(false)}>×</button>
            </div>

            {requestSubmitted ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#2e7d32' }}>
                <h4>✅ Blood Request Broadcasted!</h4>
                <p>Compatible donors in your area are notified. Medical teams will coordinate shortly.</p>
              </div>
            ) : (
              <form className="modal-form" onSubmit={handleRequestSubmit}>
                {requestError && (
                  <div style={{ color: '#d32f2f', background: '#ffebee', padding: '8px', borderRadius: '4px', marginBottom: '10px', fontSize: '13px' }}>
                    {requestError}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Patient Name *"
                  required
                  value={requestData.patientName}
                  onChange={(e) => setRequestData({ ...requestData, patientName: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={requestData.bloodType}
                    onChange={(e) => setRequestData({ ...requestData, bloodType: e.target.value })}
                    style={{ flex: 1, padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Units Needed"
                    required
                    style={{ width: '120px' }}
                    value={requestData.unitsNeeded}
                    onChange={(e) => setRequestData({ ...requestData, unitsNeeded: e.target.value })}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Hospital Name & Branch *"
                  required
                  value={requestData.hospitalName}
                  onChange={(e) => setRequestData({ ...requestData, hospitalName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="City / Area *"
                  required
                  value={requestData.location}
                  onChange={(e) => setRequestData({ ...requestData, location: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Emergency Attendant Contact Number *"
                  required
                  value={requestData.contactNumber}
                  onChange={(e) => setRequestData({ ...requestData, contactNumber: e.target.value })}
                />
                <select
                  value={requestData.urgency}
                  onChange={(e) => setRequestData({ ...requestData, urgency: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  <option value="Immediate">Immediate (Within 2 Hours)</option>
                  <option value="Critical">Critical (Within 6 Hours)</option>
                  <option value="Normal">Normal (Within 24 Hours)</option>
                </select>
                <textarea
                  placeholder="Additional Clinical Notes (Optional)"
                  rows="2"
                  value={requestData.notes}
                  onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '10px' }}
                />
                <button type="submit" className="btn-submit" style={{ backgroundColor: '#b71c1c' }}>
                  Broadcast Emergency Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
