// API Configuration
// This file centralizes the API base URL for production deployment

// Get API base URL from environment variable
const getApiBaseUrl = () => {
  // Use environment variable for production
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
  MY_APPLICATIONS: `${API_BASE_URL}/api/application/my-applications`,
  ALL_APPLICATIONS: `${API_BASE_URL}/api/application/all`,
  ALL_APPLICATIONS_DEBUG: `${API_BASE_URL}/api/application/all-debug`,
  UPDATE_APPLICATION_STATUS: `${API_BASE_URL}/api/application/update-status`,
  MY_DOCUMENTS: `${API_BASE_URL}/api/application/my-documents`,
  APPROVED_APPLICATIONS: `${API_BASE_URL}/api/application/approved`,
  SEND_DOCUMENT: `${API_BASE_URL}/api/application/send-document`,
  DELETE_APPLICATION: (applicationId) => `${API_BASE_URL}/api/application/${applicationId}`,
  
  // Payment endpoints
  PROCESS_PAYMENT: `${API_BASE_URL}/api/payment/process`,
  PAYMENT_HISTORY: `${API_BASE_URL}/api/payment/history`,
  ADMIN_PAYMENT_HISTORY: `${API_BASE_URL}/api/payment/admin/history`,
  
  // Service endpoints
  ACTIVE_SERVICES: `${API_BASE_URL}/api/service/active`,
  SERVICE_DETAILS: (serviceId) => `${API_BASE_URL}/api/service/${serviceId}`,
  GET_ALL_SERVICES_ADMIN: `${API_BASE_URL}/api/service/admin/all`,
  TOGGLE_SERVICE: `${API_BASE_URL}/api/service/admin`,
  DELETE_SERVICE: `${API_BASE_URL}/api/service/admin`,
  UPDATE_SERVICE_PRICING: `${API_BASE_URL}/api/service/admin`,
  CREATE_SERVICE: `${API_BASE_URL}/api/service/admin/create`,
  UPDATE_SERVICE: (serviceId) => `${API_BASE_URL}/api/service/admin/${serviceId}`,
  
  // Contact endpoints
  CONTACT_SUBMIT: `${API_BASE_URL}/api/contact/submit`,
  CONTACT_QUERIES: `${API_BASE_URL}/api/contact/queries`,
  UPDATE_CONTACT_QUERY: (queryId) => `${API_BASE_URL}/api/contact/queries/${queryId}`,
  DELETE_CONTACT_QUERY: (queryId) => `${API_BASE_URL}/api/contact/queries/${queryId}`,
  
  // Profile endpoints
  UPDATE_PROFILE: `${API_BASE_URL}/api/profile/update`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/profile/change-password`,
  
  // Admin endpoints
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  UPDATE_USER: (userId) => `${API_BASE_URL}/api/admin/users/${userId}`,
  DELETE_USER: (userId) => `${API_BASE_URL}/api/admin/users/${userId}`,
  
  // File uploads
  UPLOADS: `${API_BASE_URL}/uploads`
};

// Optional: Add any helper methods
export const getFileUrl = (filename) => {
  return `${API_BASE_URL}/uploads/${filename}`;
};

export default API_ENDPOINTS;