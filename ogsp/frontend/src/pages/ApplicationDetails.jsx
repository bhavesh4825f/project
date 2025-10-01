import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../config/api';

const ApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/application/details/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setApplication(data.application);
        } else {
          console.error('API returned error:', data.message);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch application details:', errorData.message);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'bg-warning',
      'approved': 'bg-success',
      'rejected': 'bg-danger',
      'in-review': 'bg-info'
    };
    
    return (
      <span className={`badge ${statusColors[status] || 'bg-secondary'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading application details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!application) {
    return (
      <Layout>
        <div className="container mt-4">
          <div className="alert alert-danger">
            <h4>Application Not Found</h4>
            <p>The requested application could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                <h3 className="mb-2 mb-sm-0 fs-4 fs-sm-3">Application Details</h3>
                {getStatusBadge(application.status)}
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 col-lg-6">
                    <h5 className="fs-5">Basic Information</h5>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <tbody>
                          <tr>
                            <td><strong>Application ID:</strong></td>
                            <td className="text-break">{application._id}</td>
                          </tr>
                          <tr>
                            <td><strong>Service:</strong></td>
                            <td>{application.serviceName}</td>
                          </tr>
                          <tr>
                            <td><strong>Status:</strong></td>
                            <td>{getStatusBadge(application.status)}</td>
                          </tr>
                          <tr>
                            <td><strong>Submitted Date:</strong></td>
                            <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                          </tr>
                          <tr>
                            <td><strong>Last Updated:</strong></td>
                            <td>{new Date(application.updatedAt).toLocaleDateString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <h5 className="fs-5">Applicant Details</h5>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <tbody>
                          <tr>
                            <td><strong>Name:</strong></td>
                            <td>{application.fullName}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td className="text-break">{application.email}</td>
                          </tr>
                          <tr>
                            <td><strong>Phone:</strong></td>
                            <td>{application.phoneNumber}</td>
                          </tr>
                          <tr>
                            <td><strong>Address:</strong></td>
                            <td className="text-break">{application.address}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {application.documents && application.documents.length > 0 && (
                  <div className="mt-4">
                    <h5 className="fs-5">Uploaded Documents</h5>
                    <div className="row">
                      {application.documents.map((doc, index) => (
                        <div key={index} className="col-12 col-sm-6 col-md-4 mb-3">
                          <div className="card h-100">
                            <div className="card-body text-center d-flex flex-column">
                              <i className="bi bi-file-earmark-text fs-1 text-primary mb-2"></i>
                              <p className="card-text small text-break flex-grow-1">{doc}</p>
                              <a 
                                href={`${API_BASE_URL}/uploads/${doc}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary mt-auto"
                              >
                                <i className="bi bi-eye me-1"></i>
                                <span className="d-none d-sm-inline">View </span>Document
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {application.comments && (
                  <div className="mt-4">
                    <h5>Comments</h5>
                    <div className="alert alert-info">
                      {application.comments}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationDetails;