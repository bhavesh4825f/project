import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS } from '../config/api';

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mno, setMno] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ fixed API endpoint
      const { data } = await axios.post(API_ENDPOINTS.REGISTER, {
        username,
        email,
        mno,
        password,
        cpassword,
      });

      if (data.success) {
        alert(data.message);
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Register error:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      
      let errorMessage = "Registration failed. ";
      if (err.code === 'ECONNABORTED') {
        errorMessage += "Request timeout - server is slow to respond.";
      } else if (err.response?.status === 404) {
        errorMessage += "Registration endpoint not found. Check backend deployment.";
      } else if (err.response?.status >= 500) {
        errorMessage += "Server error. Please try again later.";
      } else if (err.message.includes('Network Error')) {
        errorMessage += "Cannot connect to server. Check if backend is deployed.";
      } else {
        errorMessage += err.response?.data?.message || err.message || "Unknown error occurred.";
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 col-md-5 mx-auto">
        <h3 className="text-center">Register - OGSP</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Mobile Number</label>
            <input
              type="text"
              className="form-control"
              value={mno}
              onChange={(e) => setMno(e.target.value)}
              pattern="[0-9]{10}"
              required
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={cpassword}
              onChange={(e) => setCPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
