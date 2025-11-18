import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Boot NTE engine for iframe communication
import { initializeNTE } from './nte.js';
import { startMessageListener } from './listener.js';

// Initialize NTE engine immediately
(async () => {
  try {
    console.log('[NTE] Booting Notification Trigger Engine...');
    await initializeNTE();
    startMessageListener();
    console.log('[NTE] Engine ready and listening');
  } catch (error) {
    console.error('[NTE] Failed to boot:', error);
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
