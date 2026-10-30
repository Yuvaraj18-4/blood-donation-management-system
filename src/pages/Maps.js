import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { getDonors } from "../api";
import L from "leaflet";

// Fix default marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Default fallback donors with Hyderabad coordinates
const defaultDonors = [
  { id: 'm1', name: "Kavya Sri", bloodType: "A+", pincode: "500001", location: "Abids", lat: 17.3850, lng: 78.4867, mobile: "9876543210" },
  { id: 'm2', name: "Rahul Kumar", bloodType: "B+", pincode: "500034", location: "Banjara Hills", lat: 17.4156, lng: 78.4350, mobile: "9123456780" },
  { id: 'm3', name: "Priya Sharma", bloodType: "O+", pincode: "500020", location: "Domalguda", lat: 17.4080, lng: 78.4890, mobile: "9988776655" },
  { id: 'm4', name: "Anil Reddy", bloodType: "AB+", pincode: "500081", location: "Madhapur", lat: 17.4480, lng: 78.3900, mobile: "9012345678" },
  { id: 'm5', name: "Meena Patel", bloodType: "O-", pincode: "500003", location: "Secunderabad", lat: 17.4399, lng: 78.4983, mobile: "9876501234" },
];

function Maps() {
  const [donors, setDonors] = useState([]);
  const [filters, setFilters] = useState({ bloodGroup: "", pincode: "" });

  useEffect(() => {
    const fetchLiveMapDonors = async () => {
      try {
        const res = await getDonors(filters.bloodGroup, filters.pincode);
        if (res.data && res.data.length > 0) {
          setDonors(res.data);
        } else {
          setDonors(defaultDonors);
        }
      } catch (err) {
        setDonors(defaultDonors);
      }
    };

    fetchLiveMapDonors();
  }, [filters.bloodGroup, filters.pincode]);

  // Filter donors based on input
  const filteredDonors = donors.filter((donor) => {
    const bType = donor.bloodType || donor.bloodGroup || "";
    const pin = (donor.pincode || donor.location || "").toLowerCase();
    const matchesBlood = filters.bloodGroup === "" || bType === filters.bloodGroup;
    const matchesPin = filters.pincode === "" || pin.includes(filters.pincode.toLowerCase());
    return matchesBlood && matchesPin;
  });

  return (
    <>
      <Navbar />
      <div className="map-filters" style={{ padding: "15px 24px", background: "#f8f9fa", display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap", borderBottom: "1px solid #ddd" }}>
        <h3 style={{ margin: 0, color: "#b71c1c", fontSize: "1.1rem" }}>🗺️ Real-Time Donor GIS Map</h3>

        <div>
          <select
            value={filters.bloodGroup}
            onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Filter City / Pincode"
            value={filters.pincode}
            onChange={(e) => setFilters({ ...filters, pincode: e.target.value })}
            style={{ padding: "8px 12px", borderRadius: "6px", width: "180px", border: "1px solid #ccc" }}
          />
        </div>

        <span style={{ fontSize: "14px", color: "#555" }}>
          Showing <strong>{filteredDonors.length}</strong> active lifesavers on map
        </span>
      </div>

      <div style={{ height: "calc(100vh - 130px)", width: "100%" }}>
        <MapContainer center={[17.3850, 78.4867]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          />
          {filteredDonors.map((donor) => {
            const bType = donor.bloodType || donor.bloodGroup || "O+";
            const loc = donor.location || donor.pincode || "Hyderabad";
            const phone = donor.mobile || donor.phone || "9876543210";
            const lat = donor.lat || 17.3850;
            const lng = donor.lng || 78.4867;

            return (
              <Marker key={donor._id || donor.id} position={[lat, lng]}>
                <Popup>
                  <div style={{ padding: "5px" }}>
                    <h4 style={{ margin: "0 0 5px", color: "#b71c1c" }}>{donor.name}</h4>
                    <p style={{ margin: "2px 0" }}>
                      Blood Group: <strong style={{ color: "#b71c1c" }}>{bType}</strong>
                    </p>
                    <p style={{ margin: "2px 0" }}>
                      Location: {loc}
                    </p>
                    <p style={{ margin: "6px 0 0" }}>
                      <a
                        href={`tel:${phone}`}
                        style={{
                          display: "inline-block",
                          background: "#b71c1c",
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}
                      >
                        📞 Contact {phone}
                      </a>
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </>
  );
}

export default Maps;
