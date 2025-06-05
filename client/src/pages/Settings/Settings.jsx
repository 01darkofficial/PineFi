import React, { useState } from "react";
import { logout, updateNetWorth } from "../../redux/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Settings.css";
const Settings = () => {
  const { user, tokens } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [netWorth, setNetWorth] = useState(
    user?.netWorth === 0 ? "" : user?.netWorth || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const handleNetWorthChange = (e) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setNetWorth(value);
    setError(null);
    setSuccess(false);
  };
  const handleSaveChanges = async () => {
    if (netWorth === "" || isNaN(netWorth)) {
      setError("Please enter a valid number");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("https://localhost:5000/api/auth/networth", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.refresh}`,
        },
        body: JSON.stringify({
          netWorth: netWorth,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update net worth");
      }
      dispatch(updateNetWorth(netWorth));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Failed to update net worth");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async () => {
    try {
      const response = await fetch("https://localhost:5000/api/auth/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.refresh}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update net worth");
      }
      dispatch(logout());
      navigate("/");
      localStorage.clear();
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <div className="settings-container">
      <div className="settings-sidebar fixed-filters-sidebar">
        <div className="settings-filters st-same-filters">
          <h3>Settings</h3>
          <nav className="filter-options">
            <a href="#profile">Profile</a>
            <a href="#advanced">Advanced</a>
          </nav>
        </div>
      </div>
      <div className="settings-body">
        <header className="settings-header">
          <h1>Application Settings</h1>
        </header>
        <section id="profile" className="account-section">
          <h2>Profile Information</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={user.name} readOnly />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={user.email} readOnly />
          </div>
          <div className="form-group">
            <label>Set Networth</label>
            <input
              type="number"
              value={netWorth}
              onChange={handleNetWorthChange}
              min="0"
              step="0.01"
            />
          </div>
          <button className="save-btn" onClick={handleSaveChanges}>
            Save Changes
          </button>
        </section>
        <section id="advanced" className="settings-section">
          <h2>Advanced Settings</h2>
          <div className="danger-zone">
            <h3>Danger Zone</h3>
            <button className="action-btn delete" onClick={handleDelete}>
              Delete Account
            </button>
            <p className="warning">Warning: These actions cannot be undone</p>
          </div>
          <div className="logout-section">
            <button
              className="logout-btn"
              onClick={() => {
                dispatch(logout());
                navigate("/");
                localStorage.clear();
              }}
            >
              Log Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
export default Settings;
