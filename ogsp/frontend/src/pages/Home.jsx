import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

// Get API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Custom styles for logo and branding
const customStyles = `
  .navbar-brand:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease;
  }
  
  .logotext {
    background: linear-gradient(45deg, #1e40af, #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .text-purple {
    color: #8b5cf6 !important;
  }
  
  .service-icon {
    transition: transform 0.2s ease;
  }
  
  .service-icon:hover {
    transform: scale(1.1);
  }

  /* Mobile navigation improvements */
  @media (max-width: 991.98px) {
    .navbar-collapse {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-top: 15px;
      padding: 15px;
      position: absolute;
      top: 100%;
      left: 15px;
      right: 15px;
      z-index: 1000;
    }
    
    .navbar-nav .nav-item {
      margin: 5px 0;
    }
    
    .navbar-nav .nav-link {
      padding: 12px 15px !important;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: block;
      text-align: left;
    }
    
    .navbar-nav .nav-link:hover {
      background-color: #f8f9fa;
      transform: translateX(5px);
    }
    
    .navbar-toggler {
      padding: 8px;
      border: 1px solid #dee2e6 !important;
    }
    
    .navbar-toggler:focus {
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  }

  /* Touch-friendly buttons */
  @media (max-width: 575.98px) {
    .btn {
      min-height: 44px;
      font-size: 16px;
    }
    
    .nav-link {
      font-size: 16px;
      padding: 15px !important;
    }
    
    .navbar-brand h1 {
      font-size: 20px !important;
    }
    
    .navbar-brand small {
      font-size: 9px !important;
    }

    /* Mobile services section improvements */
    #services .col-md-4 {
      margin-bottom: 20px;
    }
    
    #services .card {
      margin-bottom: 15px;
    }
    
    #services .card-body {
      padding: 1.5rem !important;
    }
    
    #services h2 {
      font-size: 1.8rem;
      margin-bottom: 2rem !important;
    }
    
    /* Loading spinner mobile optimization */
    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render when needed
  const [servicePrices, setServicePrices] = useState({});
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);

  // Function to load service prices from localStorage
  const loadServicePrices = () => {
    const savedPrices = JSON.parse(localStorage.getItem("servicePrices")) || {};
    setServicePrices(savedPrices);
  };

  // Function to get current price for a service
  const getCurrentPrice = (serviceName, defaultPrice) => {
    return servicePrices[serviceName] || defaultPrice;
  };

  // Function to fetch active services
  const fetchServices = async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service/active`);
      if (response.data.success) {
        setServices(response.data.services);
      } else {
        setServicesError('Failed to load services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setServicesError(`Unable to connect to services. ${err.message}`);
      // Fallback to empty services if API fails
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  // Function to check and update user state
  const checkUserStatus = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(storedUser);
    } else {
      setUser(null);
    }
    setForceUpdate(prev => prev + 1); // Force re-render
  };

  useEffect(() => {
    // Check if user is logged in on component mount and route change
    checkUserStatus();
    // Load service prices
    loadServicePrices();
    // Fetch services
    fetchServices();
  }, [location]); // Re-run when location changes

  // Initial user check on component mount
  useEffect(() => {
    checkUserStatus();
    loadServicePrices();
    fetchServices();
  }, []); // Run only once on component mount

  // Add another useEffect to listen for storage changes and page visibility
  useEffect(() => {
    const handleStorageChange = () => {
      checkUserStatus();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkUserStatus();
      }
    };

    // Listen for storage changes (when user logs in from another tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for page visibility changes (when user comes back to this tab)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also check on window focus
    window.addEventListener('focus', checkUserStatus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkUserStatus);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/contact/submit`, {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: "General Inquiry"
      });
      
      if (response.data.success) {
        setSuccess(response.data.message);
        setFormData({ 
          name: "", 
          email: "", 
          message: "" 
        });
      } else {
        setError(response.data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      let errorMessage = "Failed to send message. Please try again later.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Unable to connect to server. Please check if the backend is running.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const handleApplyClick = (servicePath) => {
    if (user) {
      navigate(servicePath);
    } else {
      // Store the intended destination before redirecting to login
      localStorage.setItem("redirectAfterLogin", servicePath);
      navigate("/login");
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg fixed-top bg-white shadow-sm">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img src="ogsp-icon.svg" alt="OGSP Logo" width="50" height="50" className="me-2" />
            <div>
              <h1 className="logotext mb-0" style={{fontSize: '24px', fontWeight: 'bold', color: '#1e40af'}}>OGSP</h1>
              <small style={{fontSize: '10px', color: '#6b7280'}}>Online Government Service Portal</small>
            </div>
          </a>
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-4`}></i>
          </button>
          <div className={`navbar-collapse ${mobileMenuOpen ? 'show' : 'collapse'}`}>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#home" onClick={closeMobileMenu}>
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#services" onClick={closeMobileMenu}>
                  Services
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about" onClick={closeMobileMenu}>
                  About Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact" onClick={closeMobileMenu}>
                  Contact Us
                </a>
              </li>

              {user ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link text-primary fw-bold">
                      <i className="bi bi-person-circle me-1"></i>
                      Welcome, {user.username}
                    </span>
                  </li>
                  <li className="nav-item">
                    <button 
                      className="nav-link btn btn-link d-flex align-items-center"
                      onClick={() => {
                        navigate("/dashboard");
                        closeMobileMenu();
                      }}
                      style={{ border: "none", background: "none", color: "inherit" }}
                    >
                      <i className="bi bi-speedometer2 me-1"></i>
                      Dashboard
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-link text-danger d-flex align-items-center"
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      style={{ border: "none", background: "none" }}
                    >
                      <i className="bi bi-box-arrow-right me-1"></i>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <button 
                    className="btn btn-primary text-white px-4 py-2 rounded-pill mx-2"
                    onClick={() => {
                      navigate("/login");
                      closeMobileMenu();
                    }}
                    style={{ border: "none", minWidth: "120px", fontSize: "16px" }}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="hero d-flex align-items-center justify-content-center text-center text-white"
        style={{
          background: "url('india.jpg') no-repeat center center/cover",
          height: "100vh",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.55)",
          }}
        ></div>
        <div className="hero-content position-relative z-2">
          <h1 className="display-4 fw-bold">
            We are <br /> Government Service Provider
          </h1>
          <p className="lead mt-3">
            We provide reliable services for government sectors,
            ensuring efficiency, innovation, and compliance to support
            organizational growth and success.
          </p>
          <a href="#services" className="btn btn-primary btn-lg mt-4">
            Our Services
          </a>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section text-center py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-3">
              <h2>100%</h2>
              <p>Customer Satisfaction</p>
            </div>
            <div className="col-md-4 mb-3">
              <h2>120+</h2>
              <p>Customers Worldwide</p>
            </div>
            <div className="col-md-4 mb-3">
              <h2>650+</h2>
              <p>Skilled Employees</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-content">
                <h2 className="display-5 fw-bold mb-4">About OGSP</h2>
                <h4 className="text-primary mb-3">Online Government Service Portal</h4>
                <p className="lead text-muted mb-4">
                  OGSP is a comprehensive digital platform designed to bridge the gap between citizens and government services, 
                  making essential administrative processes accessible, efficient, and transparent.
                </p>
                <p className="mb-4">
                  Our mission is to digitize and streamline government services, enabling citizens to access vital documents 
                  and certificates from the comfort of their homes. We are committed to reducing bureaucratic delays, 
                  eliminating paperwork, and providing a seamless online experience for all government-related services.
                </p>
                <div className="row g-4 mb-4">
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: "50px", height: "50px"}}>
                        <i className="bi bi-shield-check fs-5"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">Secure & Reliable</h6>
                        <small className="text-muted">Government-grade security</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: "50px", height: "50px"}}>
                        <i className="bi bi-clock fs-5"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">24/7 Available</h6>
                        <small className="text-muted">Round-the-clock service</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: "50px", height: "50px"}}>
                        <i className="bi bi-lightning fs-5"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">Fast Processing</h6>
                        <small className="text-muted">Quick document verification</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: "50px", height: "50px"}}>
                        <i className="bi bi-people fs-5"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">User-Friendly</h6>
                        <small className="text-muted">Easy to use interface</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-image">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="bg-primary bg-opacity-10 p-4 rounded-3 text-center h-100">
                      <i className="bi bi-file-earmark-text display-4 text-primary mb-3"></i>
                      <h5>Digital Documents</h5>
                      <p className="text-muted mb-0">Secure online document processing and verification</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-success bg-opacity-10 p-4 rounded-3 text-center h-100 mt-4">
                      <i className="bi bi-graph-up display-4 text-success mb-3"></i>
                      <h5>Efficient Process</h5>
                      <p className="text-muted mb-0">Streamlined workflows for faster service delivery</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-warning bg-opacity-10 p-4 rounded-3 text-center h-100">
                      <i className="bi bi-headset display-4 text-warning mb-3"></i>
                      <h5>24/7 Support</h5>
                      <p className="text-muted mb-0">Round-the-clock customer support and assistance</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-info bg-opacity-10 p-4 rounded-3 text-center h-100 mt-4">
                      <i className="bi bi-patch-check display-4 text-info mb-3"></i>
                      <h5>Verified Services</h5>
                      <p className="text-muted mb-0">Government-authorized and verified service platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="row mt-5 pt-5">
            <div className="col-lg-4 mb-4">
              <div className="text-center p-4">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: "80px", height: "80px"}}>
                  <i className="bi bi-eye fs-1"></i>
                </div>
                <h4 className="mb-3">Our Vision</h4>
                <p className="text-muted">
                  To become the leading digital platform for government services, ensuring every citizen has seamless access 
                  to essential administrative services with transparency and efficiency.
                </p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="text-center p-4">
                <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: "80px", height: "80px"}}>
                  <i className="bi bi-bullseye fs-1"></i>
                </div>
                <h4 className="mb-3">Our Mission</h4>
                <p className="text-muted">
                  To digitize government processes, reduce bureaucratic delays, and provide citizens with a user-friendly 
                  platform for accessing vital services and documents efficiently.
                </p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="text-center p-4">
                <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: "80px", height: "80px"}}>
                  <i className="bi bi-heart fs-1"></i>
                </div>
                <h4 className="mb-3">Our Values</h4>
                <p className="text-muted">
                  Transparency, efficiency, security, and citizen-first approach guide everything we do. We believe in 
                  making government services accessible to everyone, everywhere.
                </p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="row mt-5 pt-5">
            <div className="col-12 text-center mb-5">
              <h3 className="display-6 fw-bold">Why Choose OGSP?</h3>
              <p className="lead text-muted">Experience the future of government services with our comprehensive digital platform</p>
            </div>
            <div className="col-md-6 col-lg-3 mb-4">
              <div className="feature-card text-center p-4 h-100 border rounded-3">
                <i className="bi bi-download display-4 text-primary mb-3"></i>
                <h5>Instant Download</h5>
                <p className="text-muted mb-0">Download your verified documents instantly after approval</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3 mb-4">
              <div className="feature-card text-center p-4 h-100 border rounded-3">
                <i className="bi bi-phone display-4 text-success mb-3"></i>
                <h5>Mobile Friendly</h5>
                <p className="text-muted mb-0">Access all services from your smartphone or tablet</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3 mb-4">
              <div className="feature-card text-center p-4 h-100 border rounded-3">
                <i className="bi bi-bell display-4 text-warning mb-3"></i>
                <h5>Real-time Updates</h5>
                <p className="text-muted mb-0">Get instant notifications about your application status</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3 mb-4">
              <div className="feature-card text-center p-4 h-100 border rounded-3">
                <i className="bi bi-credit-card display-4 text-info mb-3"></i>
                <h5>Secure Payments</h5>
                <p className="text-muted mb-0">Safe and secure online payment gateway for all transactions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="about-section py-5">
        <div className="container text-center">
          <h2 className="mb-4">GOVERNMENT SERVICES</h2>
          {servicesLoading ? (
            <div className="row g-4">
              <div className="col-12">
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mb-0">Loading government services...</p>
                  <small className="text-muted mt-2">Please wait while we fetch the latest services</small>
                </div>
              </div>
            </div>
          ) : servicesError ? (
            <div className="row g-4">
              <div className="col-12">
                <div className="alert alert-warning d-flex flex-column align-items-center text-center">
                  <i className="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
                  <h5>Unable to Load Services</h5>
                  <p className="mb-3">{servicesError}</p>
                  <button 
                    onClick={fetchServices} 
                    className="btn btn-outline-primary"
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="row g-4">
              <div className="col-12">
                <div className="alert alert-info text-center">
                  <i className="bi bi-info-circle display-4 text-info mb-3"></i>
                  <h5>No Services Available</h5>
                  <p className="mb-0">No government services are currently available. Please check back later.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {services.map((service, i) => (
                <div key={service._id || i} className="col-md-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-body d-flex flex-column text-center p-4">
                      <div className="mb-3">
                        <i className={`${service.icon} text-primary`} style={{fontSize: '3rem'}}></i>
                      </div>
                      <h4 className="card-title">{service.displayName}</h4>
                      <p className="card-text">{service.description}</p>
                      <div className="mb-3">
                        <span className="badge bg-success fs-6">
                          ₹{service.pricing.serviceFee + service.pricing.consultancyCharge}
                        </span>
                        <small className="text-muted d-block mt-1">
                          Processing: {service.processingTime}
                        </small>
                      </div>
                      <button 
                        onClick={() => handleApplyClick(`/apply/${service._id}`)}
                        className="btn btn-primary mt-auto"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Contact Us</h2>
            <p className="lead text-muted">Get in touch with us for any assistance or queries</p>
          </div>

          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="row g-3 justify-content-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control form-control-lg"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-5">
              <input
                type="email"
                className="form-control form-control-lg"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-10">
              <textarea
                className="form-control form-control-lg"
                name="message"
                rows="5"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="col-md-10 text-center">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg px-5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-5">
        <div className="container">
          <div className="row">
            {/* Logo and Description */}
            <div className="col-lg-4 mb-4">
              <div className="d-flex align-items-center mb-3">
                <img src="ogsp-logo.svg" alt="OGSP Complete Logo" width="200" height="80" className="img-fluid" />
              </div>
              <p className="text-muted">
                Your trusted partner for all government services. Fast, secure, and reliable 24/7.
              </p>
            </div>
            
            {/* Services */}
            <div className="col-lg-4 mb-4">
              <h5 className="text-primary mb-3">Our Services</h5>
              <div className="row">
                <div className="col-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-file-earmark-text text-warning me-2"></i>
                      PAN Card
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-person-circle text-success me-2"></i>
                      Birth Certificate
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-award text-purple me-2"></i>
                      Caste Certificate
                    </li>
                  </ul>
                </div>
                <div className="col-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-currency-rupee text-danger me-2"></i>
                      Income Certificate
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-headset text-info me-2"></i>
                      24/7 Support
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-shield-check text-primary me-2"></i>
                      Secure Processing
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Quality Assurance */}
            <div className="col-lg-4 mb-4">
              <h5 className="text-primary mb-3">Why Choose OGSP?</h5>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-success rounded-circle me-3" style={{width: '12px', height: '12px'}}></div>
                  <span>Government-grade Security</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-warning rounded-circle me-3" style={{width: '12px', height: '12px'}}></div>
                  <span>Fast Document Processing</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-primary rounded-circle me-3" style={{width: '12px', height: '12px'}}></div>
                  <span>24/7 Available Service</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-info rounded-circle me-3" style={{width: '12px', height: '12px'}}></div>
                  <span>User-Friendly Interface</span>
                </div>
              </div>
            </div>
          </div>
          
          <hr className="my-4" />
          
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0">&copy; {new Date().getFullYear()} OGSP - Online Government Service Portal. All Rights Reserved.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <span className="badge bg-success me-2">Secure</span>
              <span className="badge bg-warning me-2">Fast</span>
              <span className="badge bg-primary me-2">Reliable</span>
              <span className="badge bg-info">24/7</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}