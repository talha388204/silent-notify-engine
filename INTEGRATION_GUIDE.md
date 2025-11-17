# NTE Integration Guide

## আপনার Main App এ NTE কিভাবে Integrate করবেন

### Step 1: Load NTE in Hidden Iframe

আপনার main app এর যেকোনো page এ (যেমন `App.tsx` বা `index.html`) এই code add করুন:

```html
<!-- NTE iframe - completely hidden -->
<iframe 
  id="nte-iframe"
  src="https://your-nte-domain.com" 
  style="display:none"
  title="Notification Engine"
></iframe>
```

**গুরুত্বপূর্ণ**: `your-nte-domain.com` replace করুন আপনার deployed NTE app এর domain দিয়ে।

### Step 2: Initialize Communication

আপনার main app এ একটা script file create করুন (যেমন `nteClient.js`):

```javascript
// নিজের NTE domain দিয়ে replace করুন
const NTE_ORIGIN = 'https://your-nte-domain.com';

class NTEClient {
  constructor() {
    this.iframe = null;
    this.isReady = false;
    this.messageHandlers = new Map();
    
    // Listen for messages from NTE
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  // NTE iframe খুঁজে বের করা
  init() {
    this.iframe = document.getElementById('nte-iframe');
    
    if (!this.iframe) {
      console.error('[NTE Client] Iframe not found');
      return false;
    }
    
    console.log('[NTE Client] Initialized');
    return true;
  }

  // NTE থেকে message handle করা
  handleMessage(event) {
    // Security check - শুধুমাত্র NTE origin থেকে message accept করা
    if (event.origin !== NTE_ORIGIN) {
      return;
    }

    const { type, data, error } = event.data;
    console.log('[NTE Client] Message received:', type);

    // Handle different message types
    switch (type) {
      case 'NTE_READY':
        this.isReady = true;
        console.log('[NTE Client] NTE is ready!');
        this.onReady && this.onReady();
        break;

      case 'PERMISSION_RESPONSE':
        this.onPermissionResponse && this.onPermissionResponse(data);
        break;

      case 'SUBSCRIPTION_RESPONSE':
        this.onSubscription && this.onSubscription(data);
        break;

      case 'ERROR':
        console.error('[NTE Client] Error:', error);
        this.onError && this.onError(error);
        break;

      case 'PONG':
        console.log('[NTE Client] Pong received');
        break;
    }

    // Custom message handlers
    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(data, error);
    }
  }

  // NTE তে message পাঠানো
  sendMessage(message) {
    if (!this.iframe) {
      console.error('[NTE Client] Iframe not initialized');
      return false;
    }

    this.iframe.contentWindow.postMessage(message, NTE_ORIGIN);
    return true;
  }

  // Notification permission request করা
  requestPermission() {
    return this.sendMessage({
      type: 'REQUEST_PERMISSION'
    });
  }

  // Current subscription জানা
  getSubscription() {
    return this.sendMessage({
      type: 'GET_SUBSCRIPTION'
    });
  }

  // Event trigger করা (mini-apps থেকেও call করা যাবে)
  triggerEvent(eventName, eventData, notificationConfig) {
    return this.sendMessage({
      type: 'TRIGGER_EVENT',
      payload: {
        eventName,
        eventData,
        notificationConfig
      }
    });
  }

  // Foreground notification পাঠানো (app open থাকলে)
  sendForegroundNotification(title, body, options = {}) {
    return this.sendMessage({
      type: 'SEND_FOREGROUND_NOTIFICATION',
      payload: {
        title,
        body,
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/icon-192.png',
        tag: options.tag || 'notification',
        data: options.data || {}
      }
    });
  }

  // Ping করা (testing এর জন্য)
  ping() {
    return this.sendMessage({ type: 'PING' });
  }

  // Custom message handler register করা
  on(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }

  // Handler remove করা
  off(messageType) {
    this.messageHandlers.delete(messageType);
  }
}

// Global instance তৈরি করা
const nteClient = new NTEClient();

// Export করা
export default nteClient;
```

### Step 3: আপনার App এ Use করা

React example:

