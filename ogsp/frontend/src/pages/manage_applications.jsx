import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "bootstrap/dist/css/bootstrap.min.css";

const ManageApplications = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token) {
      navigate("/login");
    } else if (storedUser.role !== "admin") {
      navigate("/dashboard");
    } else {
      setUser(storedUser);
      fetchApplications(token);
    }
  }, [navigate]);

  const fetchApplications = async (token) => {
    try {
      const res = await axios.get("http://localhost:5000/api/application/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setApplications(res.data.applications);
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
      const res = await axios.patch(
        `http://localhost:5000/api/application/update-status/${applicationId}`,
        { status: newStatus, remarks: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        setError("Failed to update application status");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating application");
      console.error("Error updating application:", err);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: "bg-secondary",
      approved: "bg-success", 
      rejected: "bg-danger",
      in_progress: "bg-info"
    };
    return `badge ${statusMap[status] || "bg-secondary"}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === "all" || app.status === filterStatus
  );

  if (!user) return null;

  return (
    <Layout user={user} title="Service Request">
      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <h3 className="mb-0">Service Requests</h3>
          <span className="fw-bold">Admin</span>
        </div>
        
        <div className="p-4" style={{backgroundColor: "#f8f9fa"}}>
          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-5">
                    <h5>No Applications Found</h5>
                    <p>No applications match the current filter.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{width: "50px"}}>#</th>
                          <th>User</th>
                          <th>Service</th>
                          <th>Files</th>
                          <th>Submitted On</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((app, index) => (
                          <tr key={app._id}>
                            <td className="fw-bold">{index + 1}</td>
                            <td>
                              <div className="fw-semibold">{app.userId?.username}</div>
                              <small className="text-muted">{app.userId?.email}</small>
                            </td>
                            <td className="fw-semibold">{app.applicationType}</td>
                            <td>
                              <div className="d-flex gap-1">
                                {app.documents?.adharcard && (
                                  <a 
                                    href={`http://localhost:5000/uploads/${app.documents.adharcard}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary text-decoration-none"
                                  >
                                    Aadhar
                                  </a>
                                )}
                                {app.documents?.adharcard && app.documents?.passport_photo && " | "}
                                {app.documents?.passport_photo && (
                                  <a 
                                    href={`http://localhost:5000/uploads/${app.documents.passport_photo}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary text-decoration-none"
                                  >
                                    Photo
                                  </a>
                                )}
                              </div>
                            </td>
                            <td>{formatDate(app.submittedAt)}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              <select 
                                className="form-select form-select-sm"
                                value={app.status}
                                onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                                style={{width: "120px", display: "inline-block"}}
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              <button 
                                className="btn btn-primary btn-sm ms-2"
                                onClick={() => updateApplicationStatus(app._id, app.status)}
                              >
                                Update
                              </button>
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
      </div>
    </Layout>
  );
};

export default ManageApplications;