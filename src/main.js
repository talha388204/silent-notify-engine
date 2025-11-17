/**
 * NTE (Notification Trigger Engine) - Main Entry Point
 * This app runs completely invisible in the background
 * Loaded by main app via hidden iframe
 */

import { initializeNTE } from './nte.js';
import { startMessageListener } from './listener.js';

// Boot the NTE engine when page loads
async function boot() {
  try {
    console.log('[NTE] Booting Notification Trigger Engine...');
    
    // Initialize the core engine
    await initializeNTE();
    
    // Start listening for messages from main app
    startMessageListener();
    
    console.log('[NTE] Engine ready and listening');
  } catch (error) {
    console.error('[NTE] Failed to boot:', error);
  }
}

// Start immediately
boot();
