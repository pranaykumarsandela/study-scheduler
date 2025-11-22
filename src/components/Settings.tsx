import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Mail, Shield, User, Bell, Moon, Sun, Monitor, Calendar, Download, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { requestNotificationPermission } from './NotificationManager';
import { toast } from 'sonner@2.0.3';
import { exportToICS } from '../utils/calendarExport';

interface SettingsProps {
  notificationSettings: {
    enabled: boolean;
    reminderTime: number;
    breakReminders: boolean;
    dailySummary: boolean;
    dailySummaryTime: string;
  };
  onNotificationSettingsChange: (settings: any) => void;
  sessions: any[];
}

export function Settings({ notificationSettings, onNotificationSettingsChange, sessions }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      onNotificationSettingsChange({ ...notificationSettings, enabled: true });
    }
  };

  const handleExportAllSessions = () => {
    if (sessions.length === 0) {
      toast.error('No sessions to export');
      return;
    }
    exportToICS(sessions);
    toast.success('Calendar file downloaded! Import it to your calendar app.');
  };

  const handleExportUpcomingSessions = () => {
    const upcoming = sessions.filter(s => !s.completed && new Date(s.startTime) > new Date());
    if (upcoming.length === 0) {
      toast.error('No upcoming sessions to export');
      return;
    }
    exportToICS(upcoming, 'upcoming-study-sessions.ics');
    toast.success('Upcoming sessions exported!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the app looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred color scheme
                  </p>
                </div>
                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3 text-green-500" />
                  Active
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Your theme preference is saved locally on this device
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Study Reminders
              </CardTitle>
              <CardDescription>
                Get notified about upcoming study sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications for study reminders
                  </p>
                </div>
                {notificationPermission === 'granted' ? (
                  <Switch
                    checked={notificationSettings.enabled}
                    onCheckedChange={(checked) => 
                      onNotificationSettingsChange({ ...notificationSettings, enabled: checked })
                    }
                  />
                ) : (
                  <Button onClick={handleEnableNotifications} size="sm">
                    Enable
                  </Button>
                )}
              </div>

              {notificationSettings.enabled && (
                <>
                  {/* Reminder Time */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reminder Time</Label>
                      <p className="text-sm text-muted-foreground">
                        How early to notify before sessions
                      </p>
                    </div>
                    <Select
                      value={notificationSettings.reminderTime.toString()}
                      onValueChange={(value) =>
                        onNotificationSettingsChange({ ...notificationSettings, reminderTime: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Break Reminders */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Break Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Remind me to take breaks during study sessions
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.breakReminders}
                      onCheckedChange={(checked) =>
                        onNotificationSettingsChange({ ...notificationSettings, breakReminders: checked })
                      }
                    />
                  </div>

                  {/* Daily Summary */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        Get a daily summary of your study progress
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.dailySummary}
                      onCheckedChange={(checked) =>
                        onNotificationSettingsChange({ ...notificationSettings, dailySummary: checked })
                      }
                    />
                  </div>

                  {notificationSettings.dailySummary && (
                    <div className="flex items-center justify-between pl-6">
                      <div className="space-y-0.5">
                        <Label>Summary Time</Label>
                        <p className="text-sm text-muted-foreground">
                          When to send the daily summary
                        </p>
                      </div>
                      <Select
                        value={notificationSettings.dailySummaryTime}
                        onValueChange={(value) =>
                          onNotificationSettingsChange({ ...notificationSettings, dailySummaryTime: value })
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                          <SelectItem value="20:00">8:00 PM</SelectItem>
                          <SelectItem value="21:00">9:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {notificationPermission === 'denied' && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
                  <p className="text-sm text-destructive">
                    Notifications are blocked. Please enable them in your browser settings.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Integration Tab */}
        <TabsContent value="calendar" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar Integration
              </CardTitle>
              <CardDescription>
                Export your study sessions to external calendar apps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-3">Export Options</h4>
                <div className="space-y-2">
                  <Button
                    onClick={handleExportAllSessions}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export All Sessions (.ics)
                  </Button>
                  <Button
                    onClick={handleExportUpcomingSessions}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Upcoming Sessions (.ics)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Download .ics files that can be imported into Google Calendar, Outlook, Apple Calendar, and other calendar applications.
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="mb-3">Quick Add to Calendar</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  You can also add individual sessions directly from the schedule view using the calendar buttons on each session.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Google Calendar
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Outlook
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Download className="h-3 w-3" />
                    .ics Export
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6 mt-6">
          {/* Authentication Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Authentication
              </CardTitle>
              <CardDescription>
                Available authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p>Email/Password Login</p>
                    <p className="text-sm text-muted-foreground">Standard authentication</p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    Enabled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p>Password Reset</p>
                    <p className="text-sm text-muted-foreground">Email-based password recovery</p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    Enabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Profile customization features coming soon! You'll be able to update your name,
                email preferences, and profile picture.
              </p>
            </CardContent>
          </Card>

          {/* Coming Soon */}
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Features currently in development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Export study data (CSV, PDF)</li>
                <li>• Advanced analytics and insights</li>
                <li>• Cloud storage for study sessions</li>
                <li>• Focus time tracking</li>
                <li>• Study group collaboration</li>
                <li>• AI-powered study recommendations</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
