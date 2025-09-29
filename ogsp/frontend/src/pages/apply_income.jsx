// src/pages/IncomeCertificate.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import PaymentModal from "../components/PaymentModal";
import SuccessToast from "../components/SuccessToast";
import "bootstrap/dist/css/bootstrap.min.css";

const IncomeCertificate = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    passport_photo: null,
    adhar_card: null,
    ration_card: null,
    light_bill: null,
    supportive_aadhar1: null,
    supportive_aadhar2: null,
    rent_certificate_needed: "",
    rent_certificate: null,
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastDetails, setToastDetails] = useState(null);

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
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    const data = new FormData();
    data.append("applicationType", "Income Certificate");
    
    for (const key in formData) {
      if (formData[key] && key !== "rent_certificate_needed") {
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
        setSuccess("Income Certificate application submitted successfully!");
        setApplicationId(res.data.applicationId);
        setShowPayment(true);
        setFormData({
          passport_photo: null,
          adhar_card: null,
          ration_card: null,
          light_bill: null,
          supportive_aadhar1: null,
          supportive_aadhar2: null,
          rent_certificate_needed: "",
          rent_certificate: null,
        });
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
    setSuccess(`Payment successful! Transaction ID: ${paymentDetails.transactionId}. Your Income Certificate application is now being processed.`);
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
    <Layout user={user} title="Income Certificate Application">
      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Income Certificate Application</h2>
          </div>

      <div className="instruction-text text-center mb-3">
        Upload required documents to apply for Income Certificate.
      </div>

      <div className="user-info bg-light p-3 mb-3 rounded">
        Logged in as: <strong>{user?.username}</strong>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="row g-3" encType="multipart/form-data">
        <div className="col-md-6">
          <label>Passport Photo</label>
          <input type="file" name="passport_photo" className="form-control" onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label>Aadhar Card</label>
          <input type="file" name="adhar_card" className="form-control" onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label>Ration Card</label>
          <input type="file" name="ration_card" className="form-control" onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label>Light Bill</label>
          <input type="file" name="light_bill" className="form-control" onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label>Supportive Aadhar 1</label>
          <input type="file" name="supportive_aadhar1" className="form-control" onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label>Supportive Aadhar 2</label>
          <input type="file" name="supportive_aadhar2" className="form-control" onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label>Do you live in rent?</label>
          <select name="rent_certificate_needed" className="form-select" onChange={handleChange} value={formData.rent_certificate_needed}>
            <option value="">No</option>
            <option value="1">Yes</option>
          </select>
        </div>

        {formData.rent_certificate_needed === "1" && (
          <div className="col-md-6">
            <label>Rent Certificate</label>
            <input type="file" name="rent_certificate" className="form-control" onChange={handleChange} required />
          </div>
        )}

        <div className="col-12 d-flex justify-content-between mt-3">
          <button type="submit" className="btn btn-primary w-45">Submit</button>
          <button type="reset" className="btn btn-secondary w-45" onClick={() => setFormData({
            passport_photo: null,
            adhar_card: null,
            ration_card: null,
            light_bill: null,
            supportive_aadhar1: null,
            supportive_aadhar2: null,
            rent_certificate_needed: "",
            rent_certificate: null,
          })}>Reset</button>
        </div>
      </form>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPayment}
        onClose={handlePaymentCancel}
        applicationId={applicationId}
        serviceType="Income Certificate"
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Success Toast */}
          <SuccessToast 
            show={showSuccessToast}
            message="Income Certificate payment completed successfully!"
            details={toastDetails}
            onClose={() => setShowSuccessToast(false)}
          />
        </div>
      </div>
    </Layout>
  );
};

export default IncomeCertificate;
