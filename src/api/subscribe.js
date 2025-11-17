/**
 * Backend API: Subscribe
 * Sends push subscription to backend for storage
 * 
 * This is a CLIENT-SIDE example showing how to call your backend
 * Your actual backend should store subscriptions in a database
 */

/**
 * Example backend endpoint implementation (Node.js/Express)
 * 
 * app.post('/api/push/subscribe', async (req, res) => {
 *   const { subscription, userAgent, timestamp } = req.body;
 *   
 *   try {
 *     // Store subscription in database
 *     await db.subscriptions.create({
 *       endpoint: subscription.endpoint,
 *       keys: subscription.keys,
 *       userAgent,
 *       createdAt: new Date(timestamp)
 *     });
 *     
 *     res.json({ success: true, message: 'Subscription saved' });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 */

export async function subscribeToBackend(subscription, backendUrl) {
  const response = await fetch(`${backendUrl}/api/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    })
  });

  if (!response.ok) {
    throw new Error(`Subscription failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Unsubscribe from backend
 */
export async function unsubscribeFromBackend(subscription, backendUrl) {
  const response = await fetch(`${backendUrl}/api/push/unsubscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint
    })
  });

  if (!response.ok) {
    throw new Error(`Unsubscription failed: ${response.status}`);
  }

  return await response.json();
}
