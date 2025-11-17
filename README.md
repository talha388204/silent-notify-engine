# Notification Trigger Engine (NTE)

A completely invisible PWA that handles all notification logic for your main app.

## 🎯 What is NTE?

NTE is a **separate, invisible background app** that:
- Runs silently without any UI
- Handles notification permissions
- Manages push subscriptions
- Processes events from your main app
- Sends foreground notifications (app open)
- Sends background notifications (app closed)

## 🔌 How to Use NTE in Your Main App

### 1. Load NTE via Hidden Iframe

```html
<iframe 
  id="nte-iframe"
  src="https://your-nte-domain.com" 
  style="display:none"
></iframe>
```

### 2. Communicate with NTE

```javascript
const nteOrigin = 'https://your-nte-domain.com';
const nteIframe = document.getElementById('nte-iframe').contentWindow;

// Wait for NTE to be ready
window.addEventListener('message', (event) => {
  if (event.origin !== nteOrigin) return;
  
  if (event.data.type === 'NTE_READY') {
    console.log('NTE is ready!');
    requestNotificationPermission();
  }
});

// Request notification permission
function requestNotificationPermission() {
  nteIframe.postMessage({
    type: 'REQUEST_PERMISSION'
  }, nteOrigin);
}

// Listen for permission response
window.addEventListener('message', (event) => {
  if (event.origin !== nteOrigin) return;
  
  if (event.data.type === 'PERMISSION_RESPONSE') {
    const { permission, subscription } = event.data.data;
    console.log('Permission:', permission);
    console.log('Subscription:', subscription);
  }
});
```

### 3. Trigger Events

```javascript
// Trigger a notification event
function triggerNotification(eventName, eventData) {
  nteIframe.postMessage({
    type: 'TRIGGER_EVENT',
    payload: {
      eventName: eventName,
      eventData: eventData,
      notificationConfig: {
        title: 'Daily Hadith',
        body: 'Recite this beautiful hadith today!',
        icon: '/icon.png',
        tag: 'daily-hadith'
      }
    }
  }, nteOrigin);
}

// Example: Trigger from mini-app
triggerNotification('DAILY_HADITH', {
  hadithId: '123',
  hadithText: 'Be kind to others...'
});
```

### 4. Send Foreground Notifications

```javascript
// Send notification while app is open
function sendForegroundNotification() {
  nteIframe.postMessage({
    type: 'SEND_FOREGROUND_NOTIFICATION',
    payload: {
      title: 'Prayer Time',
      body: 'It\'s time for Fajr prayer',
      icon: '/prayer-icon.png',
      tag: 'prayer-reminder',
      data: {
        prayerName: 'Fajr',
        timestamp: Date.now()
      }
    }
  }, nteOrigin);
}
```

## 🔧 Configuration

Update `src/utils.js` with your values:

```javascript
const config = {
  // Your main app origin (must match exactly)
  mainAppOrigin: 'https://your-main-app-domain.com',
  
  // Your backend API URL
  backendUrl: 'https://your-backend-api.com',
  
  // VAPID public key for Web Push
  vapidPublicKey: 'YOUR_VAPID_PUBLIC_KEY_HERE'
};
```

### Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

## 🌐 Backend Setup

NTE requires a backend to handle push notifications. See `src/api/` for examples.

### Backend Endpoints Needed

1. `POST /api/push/subscribe` - Save push subscriptions
2. `POST /api/push/trigger` - Trigger push notifications
3. `POST /api/push/send` - Send immediate notifications
4. `POST /api/push/schedule` - Schedule future notifications

### Example Backend (Node.js + Express)

```javascript
const express = require('express');
const webpush = require('web-push');

const app = express();
app.use(express.json());

// Set VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Save subscription
app.post('/api/push/subscribe', async (req, res) => {
  const { subscription } = req.body;
  // Save to database
  res.json({ success: true });
});

// Trigger notification
app.post('/api/push/trigger', async (req, res) => {
  const { subscription, notificationConfig } = req.body;
  
  const payload = JSON.stringify({
    title: notificationConfig.title,
    body: notificationConfig.body,
    icon: notificationConfig.icon,
    data: notificationConfig.data
  });
  
  await webpush.sendNotification(subscription, payload);
  res.json({ success: true });
});

app.listen(3000);
```

## 📱 How It Works

### Complete Flow

1. **User opens main app**
2. **Main app loads NTE** via hidden iframe
3. **NTE initializes** and sends `NTE_READY` message
4. **Main app requests permission** via `REQUEST_PERMISSION`
5. **NTE shows permission popup**
6. **User grants permission**
7. **NTE creates push subscription**
8. **NTE sends subscription to backend**
9. **Mini-app triggers event** → Main app forwards to NTE
10. **NTE sends event to backend**
11. **Backend sends push notification**
12. **Service worker receives push**
13. **Notification displays** (even if app closed)

### Foreground vs Background

**Foreground (App Open)**
- Uses `new Notification()` API
- Works immediately
- Controlled by NTE directly

**Background (App Closed)**
- Uses Service Worker
- Receives push from backend
- Shows via `self.registration.showNotification()`

## 🔐 Security

- **Origin validation**: All messages checked
- **VAPID authentication**: Secure push delivery
- **HTTPS required**: Notifications only work over HTTPS
- **User consent**: Permission required before any notifications

## 📦 Deployment

1. Deploy NTE to a separate domain
2. Configure CORS for your main app origin
3. Set up backend with VAPID keys
4. Update `config` in `src/utils.js`
5. Deploy backend API
6. Test in production environment

## 🚀 Features

✅ Completely invisible (no UI)  
✅ Secure postMessage communication  
✅ Service worker for background notifications  
✅ Foreground notification support  
✅ Push subscription management  
✅ Event-driven architecture  
✅ Works when app is closed  
✅ Works when phone is locked  
✅ Automatic permission sharing with mini-apps  

## 🔍 Debugging

Check browser console for logs:
- `[NTE]` - Core engine logs
- `[SW]` - Service worker logs

Test commands:
```javascript
// Ping NTE
nteIframe.postMessage({ type: 'PING' }, nteOrigin);

// Get current subscription
nteIframe.postMessage({ type: 'GET_SUBSCRIPTION' }, nteOrigin);
```

## 📄 Browser Support

- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ⚠️ Safari (limited push support)
- ❌ iOS Safari (no push support)

## 🤝 Mini-App Integration

Mini-apps automatically get notification access through main app:

```javascript
// In your mini-app
window.parent.postMessage({
  type: 'TRIGGER_NOTIFICATION',
  data: {
    eventName: 'DAILY_DUA',
    title: 'Daily Dua',
    body: 'Today\'s dua reminder'
  }
}, mainAppOrigin);
```

Main app forwards to NTE automatically.

## 📚 Resources

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [VAPID Keys](https://github.com/web-push-libs/web-push#command-line)

## 🐛 Troubleshooting

**Notifications not showing?**
- Check permission status
- Verify HTTPS connection
- Check service worker registration
- Verify VAPID keys
- Check browser console for errors

**Background notifications not working?**
- Service worker must be registered
- Backend must send valid push
- VAPID keys must match
- Subscription must be active

**Permission popup not appearing?**
- Must be triggered by user action
- Check if permission already granted/denied
- Verify secure context (HTTPS)

## 📞 Support

For issues or questions about NTE implementation, check:
- Browser developer console
- Service worker status: `chrome://serviceworker-internals`
- Push subscription: `navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription())`
