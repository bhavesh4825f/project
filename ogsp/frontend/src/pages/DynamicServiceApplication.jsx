// DynamicServiceApplication.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import PaymentModal from '../components/PaymentModal';
import { API_ENDPOINTS } from '../config/api';
import "bootstrap/dist/css/bootstrap.min.css";

const DynamicServiceApplication = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }
    
    setUser(storedUser);
    fetchServiceDetails();
  }, [navigate, serviceId]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching service details for ID:', serviceId);
      const response = await axios.get(API_ENDPOINTS.SERVICE_DETAILS(serviceId));
      console.log('Service response:', response.data);
      
      if (response.data.success && response.data.service) {
        const serviceData = response.data.service;
        setService(serviceData);
        
        // Initialize form data with default values
        const initialFormData = {};
        if (serviceData.formFields && serviceData.formFields.length > 0) {
          serviceData.formFields.forEach(field => {
            initialFormData[field.fieldName] = '';
          });
        }
        setFormData(initialFormData);
      } else {
        setError('Service not found');
      }
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError(err.response?.data?.message || 'Error fetching service details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0]
      }));
    }
  };

  const validateForm = () => {
    // Validate required form fields
    for (const field of service.formFields) {
      if (field.required && !formData[field.fieldName]?.trim()) {
        setError(`${field.displayName} is required`);
        return false;
      }
    }

    // Validate required documents
    for (const doc of service.requiredDocuments) {
      if (doc.required && !files[doc.fieldName]) {
        setError(`${doc.displayName} is required`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('serviceId', serviceId);
      formDataToSend.append('applicationType', service.name);
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      });

      const token = localStorage.getItem("token");
      const response = await axios.post(
        API_ENDPOINTS.SUBMIT_APPLICATION,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setApplicationId(response.data.applicationId);
        setSuccess('Application submitted successfully!');
        setShowPayment(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormField = (field) => {
    const commonProps = {
      name: field.fieldName,
      className: 'form-control',
      value: formData[field.fieldName] || '',
      onChange: handleInputChange,
      required: field.required,
      placeholder: field.placeholder
    };

    switch (field.fieldType) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.displayName}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return <textarea {...commonProps} rows="3" />;
      
      case 'date':
        return <input {...commonProps} type="date" />;
      
      case 'email':
        return <input {...commonProps} type="email" />;
      
      case 'tel':
        return <input {...commonProps} type="tel" />;
      
      case 'number':
        return <input {...commonProps} type="number" />;
      
      default:
        return <input {...commonProps} type="text" />;
    }
  };

  const renderFileField = (doc) => {
    return (
      <div key={doc.fieldName} className="col-md-6 mb-3">
        <label className="form-label">
          {doc.displayName} {doc.required && <span className="text-danger">*</span>}
        </label>
        <input
          type="file"
          name={doc.fieldName}
          className="form-control"
          accept={doc.acceptedFormats?.join(',')}
          onChange={handleFileChange}
          required={doc.required}
        />
        {doc.description && (
          <small className="text-muted">{doc.description}</small>
        )}
      </div>
    );
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

  if (!loading && (!service || error)) {
    return (
      <Layout user={user} title="Service Not Found">
        <div className="container py-5">
          <div className="text-center">
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
              <h4>Service Not Found</h4>
              <p>{error || 'The requested service could not be found.'}</p>
              <div className="mt-4">
                <button className="btn btn-primary me-2" onClick={() => navigate('/')}>
                  Back to Home
                </button>
                <button className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} title={service.displayName}>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Service Header */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <div className="d-flex align-items-center">
                  <i className={`${service.icon} me-3`} style={{fontSize: '2rem'}}></i>
                  <div>
                    <h4 className="mb-0">{service.displayName}</h4>
                    <small>Processing Time: {service.processingTime}</small>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <p className="mb-0">{service.description}</p>
                <div className="mt-3">
                  <strong>Total Fee: ₹{service.pricing.serviceFee + service.pricing.consultancyCharge}</strong>
                  <small className="text-muted ms-2">
                    (Service: ₹{service.pricing.serviceFee}, Consultancy: ₹{service.pricing.consultancyCharge})
                  </small>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Application Form */}
            {!showPayment && (
              <form onSubmit={handleSubmit} className="card shadow-sm">
                <div className="card-header">
                  <h5 className="mb-0">Application Form</h5>
                </div>
                <div className="card-body">
                  {/* Form Fields */}
                  {service.formFields.length > 0 && (
                    <div className="row">
                      {service.formFields.map((field) => (
                        <div key={field.fieldName} className="col-md-6 mb-3">
                          <label className="form-label">
                            {field.displayName} {field.required && <span className="text-danger">*</span>}
                          </label>
                          {renderFormField(field)}
                          {field.helpText && (
                            <small className="text-muted">{field.helpText}</small>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Document Upload */}
                  {service.requiredDocuments.length > 0 && (
                    <>
                      <hr />
                      <h6 className="mb-3">Required Documents</h6>
                      <div className="row">
                        {service.requiredDocuments.map(renderFileField)}
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="d-flex gap-3 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/dashboard')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Payment Modal */}
            <PaymentModal
              isOpen={showPayment}
              onClose={() => setShowPayment(false)}
              applicationId={applicationId}
              serviceType={service.name}
              onPaymentSuccess={() => {
                setShowPayment(false);
                navigate('/my-applications');
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DynamicServiceApplication;