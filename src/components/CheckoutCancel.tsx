import { Link, useSearchParams } from 'react-router-dom';
import './CheckoutResult.css';

export function CheckoutCancel() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  const getReasonMessage = () => {
    switch (reason) {
      case 'expired':
        return 'Your payment session has expired. Please try again.';
      case 'declined':
        return 'Your payment was declined. Please try a different payment method.';
      default:
        return 'Your payment was not completed. No charges were made to your account.';
    }
  };

  return (
    <div className="result-container">
      <div className="result-card cancel">
        {/* Cancel Icon */}
        <div className="cancel-animation">
          <div className="cancel-circle">
            <svg className="cancel-x" viewBox="0 0 52 52">
              <circle className="cancel-circle-bg" cx="26" cy="26" r="25" fill="none"/>
              <path className="cancel-x-path" fill="none" d="M16 16 36 36 M36 16 16 36"/>
            </svg>
          </div>
        </div>

        <h1>Payment Not Completed</h1>
        <p className="result-message">{getReasonMessage()}</p>

        {/* Status Banner */}
        <div className="status-banner info">
          <span className="banner-icon">ℹ️</span>
          <span>Don't worry! Your cart is still saved. You can try again anytime.</span>
        </div>

        {/* Common Reasons */}
        <div className="reasons-section">
          <h3>What might have happened?</h3>
          <div className="reasons-grid">
            <div className="reason-card">
              <span className="reason-icon">🚫</span>
              <span className="reason-text">Payment was cancelled</span>
            </div>
            <div className="reason-card">
              <span className="reason-icon">⏱️</span>
              <span className="reason-text">Session timed out</span>
            </div>
            <div className="reason-card">
              <span className="reason-icon">💳</span>
              <span className="reason-text">Card was declined</span>
            </div>
            <div className="reason-card">
              <span className="reason-icon">🌐</span>
              <span className="reason-text">Connection issue</span>
            </div>
          </div>
        </div>

        {/* Help Tips */}
        <div className="help-tips">
          <h3>💡 Tips for a successful payment</h3>
          <ul>
            <li>
              <span className="tip-check">✓</span>
              Ensure your card details are entered correctly
            </li>
            <li>
              <span className="tip-check">✓</span>
              Check if your card has sufficient funds
            </li>
            <li>
              <span className="tip-check">✓</span>
              Try a different payment method if issues persist
            </li>
            <li>
              <span className="tip-check">✓</span>
              Disable any ad blockers that might interfere
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          <Link to="/checkout" className="btn primary">
            <span className="btn-icon">🔄</span>
            Try Again
          </Link>
          <Link to="/" className="btn secondary">
            <span className="btn-icon">🏠</span>
            Return Home
          </Link>
        </div>

        {/* Support Section */}
        <div className="support-section">
          <p>Still having trouble?</p>
          <div className="support-options">
            <a href="mailto:support@batotheroad.com" className="support-link">
              <span>📧</span> Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutCancel;
