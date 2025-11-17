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
  mainAppOrigin: 'https://your-main-app-domain.com',
  
  // Backend API URL
  backendUrl: 'https://your-backend-api.com',
  
  // VAPID public key for Web Push
  // Generate using: npx web-push generate-vapid-keys
  vapidPublicKey: 'YOUR_VAPID_PUBLIC_KEY_HERE'
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
