import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ user }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section mt-auto" style={{ 
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      color: 'white'
    }}>
      <div className="container-fluid">
        
        {/* Main Footer Content */}
        <div className="row py-4 px-3">
          
          {/* Company Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="footer-section-content">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-shield-check fs-3 text-warning me-2"></i>
                <div>
                  <h5 className="mb-0">OGSP</h5>
                  <small className="text-light opacity-75">Online Government Service Portal</small>
                </div>
              </div>
              <p className="text-light opacity-75 mb-3">
                Your trusted partner for all government services. Apply for certificates, 
                manage documents, and track your applications seamlessly.
              </p>
              <div className="social-links">
                <a href="#" className="text-warning me-3" title="Facebook">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="text-warning me-3" title="Twitter">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="text-warning me-3" title="LinkedIn">
                  <i className="bi bi-linkedin"></i>
                </a>
                <a href="#" className="text-warning me-3" title="Email">
                  <i className="bi bi-envelope"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-warning mb-3">Quick Links</h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link to="/dashboard" className="text-light text-decoration-none opacity-75 hover-link">
                  <i className="bi bi-chevron-right me-1"></i>Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-light text-decoration-none opacity-75 hover-link">
                  <i className="bi bi-chevron-right me-1"></i>Profile
                </Link>
              </li>
              {user?.role === 'admin' ? (
                <>
                  <li className="mb-2">
                    <Link to="/manage_users" className="text-light text-decoration-none opacity-75 hover-link">
                      <i className="bi bi-chevron-right me-1"></i>Manage Users
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/admin_document" className="text-light text-decoration-none opacity-75 hover-link">
                      <i className="bi bi-chevron-right me-1"></i>Documents
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="mb-2">
                    <Link to="/my-applications" className="text-light text-decoration-none opacity-75 hover-link">
                      <i className="bi bi-chevron-right me-1"></i>My Applications
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/payment-history" className="text-light text-decoration-none opacity-75 hover-link">
                      <i className="bi bi-chevron-right me-1"></i>Payments
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Services */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="text-warning mb-3">Our Services</h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link to="/apply-pan" className="text-light text-decoration-none opacity-75 hover-link">
                  <i className="bi bi-chevron-right me-1"></i>PAN Card Application
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/apply-income" className="text-light text-decoration-none opacity-75 hover-link">
                  <i className="bi bi-chevron-right me-1"></i>Income Certificate
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/apply-caste" className="text-light text-decoration-none opacity-75 hover-link">
                  <i className="bi bi-chevron-right me-1"></i>Caste Certificate
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/apply-birth" className="text-light text-decoration-none opacity-75 hover-link">
                  <i className="bi bi-chevron-right me-1"></i>Birth Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="text-warning mb-3">Contact Information</h6>
            <div className="contact-info">
              <div className="mb-3">
                <div className="d-flex align-items-start">
                  <i className="bi bi-geo-alt text-warning me-2 mt-1"></i>
                  <div className="text-light opacity-75">
                    <small>Boricha Bhavesh<br/>
                    M-203 pandit din dyayal nagar surat-39509</small>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-telephone text-warning me-2"></i>
                  <small className="text-light opacity-75">+91 9510348699</small>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-envelope text-warning me-2"></i>
                  <small className="text-light opacity-75">support@ogsp.gov.in</small>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-clock text-warning me-2"></i>
                  <small className="text-light opacity-75">Mon-Fri: 9:00 AM - 6:00 PM</small>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom border-top border-secondary py-3 px-3">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0 text-light opacity-75">
                <small>
                  © {currentYear} Online Government Service Portal (OGSP). All rights reserved.
                </small>
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="footer-links-bottom">
                <a href="#" className="text-light text-decoration-none opacity-75 me-3 hover-link">
                  <small>Privacy Policy</small>
                </a>
                <a href="#" className="text-light text-decoration-none opacity-75 me-3 hover-link">
                  <small>Terms of Service</small>
                </a>
                <a href="#" className="text-light text-decoration-none opacity-75 hover-link">
                  <small>Help</small>
                </a>
              </div>
            </div>
          </div>
          
          {/* System Status */}
          <div className="row mt-2">
            <div className="col-12 text-center">
              <small className="text-light opacity-50">
                <i className="bi bi-circle-fill text-success me-1" style={{ fontSize: '0.5rem' }}></i>
                System Status: All Services Operational
                {user && (
                  <span className="ms-3">
                    <i className="bi bi-person-check me-1"></i>
                    Logged in as: {user.username} ({user.role})
                  </span>
                )}
              </small>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .hover-link:hover {
          color: #f1c40f !important;
          transform: translateX(3px);
          transition: all 0.3s ease;
        }
        .social-links a:hover {
          transform: scale(1.2);
          transition: all 0.3s ease;
        }
        .footer-links li {
          transition: all 0.3s ease;
        }
        .footer-links li:hover {
          transform: translateX(5px);
        }
      `}</style>
    </footer>
  );
};

export default Footer;