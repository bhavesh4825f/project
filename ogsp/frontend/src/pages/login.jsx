import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from '../config/api';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      if (res.data.success) {
        // Save user data and token
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        
        // Check if there's a redirect path stored
        const redirectPath = localStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else {
          navigate("/dashboard");
        }
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="container-fluid px-3 pt-5">
      <div className="row justify-content-center min-vh-100 align-items-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <i className="bi bi-shield-check fs-1 mb-2"></i>
              <h3 className="mb-0">Login - OGSP</h3>
              <small>Online Government Service Portal</small>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-envelope me-2"></i>Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-lock me-2"></i>Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success btn-lg w-100 py-3">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </button>
              </form>
            </div>
            <div className="card-footer text-center bg-light py-3">
              <p className="mb-0">
                Don't have an account?{' '}
                <Link to="/register" className="text-decoration-none fw-semibold">
                  Register Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;