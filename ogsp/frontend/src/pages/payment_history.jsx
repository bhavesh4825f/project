import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { API_ENDPOINTS } from '../config/api';
import "bootstrap/dist/css/bootstrap.min.css";

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
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
      fetchPaymentHistory(token);
    }
  }, [navigate]);

  const fetchPaymentHistory = async (token) => {
    try {
      const res = await axios.get(API_ENDPOINTS.PAYMENT_HISTORY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setPayments(res.data.payments);
      } else {
        setError("Failed to fetch payment history");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching payment history");
      console.error("Error fetching payment history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.transactionId?.toLowerCase().includes(searchLower) ||
      payment.serviceType?.toLowerCase().includes(searchLower) ||
      payment.paymentStatus?.toLowerCase().includes(searchLower) ||
      new Date(payment.paymentDate).toLocaleDateString().toLowerCase().includes(searchLower)
    );
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      completed: "success",
      pending: "warning", 
      failed: "danger"
    };
    return `badge bg-${statusColors[status] || 'secondary'}`;
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      "PAN Card": "bi-credit-card",
      "Income Certificate": "bi-currency-rupee",
      "Caste Certificate": "bi-file-earmark-text",
      "Birth Certificate": "bi-person-badge"
    };
    return icons[serviceType] || "bi-file-earmark";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} title="Payment History">
      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <div>
            <h3 className="mb-0">My Payments</h3>
            <small className="text-muted">View your payment history and transaction details</small>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2">Welcome, <strong>{user?.username}</strong></span>
          </div>
        </div>
        
        <div className="p-4" style={{backgroundColor: "#f8f9fa"}}>
          <div className="row">
            <div className="col-12"></div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Search Bar */}
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
                        placeholder="Search by transaction ID, service type, status, or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <small className="text-muted">
                      Showing {filteredPayments.length} of {payments.length} payments
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary Cards */}
            {payments.length > 0 && (
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-currency-rupee text-primary"></i>
                        </div>
                        <div>
                          <h6 className="card-title mb-0">{searchTerm ? 'Filtered' : 'Total'} Paid</h6>
                          <h4 className="text-primary mb-0">
                            ₹{filteredPayments.reduce((sum, payment) => sum + (Number(payment.totalAmount) || 0), 0)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-check-circle text-success"></i>
                        </div>
                        <div>
                          <h6 className="card-title mb-0">{searchTerm ? 'Filtered' : 'Total'} Transactions</h6>
                          <h4 className="text-success mb-0">{filteredPayments.length}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-receipt text-info"></i>
                        </div>
                        <div>
                          <h6 className="card-title mb-0">Services Used</h6>
                          <h4 className="text-info mb-0">
                            {[...new Set(filteredPayments.map(p => p.serviceType))].length}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payments List */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0">
                <h5 className="card-title mb-0">
                  Payment History {searchTerm && `(${filteredPayments.length} results for "${searchTerm}")`}
                </h5>
              </div>
              <div className="card-body p-0">
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-credit-card text-muted" style={{ fontSize: '4rem' }}></i>
                    <h5 className="mt-3 text-muted">
                      {searchTerm ? `No payments found matching "${searchTerm}"` : "No payments found"}
                    </h5>
                    <p className="text-muted">
                      {searchTerm ? "Try searching with different keywords." : "Your payment history will appear here once you make payments."}
                    </p>
                    {searchTerm ? (
                      <button 
                        className="btn btn-outline-primary me-2"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear search
                      </button>
                    ) : null}
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate("/my-applications")}
                    >
                      View Applications
                    </button>
                  </div>
                ) : (
                  <div className="row g-3 p-3">
                    {filteredPayments.map((payment) => (
                      <div key={payment._id} className="col-md-6">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between mb-3">
                              <div className="d-flex align-items-center">
                                <div className="bg-light rounded-circle p-2 me-3">
                                  <i className={`${getServiceIcon(payment.serviceType)} text-primary`}></i>
                                </div>
                                <div>
                                  <h6 className="card-title mb-0">{payment.serviceType}</h6>
                                  <small className="text-muted">
                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                  </small>
                                </div>
                              </div>
                              <span className={getStatusBadge(payment.paymentStatus)}>
                                {payment.paymentStatus}
                              </span>
                            </div>

                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="text-muted">Transaction ID:</small>
                                <code className="text-primary small">{payment.transactionId}</code>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="text-muted">Service Fee:</small>
                                <span className="small">₹{Number(payment.serviceFee) || 0}</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="text-muted">Consultancy Charge:</small>
                                <span className="small">₹{Number(payment.consultancyCharge) || 0}</span>
                              </div>
                              <hr className="my-2" />
                              <div className="d-flex justify-content-between align-items-center">
                                <strong className="text-muted">Total Amount:</strong>
                                <strong className="text-success">₹{Number(payment.totalAmount) || 0}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}