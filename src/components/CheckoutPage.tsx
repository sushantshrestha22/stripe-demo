import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_CONFIG } from '../config/stripe';
import './CheckoutPage.css';

interface EventTicket {
  id: string;
  order: number;
  ticket_category: string;
  ticket_description: string;
  ticket_price: string;
  ticket_highlights: string[];
  maxTicketsPerUser: number;
  totalQuota: number;
  status: string;
  currency: string;
  salesStartDate: string | null;
  salesEndDate: string | null;
}

interface EventData {
  id: string;
  event_name: string;
  event_logo: string;
  event_description: string;
  event_date: string;
  event_location: string;
  tickets: EventTicket[];
}

interface CheckoutFormData {
  ticketId: string;
  email: string;
  buyerName: string;
  buyerPhone: string;
  quantity: number;
  formResponses: Record<string, string>;
}

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const ticketIdFromUrl = searchParams.get('ticketId');
  
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<EventTicket | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    ticketId: '',
    email: '',
    buyerName: '',
    buyerPhone: '',
    quantity: 1,
    formResponses: {},
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch event data from API
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch('https://backend.batotheroad.com/api/events/event/get/active');
        if (!response.ok) throw new Error('Failed to fetch event data');
        const data = await response.json();
        setEventData(data);
        
        // Auto-select ticket from URL if present
        if (ticketIdFromUrl && data.tickets) {
          const ticket = data.tickets.find((t: EventTicket) => t.id === ticketIdFromUrl);
          if (ticket && isTicketAvailable(ticket)) {
            setSelectedTicket(ticket);
            setFormData(prev => ({ ...prev, ticketId: ticket.id }));
          }
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEventData();
  }, [ticketIdFromUrl]);

  const formatPrice = (price: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(parseFloat(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isTicketAvailable = (ticket: EventTicket) => {
    if (ticket.status !== 'active') return false;
    
    const now = new Date();
    if (ticket.salesStartDate && new Date(ticket.salesStartDate) > now) return false;
    if (ticket.salesEndDate && new Date(ticket.salesEndDate) < now) return false;
    
    return true;
  };

  const getTicketStatus = (ticket: EventTicket) => {
    const now = new Date();
    
    if (ticket.status !== 'active') return { status: 'disabled', label: 'Unavailable' };
    if (ticket.salesStartDate && new Date(ticket.salesStartDate) > now) {
      return { status: 'upcoming', label: `Sales start ${formatDate(ticket.salesStartDate)}` };
    }
    if (ticket.salesEndDate && new Date(ticket.salesEndDate) < now) {
      return { status: 'ended', label: 'Sales ended' };
    }
    
    return { status: 'available', label: 'Available' };
  };

  const getAvailableQuantities = (ticket: EventTicket) => {
    const maxAllowed = ticket.maxTicketsPerUser || 5;
    return Array.from({ length: maxAllowed }, (_, i) => i + 1);
  };

  const handleTicketSelect = (ticket: EventTicket) => {
    if (!isTicketAvailable(ticket)) return;
    setSelectedTicket(ticket);
    setFormData(prev => ({ ...prev, ticketId: ticket.id, quantity: 1 }));
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTicket) {
      setError('Please select a ticket type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.checkout}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: formData.ticketId,
          email: formData.email,
          quantity: formData.quantity,
          buyerName: formData.buyerName,
          buyerPhone: formData.buyerPhone,
          formResponses: formData.formResponses,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { checkoutUrl, orderNumber } = await response.json();
      
      sessionStorage.setItem('pendingOrderNumber', orderNumber);
      window.location.href = checkoutUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="checkout-container">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="checkout-container">
        <div className="error-container">
          <h2>Unable to load event</h2>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Event Header */}
      <div className="event-header">
        <div className="event-info">
          <h1>{eventData.event_name}</h1>
          <div className="event-meta">
            <span className="event-date">
              📅 {formatDate(eventData.event_date)}
            </span>
            <span className="event-location">
              📍 {eventData.event_location}
            </span>
          </div>
        </div>
        <div className="test-mode-badge">
          🧪 Test Mode - Use card: 4242 4242 4242 4242
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-dismiss">×</button>
        </div>
      )}

      <div className="checkout-layout">
        {/* Ticket Selection */}
        <div className="ticket-selection">
          <h2>Select Your Ticket</h2>
          <div className="ticket-grid">
            {eventData.tickets
              .sort((a, b) => a.order - b.order)
              .map((ticket) => {
                const ticketStatus = getTicketStatus(ticket);
                const isAvailable = isTicketAvailable(ticket);
                
                return (
                  <div
                    key={ticket.id}
                    className={`ticket-card ${selectedTicket?.id === ticket.id ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                    onClick={() => handleTicketSelect(ticket)}
                  >
                    {ticketStatus.status !== 'available' && (
                      <div className={`ticket-status-badge ${ticketStatus.status}`}>
                        {ticketStatus.label}
                      </div>
                    )}
                    
                    <div className="ticket-category">{ticket.ticket_category}</div>
                    <div className="ticket-price">
                      {formatPrice(ticket.ticket_price, ticket.currency)}
                    </div>
                    
                    <p className="ticket-desc">{ticket.ticket_description}</p>
                    
                    {ticket.ticket_highlights && ticket.ticket_highlights.length > 0 && (
                      <ul className="ticket-highlights">
                        {ticket.ticket_highlights.map((highlight, idx) => (
                          <li key={idx}>
                            <span className="highlight-check">✓</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    <div className="ticket-footer">
                      <span className="max-per-user">
                        Max {ticket.maxTicketsPerUser} per person
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Checkout Form */}
        <div className="checkout-form-section">
          <h2>Your Information</h2>
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label htmlFor="buyerName">Full Name *</label>
              <input
                type="text"
                id="buyerName"
                name="buyerName"
                value={formData.buyerName}
                onChange={handleInputChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="john@example.com"
              />
              <span className="form-hint">Confirmation will be sent to this email</span>
            </div>

            <div className="form-group">
              <label htmlFor="buyerPhone">Phone Number *</label>
              <input
                type="tel"
                id="buyerPhone"
                name="buyerPhone"
                value={formData.buyerPhone}
                onChange={handleInputChange}
                required
                placeholder="+358 40 123 4567"
              />
            </div>

            {selectedTicket && (
              <div className="form-group">
                <label htmlFor="quantity">Number of Tickets *</label>
                <select
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                >
                  {getAvailableQuantities(selectedTicket).map(qty => (
                    <option key={qty} value={qty}>{qty} {qty === 1 ? 'ticket' : 'tickets'}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Order Summary */}
            {selectedTicket && (
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-event">
                  <strong>{eventData.event_name}</strong>
                  <span>{formatDate(eventData.event_date)}</span>
                </div>
                <div className="summary-row">
                  <span>{selectedTicket.ticket_category} × {formData.quantity}</span>
                  <span>{formatPrice((parseFloat(selectedTicket.ticket_price) * formData.quantity).toFixed(2), selectedTicket.currency)}</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>{formatPrice((parseFloat(selectedTicket.ticket_price) * formData.quantity).toFixed(2), selectedTicket.currency)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedTicket}
              className="checkout-submit-button"
            >
              {loading ? (
                <span className="loading-spinner">Processing...</span>
              ) : selectedTicket ? (
                `Pay ${formatPrice((parseFloat(selectedTicket.ticket_price) * formData.quantity).toFixed(2), selectedTicket.currency)}`
              ) : (
                'Select a ticket to continue'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="checkout-footer">
        <p>🔒 Secure checkout powered by Stripe</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
}

export default CheckoutPage;
