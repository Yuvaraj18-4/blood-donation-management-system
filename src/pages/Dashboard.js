import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentUser, getRegistrations, cancelRegistration, updateProfile } from "../api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const stored = localStorage.getItem("user");
      let currentUser = stored ? JSON.parse(stored) : null;

      try {
        const token = localStorage.getItem("token");
        if (token) {
          const profileRes = await getCurrentUser();
          currentUser = profileRes.data;
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      } catch (err) {
        console.warn("Could not refresh profile from API, using cached:", err.message);
      }

      if (!currentUser) {
        // Fallback demo profile if visitor explores dashboard without auth
        currentUser = {
          _id: "demo-user-1",
          name: "Guest Donor",
          bloodType: "O+",
          totalDonations: 3,
          rewardPoints: 75,
          lastDonation: "2025-08-15",
          eligibility: {
            eligible: true,
            daysRemaining: 0,
            message: "Eligible to donate blood."
          }
        };
      }

      setUser(currentUser);

      // Load live registrations
      if (currentUser._id && currentUser._id !== "demo-user-1") {
        try {
          const regRes = await getRegistrations(currentUser._id);
          setAppointments(regRes.data || []);
        } catch (err) {
          console.error("Error fetching registrations:", err);
        }
      } else {
        // Sample appointment for guest
        setAppointments([
          {
            _id: "demo-app-1",
            id: "demo-app-1",
            camp: "City Center Mega Blood Drive",
            date: "Scheduled This Weekend",
            status: "Registered"
          }
        ]);
      }

      setLoading(false);
    };

    loadDashboard();
  }, []);

  const handleDownload = (appointment) => {
    const certData = {
      donorName: user.name,
      bloodType: user.bloodType || "O+",
      campTitle: appointment.camp || appointment.campTitle || "Blood Donation Camp",
      date: appointment.date || new Date().toDateString(),
      certificateId: appointment.certificateId || "CERT-BDMS-" + (appointment._id || "2026").substring(0, 8),
      status: appointment.status
    };
    setSelectedCert(certData);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment and release your reserved slot?")) {
      return;
    }

    try {
      if (appointmentId !== "demo-app-1") {
        await cancelRegistration(appointmentId);
      }
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId || a.id === appointmentId ? { ...a, status: "Cancelled" } : a))
      );
      alert("Appointment successfully cancelled.");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to cancel appointment.");
    }
  };

  const handleRecordNewDonation = async () => {
    const donationDate = prompt("Enter donation date (YYYY-MM-DD):", new Date().toISOString().split("T")[0]);
    if (!donationDate) return;

    try {
      const res = await updateProfile({ lastDonation: donationDate });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Donation successfully recorded! +25 reward points awarded.");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to record donation.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "60px", textAlign: "center" }}>
          <h3>Loading your donor dashboard...</h3>
        </div>
      </>
    );
  }

  const maxPoints = 200;
  const currentPoints = user.rewardPoints || 0;
  const progressPercent = Math.min(100, Math.round((currentPoints / maxPoints) * 100));

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h2>Welcome, {user.name}!</h2>
            <p>Blood Group: <strong>{user.bloodType || "O+"}</strong> • Keep donating blood to save lives and earn community badges!</p>
          </div>
          <div>
            <button
              onClick={handleRecordNewDonation}
              style={{
                backgroundColor: "#2e7d32",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "20px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              + Record Completed Donation
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="card">
            <h3>Total Donations</h3>
            <p>{user.totalDonations || 0} Pints</p>
            <span style={{ fontSize: "12px", color: "#666" }}>Up to {(user.totalDonations || 0) * 3} lives touched</span>
          </div>

          <div className="card">
            <h3>Reward Points</h3>
            <p>{currentPoints} / {maxPoints}</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span style={{ fontSize: "12px", color: "#666" }}>{progressPercent}% towards Gold Donor Badge</span>
          </div>

          <div className="card">
            <h3>Last Donation</h3>
            <p>{user.lastDonation ? new Date(user.lastDonation).toISOString().split("T")[0] : "None recorded"}</p>
            <span style={{ fontSize: "12px", color: "#666" }}>90-day clinical rest gap</span>
          </div>

          <div className="card">
            <h3>Donation Eligibility</h3>
            <p style={{ color: user.eligibility?.eligible !== false ? "#2e7d32" : "#e65100" }}>
              {user.eligibility?.eligible !== false ? "✅ Ready to Donate" : `⏳ ${user.eligibility?.daysRemaining} Days Rest`}
            </p>
            <span style={{ fontSize: "12px", color: "#666" }}>
              {user.eligibility?.message || "Standard medical rest period"}
            </span>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="upcoming-appointments">
          <h4>My Blood Camp Appointments</h4>
          {appointments.length === 0 ? (
            <p style={{ padding: "20px", color: "#777", textAlign: "center" }}>
              No camp appointments booked yet. Visit the <a href="/bloodcamp" style={{ color: "#b71c1c", fontWeight: "bold" }}>Blood Camps</a> page to reserve a donation slot!
            </p>
          ) : (
            <ul>
              {appointments.map((app) => (
                <li key={app._id || app.id}>
                  <span><strong>{app.camp || app.campTitle}</strong></span>
                  <span>{app.date}</span>
                  <span style={{
                    color: app.status === "Cancelled" ? "#999" : (app.status === "Attended" ? "#2e7d32" : "#b71c1c"),
                    fontWeight: "bold"
                  }}>
                    {app.status}
                  </span>
                  <div className="appointment-actions">
                    <button className="btn btn-small" onClick={() => handleDownload(app)}>
                      Certificate
                    </button>
                    {app.status === "Registered" && (
                      <button
                        className="btn btn-small cancel"
                        onClick={() => handleCancelAppointment(app._id || app.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
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
                Your selfless contribution supports emergency surgeries and patient transfusions.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#777", marginTop: "20px", borderTop: "1px dashed #ccc", paddingTop: "10px" }}>
                <div>ID: <strong>{selectedCert.certificateId}</strong></div>
                <div>Status: <strong>{selectedCert.status}</strong></div>
                <div>Authorized: <strong>Blood Transfusion Council</strong></div>
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
    </>
  );
}

export default Dashboard;