```javascript
import { useEffect, useState } from 'react';
import nteClient from './nteClient';

function App() {
  const [nteReady, setNteReady] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // NTE initialize করা
    nteClient.init();

    // NTE ready হলে
    nteClient.onReady = () => {
      console.log('NTE is ready!');
      setNteReady(true);
    };

    // Permission response handle করা
    nteClient.onPermissionResponse = (data) => {
      console.log('Permission:', data.permission);
      setPermission(data.permission);
    };

    // Error handle করা
    nteClient.onError = (error) => {
      console.error('NTE Error:', error);
    };
  }, []);

  // Permission request করা
  const handleRequestPermission = () => {
    nteClient.requestPermission();
  };

  // Test notification পাঠানো
  const handleSendNotification = () => {
    nteClient.sendForegroundNotification(
      'Test Notification',
      'This is a test notification from your app!',
      {
        icon: '/icon-192.png',
        tag: 'test',
        data: { customData: 'hello' }
      }
    );
  };

  return (
    <div>
      <h1>My App with NTE</h1>
      
      {nteReady ? (
        <div>
          <p>NTE Status: ✅ Ready</p>
          <p>Permission: {permission}</p>
          
          {permission !== 'granted' && (
            <button onClick={handleRequestPermission}>
              Request Notification Permission
            </button>
          )}
          
          {permission === 'granted' && (
            <button onClick={handleSendNotification}>
              Send Test Notification
            </button>
          )}
        </div>
      ) : (
        <p>Loading NTE...</p>
      )}
    </div>
  );
}

export default App;
```

### Step 4: Mini-Apps থেকে Notification Trigger করা

আপনার mini-apps থেকে এভাবে notification trigger করতে পারবেন:

```javascript
// Mini-app থেকে event trigger করা
function triggerDailyDua() {
  // Main app এর window access করা (যদি iframe হয়)
  if (window.parent) {
    window.parent.postMessage({
      type: 'MINI_APP_EVENT',
      eventName: 'DAILY_DUA',
      eventData: {
        duaText: 'Subhanallah...',
        duaId: '123'
      },
      notificationConfig: {
        title: 'Daily Dua Reminder',
        body: 'Time to recite your daily dua!',
        icon: '/dua-icon.png',
        tag: 'daily-dua'
      }
    }, 'https://your-main-app-domain.com');
  }
}
```

Main app এ এই event listen করুন:

```javascript
// Main app এ mini-app events listen করা
window.addEventListener('message', (event) => {
  // Security: mini-app origin verify করা
  if (event.origin !== 'https://your-mini-app-domain.com') {
    return;
  }

  if (event.data.type === 'MINI_APP_EVENT') {
    // NTE তে forward করা
    nteClient.triggerEvent(
      event.data.eventName,
      event.data.eventData,
      event.data.notificationConfig
    );
  }
});
```

## Configuration

### Update Origins

`src/utils.js` file এ আপনার domains update করুন:

```javascript
const config = {
  // আপনার main app এর domain
  mainAppOrigin: 'https://your-main-app-domain.com',
  
  // Backend ইতিমধ্যে configure করা আছে (Lovable Cloud)
  backendUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`,
  
  // VAPID key ইতিমধ্যে set করা আছে
  vapidPublicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
};
```

## Testing

### Demo Page

এই NTE app এ একটা demo page আছে যেখানে আপনি test করতে পারবেন:

1. `/demo` route এ যান
2. "Request Notification Permission" button click করুন
3. "Send Test Notification" button click করুন

### Production Testing

1. NTE app deploy করুন একটা separate domain এ
2. Main app এ iframe add করুন
3. NTE client code add করুন
4. Test করুন:
   - Permission request
   - Foreground notifications (app open)
   - Background notifications (app closed)

## Features

✅ **Completely Invisible**: NTE কোন UI দেখায় না  
✅ **Secure Communication**: Origin validation সহ postMessage  
✅ **Background Support**: App closed থাকলেও notification কাজ করে  
✅ **Mini-App Ready**: Mini-apps automatically permission পায়  
✅ **Backend Configured**: Lovable Cloud এর সাথে integrate করা  

## Important Notes

1. **HTTPS Required**: Notifications শুধুমাত্র HTTPS এ কাজ করে
2. **User Interaction**: Permission request করার জন্য user action লাগবে
3. **Browser Support**: Chrome/Firefox এ ভালো কাজ করে, Safari এ limited
4. **Testing**: Development এ localhost allowed আছে

## Troubleshooting

**Notifications দেখা যাচ্ছে না?**
- Permission status check করুন
- Console logs দেখুন
- Service worker registered আছে কিনা verify করুন

**Communication কাজ করছে না?**
- Origins সঠিক আছে কিনা check করুন
- Browser console এ errors দেখুন
- Iframe load হয়েছে কিনা verify করুন

## Support

আরো help এর জন্য:
- Console logs check করুন (`[NTE]` prefix)
- Demo page use করে test করুন
- Browser notification settings verify করুন
