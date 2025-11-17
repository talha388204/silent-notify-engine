# Copilot AI Integration Prompts for NTE Notification System

## 🎯 Overview
You have access to a Notification Trigger Engine (NTE) app that handles all push notifications. The NTE app is already deployed and ready. Your task is to integrate it into the main Islamic app to enable automatic notifications for:
1. Adhan (prayer call) times
2. Prayer time reminders
3. Daily Hadith (morning and evening)

---

## 📋 PROMPT 1: Load NTE App and Initialize Connection

```
I need to integrate a Notification Trigger Engine (NTE) into my Islamic app. The NTE app is deployed at [YOUR_NTE_LOVABLE_PUBLISH_LINK].

Please follow these steps:

1. Create a new file called `src/lib/nteClient.js` with the following functionality:
   - Load the NTE app in a hidden iframe
   - Establish postMessage communication with the NTE app
   - Implement these methods:
     * requestPermission() - request notification permission
     * getSubscription() - get push subscription
     * sendForegroundNotification(title, body, icon) - send immediate notification
     * triggerEvent(eventName, eventData, notificationConfig) - trigger backend notification
   - Add proper error handling and connection status tracking
   - Use origin validation for security

2. Initialize the NTE client when the app loads:
   - In the main App component or layout
   - Show a one-time notification permission prompt to users
   - Store permission status in localStorage

3. Create a React hook called `useNTE()` that wraps the nteClient:
   - Returns connection status
   - Returns all client methods
   - Handles loading states

Reference the INTEGRATION_GUIDE.md for implementation details.
```

---

## 📋 PROMPT 2: Setup Prayer Times Notification System

```
Now that the NTE is connected, implement automatic Adhan and prayer time notifications.

Requirements:

1. Create a new file `src/services/prayerNotifications.js` with:
   - Function to schedule notifications for all 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
   - Function to schedule Adhan notifications (before prayer time)
   - Use the existing prayer times data from the app's prayer time section

2. Notification timing:
   - Adhan notification: Send 5 minutes BEFORE each prayer time
   - Prayer time notification: Send EXACTLY at prayer time
   
3. Notification content:
   - Adhan: Title: "Adhan Time - [Prayer Name]", Body: "It's time for [Prayer Name] adhan", Icon: prayer icon
   - Prayer: Title: "Prayer Time - [Prayer Name]", Body: "[Prayer Name] prayer time has arrived. It's time to pray.", Icon: prayer icon

4. Implementation approach:
   - Calculate next prayer time from current time
   - Use setTimeout or setInterval to check times
   - When time matches, call nteClient.triggerEvent() to send notification
   - Reschedule for next day after Isha

5. Create a settings page where users can:
   - Enable/disable Adhan notifications
   - Enable/disable prayer time notifications
   - Choose which prayers to get notifications for
   - Store preferences in localStorage

6. Auto-start the notification scheduler when:
   - User grants notification permission
   - App loads and permission is already granted
```

---

## 📋 PROMPT 3: Implement Daily Hadith Notifications

```
Implement daily Hadith notifications that send one Hadith in the morning and one in the evening.

Requirements:

1. Create a new file `src/services/hadithNotifications.js` with:
   - Function to fetch a random Hadith from the app's existing Hadith section/database
   - Function to schedule morning Hadith notification (8:00 AM local time)
   - Function to schedule evening Hadith notification (6:00 PM local time)

2. Notification content:
   - Title: "Daily Hadith" (morning) or "Evening Hadith" (evening)
   - Body: First 100 characters of the Hadith text + "..."
   - Icon: Hadith/book icon
   - Data: Include full Hadith text and reference

3. Implementation approach:
   - Check current time on app load
   - Calculate milliseconds until next scheduled time (8 AM or 6 PM)
   - Use setTimeout to trigger at exact times
   - After sending, reschedule for next occurrence
   - Ensure it works across days (reschedule for tomorrow if time passed)

4. Hadith selection logic:
   - Fetch random Hadith from existing Hadith collection
   - Don't repeat same Hadith within 30 days (store sent Hadith IDs in localStorage)
   - If all Hadiths exhausted, reset and start over

5. Create notification click handler:
   - When user clicks Hadith notification
   - Open app and navigate to Hadith detail page
   - Show full Hadith with translation and reference

6. Settings integration:
   - Add toggle in settings: "Daily Hadith Notifications"
   - Add time pickers to customize morning/evening times
   - Store preferences in localStorage
```

---

## 📋 PROMPT 4: Create Unified Notification Management Dashboard

```
Create a comprehensive notification management page for users to control all notification features.

Requirements:

1. Create a new page component: `src/pages/NotificationSettings.tsx`

2. Include these sections:

   **Permission Status:**
   - Show current notification permission (Granted/Denied/Not Asked)
   - Button to request permission if not granted
   - Show NTE connection status

   **Prayer Notifications:**
   - Master toggle: Enable All Prayer Notifications
   - Individual toggles for each prayer (Fajr, Dhuhr, Asr, Maghrib, Isha)
   - Separate toggles for Adhan vs Prayer Time
   - Setting: Minutes before prayer for Adhan (default 5)

   **Hadith Notifications:**
   - Toggle: Daily Hadith Notifications
   - Time picker: Morning Hadith time (default 8:00 AM)
   - Time picker: Evening Hadith time (default 6:00 PM)
   - Button: Send Test Hadith Notification

   **Test Notifications:**
   - Button to send test notification immediately
   - Shows last notification sent time

3. Design:
   - Use clean, Islamic-themed UI
   - Use switches/toggles for enable/disable options
   - Use cards to group related settings
   - Show icons for each notification type
   - Add helpful descriptions under each setting

4. Functionality:
   - All settings save automatically to localStorage
   - Changes take effect immediately
   - Show toast/success message when settings are saved
   - Validation: Don't allow times to be the same

5. Add navigation link to this page from main app menu/settings
```

