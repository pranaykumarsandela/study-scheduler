import { useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  startTime: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface NotificationSettings {
  enabled: boolean;
  reminderTime: number; // minutes before session
  breakReminders: boolean;
  dailySummary: boolean;
  dailySummaryTime: string; // HH:MM format
}

interface NotificationManagerProps {
  sessions: StudySession[];
  settings: NotificationSettings;
}

export function NotificationManager({ sessions, settings }: NotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifiedSessions, setNotifiedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!settings.enabled || permission !== 'granted') return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const upcomingSessions = sessions.filter(session => {
        if (session.completed || notifiedSessions.has(session.id)) return false;
        
        const sessionTime = new Date(session.startTime);
        const timeDiff = sessionTime.getTime() - now.getTime();
        const minutesUntil = Math.floor(timeDiff / (1000 * 60));

        return minutesUntil <= settings.reminderTime && minutesUntil > 0;
      });

      upcomingSessions.forEach(session => {
        const sessionTime = new Date(session.startTime);
        const minutesUntil = Math.floor((sessionTime.getTime() - now.getTime()) / (1000 * 60));
        
        showNotification(
          'Study Session Reminder',
          `${session.subject}: ${session.topic} starts in ${minutesUntil} minutes`,
          session.id
        );
        
        setNotifiedSessions(prev => new Set([...prev, session.id]));
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [sessions, settings, permission, notifiedSessions]);

  // Daily summary notification
  useEffect(() => {
    if (!settings.enabled || !settings.dailySummary || permission !== 'granted') return;

    const checkDailySummary = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = settings.dailySummaryTime.split(':').map(Number);
      
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        const todaySessions = sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate.toDateString() === now.toDateString();
        });

        const completed = todaySessions.filter(s => s.completed).length;
        const total = todaySessions.length;

        if (total > 0) {
          showNotification(
            'Daily Study Summary',
            `You've completed ${completed} of ${total} study sessions today!`,
            'daily-summary'
          );
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkDailySummary);
  }, [sessions, settings, permission]);

  const showNotification = (title: string, body: string, tag: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        tag,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  return null;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    toast.error('Notifications are not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Notifications enabled!');
      return true;
    }
  }

  toast.error('Notification permission denied');
  return false;
}
