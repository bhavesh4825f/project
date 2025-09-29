import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_ENDPOINTS } from '../config/api';

export default function PriceManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prices, setPrices] = useState({});
  const [editingService, setEditingService] = useState(null);
  const [tempPrice, setTempPrice] = useState("");
  const [tempConsultancyPrice, setTempConsultancyPrice] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [dynamicServices, setDynamicServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default services that can have price changes
  const defaultServices = [
    {
      id: "pan_card",
      name: "PAN Card Application",
      defaultPrice: "107",
      description: "Apply online for a new PAN card or correction"
    },
    {
      id: "income_certificate", 
      name: "Income Certificate",
      defaultPrice: "30",
      description: "Apply online for income certificate verification"
    },
    {
      id: "caste_certificate",
      name: "Caste Certificate", 
      defaultPrice: "30",
      description: "Apply for caste certificate verification"
    },
    {
      id: "birth_certificate",
      name: "Birth Certificate",
      defaultPrice: "50", 
      description: "Apply for birth certificate verification"
    }
  ];

  useEffect(() => {
    // Check admin authentication
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token) {
      navigate("/login");
      return;
    } else if (storedUser.role !== "admin") {
      navigate("/dashboard");
      return;
    } else {
      setUser(storedUser);
    }

    // Load saved prices from localStorage
    const savedPrices = JSON.parse(localStorage.getItem("servicePrices")) || {};
    setPrices(savedPrices);
    
    // Fetch dynamic services
    fetchDynamicServices();
  }, [navigate]);

  const fetchDynamicServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API_ENDPOINTS.GET_ALL_SERVICES_ADMIN, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDynamicServices(response.data.services);
      }
    } catch (err) {
      console.error("Error fetching dynamic services:", err);
      setError("Failed to load dynamic services");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const startEditing = (service) => {
    setEditingService(service.id || service._id);
    if (service.pricing) {
      // Dynamic service
      setTempPrice(service.pricing.serviceFee.toString());
      setTempConsultancyPrice(service.pricing.consultancyCharge.toString());
    } else {
      // Legacy service
      const currentPrice = prices[service.name] || service.defaultPrice;
      setTempPrice(currentPrice.replace("₹", ""));
      setTempConsultancyPrice("20"); // Default consultancy charge
    }
  };

  const cancelEditing = () => {
    setEditingService(null);
    setTempPrice("");
    setTempConsultancyPrice("");
  };

  const savePrice = async (service) => {
    if (!tempPrice || isNaN(tempPrice) || parseFloat(tempPrice) <= 0) {
      setError("Please enter a valid service fee");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!tempConsultancyPrice || isNaN(tempConsultancyPrice) || parseFloat(tempConsultancyPrice) < 0) {
      setError("Please enter a valid consultancy charge");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (service.pricing) {
      // Dynamic service - update via API
      try {
        const token = localStorage.getItem("token");
        const response = await axios.patch(
          `${API_ENDPOINTS.UPDATE_SERVICE_PRICING}/${service._id}/pricing`,
          {
            serviceFee: parseFloat(tempPrice),
            consultancyCharge: parseFloat(tempConsultancyPrice)
          },
          { headers: { Authorization: `Bearer ${token}` }}
        );

        if (response.data.success) {
          // Update local state
          setDynamicServices(prev => prev.map(s => 
            s._id === service._id 
              ? { ...s, pricing: { serviceFee: parseFloat(tempPrice), consultancyCharge: parseFloat(tempConsultancyPrice) }}
              : s
          ));
          setSuccess(`Price updated for ${service.displayName}`);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update service pricing");
        setTimeout(() => setError(""), 3000);
        return;
      }
    } else {
      // Legacy service - save to localStorage
      const newPrices = {
        ...prices,
        [service.name]: `₹${tempPrice}`
      };

      setPrices(newPrices);
      localStorage.setItem("servicePrices", JSON.stringify(newPrices));
      setSuccess(`Price updated for ${service.name}`);
    }
    
    setEditingService(null);
    setTempPrice("");
    setTempConsultancyPrice("");
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetToDefault = async (service) => {
    if (service.pricing) {
      // Dynamic service - reset not applicable as it's database-driven
      setError("Dynamic services don't have default prices. Edit to change pricing.");
      setTimeout(() => setError(""), 3000);
      return;
    } else {
      // Legacy service - reset to default
      const newPrices = { ...prices };
      delete newPrices[service.name];
      
      setPrices(newPrices);
      localStorage.setItem("servicePrices", JSON.stringify(newPrices));
      
      setSuccess(`${service.name} price reset to default ₹${service.defaultPrice}`);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const getCurrentPrice = (service) => {
    if (service.pricing) {
      // Dynamic service - return current database values
      return `₹${service.pricing.serviceFee + service.pricing.consultancyCharge}`;
    } else {
      // Legacy service - return localStorage or default
      return prices[service.name] || `₹${service.defaultPrice}`;
    }
  };

  if (!user) return null;

  return (
    <Layout user={user} title="Price Management">
      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <h3 className="mb-0">Price Management</h3>
          <span className="text-muted">Admin Panel</span>
        </div>

        <div className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "calc(100vh - 60px)" }}>
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              {success}
            </div>
          )}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-currency-rupee me-2"></i>
                    Service Pricing Management
                  </h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-4">
                    Update the pricing for government services. Changes will be reflected immediately on the home page.
                  </p>
                  
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Service Name</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Service Fee</th>
                          <th>Consultancy</th>
                          <th>Total Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Legacy Services */}
                        {defaultServices.map((service) => (
                          <tr key={service.id}>
                            <td>
                              <strong>{service.name}</strong>
                            </td>
                            <td>
                              <span className="badge bg-secondary">Legacy</span>
                            </td>
                            <td>
                              <small className="text-muted">{service.description}</small>
                            </td>
                            <td>
                              {editingService === service.id ? (
                                <div className="input-group" style={{ width: "100px" }}>
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(e.target.value)}
                                    min="1"
                                    step="1"
                                  />
                                </div>
                              ) : (
                                <span className="text-muted">₹{(prices[service.name] || service.defaultPrice).replace("₹", "")}</span>
                              )}
                            </td>
                            <td>
                              {editingService === service.id ? (
                                <div className="input-group" style={{ width: "100px" }}>
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={tempConsultancyPrice}
                                    onChange={(e) => setTempConsultancyPrice(e.target.value)}
                                    min="0"
                                    step="1"
                                  />
                                </div>
                              ) : (
                                <span className="text-muted">₹20</span>
                              )}
                            </td>
                            <td>
                              <span className="badge bg-success fs-6">
                                {getCurrentPrice(service)}
                              </span>
                            </td>
                            <td>
                              {editingService === service.id ? (
                                <div className="btn-group btn-group-sm" role="group">
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => savePrice(service)}
                                  >
                                    <i className="bi bi-check"></i>
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={cancelEditing}
                                  >
                                    <i className="bi bi-x"></i>
                                  </button>
                                </div>
                              ) : (
                                <div className="btn-group btn-group-sm" role="group">
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => startEditing(service)}
                                  >
                                    <i className="bi bi-pencil"></i> Edit
                                  </button>
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => resetToDefault(service)}
                                    disabled={getCurrentPrice(service) === `₹${service.defaultPrice}`}
                                  >
                                    <i className="bi bi-arrow-clockwise"></i> Reset
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        
                        {/* Dynamic Services */}
                        {loading ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="mt-2 text-muted">Loading dynamic services...</p>
                            </td>
                          </tr>
                        ) : dynamicServices.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4 text-muted">
                              No dynamic services found. Create services in Service Management.
                            </td>
                          </tr>
                        ) : (
                          dynamicServices.map((service) => (
                            <tr key={service._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <i className={`${service.icon} text-primary me-2`}></i>
                                  <strong>{service.displayName}</strong>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-primary">Dynamic</span>
                              </td>
                              <td>
                                <small className="text-muted">{service.description}</small>
                              </td>
                              <td>
                                {editingService === service._id ? (
                                  <div className="input-group" style={{ width: "100px" }}>
                                    <span className="input-group-text">₹</span>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={tempPrice}
                                      onChange={(e) => setTempPrice(e.target.value)}
                                      min="0"
                                      step="1"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-muted">₹{service.pricing.serviceFee}</span>
                                )}
                              </td>
                              <td>
                                {editingService === service._id ? (
                                  <div className="input-group" style={{ width: "100px" }}>
                                    <span className="input-group-text">₹</span>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={tempConsultancyPrice}
                                      onChange={(e) => setTempConsultancyPrice(e.target.value)}
                                      min="0"
                                      step="1"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-muted">₹{service.pricing.consultancyCharge}</span>
                                )}
                              </td>
                              <td>
                                <span className="badge bg-success fs-6">
                                  {getCurrentPrice(service)}
                                </span>
                              </td>
                              <td>
                                {editingService === service._id ? (
                                  <div className="btn-group btn-group-sm" role="group">
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => savePrice(service)}
                                    >
                                      <i className="bi bi-check"></i>
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={cancelEditing}
                                    >
                                      <i className="bi bi-x"></i>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="btn-group btn-group-sm" role="group">
                                    <button
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => startEditing(service)}
                                    >
                                      <i className="bi bi-pencil"></i> Edit
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="text-primary">
                      <i className="bi bi-info-circle me-2"></i>
                      How it works:
                    </h6>
                    <ul className="mb-0 small text-muted">
                      <li><strong>Legacy Services:</strong> Stored locally, can be reset to defaults</li>
                      <li><strong>Dynamic Services:</strong> Stored in database, changes are permanent</li>
                      <li>Click "Edit" to change the service fee and consultancy charge</li>
                      <li>Enter the new prices and click the checkmark to save</li>
                      <li>Price changes are immediately visible to users on the home page</li>
                      <li>New services added through Service Management will appear here automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}