import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { getDonors } from '../api';
import './SearchResults.css';

function SearchResults() {
  const [donors, setDonors] = useState([]);
  const [bloodGroup, setBloodGroup] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [contactModalDonor, setContactModalDonor] = useState(null);

  const fetchDonors = async () => {
    if (!bloodGroup && !pincode) {
      alert('Please select a blood group or enter location/pincode to search.');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await getDonors(bloodGroup, pincode);
      setDonors(res.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch donors from server. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-results-page">
      <Navbar />

      {/* Hero Section */}
      <div className="search-hero">
        <h1>Find a Blood Donor, Save a Life ❤️</h1>
        <p>
          “The blood you donate gives someone another chance at life. Be a hero — connect today!”
        </p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>

        <input
          type="text"
          placeholder="Enter City or Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />

        <button className="btn-search" onClick={fetchDonors} disabled={loading}>
          {loading ? 'Searching...' : 'Search Donors'}
        </button>
      </div>

      {/* Donor Cards Section */}
      <div className="results">
        {loading && (
          <p style={{ textAlign: 'center', fontSize: '18px', padding: '40px' }}>
            Searching verified donor network...
          </p>
        )}

        {!loading && searched && donors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px', maxWidth: '500px', margin: '20px auto' }}>
            <p className="no-results" style={{ fontSize: '18px', color: '#b71c1c' }}>
              No matching donors found in this location.
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Try searching by universal donor types (O-) or broadening the city search.
            </p>
          </div>
        )}

        <div className="donor-grid">
          {donors.map((donor) => {
            const bType = donor.bloodType || donor.bloodGroup || 'O+';
            const loc = donor.location || donor.pincode || 'Local Area';
            const phone = donor.mobile || donor.phone || '9876543210';
            const isEligible = donor.eligibility ? donor.eligibility.eligible : true;

            return (
              <div key={donor._id || donor.id} className="donor-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{donor.name}</h3>
                  <span style={{
                    backgroundColor: '#ffebee',
                    color: '#b71c1c',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {bType}
                  </span>
                </div>

                <p><strong>Location:</strong> {loc}</p>
                <p>
                  <strong>Eligibility:</strong>{' '}
                  <span style={{ color: isEligible ? '#2e7d32' : '#e65100', fontWeight: 'bold' }}>
                    {isEligible ? '✅ Ready to Donate' : '⏳ In Rest Period'}
                  </span>
                </p>
                <p>
                  <strong>Contact:</strong>{' '}
                  <a href={`tel:${phone}`}>{phone}</a>
                </p>

                <button
                  className="connect-btn"
                  onClick={() => setContactModalDonor(donor)}
                >
                  Contact Donor ❤️
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Contact Modal */}
      {contactModalDonor && (
        <div className="modal-overlay" onClick={() => setContactModalDonor(null)}>
          <div className="modal" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect with Donor</h2>
              <button className="close-btn" onClick={() => setContactModalDonor(null)}>×</button>
            </div>
            <div style={{ padding: '20px 10px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🩸</div>
              <h3>{contactModalDonor.name}</h3>
              <p>Blood Group: <strong>{contactModalDonor.bloodType || contactModalDonor.bloodGroup}</strong></p>
              <p>Location: <strong>{contactModalDonor.location || contactModalDonor.pincode}</strong></p>
              <div style={{ margin: '20px 0' }}>
                <a
                  href={`tel:${contactModalDonor.mobile || contactModalDonor.phone}`}
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#b71c1c',
                    color: '#fff',
                    borderRadius: '25px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  📞 Call {contactModalDonor.mobile || contactModalDonor.phone}
                </a>
              </div>
              <p style={{ fontSize: '12px', color: '#888' }}>
                Please maintain medical etiquette when contacting voluntary lifesavers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
