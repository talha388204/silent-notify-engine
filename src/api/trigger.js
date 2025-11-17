/**
 * Backend API: Trigger
 * Sends events to backend which triggers push notifications
 * 
 * This is a CLIENT-SIDE example showing how to call your backend
 * Your actual backend should use Web Push to send notifications
 */

/**
 * Example backend endpoint implementation (Node.js/Express)
 * 
 * const webpush = require('web-push');
 * 
 * app.post('/api/push/trigger', async (req, res) => {
 *   const { eventName, eventData, subscription, notificationConfig } = req.body;
 *   
 *   try {
 *     // Prepare notification payload
 *     const payload = JSON.stringify({
 *       title: notificationConfig.title || 'New Notification',
 *       body: notificationConfig.body || 'You have a new update',
 *       icon: notificationConfig.icon || '/icon.png',
 *       data: {
 *         eventName,
 *         eventData,
 *         url: notificationConfig.url || '/'
 *       }
 *     });
 *     
 *     // Send push notification
 *     await webpush.sendNotification(subscription, payload);
 *     
 *     res.json({ success: true, message: 'Notification sent' });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 */

export async function triggerNotification(eventName, eventData, subscription, notificationConfig, backendUrl) {
  const response = await fetch(`${backendUrl}/api/push/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      eventName,
      eventData,
      subscription,
      notificationConfig,
      timestamp: Date.now()
    })
  });

  if (!response.ok) {
    throw new Error(`Trigger failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Send immediate push notification
 */
export async function sendPushNotification(subscription, notification, backendUrl) {
  const response = await fetch(`${backendUrl}/api/push/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge,
        data: notification.data,
        tag: notification.tag,
        requireInteraction: notification.requireInteraction
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Push send failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Schedule future notification
 */
export async function scheduleNotification(subscription, notification, scheduleTime, backendUrl) {
  const response = await fetch(`${backendUrl}/api/push/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription,
      notification,
      scheduleTime: scheduleTime.toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Schedule failed: ${response.status}`);
  }

  return await response.json();
}
