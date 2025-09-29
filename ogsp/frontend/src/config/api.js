// API Configuration
// This file centralizes the API base URL for easy switching between localhost and remote access

// Dynamic API base URL for mobile compatibility
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    } else {
      return `http://${window.location.hostname}:5000`;
    }
  }
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log the API base URL (can be removed in production)
console.log('API Base URL:', API_BASE_URL);

export { API_BASE_URL };

// Helper function to create full API URLs
export const createApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // Application endpoints
  SUBMIT_APPLICATION: `${API_BASE_URL}/api/application/submit`,
  APPLICATION_DETAILS: `${API_BASE_URL}/api/application/details`,
  APPROVED_APPLICATIONS: `${API_BASE_URL}/api/application/approved`,
  SEND_DOCUMENT: `${API_BASE_URL}/api/application/send-document`,
  
  // Payment endpoints
  PROCESS_PAYMENT: `${API_BASE_URL}/api/payment/process`,
  PAYMENT_HISTORY: `${API_BASE_URL}/api/payment/history`,
  
  // Service endpoints
  SERVICE_DETAILS: (serviceId) => `${API_BASE_URL}/api/service/${serviceId}`,
  GET_ALL_SERVICES_ADMIN: `${API_BASE_URL}/api/service/admin/all`,
  TOGGLE_SERVICE: `${API_BASE_URL}/api/service/admin`,
  DELETE_SERVICE: `${API_BASE_URL}/api/service/admin`,
  UPDATE_SERVICE_PRICING: `${API_BASE_URL}/api/service/admin`,
  
  // Profile endpoints
  UPDATE_PROFILE: `${API_BASE_URL}/api/profile/update`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/profile/change-password`,
  
  // Admin endpoints
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  
  // File uploads
  UPLOADS: `${API_BASE_URL}/uploads`
};

// Optional: Add any helper methods
export const getFileUrl = (filename) => {
  return `${API_BASE_URL}/uploads/${filename}`;
};

export default API_ENDPOINTS;