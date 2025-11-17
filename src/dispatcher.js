/**
 * Event Dispatcher
 * Processes events from main app and triggers notifications
 */

import { getConfig } from './utils.js';
import { getPushSubscription } from './permission.js';

/**
 * Process event from main app
 * Sends event to backend which triggers push notification
 */
export async function processEvent(payload) {
  const { eventName, eventData, notificationConfig } = payload;

  console.log('[NTE] Processing event:', eventName);

  // Get push subscription
  const subscription = await getPushSubscription();
  
  if (!subscription) {
    throw new Error('No push subscription available');
  }

  // Send event to backend
  const result = await sendEventToBackend({
    eventName,
    eventData,
    subscription,
    notificationConfig
  });

  console.log('[NTE] Event processed:', result);

  return result;
}

/**
 * Send event to backend
 * Backend will process and send push notification
 */
async function sendEventToBackend(data) {
  const config = getConfig();

  try {
    const response = await fetch(`${config.backendUrl}/api/push/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        timestamp: Date.now(),
        origin: window.location.origin
      })
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('[NTE] Failed to send event to backend:', error);
    throw error;
  }
}

/**
 * Schedule delayed notification
 */
export async function scheduleNotification(payload) {
  const { delay, eventName, eventData, notificationConfig } = payload;

  console.log(`[NTE] Scheduling notification in ${delay}ms`);

  // Use setTimeout for client-side scheduling
  // For production, this should be handled by backend
  setTimeout(async () => {
    await processEvent({
      eventName,
      eventData,
      notificationConfig
    });
  }, delay);

  return { success: true, scheduled: true, delay };
}
