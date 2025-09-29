import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminDocuments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token || storedUser.role !== "admin") {
      navigate("/login");
      return;
    }
    
    setUser(storedUser);
    fetchAllApplications(token);
  }, [navigate]);

  const fetchAllApplications = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/application/all-debug", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setApplications(response.data.applications);
      } else {
        setError("Failed to fetch applications");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching applications");
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSearchClear = () => {
    setSearchTerm("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return "badge bg-warning text-dark";
      case "approved": return "badge bg-success";
      case "rejected": return "badge bg-danger";
      case "in_progress": return "badge bg-info";
      default: return "badge bg-secondary";
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "completed": return "badge bg-success";
      case "pending": return "badge bg-warning text-dark";
      case "failed": return "badge bg-danger";
      default: return "badge bg-secondary";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter applications based on search term
  const filteredApplications = applications.filter(app => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      app.username?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower) ||
      app.applicationType?.toLowerCase().includes(searchLower) ||
      app.status?.toLowerCase().includes(searchLower) ||
      app.paymentStatus?.toLowerCase().includes(searchLower) ||
      app.id?.toString().toLowerCase().includes(searchLower)
    );
  });

  if (!user) return null;

  return (
    <Layout user={user} title="Document History">
      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <div>
            <h3 className="mb-0">All Applications & Documents</h3>
            <p className="text-muted mb-0">
              {loading ? 'Loading...' : `${filteredApplications.length} application${filteredApplications.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2">Welcome, <strong>{user?.username}</strong></span>
            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
        
        <div className="p-4" style={{backgroundColor: "#f8f9fa"}}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control pe-5"
                      placeholder="Search by username, email, service type, status, payment status, or application ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0"
                        onClick={handleSearchClear}
                        style={{ textDecoration: 'none' }}
                        title="Clear search"
                      >
                        ✖️
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-md-4 d-flex align-items-center">
                  <span className="text-muted">
                    {loading ? 'Loading...' : (
                      searchTerm 
                        ? `${filteredApplications.length} of ${applications.length} applications match your search`
                        : `${applications.length} total applications`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading applications...</p>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-text text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3">
                    {searchTerm ? 'No matching applications found' : 'No Applications Found'}
                  </h5>
                  <p className="text-muted">
                    {searchTerm 
                      ? `No applications match your search "${searchTerm}". Try adjusting your search terms.`
                      : 'No service applications have been submitted yet.'
                    }
                  </p>
                  {searchTerm && (
                    <button className="btn btn-outline-primary" onClick={handleSearchClear}>
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Service Type</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Document Sent</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((app, index) => (
                        <tr key={app.id}>
                          <td className="py-3">{index + 1}</td>
                          <td className="py-3">
                            <div>
                              <div className="fw-semibold">{app.username}</div>
                              <small className="text-muted">{app.email}</small>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="badge bg-primary">{app.applicationType}</span>
                          </td>
                          <td className="py-3">
                            <span className={getStatusBadge(app.status)}>
                              {app.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={getPaymentStatusBadge(app.paymentStatus)}>
                              {app.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3">
                            {app.documentSent ? (
                              <span className="badge bg-success">
                                ✅ Sent
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                ❌ Not Sent
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <small className="text-muted">{formatDate(app.submittedAt)}</small>
                          </td>
                          <td className="py-3">
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate(`/application-details/${app.id}`)}
                                title="View Details"
                              >
                                👁️ View
                              </button>
                              {app.status === 'approved' && !app.documentSent && (
                                <button 
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => navigate(`/send_document`)}
                                  title="Send Document"
                                >
                                  📤 Send
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};