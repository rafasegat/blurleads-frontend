'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useClient } from '@/hooks/use-client';
import { toast } from 'sonner';
import { Save, User, Bell, Key, Code, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage(): JSX.Element {
  const { user } = useAuth();
  console.log('[Settings] Rendering settings page, user:', user?.email);

  // Profile settings
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.user_metadata?.company || '');
  const [saving, setSaving] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [leadNotifications, setLeadNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  // API settings - Get from client
  const { data: client } = useClient();
  const apiKey = client?.apiKey || 'Loading...';
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleSaveProfile = async (): Promise<void> => {
    setSaving(true);
    console.log('[Settings] Saving profile settings');

    try {
      // TODO: Call API to update profile
      // await fetch('/api/user/profile', {
      //   method: 'PATCH',
      //   body: JSON.stringify({ name, email, company })
      // });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('[Settings] Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (): Promise<void> => {
    console.log('[Settings] Saving notification settings');

    try {
      // TODO: Call API to update notification preferences
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('[Settings] Notification update error:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handleCopyApiKey = (): void => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied to clipboard');
  };

  const handleRegenerateApiKey = async (): Promise<void> => {
    console.log('[Settings] Regenerating API key');
    // TODO: Call API to regenerate key
    toast.success('API key regenerated');
  };

  const handleSaveWebhook = async (): Promise<void> => {
    console.log('[Settings] Saving webhook URL');

    try {
      // TODO: Call API to save webhook
      toast.success('Webhook URL saved');
    } catch (error) {
      console.error('[Settings] Webhook save error:', error);
      toast.error('Failed to save webhook');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            API & Webhooks
          </TabsTrigger>
          <TabsTrigger value="tracking" className="gap-2">
            <Code className="h-4 w-4" />
            Tracking Script
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This email is used for notifications and account recovery
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>
                Your current subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Plan</p>
                  <p className="text-sm text-muted-foreground">Free Trial</p>
                </div>
                <Badge>Active</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Monthly Lead Credits</p>
                  <p className="text-sm text-muted-foreground">
                    1,000 / 1,000 remaining
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Upgrade Plan</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when you want to receive email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    All Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive all email notifications from BlurLeads
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="lead-notifications">New Lead Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new high-value lead is identified
                  </p>
                </div>
                <Switch
                  id="lead-notifications"
                  checked={leadNotifications}
                  onCheckedChange={setLeadNotifications}
                  disabled={!emailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-report">Weekly Summary Report</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your lead generation activity
                  </p>
                </div>
                <Switch
                  id="weekly-report"
                  checked={weeklyReport}
                  onCheckedChange={setWeeklyReport}
                  disabled={!emailNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key</CardTitle>
              <CardDescription>
                Use this key to authenticate API requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Keep your API key secure</AlertTitle>
                <AlertDescription>
                  Your API key is used to track visitors on your website.
                  It&apos;s safe to include in your public HTML since it&apos;s
                  read-only and only tracks visitor data.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={apiKey}
                    readOnly
                    className="font-mono text-sm"
                    placeholder="Loading..."
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyApiKey}
                    disabled={!apiKey || apiKey === 'Loading...'}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This key is auto-generated and unique to your account
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleRegenerateApiKey}
                disabled={!apiKey || apiKey === 'Loading...'}
              >
                Regenerate Key
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  window.open('http://localhost:3001/api/docs', '_blank')
                }
              >
                View API Documentation
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook URL</CardTitle>
              <CardDescription>
                Receive real-time lead events via webhook
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook Endpoint</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-domain.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  We&apos;ll send POST requests with lead data to this URL
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveWebhook}>
                <Save className="mr-2 h-4 w-4" />
                Save Webhook
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tracking Script Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installation</CardTitle>
              <CardDescription>
                Add this script to your website to start identifying visitors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Code className="h-4 w-4" />
                <AlertTitle>Installation Instructions</AlertTitle>
                <AlertDescription>
                  Copy the code below and paste it before the closing{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    &lt;/head&gt;
                  </code>{' '}
                  tag on every page of your website.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label>Tracking Script</Label>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`<!-- BlurLeads Tracking Script -->
<script src="https://blurleads.com/tracker.js?id=${apiKey}" async></script>`}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      const code =
                        document.querySelector('pre code')?.textContent || '';
                      navigator.clipboard.writeText(code);
                      toast.success('Code copied to clipboard');
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Test Installation</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
