import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState({ username: "", role: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) navigate("/login");
    else setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="d-flex min-vh-100">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-grow-1 d-flex flex-column">
        <Header 
          user={user} 
          title="Dashboard"
          subtitle={user?.role === 'admin' ? 'Admin Panel' : 'Client Portal'}
        />

        <main className="flex-grow-1" style={{ background: "#f8f9fa" }}>
          <div className="container-fluid p-4">
            
            {/* Welcome Section */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body bg-gradient text-white" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h2 className="mb-2">
                          Welcome back, {user.username}! 👋
                        </h2>
                        <p className="mb-0 opacity-75">
                          {user?.role === 'admin' 
                            ? 'Manage users, applications, and system settings from your admin dashboard.' 
                            : 'Track your applications, make payments, and manage your documents.'}
                        </p>
                      </div>
                      <div className="col-md-4 text-end">
                        <div className="d-flex align-items-center justify-content-end">
                          <div className="avatar bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3"
                               style={{ width: '60px', height: '60px' }}>
                            <i className="bi bi-person-fill fs-3"></i>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">{user?.role === 'admin' ? 'Administrator' : 'Client'}</div>
                            <small className="opacity-75">Role: {user?.role}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="row g-4">
              {user.role === "admin" ? (
                <>
                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/manage_users" className="text-decoration-none">
                          <div className="icon-wrapper bg-primary bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-people text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Manage Users</h5>
                          <p className="text-muted small mb-0">Add, edit, and manage user accounts</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/manage-applications" className="text-decoration-none">
                          <div className="icon-wrapper bg-info bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-file-earmark-check text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Application Management</h5>
                          <p className="text-muted small mb-0">Complete application overview with all details, status, payments & documents</p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/contact_queries" className="text-decoration-none">
                          <div className="icon-wrapper bg-danger bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-chat-left-text text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Contact Queries</h5>
                          <p className="text-muted small mb-0">Manage user inquiries</p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/admin-payment-history" className="text-decoration-none">
                          <div className="icon-wrapper bg-success bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-credit-card text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Payment History</h5>
                          <p className="text-muted small mb-0">View all payment transactions</p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/price-management" className="text-decoration-none">
                          <div className="icon-wrapper bg-secondary bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-currency-rupee text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Price Management</h5>
                          <p className="text-muted small mb-0">Manage service pricing</p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/send_document" className="text-decoration-none">
                          <div className="icon-wrapper bg-info bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-send text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Send Documents</h5>
                          <p className="text-muted small mb-0">Send documents to users</p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/service-management" className="text-decoration-none">
                          <div className="icon-wrapper bg-success bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-gear-fill text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Service Management</h5>
                          <p className="text-muted small mb-0">Add & manage services</p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/profile" className="text-decoration-none">
                          <div className="icon-wrapper bg-dark bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-person text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Profile Settings</h5>
                          <p className="text-muted small mb-0">Manage your account settings</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/profile" className="text-decoration-none">
                          <div className="icon-wrapper bg-primary bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-person text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">My Profile</h5>
                          <p className="text-muted small mb-0">Update your personal information</p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/my-applications" className="text-decoration-none">
                          <div className="icon-wrapper bg-info bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-file-earmark-check text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Service Requests</h5>
                          <p className="text-muted small mb-0">Track your application status</p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/payment-history" className="text-decoration-none">
                          <div className="icon-wrapper bg-success bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-credit-card text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Payment History</h5>
                          <p className="text-muted small mb-0">View your payment records</p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6">
                    <div className="card h-100 border-0 shadow-sm dashboard-card">
                      <div className="card-body text-center p-4">
                        <Link to="/document_history" className="text-decoration-none">
                          <div className="icon-wrapper bg-warning bg-gradient rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-file-earmark-text text-white" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-dark fw-bold">Document History</h5>
                          <p className="text-muted small mb-0">Access your documents</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions Section */}
            {user.role !== "admin" && (
              <div className="row mt-5">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom">
                      <h5 className="mb-0">
                        <i className="bi bi-lightning-fill text-warning me-2"></i>
                        Quick Actions
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-3">
                          <Link to="/apply-pan" className="btn btn-outline-primary w-100 py-3">
                            <i className="bi bi-credit-card-2-front fs-4 d-block mb-2"></i>
                            Apply PAN Card
                          </Link>
                        </div>
                        <div className="col-md-3">
                          <Link to="/apply-income" className="btn btn-outline-success w-100 py-3">
                            <i className="bi bi-file-earmark-richtext fs-4 d-block mb-2"></i>
                            Income Certificate
                          </Link>
                        </div>
                        <div className="col-md-3">
                          <Link to="/apply-caste" className="btn btn-outline-info w-100 py-3">
                            <i className="bi bi-file-earmark-person fs-4 d-block mb-2"></i>
                            Caste Certificate
                          </Link>
                        </div>
                        <div className="col-md-3">
                          <Link to="/apply-birth" className="btn btn-outline-warning w-100 py-3">
                            <i className="bi bi-calendar-event fs-4 d-block mb-2"></i>
                            Birth Certificate
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        <Footer user={user} />
      </div>
    </div>
  );
};

export default Dashboard;