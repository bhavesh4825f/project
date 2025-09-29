// ServiceFormModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import "bootstrap/dist/css/bootstrap.min.css";

const ServiceFormModal = ({ show, onClose, service, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    category: 'certificate',
    pricing: {
      serviceFee: 0,
      consultancyCharge: 20
    },
    processingTime: '5-7 working days',
    icon: 'bi-file-earmark',
    displayOrder: 0
  });
  
  const [formFields, setFormFields] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or service changes
  useEffect(() => {
    if (show) {
      if (service) {
        // Edit mode
        setFormData({
          name: service.name || '',
          displayName: service.displayName || '',
          description: service.description || '',
          category: service.category || 'certificate',
          pricing: service.pricing || { serviceFee: 0, consultancyCharge: 20 },
          processingTime: service.processingTime || '5-7 working days',
          icon: service.icon || 'bi-file-earmark',
          displayOrder: service.displayOrder || 0
        });
        setFormFields(service.formFields || []);
        setRequiredDocuments(service.requiredDocuments || []);
      } else {
        // Create mode
        setFormData({
          name: '',
          displayName: '',
          description: '',
          category: 'certificate',
          pricing: { serviceFee: 0, consultancyCharge: 20 },
          processingTime: '5-7 working days',
          icon: 'bi-file-earmark',
          displayOrder: 0
        });
        setFormFields([]);
        setRequiredDocuments([]);
      }
      setError('');
    }
  }, [show, service]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('pricing.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [field]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Form Fields Management
  const addFormField = () => {
    setFormFields(prev => [...prev, {
      fieldName: '',
      displayName: '',
      fieldType: 'text',
      required: false,
      options: [],
      placeholder: '',
      helpText: ''
    }]);
  };

  const removeFormField = (index) => {
    setFormFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateFormField = (index, field, value) => {
    setFormFields(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Document Fields Management
  const addDocument = () => {
    setRequiredDocuments(prev => [...prev, {
      fieldName: '',
      displayName: '',
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      description: ''
    }]);
  };

  const removeDocument = (index) => {
    setRequiredDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const updateDocument = (index, field, value) => {
    setRequiredDocuments(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Service name is required');
      return false;
    }
    if (!formData.displayName.trim()) {
      setError('Display name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (formData.pricing.serviceFee < 0) {
      setError('Service fee cannot be negative');
      return false;
    }
    if (formData.pricing.consultancyCharge < 0) {
      setError('Consultancy charge cannot be negative');
      return false;
    }

    // Validate form fields
    for (let i = 0; i < formFields.length; i++) {
      const field = formFields[i];
      if (!field.fieldName.trim() || !field.displayName.trim()) {
        setError(`Form field ${i + 1}: Field name and display name are required`);
        return false;
      }
    }

    // Validate documents
    for (let i = 0; i < requiredDocuments.length; i++) {
      const doc = requiredDocuments[i];
      if (!doc.fieldName.trim() || !doc.displayName.trim()) {
        setError(`Document ${i + 1}: Field name and display name are required`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        formFields,
        requiredDocuments
      };

      let response;
      if (service) {
        // Update existing service
        response = await axios.put(
          `${API_BASE_URL}/api/service/admin/${service._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` }}
        );
      } else {
        // Create new service
        response = await axios.post(
          `${API_BASE_URL}/api/service/admin/create`,
          payload,
          { headers: { Authorization: `Bearer ${token}` }}
        );
      }

      if (response.data.success) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving service');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {service ? 'Edit Service' : 'Create New Service'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-danger">{error}</div>}

              {/* Basic Information */}
              <div className="card mb-4">
                <div className="card-header">
                  <h6 className="mb-0">Basic Information</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Service Name (Internal) *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="pan_card"
                        required
                      />
                      <small className="text-muted">Used internally, no spaces or special characters</small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Display Name *</label>
                      <input
                        type="text"
                        name="displayName"
                        className="form-control"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        placeholder="PAN Card Application"
                        required
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Description *</label>
                      <textarea
                        name="description"
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the service..."
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Category</label>
                      <select name="category" className="form-select" value={formData.category} onChange={handleInputChange}>
                        <option value="certificate">Certificate</option>
                        <option value="card">Card</option>
                        <option value="document">Document</option>
                        <option value="verification">Verification</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Icon Class</label>
                      <input
                        type="text"
                        name="icon"
                        className="form-control"
                        value={formData.icon}
                        onChange={handleInputChange}
                        placeholder="bi-file-earmark"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Processing Time</label>
                      <input
                        type="text"
                        name="processingTime"
                        className="form-control"
                        value={formData.processingTime}
                        onChange={handleInputChange}
                        placeholder="5-7 working days"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="card mb-4">
                <div className="card-header">
                  <h6 className="mb-0">Pricing</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Service Fee (₹)</label>
                      <input
                        type="number"
                        name="pricing.serviceFee"
                        className="form-control"
                        value={formData.pricing.serviceFee}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Consultancy Charge (₹)</label>
                      <input
                        type="number"
                        name="pricing.consultancyCharge"
                        className="form-control"
                        value={formData.pricing.consultancyCharge}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="col-12">
                      <div className="alert alert-info">
                        <strong>Total Fee: ₹{formData.pricing.serviceFee + formData.pricing.consultancyCharge}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Form Fields</h6>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={addFormField}>
                    <i className="bi bi-plus"></i> Add Field
                  </button>
                </div>
                <div className="card-body">
                  {formFields.length === 0 ? (
                    <p className="text-muted text-center py-3">No form fields added yet</p>
                  ) : (
                    formFields.map((field, index) => (
                      <div key={index} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h6>Field {index + 1}</h6>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeFormField(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <label className="form-label small">Field Name</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={field.fieldName}
                              onChange={(e) => updateFormField(index, 'fieldName', e.target.value)}
                              placeholder="applicantName"
                            />
                          </div>
                          <div className="col-md-6 mb-2">
                            <label className="form-label small">Display Name</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={field.displayName}
                              onChange={(e) => updateFormField(index, 'displayName', e.target.value)}
                              placeholder="Applicant Name"
                            />
                          </div>
                          <div className="col-md-4 mb-2">
                            <label className="form-label small">Field Type</label>
                            <select 
                              className="form-select form-select-sm"
                              value={field.fieldType}
                              onChange={(e) => updateFormField(index, 'fieldType', e.target.value)}
                            >
                              <option value="text">Text</option>
                              <option value="email">Email</option>
                              <option value="tel">Phone</option>
                              <option value="date">Date</option>
                              <option value="number">Number</option>
                              <option value="select">Select</option>
                              <option value="textarea">Textarea</option>
                            </select>
                          </div>
                          <div className="col-md-4 mb-2">
                            <label className="form-label small">Placeholder</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={field.placeholder}
                              onChange={(e) => updateFormField(index, 'placeholder', e.target.value)}
                            />
                          </div>
                          <div className="col-md-4 mb-2">
                            <div className="form-check mt-4">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateFormField(index, 'required', e.target.checked)}
                              />
                              <label className="form-check-label small">Required</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Required Documents */}
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Required Documents</h6>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={addDocument}>
                    <i className="bi bi-plus"></i> Add Document
                  </button>
                </div>
                <div className="card-body">
                  {requiredDocuments.length === 0 ? (
                    <p className="text-muted text-center py-3">No documents added yet</p>
                  ) : (
                    requiredDocuments.map((doc, index) => (
                      <div key={index} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h6>Document {index + 1}</h6>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeDocument(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <label className="form-label small">Field Name</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={doc.fieldName}
                              onChange={(e) => updateDocument(index, 'fieldName', e.target.value)}
                              placeholder="adhar_card"
                            />
                          </div>
                          <div className="col-md-6 mb-2">
                            <label className="form-label small">Display Name</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={doc.displayName}
                              onChange={(e) => updateDocument(index, 'displayName', e.target.value)}
                              placeholder="Aadhar Card"
                            />
                          </div>
                          <div className="col-md-8 mb-2">
                            <label className="form-label small">Description</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={doc.description}
                              onChange={(e) => updateDocument(index, 'description', e.target.value)}
                              placeholder="Upload clear photo of Aadhar card"
                            />
                          </div>
                          <div className="col-md-4 mb-2">
                            <div className="form-check mt-4">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={doc.required}
                                onChange={(e) => updateDocument(index, 'required', e.target.checked)}
                              />
                              <label className="form-check-label small">Required</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {service ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  service ? 'Update Service' : 'Create Service'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormModal;