import React, { useState, useEffect } from "react";

const SuccessToast = ({ message, details, show, onClose, autoHide = true }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (autoHide) {
        const timer = setTimeout(() => {
          handleClose();
        }, 5000); // Auto hide after 5 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [show, autoHide]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300); // Wait for animation to complete
  };

  if (!show && !isVisible) return null;

  return (
    <div
      className={`position-fixed top-0 end-0 p-3`}
      style={{ zIndex: 1055 }}
    >
      <div
        className={`toast ${isVisible ? 'show' : ''} border-0 shadow-lg`}
        role="alert"
        style={{
          minWidth: '350px',
          backgroundColor: '#d1e7dd',
          borderLeft: '4px solid #198754'
        }}
      >
        <div className="toast-header border-0 bg-transparent">
          <div className="bg-success rounded-circle me-2 d-flex align-items-center justify-content-center"
               style={{ width: '20px', height: '20px' }}>
            <i className="bi bi-check text-white" style={{ fontSize: '12px' }}></i>
          </div>
          <strong className="me-auto text-success">Payment Successful</strong>
          <small className="text-muted">Just now</small>
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
          ></button>
        </div>
        <div className="toast-body text-success">
          <div className="fw-semibold mb-1">{message}</div>
          {details && (
            <div className="small text-muted">
              {details.transactionId && (
                <div>Transaction ID: {details.transactionId}</div>
              )}
              {details.amount && (
                <div>Amount: ₹{details.amount}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessToast;