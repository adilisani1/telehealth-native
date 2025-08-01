/**
 * Stripe Configuration Constants
 * Production-level configuration for Stripe integration
 */

// Stripe Test Keys (Replace with production keys for live environment)
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_51MTM9REHiZKfEP69NWDg7k86uCfuLj7iSZpNj9gLlEALMwImrRX1Hgu00xuL2pRCyuDOULI76BavITsWvWcUw9Cy00736ciHby',
  MERCHANT_IDENTIFIER: 'merchant.com.telehealth.app',
  URL_SCHEME: 'telehealth-app',
  CURRENCY: 'usd',
  COUNTRY: 'US',
};

// Stripe Test Cards for Testing
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  EXPIRED: '4000000000000069',
  INSUFFICIENT_FUNDS: '4000000000009995',
  INCORRECT_CVC: '4000000000000127',
  PROCESSING_ERROR: '4000000000000119',
};

// Payment Method Types
export const PAYMENT_METHODS = {
  CARD: 'Card',
  APPLE_PAY: 'ApplePay',
  GOOGLE_PAY: 'GooglePay',
};

// Error Messages
export const STRIPE_ERRORS = {
  NOT_INITIALIZED: 'Stripe is not properly initialized. Please restart the app and try again.',
  PAYMENT_FAILED: 'Payment could not be processed. Please try again.',
  CARD_DECLINED: 'Your card was declined. Please try a different payment method.',
  EXPIRED_CARD: 'Your card has expired. Please use a different card.',
  INSUFFICIENT_FUNDS: 'Your card has insufficient funds. Please use a different payment method.',
  INCORRECT_CVC: 'The CVC code is incorrect. Please check and try again.',
  PROCESSING_ERROR: 'An error occurred while processing your payment. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Payment Intent Status
export const PAYMENT_STATUS = {
  REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
  REQUIRES_CONFIRMATION: 'requires_confirmation',
  REQUIRES_ACTION: 'requires_action',
  PROCESSING: 'processing',
  REQUIRES_CAPTURE: 'requires_capture',
  CANCELED: 'canceled',
  SUCCEEDED: 'succeeded',
};

// Stripe Provider Configuration
export const STRIPE_PROVIDER_CONFIG = {
  publishableKey: STRIPE_CONFIG.PUBLISHABLE_KEY,
  merchantIdentifier: STRIPE_CONFIG.MERCHANT_IDENTIFIER,
  urlScheme: STRIPE_CONFIG.URL_SCHEME,
  setUrlSchemeOnAndroid: true,
};
