import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import "bootstrap/dist/css/bootstrap.min.css";

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState({
    serviceFee: 0,
    consultancyCharge: 0,
    totalAmount: 0
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Service fee mapping
  const serviceFees = {
    "PAN Card": { serviceFee: 100, consultancyCharge: 20 },
    "Income Certificate": { serviceFee: 50, consultancyCharge: 20 },
    "Caste Certificate": { serviceFee: 30, consultancyCharge: 20 },
    "Birth Certificate": { serviceFee: 25, consultancyCharge: 20 }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }
    
    setUser(storedUser);
    fetchApplicationDetails(token);
  }, [navigate, id]);

  const fetchApplicationDetails = async (token) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`http://localhost:5000/api/application/details/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        const app = response.data.application;
        setApplication(app);
        
        // Set payment data based on service type
        const fees = serviceFees[app.applicationType];
        if (fees) {
          setPaymentData({
            serviceFee: fees.serviceFee,
            consultancyCharge: fees.consultancyCharge,
            totalAmount: fees.serviceFee + fees.consultancyCharge
          });
        }
      } else {
        setError(response.data.message || "Application not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching application details");
      console.error("Error fetching application:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    try {
      setPaymentLoading(true);
      
      const response = await axios.post(
        "http://localhost:5000/api/payment/process",
        {
          applicationId: id,
          serviceType: application.applicationType,
          amount: paymentData.totalAmount
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setPaymentSuccess(true);
        // Refresh application data to show updated payment status
        fetchApplicationDetails(localStorage.getItem("token"));
      } else {
        setError("Payment failed: " + response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment processing error");
      console.error("Payment error:", err);
    } finally {
      setPaymentLoading(false);
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

  if (!user) return null;

  return (
    <Layout user={user} title="Payment">
      <div className="flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-secondary me-3"
              onClick={() => navigate("/my-applications")}
            >
              <i className="bi bi-arrow-left"></i> Back to Applications
            </button>
            <h3 className="mb-0">Payment</h3>
          </div>
        </div>
        
        <div className="p-4" style={{backgroundColor: "#f8f9fa"}}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {paymentSuccess && (
            <div className="alert alert-success d-flex align-items-center mb-4">
              <i className="bi bi-check-circle-fill me-2"></i>
              Payment completed successfully! Your application will be processed soon.
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : application ? (
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
                        <strong>Current Status:</strong>
                        <p className="mb-0">
                          <span className={`badge ${
                            application.status === 'pending' ? 'bg-warning text-dark' :
                            application.status === 'approved' ? 'bg-success' :
                            application.status === 'rejected' ? 'bg-danger' : 'bg-info'
                          }`}>
                            {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                          </span>
                        </p>
                      </div>
                      <div className="col-md-6">
                        <strong>Submitted On:</strong>
                        <p className="mb-0">{formatDate(application.submittedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Card */}
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-success text-white">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-credit-card me-2"></i>
                      Payment Information
                    </h5>
                  </div>
                  <div className="card-body">
                    {application.paymentStatus === 'completed' ? (
                      <div className="text-center py-4">
                        <i className="bi bi-check-circle-fill text-success" style={{fontSize: "4rem"}}></i>
                        <h4 className="text-success mt-3">Payment Already Completed</h4>
                        <p className="text-muted">This application has already been paid for.</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate("/my-applications")}
                        >
                          Back to Applications
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <div className="d-flex justify-content-between">
                              <span>Service Fee:</span>
                              <span className="fw-bold">₹{paymentData.serviceFee}</span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex justify-content-between">
                              <span>Consultancy Charge:</span>
                              <span className="fw-bold">₹{paymentData.consultancyCharge}</span>
                            </div>
                          </div>
                        </div>
                        
                        <hr />
                        
                        <div className="d-flex justify-content-between mb-4">
                          <span className="h5">Total Amount:</span>
                          <span className="h4 text-success fw-bold">₹{paymentData.totalAmount}</span>
                        </div>

                        <div className="text-center">
                          <button 
                            className="btn btn-success btn-lg px-5"
                            onClick={handlePayNow}
                            disabled={paymentLoading}
                          >
                            {paymentLoading ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-credit-card me-2"></i>
                                Pay Now ₹{paymentData.totalAmount}
                              </>
                            )}
                          </button>
                        </div>

                        <div className="mt-4 text-center">
                          <small className="text-muted">
                            <i className="bi bi-shield-check me-1"></i>
                            Secure payment processing
                          </small>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h5>Application not found</h5>
              <p className="text-muted">The requested application could not be found.</p>
              <button className="btn btn-primary" onClick={() => navigate("/my-applications")}>
                Back to Applications
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Payment;