import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import PaymentModal from "../components/PaymentModal";
import SuccessToast from "../components/SuccessToast";
import Layout from "../components/Layout";
import { API_BASE_URL } from '../config/api';

export default function ApplyBirth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    applicantName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    gender: "",
    nationality: "Indian",
    address: "",
    city: "",
    state: "",
    pincode: "",
    mobileNumber: "",
    email: "",
    documents: []
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastDetails, setToastDetails] = useState(null);


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
    
    // Pre-fill some data from user profile
    setFormData(prev => ({
      ...prev,
      applicantName: storedUser.username || "",
      email: storedUser.email || "",
      mobileNumber: storedUser.mobile || ""
    }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSuccess = (paymentDetails) => {
    setSuccess(`Payment successful! Transaction ID: ${paymentDetails.transactionId}. Your Birth Certificate application is now being processed.`);
    setShowPaymentModal(false);
    
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
    setShowPaymentModal(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key !== 'documents') {
          submitData.append(key, formData[key]);
        }
      });

      // Append documents
      formData.documents.forEach((file, index) => {
        submitData.append(`other_documents`, file);
      });

      submitData.append('applicationType', 'Birth Certificate');
      submitData.append('userId', user._id);

      const response = await axios.post(`${API_BASE_URL}/api/application/submit`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Birth certificate application submitted successfully!');
        setApplicationId(response.data.applicationId);
        setShowPaymentModal(true);
        
        // Reset form
        setFormData({
          applicantName: user.username || "",
          fatherName: "",
          motherName: "",
          dateOfBirth: "",
          placeOfBirth: "",
          gender: "",
          nationality: "Indian",
          address: "",
          city: "",
          state: "",
          pincode: "",
          mobileNumber: user.mobile || "",
          email: user.email || "",
          documents: []
        });

        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setError(response.data.message || 'Something went wrong.');
      }

    } catch (error) {
      console.error('Application submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  return (
    <Layout user={user} title="Birth Certificate Application">
      {/* Main Content */}
      <div className="content flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Apply for Birth Certificate</h3>
          <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <h5 className="mb-3">Personal Information</h5>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="applicantName"
                    value={formData.applicantName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Father's Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Mother's Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Place of Birth *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Nationality *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <h5 className="mb-3">Address Information</h5>
              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="form-label">Full Address *</label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">PIN Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <h5 className="mb-3">Contact Information</h5>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Document Upload */}
              <h5 className="mb-3">Required Documents for Birth Certificate</h5>
              <div className="mb-3">
                <label className="form-label">Upload Documents *</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                <div className="form-text">
                  <ul className="mt-2">
                    <li>Hospital/Medical certificate (if available)</li>
                    <li>Identity proof of parents (Aadhaar Card/Voter ID)</li>
                    <li>Address proof</li>
                    <li>Affidavit (if hospital certificate not available)</li>
                    <li>Marriage certificate of parents (if available)</li>
                  </ul>
                  Accepted formats: PDF, JPG, JPEG, PNG. Max file size: 5MB each.
                </div>
              </div>

              <div className="d-flex gap-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Birth Certificate Application'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/my-applications")}
                >
                  View My Applications
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentCancel}
          applicationId={applicationId}
          serviceType="Birth Certificate"
          onPaymentSuccess={handlePaymentSuccess}
        />

        {/* Success Toast */}
        <SuccessToast 
          show={showSuccessToast}
          message="Birth Certificate payment completed successfully!"
          details={toastDetails}
          onClose={() => setShowSuccessToast(false)}
        />
      </div>
    </Layout>
  );
}