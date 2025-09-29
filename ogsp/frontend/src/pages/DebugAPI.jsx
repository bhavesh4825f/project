import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DebugAPI = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  const addResult = (test, status, message, details = null) => {
    const result = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [...prev, result]);
  };

  const testEndpoint = async (name, url, timeout = 10000) => {
    try {
      addResult(name, 'testing', `Testing ${url}...`);
      const response = await axios.get(url, { timeout });
      addResult(name, 'success', `✅ ${name} - Success`, {
        status: response.status,
        data: response.data
      });
      return true;
    } catch (error) {
      addResult(name, 'error', `❌ ${name} - Failed`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      return false;
    }
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Environment info
    addResult('Environment', 'info', `Environment: ${process.env.NODE_ENV}`);
    addResult('API Base URL', 'info', `API Base URL: ${API_BASE_URL}`);
    addResult('Current Domain', 'info', `Current Domain: ${window.location.origin}`);

    // Test endpoints
    await testEndpoint('Backend Root', API_BASE_URL);
    await testEndpoint('Health Check', `${API_BASE_URL}/api/health`);
    await testEndpoint('Database Test', `${API_BASE_URL}/api/db-test`);
    await testEndpoint('Services Endpoint', `${API_BASE_URL}/api/service/active`);
    await testEndpoint('Auth Login', `${API_BASE_URL}/api/auth/login`);
    
    setLoading(false);
  };

  const initializeDatabase = async () => {
    try {
      addResult('Init Database', 'testing', 'Initializing complete database with admin user and services...');
      const response = await axios.get(`${API_BASE_URL}/api/init-database`);
      addResult('Init Database', 'success', '✅ Database initialized successfully', response.data);
      
      // Re-test all endpoints
      await testEndpoint('Services After Init', `${API_BASE_URL}/api/service/active`);
      await testEndpoint('Database After Init', `${API_BASE_URL}/api/db-test`);
    } catch (error) {
      addResult('Init Database', 'error', '❌ Failed to initialize database', {
        message: error.message,
        response: error.response?.data
      });
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3>API Debug Console</h3>
              <div>
                <button 
                  className="btn btn-success me-2"
                  onClick={initializeDatabase}
                  disabled={loading}
                >
                  🗄️ Initialize Database
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={runTests}
                  disabled={loading}
                >
                  {loading ? 'Testing...' : 'Run Tests'}
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <strong>🎯 Complete Setup Guide:</strong>
                <ol>
                  <li><strong>Set up MongoDB Atlas</strong> (free tier) and get connection string</li>
                  <li><strong>Add MONGO_URI</strong> to your Render backend environment variables</li>
                  <li><strong>Deploy backend</strong> with the MongoDB connection</li>
                  <li><strong>Click "Initialize Database"</strong> to create admin user and services</li>
                  <li><strong>Test login</strong> with admin@ogsp.gov.in / admin123</li>
                </ol>
                <strong>This will create:</strong> Admin user, Default services (PAN, Income, Birth, Caste certificates)
              </div>
              
              {results.map((result, index) => (
                <div key={index} className={`alert ${
                  result.status === 'success' ? 'alert-success' : 
                  result.status === 'error' ? 'alert-danger' : 
                  result.status === 'testing' ? 'alert-warning' : 'alert-info'
                } mb-2`}>
                  <div className="d-flex justify-content-between">
                    <strong>{result.test}</strong>
                    <small>{result.timestamp}</small>
                  </div>
                  <div>{result.message}</div>
                  {result.details && (
                    <details className="mt-2">
                      <summary>Details</summary>
                      <pre className="mt-2 small">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}

              {results.length === 0 && !loading && (
                <div className="text-center text-muted">
                  Click "Run Tests" to start debugging
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAPI;