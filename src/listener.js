/**
 * Message Listener
 * Listens for commands from main app via postMessage
 * Validates origin and processes commands securely
 */

import { validateOrigin, getConfig } from './utils.js';
import { requestNotificationPermission, getPushSubscription } from './permission.js';
import { processEvent } from './dispatcher.js';

/**
 * Start listening for messages from main app
 */
export function startMessageListener() {
  window.addEventListener('message', handleMessage, false);
  console.log('[NTE] Message listener started');
}

/**
 * Handle incoming messages from main app
 */
async function handleMessage(event) {
  const config = getConfig();
  
  // Validate origin for security
  if (!validateOrigin(event.origin, config.mainAppOrigin)) {
    console.warn('[NTE] Rejected message from unauthorized origin:', event.origin);
    return;
  }

  const { type, payload } = event.data;
  
  console.log('[NTE] Received message:', type);

  try {
    let response;

    switch (type) {
      case 'REQUEST_PERMISSION':
        response = await requestNotificationPermission();
        sendResponse(event.origin, 'PERMISSION_RESPONSE', response);
        break;

      case 'GET_SUBSCRIPTION':
        response = await getPushSubscription();
        sendResponse(event.origin, 'SUBSCRIPTION_RESPONSE', response);
        break;

      case 'TRIGGER_EVENT':
        response = await processEvent(payload);
        sendResponse(event.origin, 'EVENT_RESPONSE', response);
        break;

      case 'SEND_FOREGROUND_NOTIFICATION':
        response = await sendForegroundNotification(payload);
        sendResponse(event.origin, 'NOTIFICATION_RESPONSE', response);
        break;

      case 'PING':
        sendResponse(event.origin, 'PONG', { timestamp: Date.now() });
        break;

      default:
        console.warn('[NTE] Unknown message type:', type);
        sendResponse(event.origin, 'ERROR', { error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('[NTE] Error handling message:', error);
    sendResponse(event.origin, 'ERROR', { error: error.message });
  }
}

/**
 * Send response back to main app
 */
function sendResponse(origin, type, data) {
  if (window.parent !== window) {
    window.parent.postMessage({
      type,
      data,
      timestamp: Date.now()
    }, origin);
  }
}

/**
 * Send foreground notification (when app is open)
 */
async function sendForegroundNotification(payload) {
  const { title, body, icon, badge, tag, data } = payload;

  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  // Create foreground notification
  const notification = new Notification(title, {
    body,
    icon: icon || '/favicon.ico',
    badge: badge || '/favicon.ico',
    tag: tag || 'nte-notification',
    data,
    requireInteraction: false,
    silent: false
  });

  notification.onclick = () => {
    console.log('[NTE] Notification clicked');
    notification.close();
    
    // Notify main app of click
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'NOTIFICATION_CLICKED',
        data: data
      }, getConfig().mainAppOrigin);
    }
  };

  return { success: true, type: 'foreground' };
}
