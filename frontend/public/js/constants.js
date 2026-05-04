// ==================== CONFIGURATION CONSTANTS ====================

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
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
  ALLOWANCE_WARNING_THRESHOLD: 1000, // ₦1,000
};

// Form Validation Rules
export const VALIDATION = {
  NIGERIAN_PHONE_REGEX: /^0[789][01]\d{8}$/,  
  PHONE_LENGTH: 11,
  MESSAGE_MAX_LENGTH: 200,
};

// Password Strength Configuration
export const PASSWORD_STRENGTH = {
  LEVELS: [
    { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', width: '25%' },
    { label: 'Fair', color: 'bg-orange-500', text: 'text-orange-500', width: '50%' },
    { label: 'Good', color: 'bg-yellow-500', text: 'text-yellow-500', width: '75%' },
    { label: 'Strong', color: 'bg-green-500', text: 'text-green-500', width: '100%' }
  ]
};

// Network Providers
export const NETWORKS = {
  MTN: 'MTN',
  AIRTEL: 'Airtel',
  GLO: 'Glo',
  NINE_MOBILE: '9mobile',
};

// Network Prefixes for auto-detection
export const NETWORK_PREFIXES = {
  MTN: ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906', '0704', '07025', '07026', '07027', '0708', '0913', '0916'],
  AIRTEL: ['0802', '0808', '0701', '0708', '0812', '0902', '0901', '0904', '0907', '0912', '0701'],
  GLO: ['0805', '0807', '0705', '0811', '0815', '0905'],
  NINE_MOBILE: ['0809', '0817', '0818', '0909', '0908'], // Formerly Etisalat
};

// Map for easier lookup (e.g., '9mobile' -> '9MOBILE')
export const NETWORK_NAME_MAP = {
  '9mobile': '9MOBILE',
  'Airtel': 'AIRTEL',
  'Glo': 'GLO',
  'MTN': 'MTN',
};

// Wish Types
export const WISH_TYPES = {
  AIRTIME: 'AIRTIME',
  DATA: 'DATA',
};

// Data Plans
export const DATA_PLANS = {
  MTN: [
    {
      plan: '1GB', type: 'SHARE', service_id: 240,
      amount_user: 450, amount_reseller: 440, amount_api: 420, validity: '7 Days'
    },
    {
      plan: '5GB', type: 'SHARE', service_id: 101,
      amount_user: 1850, amount_reseller: 1830, amount_api: 1790, validity: '30 Days'
    },
    {
      plan: '3GB', type: 'SHARE', service_id: 100,
      amount_user: 1450, amount_reseller: 1420, amount_api: 1370, validity: '30 Days'
    },
    {
      plan: '2GB', type: 'SHARE', service_id: 99,
      amount_user: 980, amount_reseller: 970, amount_api: 950, validity: '30 Days'
    },
    {
      plan: '500MB', type: 'SHARE', service_id: 97,
      amount_user: 330, amount_reseller: 320, amount_api: 300, validity: '7 Days'
    },
    {
      plan: '2GB', type: 'SHARE', service_id: 265,
      amount_user: 870, amount_reseller: 860, amount_api: 840, validity: '7 Days'
    }
  ],
  AIRTEL: [
    {
      plan: '1GB', type: 'DIRECT', service_id: 331,
      amount_user: 789, amount_reseller: 787, amount_api: 784, validity: '7 Days'
    },
    {
      plan: '3GB', type: 'DIRECT', service_id: 341,
      amount_user: 986, amount_reseller: 985, amount_api: 980, validity: '2 Days'
    },
    {
      plan: '3GB', type: 'AWOOF', service_id: 320,
      amount_user: 1050, amount_reseller: 1040, amount_api: 1030, validity: '2 Days'
    },
    {
      plan: '3.5 GB', type: 'DIRECT', service_id: 310,
      amount_user: 1479, amount_reseller: 1476, amount_api: 1470, validity: '7 Days'
    }
  ],
  GLO: [
    {
      plan: '1GB', type: 'CG', service_id: 409,
      amount_user: 285, amount_reseller: 283, amount_api: 280, validity: '3 Days'
    },
    {
      plan: '3GB', type: 'CG', service_id: 410,
      amount_user: 850, amount_reseller: 845, amount_api: 835, validity: '3 Days'
    },
    {
      plan: '5GB', type: 'CG', service_id: 411,
      amount_user: 1425, amount_reseller: 1410, amount_api: 1395, validity: '3 Days'
    },
    {
      plan: '1GB', type: 'CG', service_id: 412,
      amount_user: 340, amount_reseller: 335, amount_api: 330, validity: '7 Days'
    },
    {
      plan: '3GB', type: 'CG', service_id: 413,
      amount_user: 1020, amount_reseller: 1000, amount_api: 980, validity: '7 Days'
    }
  ],
  "9MOBILE": [
    {
      plan: '500MB', type: 'CG', service_id: 68,
      amount_user: 260, amount_reseller: 257, amount_api: 255, validity: '30 Days'
    },
    {
      plan: '1GB', type: 'CG', service_id: 69,
      amount_user: 500, amount_reseller: 495, amount_api: 490, validity: '30 Days'
    },
    {
      plan: '2GB', type: 'CG', service_id: 71,
      amount_user: 1000, amount_reseller: 990, amount_api: 980, validity: '30 Days'
    }
  ]
};

// Data Plan Display Keys (for easier access in wishes.js)
export const DATA_PLAN_KEYS = {
  PLAN: 'plan',
  AMOUNT_USER: 'amount_user',
  VALIDITY: 'validity',
  SERVICE_ID: 'service_id',
  AMOUNT_API: 'amount_api',
};

// Wish Categories (cleaned up to remove data sub-categories)
export const WISH_CATEGORIES = {
  KINDNESS: 'KINDNESS',
  URGENT: 'URGENT',
  CELEBRATION: 'CELEBRATION',
  EASTER: 'EASTER',
  VALENTINE: 'VALENTINE',
  NEW_YEAR: 'NEW_YEAR',
};


// Wish Status
export const WISH_STATUS = {
  OPEN: 'OPEN',
  PARTIALLY_FULFILLED: 'PARTIALLY_FULFILLED',
  FULFILLED: 'FULFILLED',
  PROCESSING: 'PROCESSING',
  CANCELLED: 'CANCELLED',
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  TOKEN: '/users/token',      // FastAPI common pattern
  REGISTER: '/users/register',
  REFRESH: '/users/refresh',
  
  // Wishes
  WISHES: '/wishes',
  WISHES_MINE: '/wishes/mine',
  WISHES_ALLOWANCE: '/wishes/allowance',
  EVENTS: '/events',
  TRANSACTIONS_RECEIVED: '/transactions/received',
  
  // Payments
  PAYMENTS_INIT: '/grants/initialize',
  PAYMENTS_VERIFY: '/grants/verify',
  PAYMENTS_CALLBACK: '/grants/callback',
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
  PASSWORD_MISMATCH: 'Passwords do not match.',
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
  USER_ID: 'user_id',
  USER_EMAIL: 'user_email',
  THEME: 'theme',
  LAST_REQUEST_TIME: 'last_request_time',
};

// Theme Configuration
export const THEME_CONFIG = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system',
  DEFAULT: 'light',
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 4000, // milliseconds
  TOAST_POSITION: { top: '80px', right: '16px' },
  LOADING_TEXT: 'Loading...',
  MOBILE_MENU_CLOSED_CLASS: 'mobile-dropdown-closed',
  MOBILE_MENU_OPEN_CLASS: 'mobile-dropdown-open',
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
    end: { month: 2, day: 15 },   // Feb 15
    visualTheme: true
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
