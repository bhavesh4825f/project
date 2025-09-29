import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ user, onLogout, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === '/admin-applications') {
      return location.pathname === path || 
             location.pathname === '/admin_document' || 
             location.pathname === '/manage-applications';
    }
    return location.pathname === path;
  };

  const adminMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/manage_users', label: 'Manage Users', icon: 'bi-people' },
    { path: '/admin-applications', label: 'Manage Applications', icon: 'bi-file-earmark-check' },
    { path: '/contact_queries', label: 'Contact Queries', icon: 'bi-chat-left-text' },
    { path: '/admin-payment-history', label: 'Payment History', icon: 'bi-credit-card' },
    { path: '/price-management', label: 'Price Management', icon: 'bi-currency-rupee' },
    { path: '/send_document', label: 'Send Documents', icon: 'bi-send' },
    { path: '/profile', label: 'Profile', icon: 'bi-person' }
  ];

  const clientMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/profile', label: 'My Profile', icon: 'bi-person' },
    { path: '/my-applications', label: 'Service Requests', icon: 'bi-file-earmark-check' },
    { path: '/payment-history', label: 'Payments', icon: 'bi-credit-card' },
    { path: '/document_history', label: 'Document History', icon: 'bi-file-earmark-text' }
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : clientMenuItems;

  const handleMenuClick = () => {
    if (onClose && window.innerWidth < 992) {
      onClose();
    }
  };

  return (
    <div 
      className={`sidebar d-flex flex-column position-fixed position-lg-relative ${isOpen ? 'sidebar-open' : ''}`}
      style={{ 
        width: '250px', 
        minHeight: '100vh', 
        background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        zIndex: 1050,
        left: 0,
        top: 0
      }}
    >
      {/* Close button for mobile */}
      <div className="d-lg-none position-absolute end-0 top-0 p-3">
        <button 
          className="btn btn-sm btn-outline-light"
          onClick={onClose}
          aria-label="Close menu"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* Logo Section */}
      <div className="sidebar-header p-4 text-center border-bottom border-secondary">
        <Link to="/dashboard" className="text-decoration-none" onClick={handleMenuClick}>
          <div className="d-flex align-items-center justify-content-center mb-2">
            <i className="bi bi-shield-check fs-2 text-warning me-2"></i>
            <h3 className="mb-0 text-white fw-bold">OGSP</h3>
          </div>
          <p className="small text-light opacity-75 mb-0">Online Government Service Portal</p>
        </Link>
      </div>

      {/* User Info Section */}
      <div className="sidebar-user p-3 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          <div className="avatar bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3"
               style={{ width: '40px', height: '40px' }}>
            <i className="bi bi-person-fill"></i>
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-0 text-white">{user?.username || 'Guest'}</h6>
            <small className="text-light opacity-75">
              {user?.role === 'admin' ? 'Administrator' : 'Client'}
            </small>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav flex-grow-1 p-2">
        <ul className="nav nav-pills flex-column">
          {menuItems.map((item) => (
            <li className="nav-item mb-1" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center px-3 py-2 rounded ${
                  isActive(item.path) 
                    ? 'active bg-warning text-dark' 
                    : 'text-light hover-link'
                }`}
                style={{
                  transition: 'all 0.3s ease'
                }}
                onClick={handleMenuClick}
              >
                <i className={`bi ${item.icon} me-3`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer p-3 border-top border-secondary">
        <button 
          className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
          onClick={handleLogout}
          style={{ transition: 'all 0.3s ease' }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </button>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .hover-link:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          transform: translateX(5px);
        }
        .sidebar-nav .nav-link.active {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;