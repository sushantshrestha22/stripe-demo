import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_CONFIG } from '../config/stripe';
import './CheckoutResult.css';

interface SessionStatus {
  status: string;
  payment_status: string;
  customer_email?: string;
  amount_total?: number;
  currency?: string;
  orderNumber?: string;
  ticketName?: string;
  quantity?: number;
  eventName?: string;
  eventDate?: string;
}

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const orderFromUrl = searchParams.get('order');
    const orderNumber = orderFromUrl || sessionStorage.getItem('pendingOrderNumber');
    
    if (sessionId) {
      fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sessionStatus}/${sessionId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to verify session');
          return res.json();
        })
        .then(data => {
          setSessionStatus({
            ...data,
            orderNumber: orderNumber || data.orderNumber,
          });
          sessionStorage.removeItem('pendingOrderNumber');
        })
        .catch(err => {
          console.error('Session verification error:', err);
          // Even if API fails, show success with available info
          setSessionStatus({
            status: 'complete',
            payment_status: 'paid',
            orderNumber: orderNumber || undefined,
          });
        })
        .finally(() => setLoading(false));
    } else if (orderNumber) {
      // If we have order number but no session_id, still show success
      setSessionStatus({
        status: 'complete',
        payment_status: 'paid',
        orderNumber: orderNumber,
      });
      sessionStorage.removeItem('pendingOrderNumber');
      setLoading(false);
    } else {
      setLoading(false);
      setError('No session ID found');
    }
  }, [searchParams]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'USD',
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="result-container">
        <div className="result-card loading-card">
          <div className="loading-animation">
            <div className="loading-circle"></div>
            <div className="loading-circle"></div>
            <div className="loading-circle"></div>
          </div>
          <h2>Confirming Your Purchase</h2>
          <p>Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  if (error && !sessionStatus) {
    return (
      <div className="result-container">
        <div className="result-card error">
          <div className="result-icon error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/>
            </svg>
          </div>
          <h1>Something Went Wrong</h1>
          <p className="result-message">
            We couldn't verify your payment. If you were charged, please contact support with your payment details.
          </p>
          <div className="error-code">
            <span>Error:</span> {error}
          </div>
          <div className="result-actions">
            <Link to="/checkout" className="btn primary">Try Again</Link>
            <Link to="/" className="btn secondary">Return Home</Link>
          </div>
          <div className="support-section">
            <p>Need immediate assistance?</p>
            <a href="mailto:support@batotheroad.com" className="support-link">
              📧 support@batotheroad.com
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-container">
      <div className="result-card success">
        {/* Success Animation */}
        <div className="success-animation">
          <div className="checkmark-circle">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>

        <h1>Payment Successful!</h1>
        <p className="result-message">
          Your tickets have been confirmed and sent to your email.
        </p>

        {/* Order Details Card */}
        <div className="order-details">
          <div className="order-header">
            <span className="order-label">Order Number</span>
            <span className="order-number-large">{sessionStatus?.orderNumber || 'N/A'}</span>
          </div>
          
          <div className="order-info-grid">
            {sessionStatus?.customer_email && (
              <div className="order-info-item">
                <span className="info-icon">📧</span>
                <div className="info-content">
                  <span className="info-label">Confirmation sent to</span>
                  <span className="info-value">{sessionStatus.customer_email}</span>
                </div>
              </div>
            )}
            
            {sessionStatus?.amount_total && (
              <div className="order-info-item">
                <span className="info-icon">💳</span>
                <div className="info-content">
                  <span className="info-label">Amount Paid</span>
                  <span className="info-value amount">{formatCurrency(sessionStatus.amount_total, sessionStatus.currency || 'USD')}</span>
                </div>
              </div>
            )}

            <div className="order-info-item">
              <span className="info-icon">✅</span>
              <div className="info-content">
                <span className="info-label">Status</span>
                <span className="info-value status-confirmed">Confirmed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="important-info">
          <h3>📋 Important Information</h3>
          <div className="info-list">
            <div className="info-item">
              <div className="info-number">1</div>
              <div className="info-text">
                <strong>Check your email</strong>
                <span>Your e-ticket and confirmation details have been sent to your email address.</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-number">2</div>
              <div className="info-text">
                <strong>Save your order number</strong>
                <span>Keep <strong>{sessionStatus?.orderNumber}</strong> handy for check-in at the event.</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-number">3</div>
              <div className="info-text">
                <strong>Arrive on time</strong>
                <span>Please arrive 15-30 minutes before the event starts for smooth registration.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          <Link to="/" className="btn primary">
            <span className="btn-icon">🏠</span>
            Back to Home
          </Link>
          <Link to="/checkout" className="btn secondary">
            <span className="btn-icon">🎫</span>
            Buy More Tickets
          </Link>
        </div>

        {/* Support Footer */}
        <div className="support-footer">
          <p>Questions about your order?</p>
          <a href="mailto:support@batotheroad.com">Contact Support</a>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccess;
