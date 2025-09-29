import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_ENDPOINTS, getFileUrl } from '../config/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: "", mobile: "", address: "", birthdate: "", photo: null });
  const [passwords, setPasswords] = useState({ old_password: "", new_password: "" });
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token) {
      navigate("/login");
    } else {
      setUser(storedUser);
      setProfile({
        name: storedUser.username || "",
        mobile: storedUser.mno || "",
        address: storedUser.address || "",
        birthdate: storedUser.birthdate || "",
        photo: null,
      });

      // Fetch fresh user data from server as backup
      fetchUserProfile(token);
    }
  }, [navigate]);

  const fetchUserProfile = async (token) => {
    try {
      const res = await axios.get(API_ENDPOINTS.PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const freshUser = res.data.user;
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
        setProfile({
          name: freshUser.username || "",
          mobile: freshUser.mno || "",
          address: freshUser.address || "",
          birthdate: freshUser.birthdate || "",
          photo: null,
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      // Continue with stored data if server fetch fails
    }
  };

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setProfile({ ...profile, photo: files[0] });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("mobile", profile.mobile);
      formData.append("address", profile.address);
      formData.append("birthdate", profile.birthdate);
      if (profile.photo) formData.append("photo", profile.photo);

      const token = localStorage.getItem("token");
      
      const res = await axios.post(
        API_ENDPOINTS.UPDATE_PROFILE,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Trigger storage event to notify other components
      window.dispatchEvent(new Event('storage'));
      
      // Update the profile state to reflect the changes
      setProfile({
        name: updatedUser.username || "",
        mobile: updatedUser.mno || "",
        address: updatedUser.address || "",
        birthdate: updatedUser.birthdate || "",
        photo: null,
      });
      
      setMessage(res.data.message || "Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      console.error("Error response:", err.response?.data);
      setMessage(
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile."
      );
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        API_ENDPOINTS.CHANGE_PASSWORD,
        passwords,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(res.data.message || "Password changed successfully!");
      setPasswords({ old_password: "", new_password: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        err.message ||
        "Failed to change password."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <Layout user={user} title="Profile">
      {/* Main Content */}
      <div className="content flex-grow-1 p-4">
        <h3>{user.role ? user.role.toUpperCase() : ""} | Profile</h3>
        {message && <div className="alert alert-info">{message}</div>}

        <div className="text-center mb-4">
          <img
            src={
              user.photo
                ? getFileUrl(user.photo)
                : "/default-user.png"
            }
            alt="Profile"
            style={{ width: "120px", borderRadius: "50%" }}
          />
          <h4>{user.username}</h4>
          {user.mno && <p className="text-muted">Mobile: {user.mno}</p>}
        </div>

        <div className="mb-3">
          <button
            className={`btn ${activeTab === "profile" ? "btn-primary" : "btn-outline-primary"} me-2`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`btn ${activeTab === "password" ? "btn-warning" : "btn-outline-warning"}`}
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </button>
        </div>

        {activeTab === "profile" && (
          <form onSubmit={submitProfile} encType="multipart/form-data">
            <div className="mb-3">
              <label>Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
              />
            </div>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                disabled
              />
            </div>
            <div className="mb-3">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                className="form-control"
                value={profile.mobile}
                onChange={handleProfileChange}
                placeholder="Enter your mobile number"
                pattern="[0-9]{10}"
              />
            </div>
            <div className="mb-3">
              <label>Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={profile.address}
                onChange={handleProfileChange}
              />
            </div>
            <div className="mb-3">
              <label>Birthdate</label>
              <input
                type="date"
                name="birthdate"
                className="form-control"
                value={profile.birthdate}
                onChange={handleProfileChange}
              />
            </div>
            <div className="mb-3">
              <label>Profile Photo</label>
              <input
                type="file"
                name="photo"
                className="form-control"
                accept="image/*"
                onChange={handleProfileChange}
              />
              {profile.photo && (
                <img
                  src={URL.createObjectURL(profile.photo)}
                  alt="Preview"
                  className="img-thumbnail mt-2"
                  style={{ width: "150px" }}
                />
              )}
            </div>
            <button type="submit" className="btn btn-success">
              Update Profile
            </button>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={submitPassword}>
            <div className="mb-3">
              <label>Old Password</label>
              <input
                type="password"
                name="old_password"
                className="form-control"
                value={passwords.old_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="mb-3">
              <label>New Password</label>
              <input
                type="password"
                name="new_password"
                className="form-control"
                value={passwords.new_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-warning">
              Change Password
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default Profile;