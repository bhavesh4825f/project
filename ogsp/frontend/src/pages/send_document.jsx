import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_ENDPOINTS } from '../config/api';

const SendDocument = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Application ID from URL
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sendingLoading, setSendingLoading] = useState(false);

  // Determine if we're in single application mode or list mode
  const isSingleMode = !!id;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token || storedUser.role !== "admin") {
      navigate("/login");
      return;
    }
    
    setUser(storedUser);
    
    if (isSingleMode) {
      // Single application mode
      fetchSingleApplication(token, id);
    } else {
      // List all approved applications mode
      fetchApprovedApplications(token);
    }
  }, [navigate, id, isSingleMode]);

  const fetchSingleApplication = async (token, appId) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_ENDPOINTS.APPLICATION_DETAILS}/${appId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        const app = response.data.application;
        // Check if application is approved and document not sent yet
        if (app.status !== 'approved') {
          setError("Application must be approved before sending documents.");
          return;
        }
        if (app.documentSent) {
          setError("Document has already been sent for this application.");
          return;
        }
        setApplication(app);
      } else {
        setError(response.data.message || "Application not found or access denied.");
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      setError(error.response?.data?.message || "Error loading application details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedApplications = async (token) => {
    try {
      setLoading(true);
      
      const response = await axios.get(API_ENDPOINTS.APPROVED_APPLICATIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setApplications(response.data.applications);
        console.log("Fetched approved applications:", response.data.applications.length);
      } else {
        console.error("Failed to fetch applications:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching approved applications:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSendDocument = async (e, appId, userId, applicationType) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('input[type="file"]');
    
    if (!fileInput.files[0]) {
      alert("Please select a file to send");
      return;
    }

    const formData = new FormData();
    formData.append("applicationId", appId);
    formData.append("userId", userId);
    formData.append("serviceType", applicationType);
    formData.append("document", fileInput.files[0]);
    formData.append("deliveryMethod", "portal");
    formData.append("sendingNotes", "");

    try {
      const response = await axios.post("http://localhost:5000/api/application/send-document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setSuccessMessage("Document sent successfully through portal.");
        fileInput.value = ""; // Clear file input
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        alert("Failed to send document: " + response.data.message);
      }
    } catch (error) {
      console.error("Error sending document:", error);
      alert("Error sending document. Please try again.");
    }
  };

  const handleSingleApplicationSend = async () => {
    if (!selectedFile) {
      alert("Please select a file to send");
      return;
    }

    setSendingLoading(true);
    const formData = new FormData();
    formData.append("applicationId", application._id);
    formData.append("userId", application.userId._id || application.userId);
    formData.append("serviceType", application.applicationType);
    formData.append("document", selectedFile);
    formData.append("deliveryMethod", "portal");
    formData.append("sendingNotes", "");

    try {
      const response = await axios.post("http://localhost:5000/api/application/send-document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setSuccessMessage("Document sent successfully through portal!");
        setSelectedFile(null);
        
        // Refresh application data
        fetchSingleApplication(localStorage.getItem("token"), id);
      } else {
        alert("Failed to send document: " + response.data.message);
      }
    } catch (error) {
      console.error("Error sending document:", error);
      alert("Error sending document. Please try again.");
    } finally {
      setSendingLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return null;

  return (
    <Layout user={user} title="Send Document">
      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <div className="d-flex align-items-center">
            {isSingleMode && (
              <button 
                className="btn btn-outline-secondary me-3"
                onClick={() => navigate("/manage-applications")}
              >
                <i className="bi bi-arrow-left"></i> Back to Applications
              </button>
            )}
            <h3 className="mb-0">
              {isSingleMode ? "Send Document - Portal Delivery" : "Send Documents to Clients"}
            </h3>
          </div>
          {isSingleMode && application && (
            <div className="d-flex align-items-center">
              <span className="badge bg-info">Portal Only</span>
            </div>
          )}
        </div>
        
        <div className="p-4" style={{backgroundColor: "#f8f9fa"}}>
          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success d-flex align-items-center mb-4">
              <i className="bi bi-check-circle-fill me-2"></i>
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : isSingleMode ? (
            /* Single Application Mode */
            application ? (
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  {/* Application Info Card */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-header bg-primary text-white">
                      <h5 className="card-title mb-0">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Application Details
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <strong>Application ID:</strong>
                          <p className="mb-0"><code>{application._id}</code></p>
                        </div>
                        <div className="col-md-6">
                          <strong>Service Type:</strong>
                          <p className="mb-0">
                            <span className="badge bg-info fs-6">{application.applicationType}</span>
                          </p>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <strong>Applicant:</strong>
                          <p className="mb-0">{application.userId?.username || 'Unknown'}</p>
                        </div>
                        <div className="col-md-6">
                          <strong>Email:</strong>
                          <p className="mb-0">{application.userId?.email || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Status:</strong>
                          <p className="mb-0">
                            <span className="badge bg-success">Approved</span>
                          </p>
                        </div>
                        <div className="col-md-6">
                          <strong>Payment:</strong>
                          <p className="mb-0">
                            <span className={`badge ${application.paymentStatus === 'completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                              {application.paymentStatus?.charAt(0).toUpperCase() + application.paymentStatus?.slice(1)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload Card */}
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-success text-white">
                      <h5 className="card-title mb-0">
                        <i className="bi bi-cloud-upload me-2"></i>
                        Send Document via Portal
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">
                          <strong>Select Document to Send:</strong>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                        <small className="text-muted">
                          Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG
                        </small>
                      </div>



                      <div className="mb-3">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          <strong>Delivery Method:</strong> Portal Only
                          <br />
                          The document will be available to the user through their portal account.
                        </div>
                      </div>

                      <div className="text-center">
                        <button
                          className="btn btn-success btn-lg px-5"
                          onClick={handleSingleApplicationSend}
                          disabled={!selectedFile || sendingLoading}
                        >
                          {sendingLoading ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send me-2"></i>
                              Send Document via Portal
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="card">
                  <div className="card-body py-5">
                    <i className="bi bi-exclamation-triangle text-warning" style={{fontSize: "3rem"}}></i>
                    <h5 className="mt-3">Application Not Available</h5>
                    <p className="text-muted">The application is not found, not approved, or document already sent.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate("/manage-applications")}
                    >
                      Back to Applications
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* List Mode */
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                {applications.length === 0 ? (
                  <div className="text-center py-5">
                    <h5>No Approved Applications</h5>
                    <p>No approved applications are available for document sending.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th style={{backgroundColor: "#495057", color: "white"}}>#</th>
                          <th style={{backgroundColor: "#495057", color: "white"}}>User</th>
                          <th style={{backgroundColor: "#495057", color: "white"}}>Email</th>
                          <th style={{backgroundColor: "#495057", color: "white"}}>Service</th>
                          <th style={{backgroundColor: "#495057", color: "white", minWidth: "350px"}}>Document Delivery</th>
                        </tr>
                      </thead>
                      <tbody style={{backgroundColor: "#f8f9fa"}}>
                        {applications.map((app, index) => (
                          <tr key={app._id} style={{backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff"}}>
                            <td className="py-3">{index + 1}</td>
                            <td className="py-3">{app.userId?.username || app.username}</td>
                            <td className="py-3">{app.userId?.email || app.email}</td>
                            <td className="py-3">
                              <span className="badge bg-primary">{app.applicationType}</span>
                            </td>
                            <td className="py-3">
                              <form 
                                onSubmit={(e) => handleSendDocument(e, app._id, app.userId?._id, app.applicationType)}
                                className="d-flex flex-column gap-2"
                              >
                                <div className="d-flex align-items-center gap-2">
                                  <input 
                                    type="file" 
                                    className="form-control form-control-sm"
                                    style={{maxWidth: "300px"}}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    required
                                  />
                                  <span className="badge bg-info">Portal Only</span>
                                </div>

                                <button 
                                  type="submit" 
                                  className="btn btn-success btn-sm"
                                  style={{minWidth: "70px"}}
                                >
                                  <i className="bi bi-send me-1"></i>
                                  Send Document
                                </button>
                              </form>
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

export default SendDocument;