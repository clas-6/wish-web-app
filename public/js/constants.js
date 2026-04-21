// ==================== CONFIGURATION CONSTANTS ====================

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  PROD_BASE_URL: 'https://api.your-domain.com/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Application Settings
export const APP_CONFIG = {
  APP_NAME: 'WISH',
  ENV: 'development',
  VERSION: '1.0.0',
};

// Financial Constants
export const FINANCIAL = {
  WEEKLY_LIMIT: 5000, // ₦5,000
  MIN_AMOUNT: 100, // ₦100
  PLATFORM_FEE: 10, // ₦10 flat fee
  CURRENCY: '₦',
};

// Form Validation Rules
export const VALIDATION = {
  NIGERIAN_PHONE_REGEX: /^0[789][01]\d{8}$/,  
  PHONE_LENGTH: 11,
  MESSAGE_MAX_LENGTH: 200,
};

// Network Providers
export const NETWORKS = {
  MTN: 'MTN',
  AIRTEL: 'Airtel',
  GLO: 'Glo',
  NINE_MOBILE: '9mobile',
};

// Wish Types
export const WISH_TYPES = {
  AIRTIME: 'AIRTIME',
  DATA: 'DATA',
};

// Wish Categories
export const WISH_CATEGORIES = {
  KINDNESS: 'KINDNESS',
  CELEBRATION: 'CELEBRATION',
  EASTER: 'EASTER',
  VALENTINE: 'VALENTINE',
  NEW_YEAR: 'NEW YEAR',
};

// Wish Status
export const WISH_STATUS = {
  OPEN: 'OPEN',
  PARTIALLY_FULFILLED: 'PARTIALLY_FULFILLED',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  TOKEN: '/token/',
  REGISTER: '/register/',
  REFRESH: '/token/refresh/',
  
  // Wishes
  WISHES: '/wishes/',
  WISHES_MINE: '/wishes/mine/',
  WISHES_ALLOWANCE: '/wishes/allowance/',
  
  // Payments
  PAYMENTS_INIT: '/payments/initialize/',
  PAYMENTS_VERIFY: '/payments/verify/',
  PAYMENTS_CALLBACK: '/payments/callback/',
};

// Toast Notification Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  INVALID_PHONE: 'Please enter a valid Nigerian phone number (e.g., 08012345678)',
  INVALID_AMOUNT: `Amount must be at least ₦${FINANCIAL.MIN_AMOUNT}`,
  WEEKLY_LIMIT_EXCEEDED: `You have exceeded your weekly limit of ₦${FINANCIAL.WEEKLY_LIMIT}`,
  AUTHENTICATION_REQUIRED: 'Please log in to perform this action',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
  SERVER_ERROR: 'Server error. Our team has been notified.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  WISH_CREATED: 'Wish created successfully! 💛',
  WISH_SHARED: 'Wish shared successfully!',
  PAYMENT_COMPLETED: 'Payment completed! Kindness delivered! 💛',
  ACCOUNT_CREATED: 'Account created! Please log in.',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER_EMAIL: 'user_email',
  THEME: 'theme',
  LAST_REQUEST_TIME: 'last_request_time',
};

// Theme Configuration
export const THEME_CONFIG = {
  DARK: 'dark',
  LIGHT: 'light',
  DEFAULT: 'dark',
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 4000, // milliseconds
  TOAST_POSITION: { top: '80px', right: '16px' },
  LOADING_TEXT: 'Loading...',
  CONFETTI_PARTICLES: 150,
  CONFETTI_SPREAD: 70,
  PULL_THRESHOLD: 80, // Distance in px before refresh triggers
  PULL_RESISTANCE: 0.4, // How "heavy" the pull feels
};

// Date/Time Configuration
export const DATE_CONFIG = {
  LOCALE: 'en-NG',
  DATE_FORMAT: { month: 'short', day: 'numeric', year: 'numeric' },
  SHORT_DATE_FORMAT: { month: 'short', day: 'numeric' },
};

// Occasion Theme Configuration
export const OCCASION_CONFIG = {
  VALENTINE: {
    id: 'valentine',
    start: { month: 2, day: 7 }, // Feb 7
    end: { month: 2, day: 15 }   // Feb 15
  },
  NEW_YEAR: {
    id: 'newyear',
    start: { month: 12, day: 28 }, // Dec 28
    end: { month: 1, day: 5 }      // Jan 5
  }
};

// Feature Flags (for gradual rollout)
export const FEATURES = {
  ENABLE_PARTIAL_AIRTIME_GRANT: true,
  ENABLE_DATA_GRANT: true,
  ENABLE_SHARING: true,
  ENABLE_ANALYTICS: false,
  ENABLE_REFERRAL: false,
};
