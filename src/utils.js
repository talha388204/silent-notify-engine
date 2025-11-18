/**
 * Utility Functions
 * Helper functions for NTE app
 */

/**
 * Configuration
 * Update these values based on your deployment
 */
const config = {
  // Main app origin (must match exactly)
  // Production: আপনার main app এর domain
  // Localhost: আপনার main app যে port এ run করছে
  mainAppOrigin: window.location.origin === 'http://localhost:5174' 
    ? 'http://localhost:5173'  // Localhost testing
    : 'https://al-quran-22267.vercel.app',  // Production main app
  
  // Backend API URL - Using Lovable Cloud edge functions
  backendUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`,
  
  // VAPID public key for Web Push
  vapidPublicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
};

/**
 * Get configuration
 */
export function getConfig() {
  return config;
}

/**
 * Update configuration at runtime
 */
export function updateConfig(updates) {
  Object.assign(config, updates);
  console.log('[NTE] Config updated:', config);
}

/**
 * Validate message origin for security
 * Prevents unauthorized apps from communicating with NTE
 */
export function validateOrigin(messageOrigin, allowedOrigin) {
  // In development, allow localhost
  if (messageOrigin.includes('localhost') || messageOrigin.includes('127.0.0.1')) {
    return true;
  }
  
  return messageOrigin === allowedOrigin;
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log with timestamp
 */
export function log(message, ...args) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, ...args);
}

/**
 * Check if running in iframe
 */
export function isInIframe() {
  return window.self !== window.top;
}

/**
 * Check browser notification support
 */
export function isNotificationSupported() {
  return 'Notification' in window;
}

/**
 * Check service worker support
 */
export function isServiceWorkerSupported() {
  return 'serviceWorker' in navigator;
}

/**
 * Get notification permission status
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  
  return Notification.permission;
}

/**
 * Format error for transmission
 */
export function formatError(error) {
  return {
    message: error.message,
    stack: error.stack,
    timestamp: Date.now()
  };
}
