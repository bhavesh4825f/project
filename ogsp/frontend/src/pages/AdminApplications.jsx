import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminApplications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");

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

  const updateApplicationStatus = async (applicationId, newStatus, message = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/application/update-status/${applicationId}`,
        { status: newStatus, remarks: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Refresh applications list
        fetchAllApplications(token);
      } else {
        setError("Failed to update application status");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating application status");
      console.error("Error updating status:", err);
    }
  };

  const deleteApplication = async (applicationId) => {
    if (window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `http://localhost:5000/api/application/${applicationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Remove from local state
          setApplications(prev => prev.filter(app => app.id !== applicationId));
        } else {
          setError("Failed to delete application");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting application");
        console.error("Error deleting application:", err);
      }
    }
  };



  const handleSearchClear = () => {
    setSearchTerm("");
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

  const filteredApplications = applications.filter(app => {
    if (!searchTerm && filterStatus === "all" && filterPaymentStatus === "all") return true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      app.applicationType?.toLowerCase().includes(searchLower) ||
      app.username?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower);
    
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesPayment = filterPaymentStatus === "all" || app.paymentStatus === filterPaymentStatus;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (!user) return null;

  return (
    <Layout user={user} title="Manage Applications">
      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <div>
            <h3 className="mb-0">Application Management</h3>
            <p className="text-muted mb-0">
              {loading ? 'Loading...' : `${filteredApplications.length} application${filteredApplications.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            {/* Comprehensive Application Management */}
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary">All Data View</span>
            </div>
            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate("/dashboard")}>
              <i className="bi bi-house me-1"></i>
              Dashboard
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by type, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-outline-secondary" onClick={handleSearchClear}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
              >
                <option value="all">All Payment Status</option>
                <option value="pending">Payment Pending</option>
                <option value="completed">Payment Completed</option>
                <option value="failed">Payment Failed</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-success w-100"
                onClick={() => fetchAllApplications(localStorage.getItem("token"))}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>Application Details</th>
                    <th>User Information</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Submitted Date</th>
                    <th>Document Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="text-muted">
                          <i className="bi bi-inbox display-1 mb-3 d-block"></i>
                          No applications found matching your criteria
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div className="fw-bold text-primary">{app.applicationType}</div>
                          <small className="text-muted">ID: {app.id}</small>
                        </td>
                        <td>
                          <div className="fw-semibold">{app.username || 'Unknown'}</div>
                          <small className="text-muted">{app.email || 'No email'}</small>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          <span className={getPaymentStatusBadge(app.paymentStatus)}>
                            {app.paymentStatus?.charAt(0).toUpperCase() + app.paymentStatus?.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div>{formatDate(app.submittedAt)}</div>
                        </td>
                        <td>
                          {app.documentSent ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Sent
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-clock me-1"></i>
                              Pending
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => navigate(`/application-details/${app.id}`)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            {app.status === 'approved' && !app.documentSent && (
                              <button 
                                className="btn btn-outline-success btn-sm"
                                onClick={() => navigate(`/send_document/${app.id}`)}
                                title="Send Document"
                              >
                                <i className="bi bi-send"></i>
                              </button>
                            )}
                            <button 
                              className="btn btn-outline-info btn-sm"
                              onClick={() => fetchAllApplications(localStorage.getItem("token"))}
                              title="Refresh"
                            >
                              <i className="bi bi-arrow-clockwise"></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => deleteApplication(app.id)}
                              title="Delete Application"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}