---

## 📋 PROMPT 5: Background Sync and Reliability

```
Ensure notifications work reliably even when the app is closed or in background.

Requirements:

1. Service Worker integration:
   - The NTE already has a service worker
   - Ensure the main app's service worker doesn't conflict
   - Add message passing between app service worker and NTE service worker if needed

2. Background sync:
   - Use Background Sync API to queue notification triggers
   - If network fails, retry when connection restored
   - Store pending notifications in IndexedDB

3. Notification persistence:
   - Create `src/services/notificationQueue.js`
   - Queue system that stores scheduled notifications
   - Persist queue to IndexedDB
   - On app restart, restore queue and reschedule

4. Handling edge cases:
   - User changes timezone: Recalculate all prayer times
   - User changes location: Update prayer times and reschedule
   - Phone restarts: Restore notification schedule on next app open
   - Permission revoked: Pause all notifications and show banner

5. Analytics/Logging:
   - Log when notifications are sent
   - Log when notifications are clicked
   - Log when notifications fail
   - Create simple dashboard to show notification stats

6. Testing tools:
   - Add debug mode in settings (hidden, activated by tapping version 7 times)
   - Debug mode shows:
     * Next scheduled notification times
     * Notification queue contents
     * Recent notification logs
     * Manual trigger buttons for each notification type
```

---

## 📋 PROMPT 6: User Onboarding for Notifications

```
Create a smooth onboarding experience to introduce users to the notification features.

Requirements:

1. Create onboarding flow:
   - Show on first app launch
   - Explain the three notification features (Adhan, Prayer Times, Daily Hadith)
   - Beautiful slides with illustrations
   - Request notification permission at the end

2. Onboarding steps:
   
   **Step 1: Welcome**
   - "Stay Connected to Your Faith"
   - Brief intro to notification features

   **Step 2: Prayer Notifications**
   - Show illustration of prayer notification
   - Explain Adhan and prayer time reminders
   - "Never miss a prayer again"

   **Step 3: Daily Hadith**
   - Show illustration of Hadith notification
   - Explain morning and evening Hadith
   - "Get inspired twice daily"

   **Step 4: Permission**
   - "Enable Notifications"
   - Clear explanation of why permission is needed
   - Button to grant permission
   - Option to skip (can enable later in settings)

3. Implementation:
   - Create `src/components/NotificationOnboarding.tsx`
   - Use modal or full-screen overlay
   - Add smooth transitions between steps
   - Store completion status in localStorage ("onboarding_completed")
   - Don't show again after completion

4. Quick setup option:
   - After onboarding, offer "Quick Setup"
   - Automatically enable all notifications with default settings
   - Or "Custom Setup" that goes to settings page

5. Re-engagement:
   - If user skipped permission
   - Show gentle reminder banner after 3 days
   - Explain benefits they're missing
   - Easy one-tap to open permission request
```

---

## 🔧 Technical Notes for All Prompts

**NTE Communication Format:**
```javascript
// Request permission
window.nteClient.requestPermission()

// Send immediate notification
window.nteClient.sendForegroundNotification(
  "Prayer Time",
  "Fajr prayer time has arrived",
  "/prayer-icon.png"
)

// Trigger event (sends to backend for push)
window.nteClient.triggerEvent(
  "PRAYER_TIME",
  { prayer: "Fajr", time: "05:30" },
  {
    title: "Prayer Time - Fajr",
    body: "Fajr prayer time has arrived",
    icon: "/prayer-icon.png"
  }
)
```

**Environment Setup:**
- NTE app URL: [YOUR_NTE_LOVABLE_PUBLISH_LINK]
- Origin validation: Important for security
- CORS: Already configured in NTE backend

**Data Sources:**
- Prayer times: Use existing prayer time calculation in the app
- Hadith: Use existing Hadith collection/API in the app
- User location: Use existing location services

**Storage:**
- Notification preferences: localStorage
- Notification queue: IndexedDB
- Sent notifications log: IndexedDB

---

## 📱 Testing Checklist

After implementation, test:

- [ ] Permission request appears and works
- [ ] Adhan notification arrives 5 min before prayer
- [ ] Prayer notification arrives at exact prayer time
- [ ] Morning Hadith arrives at 8 AM
- [ ] Evening Hadith arrives at 6 PM
- [ ] Notifications work when app is open
- [ ] Notifications work when app is closed
- [ ] Notifications work when phone is locked
- [ ] Clicking notification opens correct page
- [ ] Settings save and persist
- [ ] Disabling notifications stops them
- [ ] Works after phone restart (when app opens again)
- [ ] Works across timezone changes

---

## 🚀 Priority Order

1. **First**: PROMPT 1 (Setup NTE connection)
2. **Second**: PROMPT 2 (Prayer notifications)
3. **Third**: PROMPT 3 (Hadith notifications)  
4. **Fourth**: PROMPT 4 (Settings dashboard)
5. **Fifth**: PROMPT 6 (Onboarding)
6. **Last**: PROMPT 5 (Background sync & reliability)

---

## 💡 Additional Tips for Copilot

- Read the INTEGRATION_GUIDE.md thoroughly first
- Test each feature individually before moving to next
- Use browser DevTools to debug postMessage communication
- Check browser console for NTE connection logs
- The NTE app is already fully functional - you just need to integrate it
- Focus on the timing logic - it's the most critical part
- Make sure to handle timezones correctly
- Prayer times should update daily based on user location
- Add plenty of console.logs for debugging during development

---

**Good luck! The NTE foundation is solid, now build an amazing notification experience! 🚀**
