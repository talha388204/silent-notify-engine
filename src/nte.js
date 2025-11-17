/**
 * NTE Core Engine
 * Handles initialization and service worker registration
 */

import { getConfig, validateOrigin } from './utils.js';

let serviceWorkerRegistration = null;
let isInitialized = false;

/**
 * Initialize the NTE engine
 * Registers service worker and prepares the notification system
 */
export async function initializeNTE() {
  if (isInitialized) {
    console.log('[NTE] Already initialized');
    return;
  }

  // Register service worker for background notifications
  if ('serviceWorker' in navigator) {
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('[NTE] Service Worker registered:', serviceWorkerRegistration.scope);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      isInitialized = true;
      
      // Notify main app that NTE is ready
      notifyMainAppReady();
      
    } catch (error) {
      console.error('[NTE] Service Worker registration failed:', error);
      throw error;
    }
  } else {
    throw new Error('[NTE] Service Workers not supported');
  }
}

/**
 * Notify main app that NTE is ready
 */
function notifyMainAppReady() {
  const config = getConfig();
  
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'NTE_READY',
      timestamp: Date.now()
    }, config.mainAppOrigin);
    
    console.log('[NTE] Sent READY message to main app');
  }
}

/**
 * Get service worker registration
 */
export function getServiceWorkerRegistration() {
  return serviceWorkerRegistration;
}

/**
 * Check if NTE is initialized
 */
export function isNTEReady() {
  return isInitialized;
}
