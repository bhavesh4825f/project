import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { API_BASE_URL } from '../config/api';
import "bootstrap/dist/css/bootstrap.min.css";

const DocumentHistory = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token) {
      navigate("/login");
    } else {
      setUser(storedUser);
      fetchDocuments(token);
    }
  }, [navigate]);

  const fetchDocuments = async (token) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/application/my-documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setDocuments(res.data.documents);
      } else {
        setError("Failed to fetch documents");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching documents");
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
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

  // Filter documents based on search term (moved after formatDate definition)
  const filteredDocuments = documents.filter(doc => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      doc.serviceType?.toLowerCase().includes(searchLower) ||
      doc.fileName?.toLowerCase().includes(searchLower) ||
      formatDate(doc.sentAt).toLowerCase().includes(searchLower)
    );
  });

  const downloadDocument = (documentPath, fileName) => {
    // Use documentPath directly since it already contains the full path
    const downloadUrl = `${API_BASE_URL}/${documentPath}`;
    window.open(downloadUrl, '_blank');
  };

  if (!user) return null;

  return (
    <Layout user={user} title="Document History">
      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <div>
            <h3 className="mb-0">Document History</h3>
            <small className="text-muted">Documents sent by OGSP Admin</small>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2">Welcome, <strong>{user?.username}</strong></span>
          </div>
        </div>
        
        <div className="p-4" style={{backgroundColor: "#f8f9fa"}}>
          {/* Information Card */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body bg-light">
              <div className="d-flex align-items-center">
                <i className="bi bi-info-circle text-primary me-2"></i>
                <div>
                  <small className="text-muted">
                    This page shows completed certificates and documents that have been processed and sent to you by the OGSP admin team.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {/* Search Bar */}
          {!loading && documents.length > 0 && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search by service type, file name, or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <small className="text-muted">
                      Showing {filteredDocuments.length} of {documents.length} documents
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-file-earmark-text" style={{fontSize: "3rem", color: "#6c757d"}}></i>
                    <h5 className="mt-3">
                      {searchTerm ? `No documents found matching "${searchTerm}"` : "No Documents Received"}
                    </h5>
                    <p className="text-muted">
                      {searchTerm ? "Try searching with different keywords." : "You haven't received any completed certificates from the admin yet."}
                    </p>
                    {!searchTerm && (
                      <p className="text-muted small">Documents will appear here once the admin processes and sends your completed applications.</p>
                    )}
                    {searchTerm && (
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {searchTerm && (
                      <div className="alert alert-info mx-3 mt-3 mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Found {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} matching "{searchTerm}"
                      </div>
                    )}
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-dark">
                          <tr>
                            <th style={{backgroundColor: "#495057", color: "white"}}>#</th>
                            <th style={{backgroundColor: "#495057", color: "white"}}>Service Type</th>
                            <th style={{backgroundColor: "#495057", color: "white"}}>Document</th>
                            <th style={{backgroundColor: "#495057", color: "white"}}>Sent by Admin</th>
                            <th style={{backgroundColor: "#495057", color: "white"}}>Action</th>
                          </tr>
                        </thead>
                        <tbody style={{backgroundColor: "#f8f9fa"}}>
                          {filteredDocuments.map((doc, index) => (
                          <tr key={doc.id} style={{backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff"}}>
                            <td className="py-3">{index + 1}</td>
                            <td className="py-3">
                              <span className="badge bg-success">{doc.serviceType}</span>
                            </td>
                            <td className="py-3">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-file-earmark-pdf me-2 text-danger"></i>
                                <div>
                                  <div className="small fw-semibold">{doc.fileName}</div>
                                  <div className="text-success small">
                                    <i className="bi bi-check-circle-fill me-1"></i>
                                    Sent by Admin
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <small className="text-muted">{formatDate(doc.sentAt)}</small>
                            </td>
                            <td className="py-3">
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => downloadDocument(doc.documentPath, doc.fileName)}
                              >
                                <i className="bi bi-download me-1"></i>
                                Download
                              </button>
                            </td>
                          </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

export default DocumentHistory;
