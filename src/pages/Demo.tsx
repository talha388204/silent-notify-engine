import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const Demo = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notification permission granted!');
        await subscribeToPush();
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Permission error:', error);
      toast.error('Failed to request permission');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPush = async () => {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await registration.update();

      // Create push subscription
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        )
      });

      setSubscription(sub);
      console.log('Push subscription:', sub);
      toast.success('Push subscription created!');
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to create subscription');
    }
  };

  const sendTestNotification = () => {
    if (permission !== 'granted') {
      toast.error('Please grant notification permission first');
      return;
    }

    try {
      new Notification('Test Notification', {
        body: 'This is a test notification from NTE Demo',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
      });
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Notification error:', error);
      toast.error('Failed to send notification');
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="secondary">Not Requested</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">NTE Demo</h1>
          <p className="text-muted-foreground">
            Notification Trigger Engine - Testing Interface
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permission Status</CardTitle>
            <CardDescription>
              Current notification permission status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getPermissionBadge()}
            </div>
            
            {permission !== 'granted' && (
              <Button 
                onClick={requestPermission} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request Notification Permission
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Push Subscription</CardTitle>
            <CardDescription>
              Web Push subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Subscription:</span>
              <Badge variant={subscription ? "default" : "secondary"}>
                {subscription ? 'Active' : 'Not Created'}
              </Badge>
            </div>

            {subscription && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs font-mono break-all text-muted-foreground">
                  {subscription.endpoint.substring(0, 60)}...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Notifications</CardTitle>
            <CardDescription>
              Send test notifications to verify functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={sendTestNotification}
              disabled={permission !== 'granted'}
              className="w-full"
            >
              Send Test Notification
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Integration Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This NTE app is configured and ready to integrate with your main app.
              Load it in a hidden iframe and communicate via postMessage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Demo;
