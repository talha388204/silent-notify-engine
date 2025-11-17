import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriggerRequest {
  eventName: string;
  eventData: any;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  notificationConfig: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
  };
  timestamp: number;
  origin: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      eventName, 
      eventData, 
      subscription, 
      notificationConfig,
      timestamp,
      origin
    }: TriggerRequest = await req.json();

    console.log('[Push Trigger] Event received:', {
      eventName,
      origin,
      timestamp,
      notificationTitle: notificationConfig.title
    });

    // Here you would use web-push to send the notification
    // For now, we'll return success
    // In production, install web-push and use VAPID keys
    
    const payload = JSON.stringify({
      title: notificationConfig.title || 'New Notification',
      body: notificationConfig.body || 'You have a new update',
      icon: notificationConfig.icon || '/icon-192.png',
      badge: notificationConfig.badge || '/icon-192.png',
      tag: notificationConfig.tag || 'default',
      data: {
        eventName,
        eventData,
        url: notificationConfig.data?.url || '/',
        timestamp
      }
    });

    console.log('[Push Trigger] Notification payload prepared:', payload);

    // TODO: Implement actual web push here
    // const webpush = require('web-push');
    // await webpush.sendNotification(subscription, payload);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Push notification triggered',
        eventName,
        timestamp: Date.now()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('[Push Trigger] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
