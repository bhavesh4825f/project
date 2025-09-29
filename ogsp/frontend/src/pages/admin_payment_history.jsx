import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { API_BASE_URL } from '../config/api';
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminPaymentHistory() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "admin") {
      navigate("/login");
      return;
    }
    setUser(storedUser);
    fetchPayments();
  }, [navigate]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching payments with token:", token ? "Token exists" : "No token");
      console.log("Making request to:", `${API_BASE_URL}/api/payment/admin/history`);
      
      const response = await axios.get(`${API_BASE_URL}/api/payment/admin/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Response received:", response.data);
      
      if (response.data.success) {
        setPayments(response.data.payments || []);
      } else {
        setError("Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      console.error("Error response:", error.response?.data);
      setError(error.response?.data?.message || "Failed to fetch payments");
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
      payment.userId?.username?.toLowerCase().includes(searchLower) ||
      payment.userId?.email?.toLowerCase().includes(searchLower) ||
      payment.serviceType?.toLowerCase().includes(searchLower) ||
      payment.applicationId?.applicationType?.toLowerCase().includes(searchLower) ||
      payment.paymentStatus?.toLowerCase().includes(searchLower)
    );
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} title="Payment History">
      {/* Main Content */}
      <div className="content flex-grow-1 p-4" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Payment History</h2>
            <p className="text-muted mb-0">Monitor all payments and transactions</p>
          </div>
          <button 
            className="btn btn-outline-primary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

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
                    placeholder="Search by transaction ID, user name, email, service type, or status..."
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

        {/* Payment Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-currency-rupee text-success"></i>
                  </div>
                  <div>
                    <h6 className="card-title mb-0">Total Revenue</h6>
                    <h4 className="text-success mb-0">
                      ₹{payments.reduce((sum, payment) => sum + (Number(payment.totalAmount) || 0), 0)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-receipt text-primary"></i>
                  </div>
                  <div>
                    <h6 className="card-title mb-0">Total Payments</h6>
                    <h4 className="text-primary mb-0">{payments.length}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-check-circle text-info"></i>
                  </div>
                  <div>
                    <h6 className="card-title mb-0">Completed</h6>
                    <h4 className="text-info mb-0">
                      {payments.filter(payment => payment.paymentStatus === 'completed').length}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-clock text-warning"></i>
                  </div>
                  <div>
                    <h6 className="card-title mb-0">Pending</h6>
                    <h4 className="text-warning mb-0">
                      {payments.filter(payment => payment.paymentStatus === 'pending').length}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0">
            <h5 className="card-title mb-0">
              All Payments {searchTerm && `(${filteredPayments.length} results for "${searchTerm}")`}
            </h5>
          </div>
          <div className="card-body p-0">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="text-muted mt-3">
                  {searchTerm ? `No payments found matching "${searchTerm}"` : "No payments found"}
                </p>
                {searchTerm && (
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">Transaction ID</th>
                      <th className="border-0">User</th>
                      <th className="border-0">Service</th>
                      <th className="border-0">Amount</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          <span className="badge bg-light text-dark font-monospace">
                            #{payment.transactionId}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div className="fw-semibold">{payment.userId?.username || 'N/A'}</div>
                            <small className="text-muted">{payment.userId?.email || 'N/A'}</small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info text-white">
                            {payment.serviceType || payment.applicationId?.applicationType || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <span className="fw-semibold text-success">
                            ₹{Number(payment.totalAmount) || 0}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            payment.paymentStatus === 'completed' ? 'bg-success' : 
                            payment.paymentStatus === 'pending' ? 'bg-warning text-dark' : 
                            'bg-danger'
                          }`}>
                            {payment.paymentStatus || 'unknown'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div>{new Date(payment.paymentDate).toLocaleDateString()}</div>
                            <small className="text-muted">
                              {new Date(payment.paymentDate).toLocaleTimeString()}
                            </small>
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
    </Layout>
  );
}