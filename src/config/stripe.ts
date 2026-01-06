// API Configuration
// Update API_BASE_URL to point to your backend

export const API_CONFIG = {
  // Backend API base URL
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // API endpoints
  endpoints: {
    checkout: '/api/payments/checkout',
    sessionStatus: '/api/payments/session', // + /:sessionId
    verify: '/api/payments/verify',
    ticketAvailability: '/api/payments/tickets', // + /:ticketId/availability
    myTickets: '/api/payments/my-tickets',
  },
} as const;

// Stripe Configuration (for client-side if needed)
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_TEST_KEY_HERE',
} as const;

// Test card numbers for Stripe test mode:
// Success: 4242 4242 4242 4242
// Decline: 4000 0000 0000 0002
// Requires authentication: 4000 0025 0000 3155
// CVV: Any 3 digits, Expiry: Any future date
