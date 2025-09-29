import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { API_BASE_URL } from '../config/api';
import "bootstrap/dist/css/bootstrap.min.css";

const AdminContact = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token || storedUser.role !== "admin") {
      navigate("/login");
      return;
    }
    
    setUser(storedUser);
    fetchQueries();
  }, [navigate]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from backend API
      const response = await axios.get(`${API_BASE_URL}/api/contact/queries`);
      
      if (response.data.success) {
        // Sort by newest first
        const sortedQueries = response.data.queries.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setQueries(sortedQueries);
        setFilteredQueries(sortedQueries);
      } else {
        setError("Failed to fetch contact queries");
        setQueries([]);
        setFilteredQueries([]);
      }
      
    } catch (error) {
      console.error("Error fetching contact queries:", error);
      setError("Failed to load contact queries. Please check your connection.");
      setQueries([]);
      setFilteredQueries([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter queries based on search and status
  useEffect(() => {
    let filtered = queries;
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(query => query.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(query => 
        query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredQueries(filtered);
  }, [queries, searchTerm, statusFilter]);

  const updateQueryStatus = async (queryId, newStatus) => {
    try {
      console.log("Updating query status:", queryId, "to", newStatus); // Debug log
      
      const response = await axios.patch(`${API_BASE_URL}/api/contact/queries/${queryId}`, {
        status: newStatus
      });
      
      console.log("Status update response:", response.data); // Debug log
      
      if (response.data.success) {
        // Update local state
        const updatedQueries = queries.map(query => 
          query._id === queryId ? { ...query, status: newStatus } : query
        );
        setQueries(updatedQueries);
        setFilteredQueries(updatedQueries.filter(q => 
          (statusFilter === "all" || q.status === statusFilter) &&
          (!searchTerm || 
            q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.message.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ));
        
        setSuccess(`Query status updated to ${newStatus}`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to update query status");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Error updating query status:", error);
      console.error("Error details:", error.response?.data); // More detailed error
      
      let errorMessage = "Failed to update query status";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Unable to connect to server. Please check if the backend is running.";
      }
      
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    }
  };

  const deleteQuery = async (queryId) => {
    if (!window.confirm('Are you sure you want to delete this query? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/contact/queries/${queryId}`);
      
      if (response.data.success) {
        // Update local state by removing the deleted query
        const updatedQueries = queries.filter(query => query._id !== queryId);
        setQueries(updatedQueries);
        setFilteredQueries(updatedQueries.filter(q => 
          (statusFilter === "all" || q.status === statusFilter) &&
          (!searchTerm || 
            q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.message.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ));
        
        setSuccess('Query deleted successfully');
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to delete query");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting query:", error);
      
      let errorMessage = "Failed to delete query";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Unable to connect to server. Please check if the backend is running.";
      }
      
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { class: "bg-primary", icon: "bi-circle-fill", text: "New" },
      pending: { class: "bg-warning", icon: "bi-clock-fill", text: "Pending" },
      resolved: { class: "bg-success", icon: "bi-check-circle-fill", text: "Resolved" }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return (
      <span className={`badge ${config.class} d-flex align-items-center gap-1`}>
        <i className={`bi ${config.icon}`}></i>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid date";
    
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else {
      return "Just now";
    }
  };

  const getStats = () => {
    const total = queries.length;
    const pendingCount = queries.filter(q => q.status === "pending").length;
    const resolvedCount = queries.filter(q => q.status === "resolved").length;
    
    return { total, pendingCount, resolvedCount };
  };

  if (!user) return null;

  return (
    <Layout user={user} title="Contact Queries Management" subtitle="Admin Panel">
      <div className="container-fluid p-4">
        {success && (
          <div className="alert alert-success alert-dismissible fade show mb-4">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="bi bi-chat-dots-fill fs-2 me-3"></i>
                  <div>
                    <h3 className="mb-0">{getStats().total}</h3>
                    <small>Total Queries</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-warning text-dark border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="bi bi-clock-fill fs-2 me-3"></i>
                  <div>
                    <h3 className="mb-0">{getStats().pendingCount}</h3>
                    <small>Pending</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill fs-2 me-3"></i>
                  <div>
                    <h3 className="mb-0">{getStats().resolvedCount}</h3>
                    <small>Resolved</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Search Queries</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, email, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label">Filter by Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Query List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading queries...</p>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Query List ({filteredQueries.length})
                </h5>
                <small className="text-muted">
                  Showing {filteredQueries.length} of {queries.length} queries
                </small>
              </div>
            </div>
            
            <div className="card-body p-0">
              {filteredQueries.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <h5 className="mt-3">No Queries Found</h5>
                  <p className="text-muted">
                    {queries.length === 0 
                      ? "No contact queries have been submitted yet." 
                      : "No queries match your current filters."
                    }
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date & Time</th>
                        <th>Contact Info</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQueries.map((query) => (
                        <tr key={query._id}>
                          <td className="py-3">
                            <div className="text-primary fw-semibold">
                              {formatDate(query.submittedAt || query.createdAt)}
                            </div>
                            <small className="text-muted">
                              {getRelativeTime(query.submittedAt || query.createdAt)}
                            </small>
                          </td>
                          <td className="py-3">
                            <div className="fw-semibold">{query.name}</div>
                            <div className="text-muted small">
                              <i className="bi bi-envelope me-1"></i>
                              {query.email}
                            </div>
                            {query.category && (
                              <span className="badge bg-light text-dark mt-1">
                                {query.category}
                              </span>
                            )}
                            {query.subject && !query.category && (
                              <span className="badge bg-light text-dark mt-1">
                                {query.subject}
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="message-preview" style={{ maxWidth: "300px" }}>
                              {query.message.length > 100 
                                ? query.message.substring(0, 100) + "..." 
                                : query.message
                              }
                            </div>
                          </td>
                          <td className="py-3">
                            {getStatusBadge(query.status)}
                          </td>
                          <td className="py-3">
                            <div className="btn-group btn-group-sm" role="group">
                              {query.status === "resolved" && (
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => updateQueryStatus(query._id, "pending")}
                                  title="Apply (Mark as pending)"
                                >
                                  <i className="bi bi-clock"></i> Apply
                                </button>
                              )}
                              
                              {query.status === "pending" && (
                                <button
                                  className="btn btn-outline-warning"
                                  disabled
                                  title="Currently pending"
                                >
                                  <i className="bi bi-clock-fill"></i> Pending
                                </button>
                              )}
                              
                              {query.status !== "resolved" && (
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => updateQueryStatus(query._id, "resolved")}
                                  title="Mark as resolved"
                                >
                                  <i className="bi bi-check-circle"></i> Resolve
                                </button>
                              )}
                              
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => deleteQuery(query._id)}
                                title="Delete query"
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
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
        )}
      </div>
    </Layout>
  );
};

export default AdminContact;