/**
 * Permission & Push Subscription Management
 * Handles notification permissions and push subscriptions
 */

import { getServiceWorkerRegistration } from './nte.js';
import { getConfig } from './utils.js';

/**
 * Request notification permission from user
 * Only called when main app explicitly requests it
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported in this browser');
  }

  if (Notification.permission === 'granted') {
    console.log('[NTE] Permission already granted');
    return {
      permission: 'granted',
      subscription: await createPushSubscription()
    };
  }

  if (Notification.permission === 'denied') {
    throw new Error('Notification permission denied by user');
  }

  // Request permission
  const permission = await Notification.requestPermission();
  
  console.log('[NTE] Permission result:', permission);

  if (permission === 'granted') {
    const subscription = await createPushSubscription();
    return { permission, subscription };
  }

  return { permission, subscription: null };
}

/**
 * Create push subscription
 */
export async function createPushSubscription() {
  const registration = getServiceWorkerRegistration();
  
  if (!registration) {
    throw new Error('Service Worker not registered');
  }

  try {
    const config = getConfig();
    
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('[NTE] Using existing push subscription');
      return serializeSubscription(subscription);
    }

    // Create new subscription
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey)
    });

    console.log('[NTE] Created new push subscription');

    // Send subscription to backend
    await sendSubscriptionToBackend(subscription);

    return serializeSubscription(subscription);
    
  } catch (error) {
    console.error('[NTE] Failed to create push subscription:', error);
    throw error;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription() {
  const registration = getServiceWorkerRegistration();
  
  if (!registration) {
    return null;
  }

  const subscription = await registration.pushManager.getSubscription();
  
  return subscription ? serializeSubscription(subscription) : null;
}

/**
 * Send subscription to backend
 */
async function sendSubscriptionToBackend(subscription) {
  const config = getConfig();
  
  try {
    const response = await fetch(`${config.backendUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription: serializeSubscription(subscription),
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    console.log('[NTE] Subscription sent to backend');
    
    return await response.json();
  } catch (error) {
    console.error('[NTE] Failed to send subscription to backend:', error);
    // Don't throw - allow app to continue even if backend is unavailable
  }
}

/**
 * Serialize subscription for storage/transmission
 */
function serializeSubscription(subscription) {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth'))
    }
  };
}

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
}
