import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getDonors } from '../api';
import './SearchResults.css';

function DonorList() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await getDonors();
        setDonors(res.data || []);
      } catch (err) {
        console.error('Error fetching donors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  return (
    <div className="search-results-page" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#b71c1c', marginBottom: '10px' }}>🩸 Registered Donors Roster</h2>
        <p style={{ color: '#666', marginBottom: '25px' }}>
          Directory of verified community blood donors ready to respond to urgent medical requirements.
        </p>

        {loading ? (
          <p>Loading registered donors list...</p>
        ) : (
          <div className="donor-grid">
            {donors.map((d) => (
              <div key={d._id || d.id} className="donor-card">
                <h3>{d.name}</h3>
                <p><strong>Blood Group:</strong> {d.bloodType || d.bloodGroup || 'O+'}</p>
                <p><strong>Location:</strong> {d.location || d.pincode || 'Local Area'}</p>
                <p><strong>Contact:</strong> <a href={`tel:${d.mobile || d.phone}`}>{d.mobile || d.phone || 'Available via App'}</a></p>
              </div>
            ))}
            {donors.length === 0 && (
              <p>No registered donors available at this moment.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DonorList;
