// src/pages/PanCard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PaymentModal from "../components/PaymentModal";
import SuccessToast from "../components/SuccessToast";
import "bootstrap/dist/css/bootstrap.min.css";

const PanCard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    adharcard: null,
    passport_photo: null,
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastDetails, setToastDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token) {
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    const data = new FormData();
    data.append("applicationType", "PAN Card");
    
    for (const key in formData) {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/application/submit", data, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });
      
      if (res.data.success) {
        setSuccess("PAN Card application submitted successfully!");
        setApplicationId(res.data.applicationId);
        setShowPayment(true);
        setFormData({ adharcard: null, passport_photo: null });
        // Clear file inputs
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
      } else {
        setError(res.data.message || "Something went wrong.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentDetails) => {
    setSuccess(`Payment successful! Transaction ID: ${paymentDetails.transactionId}. Your PAN Card application is now being processed.`);
    setShowPayment(false);
    
    // Show success toast
    setToastDetails({
      transactionId: paymentDetails.transactionId,
      amount: paymentDetails.totalAmount
    });
    setShowSuccessToast(true);
    
    // Auto redirect to applications after 3 seconds
    setTimeout(() => {
      navigate("/my-applications");
    }, 3000);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (!user) return null;

  return (
    <Layout user={user} title="PAN Card Application">
      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        <div className="container" style={{ maxWidth: "700px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>PAN Card Application</h2>
          </div>

      <div className="instruction-text text-center mb-3">
        Enter the required details to apply for your PAN Card.
      </div>

      <div className="user-info bg-light p-3 mb-3 rounded">
        Logged in as: <strong>{user.username}</strong>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!showPayment ? (
        <form onSubmit={handleSubmit} className="row g-3" encType="multipart/form-data">
          <div className="col-md-6">
            <label>Adhar Card *</label>
            <input 
              type="file" 
              name="adharcard" 
              className="form-control" 
              onChange={handleChange} 
              accept=".pdf,.jpg,.jpeg,.png"
              required 
            />
            <small className="text-muted">Upload your Aadhar card (PDF, JPG, PNG)</small>
          </div>
          <div className="col-md-6">
            <label>Passport Photo *</label>
            <input 
              type="file" 
              name="passport_photo" 
              className="form-control" 
              onChange={handleChange} 
              accept=".jpg,.jpeg,.png"
              required 
            />
            <small className="text-muted">Upload your passport size photo (JPG, PNG)</small>
          </div>

          <div className="col-12 d-flex justify-content-between mt-3">
            <button 
              type="submit" 
              className="btn btn-primary w-45" 
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
            <button 
              type="reset" 
              className="btn btn-secondary w-45" 
              onClick={() => {
                setFormData({ adharcard: null, passport_photo: null });
                document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
              }}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>
      ) : (
        <PaymentModal 
          isOpen={true}
          onClose={() => {}}
          applicationId={applicationId}
          serviceType="PAN Card"
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

          {/* Success Toast */}
          <SuccessToast 
            show={showSuccessToast}
            message="PAN Card payment completed successfully!"
            details={toastDetails}
            onClose={() => setShowSuccessToast(false)}
          />
        </div>
      </div>
    </Layout>
  );
};

export default PanCard;
