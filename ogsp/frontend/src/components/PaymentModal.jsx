import React, { useState } from 'react';

const PaymentModal = ({ show, onHide, application, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call success callback
      if (onPaymentSuccess) {
        onPaymentSuccess(application.id);
      }
      
      alert('Payment successful!');
      onHide();
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Payment Details</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            {application && (
              <div>
                <h6>Application: {application.serviceName}</h6>
                <p><strong>Fee:</strong> ₹{application.fee || 500}</p>
                <p><strong>Application ID:</strong> {application.id}</p>
                
                <div className="mt-3">
                  <label className="form-label">Payment Method</label>
                  <select 
                    className="form-select" 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="online">Online Payment</option>
                    <option value="upi">UPI Payment</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
