import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ user, title, subtitle, onToggleSidebar, showSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getBreadcrumbs = () => {
    const pathMap = {
      '/dashboard': { name: 'Dashboard', icon: 'bi-speedometer2' },
      '/profile': { name: 'Profile', icon: 'bi-person' },
      '/manage_users': { name: 'Manage Users', icon: 'bi-people' },
      '/admin-applications': { name: 'Manage Applications', icon: 'bi-file-earmark-check' },
      '/manage-applications': { name: 'Manage Applications', icon: 'bi-file-earmark-check' },
      '/admin_document': { name: 'Manage Applications', icon: 'bi-file-earmark-check' },
      '/contact_queries': { name: 'Contact Queries', icon: 'bi-chat-left-text' },
      '/admin-payment-history': { name: 'Payment History', icon: 'bi-credit-card' },
      '/price-management': { name: 'Price Management', icon: 'bi-currency-rupee' },
      '/send_document': { name: 'Send Documents', icon: 'bi-send' },
      '/my-applications': { name: 'My Applications', icon: 'bi-file-earmark-check' },
      '/payment-history': { name: 'Payment History', icon: 'bi-credit-card' },
      '/document_history': { name: 'Document History', icon: 'bi-file-earmark-text' },
      '/apply-pan': { name: 'Apply PAN Card', icon: 'bi-credit-card-2-front' },
      '/apply-income': { name: 'Apply Income Certificate', icon: 'bi-file-earmark-richtext' },
      '/apply-caste': { name: 'Apply Caste Certificate', icon: 'bi-file-earmark-person' },
      '/apply-birth': { name: 'Apply Birth Certificate', icon: 'bi-calendar-event' }
    };

    return pathMap[location.pathname] || { name: 'Dashboard', icon: 'bi-speedometer2' };
  };

  const breadcrumb = getBreadcrumbs();

  return (
    <header className="header-section sticky-top" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1020
    }}>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center py-3">
          
          {/* Mobile Menu Toggle */}
          {showSidebar && (
            <button 
              className="btn btn-outline-light d-lg-none me-3"
              onClick={onToggleSidebar}
              type="button"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon">
                <i className="bi bi-list fs-4"></i>
              </span>
            </button>
          )}
          
          {/* Left Section - Breadcrumbs & Title */}
          <div className="header-left flex-grow-1">
            <nav aria-label="breadcrumb" className="d-none d-md-block">
              <ol className="breadcrumb mb-1" style={{ backgroundColor: 'transparent' }}>
                <li className="breadcrumb-item">
                  <i className="bi bi-house text-warning"></i>
                  <span className="ms-1 text-light opacity-75">OGSP</span>
                </li>
                <li className="breadcrumb-item active text-white" aria-current="page">
                  <i className={`bi ${breadcrumb.icon} me-1`}></i>
                  {breadcrumb.name}
                </li>
              </ol>
            </nav>
            
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3 fs-5 fs-md-4">{title || breadcrumb.name}</h4>
              {subtitle && (
                <small className="badge bg-warning text-dark px-2 py-1 d-none d-sm-inline">{subtitle}</small>
              )}
            </div>
          </div>

          {/* Right Section - Time & Actions */}
          <div className="header-right d-flex align-items-center">
            
            {/* Current Time */}
            <div className="time-display me-2 me-md-4 text-center d-none d-sm-block">
              <div className="small text-light opacity-75">
                {currentTime.toLocaleDateString('en-IN')}
              </div>
              <div className="fw-bold">
                {currentTime.toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="ms-2 ms-md-3">
              <button 
                className="btn btn-warning btn-sm" 
                onClick={() => navigate('/')}
                title="Go to Home"
              >
                <i className="bi bi-house"></i>
                <span className="ms-1 d-none d-md-inline">Home</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;