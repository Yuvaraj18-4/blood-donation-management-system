import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCamps, registerForCamp, getRegistrations, cancelRegistration } from "../api";
import "./BloodCamp.css";

// Fix default marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function BloodCamp() {
  const [camps, setCamps] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [searchPincode, setSearchPincode] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingCampId, setBookingCampId] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    let u = null;
    if (userStr) {
      try {
        u = JSON.parse(userStr);
        setCurrentUser(u);
      } catch (e) {
        localStorage.removeItem("user");
      }
    }

    loadCampsAndRegistrations(u ? u._id : null);
  }, []);

  const loadCampsAndRegistrations = async (userId, search = "") => {
    setLoading(true);
    try {
      const campsRes = await getCamps(search);
      setCamps(campsRes.data || []);

      if (userId) {
        const regsRes = await getRegistrations(userId);
        setRegistrations(regsRes.data || []);
      }
    } catch (err) {
      console.error("Error loading camps:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCampsAndRegistrations(currentUser ? currentUser._id : null, searchPincode);
  };

  const handleRegisterCamp = async (camp) => {
    if (!currentUser || !currentUser._id) {
      alert("Please log in or register an account before booking a blood camp slot.");
      return;
    }

    if (camp.slots <= 0) {
      alert("No slots remaining for this camp.");
      return;
    }

    setBookingCampId(camp._id);
    try {
      const res = await registerForCamp(camp._id, currentUser._id);
      alert(res.data.msg || "Successfully booked your donation appointment!");
      // Reload camps and registrations to reflect decremented slots
      loadCampsAndRegistrations(currentUser._id, searchPincode);
    } catch (err) {
      alert(err.response?.data?.msg || "Could not complete camp registration.");
    } finally {
      setBookingCampId(null);
    }
  };

  const handleCancelRegistration = async (regId) => {
    if (!window.confirm("Cancel this camp appointment and release your reserved slot?")) {
      return;
    }

    try {
      await cancelRegistration(regId);
      alert("Appointment cancelled and slot released.");
      loadCampsAndRegistrations(currentUser ? currentUser._id : null, searchPincode);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to cancel appointment.");
    }
  };

  const handleCertificate = (reg) => {
    setSelectedCert({
      donorName: currentUser ? currentUser.name : "Registered Donor",
      campTitle: reg.camp || reg.campTitle || "Blood Donation Camp",
      date: reg.date || new Date().toDateString(),
      certificateId: reg.certificateId || "CERT-" + (reg._id || "BDMS").substring(0, 8),
      status: reg.status
    });
  };

  return (
    <div>
      <Navbar />

      <div className="bloodcamp-container">
        <h2>🩸 Scheduled Blood Donation Camps</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          Reserve your voluntary donation slot at organized community camps. Walk-in slots are limited!
        </p>

        {/* Search Section */}
        <form className="camp-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by Camp Name, City, or Pincode"
            value={searchPincode}
            onChange={(e) => setSearchPincode(e.target.value)}
            style={{ width: "350px", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <button type="submit" className="btn" style={{ marginLeft: "10px" }}>
            Search Camps
          </button>
        </form>

        {/* Map Section */}
        <div style={{ height: "380px", margin: "25px 0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          <MapContainer center={[17.3850, 78.4867]} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            />
            {camps.map(c => (
              <Marker key={c._id || c.id} position={[c.lat || 17.3850, c.lng || 78.4867]}>
                <Popup>
                  <strong>{c.title}</strong> <br />
                  Hosted by: {c.hostedBy} <br />
                  Date: {c.date ? new Date(c.date).toDateString() : "Scheduled"} <br />
                  Location: {c.location} <br />
                  Slots Available: <strong>{c.slots}</strong>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Upcoming Camps Grid */}
        <h3 style={{ margin: "30px 0 15px", color: "#b71c1c" }}>Available Donation Drives</h3>
        {loading ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Loading blood camps...</p>
        ) : (
          <div className="upcoming-camps">
            {camps.map(c => {
              const isFull = c.slots <= 0;
              const isAlreadyRegistered = registrations.some(
                r => (r.campId === c._id || r.id === c._id) && r.status === "Registered"
              );

              return (
                <div key={c._id || c.id} className={`camp-card ${isFull ? 'full' : ''}`}>
                  <h3>{c.title}</h3>
                  <p><strong>Hosted by:</strong> {c.hostedBy}</p>
                  <p><strong>Date:</strong> {c.date ? new Date(c.date).toLocaleDateString() : 'Scheduled'}</p>
                  <p><strong>Location:</strong> {c.location}</p>
                  <p>
                    <strong>Slots Remaining:</strong>{' '}
                    <span style={{ fontWeight: "bold", color: isFull ? "#d32f2f" : "#2e7d32" }}>
                      {c.slots}
                    </span>
                  </p>
                  <p style={{ fontSize: "13px", color: "#666" }}>{c.description}</p>

                  {isAlreadyRegistered ? (
                    <span style={{ display: "inline-block", padding: "8px 12px", background: "#e8f5e9", color: "#2e7d32", borderRadius: "6px", fontWeight: "bold" }}>
                      ✅ You are Registered
                    </span>
                  ) : isFull ? (
                    <span className="full-text">All Slots Filled</span>
                  ) : (
                    <button
                      className="btn"
                      onClick={() => handleRegisterCamp(c)}
                      disabled={bookingCampId === c._id}
                    >
                      {bookingCampId === c._id ? "Booking..." : "Register to Donate"}
                    </button>
                  )}
                </div>
              );
            })}
            {camps.length === 0 && (
              <p style={{ textAlign: "center", width: "100%", padding: "20px" }}>
                No camps found matching this criteria.
              </p>
            )}
          </div>
        )}

        {/* My Registrations Section */}
        {currentUser && (
          <div style={{ marginTop: "40px" }}>
            <h3 style={{ color: "#b71c1c" }}>My Camp Appointments</h3>
            {registrations.length === 0 ? (
              <p style={{ padding: "15px", background: "#fff", borderRadius: "6px", color: "#777" }}>
                You have not booked any upcoming camp appointments. Choose an available camp above to reserve your slot!
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Camp Name</th>
                    <th>Hosted By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(r => (
                    <tr key={r._id || r.id}>
                      <td><strong>{r.camp || r.campTitle}</strong></td>
                      <td>{r.hostedBy || "Red Cross"}</td>
                      <td>{r.date}</td>
                      <td>
                        <span style={{
                          color: r.status === "Cancelled" ? "#999" : (r.status === "Attended" ? "#2e7d32" : "#b71c1c"),
                          fontWeight: "bold"
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn" style={{ marginRight: "8px" }} onClick={() => handleCertificate(r)}>
                          Certificate
                        </button>
                        {r.status === "Registered" && (
                          <button
                            className="btn cancel"
                            onClick={() => handleCancelRegistration(r._id || r.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="modal" style={{ width: "600px", maxWidth: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Certificate of Appreciation</h2>
              <button className="close-btn" onClick={() => setSelectedCert(null)}>×</button>
            </div>
            <div style={{
              padding: "25px",
              textAlign: "center",
              border: "4px double #b71c1c",
              borderRadius: "8px",
              backgroundColor: "#fff",
              marginTop: "10px"
            }}>
              <div style={{ fontSize: "40px" }}>🏆</div>
              <h3 style={{ color: "#b71c1c", margin: "10px 0 5px" }}>VOLUNTARY BLOOD DONATION</h3>
              <p style={{ color: "#666", fontSize: "14px" }}>Presented in high recognition to</p>
              <h2 style={{ color: "#222", borderBottom: "2px solid #b71c1c", display: "inline-block", paddingBottom: "5px" }}>
                {selectedCert.donorName}
              </h2>
              <p style={{ margin: "15px 0", fontSize: "14px", lineHeight: "1.6", color: "#444" }}>
                For dedicated service in donating blood at <strong>{selectedCert.campTitle}</strong> on <strong>{selectedCert.date}</strong>. 
                Your selfless gift saves human lives and supports trauma patients.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#777", marginTop: "20px", borderTop: "1px dashed #ccc", paddingTop: "10px" }}>
                <div>ID: <strong>{selectedCert.certificateId}</strong></div>
                <div>Status: <strong>{selectedCert.status}</strong></div>
                <div>Authorized: <strong>National Blood Transfusion Council</strong></div>
              </div>
            </div>
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <button
                className="btn-submit"
                onClick={() => window.print()}
                style={{ width: "auto", padding: "8px 24px" }}
              >
                🖨️ Print / Save Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BloodCamp;
