// ServiceManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_ENDPOINTS } from '../config/api';
import ServiceFormModal from '../components/ServiceFormModal';
import "bootstrap/dist/css/bootstrap.min.css";

const ServiceManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }
    
    if (storedUser.role !== 'admin') {
      navigate("/dashboard");
      return;
    }
    
    setUser(storedUser);
    fetchServices(token);
  }, [navigate]);

  const fetchServices = async (token) => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_ALL_SERVICES_ADMIN, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setServices(response.data.services);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_ENDPOINTS.TOGGLE_SERVICE}/${serviceId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (response.data.success) {
        setSuccess(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchServices(token);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error toggling service status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_ENDPOINTS.DELETE_SERVICE}/${serviceId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (response.data.success) {
        setSuccess('Service deleted successfully');
        fetchServices(token);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting service');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      certificate: 'bg-success',
      card: 'bg-primary',
      document: 'bg-info',
      verification: 'bg-warning',
      other: 'bg-secondary'
    };
    return badges[category] || 'bg-secondary';
  };

  if (!user || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} title="Service Management">
      <div className="flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <div>
            <h4 className="mb-0">
              <i className="bi bi-gear-fill text-primary me-2"></i>
              Service Management
            </h4>
            <small className="text-muted">Manage all available services</small>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleCreateNew}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add New Service
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show m-3" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success alert-dismissible fade show m-3" role="alert">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}

        {/* Services Table */}
        <div className="p-3">
          {services.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted mb-3" style={{ fontSize: '3rem' }}></i>
              <h5>No Services Found</h5>
              <p className="text-muted">Start by creating your first service.</p>
              <button className="btn btn-primary" onClick={handleCreateNew}>
                <i className="bi bi-plus-lg me-2"></i>
                Create First Service
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Service</th>
                    <th>Category</th>
                    <th>Pricing</th>
                    <th>Applications</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`${service.icon} text-primary me-3`} style={{fontSize: '1.5rem'}}></i>
                          <div>
                            <div className="fw-bold">{service.displayName}</div>
                            <small className="text-muted">{service.name}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getCategoryBadge(service.category)} text-capitalize`}>
                          {service.category}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong>₹{service.pricing.serviceFee + service.pricing.consultancyCharge}</strong>
                          <small className="text-muted d-block">
                            (₹{service.pricing.serviceFee} + ₹{service.pricing.consultancyCharge})
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">{service.applicationCount || 0}</span>
                      </td>
                      <td>
                        <span className={`badge ${service.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(service)}
                            title="Edit Service"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className={`btn ${service.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleToggleStatus(service._id, service.isActive)}
                            title={service.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`bi ${service.isActive ? 'bi-pause' : 'bi-play'}`}></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(service._id, service.displayName)}
                            title="Delete Service"
                            disabled={service.applicationCount > 0}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Service Form Modal */}
        <ServiceFormModal 
          show={showModal}
          onClose={() => setShowModal(false)}
          service={editingService}
          onSuccess={() => {
            setShowModal(false);
            fetchServices(localStorage.getItem("token"));
            setSuccess(editingService ? 'Service updated successfully' : 'Service created successfully');
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      </div>
    </Layout>
  );
};

export default ServiceManagement;