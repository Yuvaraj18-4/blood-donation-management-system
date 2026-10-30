import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // "login" or "register"
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bloodType: "O+",
    location: "Hyderabad",
    mobile: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const openModal = (tab) => {
    setActiveTab(tab);
    setErrorMsg("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setErrorMsg("");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (activeTab === "login") {
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        closeModal();
        navigate("/dashboard");
      } else {
        const res = await registerUser(formData);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        closeModal();
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.msg || "Authentication failed. Please check your credentials.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="nav-logo">🩸 Blood Donor Finder</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/bloodcamp" className="nav-link">Blood Camps</Link>
          <Link to="/search" className="nav-link">Search Donors</Link>
          <Link to="/maps" className="nav-link">Donor Map</Link>
          <Link to="/chatbot" className="nav-link">AI Assistant</Link>
        </div>
        <div className="navbar-right">
          {currentUser ? (
            <>
              <span className="user-greeting" style={{ marginRight: "12px", fontWeight: "bold" }}>
                👤 {currentUser.name} ({currentUser.bloodType || currentUser.bloodGroup || "Donor"})
              </span>
              <button className="nav-button login-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-button register-btn" onClick={() => openModal("register")}>
                Register
              </button>
              <button className="nav-button login-btn" onClick={() => openModal("login")}>
                Login
              </button>
            </>
          )}
        </div>
      </nav>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{activeTab === "login" ? "Donor Login" : "Donor Registration"}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-tabs">
              <button
                type="button"
                className={activeTab === "login" ? "active" : ""}
                onClick={() => { setActiveTab("login"); setErrorMsg(""); }}
              >
                Login
              </button>
              <button
                type="button"
                className={activeTab === "register" ? "active" : ""}
                onClick={() => { setActiveTab("register"); setErrorMsg(""); }}
              >
                Register
              </button>
            </div>

            {errorMsg && (
              <div style={{ color: "#d32f2f", backgroundColor: "#ffebee", padding: "8px", borderRadius: "4px", marginBottom: "12px", fontSize: "14px" }}>
                {errorMsg}
              </div>
            )}

            <form className="modal-form" onSubmit={handleAuthSubmit}>
              {activeTab === "login" ? (
                <>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? "Authenticating..." : "Login"}
                  </button>
                  <p style={{ textAlign: "center", marginTop: "10px", fontSize: "13px" }}>
                    Don't have an account?{" "}
                    <span
                      style={{ color: "#b71c1c", cursor: "pointer", fontWeight: "bold" }}
                      onClick={() => setActiveTab("register")}
                    >
                      Register here
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password (min 6 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
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
                    type="text"
                    name="location"
                    placeholder="City / Pincode"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="mobile"
                    placeholder="Phone Number (10 digits)"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                  />
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? "Registering..." : "Complete Registration"}
                  </button>
                  <p style={{ textAlign: "center", marginTop: "10px", fontSize: "13px" }}>
                    Already registered?{" "}
                    <span
                      style={{ color: "#b71c1c", cursor: "pointer", fontWeight: "bold" }}
                      onClick={() => setActiveTab("login")}
                    >
                      Login here
                    </span>
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
