import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { ScheduleView } from "./components/ScheduleView";
import { SessionForm } from "./components/SessionForm";
import { StudyTimer } from "./components/StudyTimer";
import { ProgressView } from "./components/ProgressView";
import { Settings } from "./components/Settings";
import { Auth } from "./components/Auth";
import { ThemeProvider } from "./components/ThemeProvider";
import { NotificationManager } from "./components/NotificationManager";
import { StudyPlanGenerator } from "./components/StudyPlanGenerator";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Calendar, Home, Plus, BarChart3, Settings as SettingsIcon, Clock, LogOut, User, Sparkles } from "lucide-react";
import { supabase } from "./utils/supabase/client";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  startTime: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  description?: string;
  goals?: string[];
}

type View = 'dashboard' | 'schedule' | 'progress' | 'settings';

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | undefined>();
  const [activeTimer, setActiveTimer] = useState<StudySession | undefined>();
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('notification-settings');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      reminderTime: 15,
      breakReminders: true,
      dailySummary: true,
      dailySummaryTime: '20:00',
    };
  });

  // Goals state
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('study-goals');
    return saved ? JSON.parse(saved) : {
      dailyMinutes: 120,
      weeklyMinutes: 600,
      weeklySessions: 10,
    };
  });

  // Save notification settings to localStorage
  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('study-goals', JSON.stringify(goals));
  }, [goals]);

  // Check authentication state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sample data - in a real app, this would come from a backend
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: '1',
      subject: 'Mathematics',
      topic: 'Calculus - Derivatives',
      duration: 60,
      startTime: new Date().toISOString(),
      completed: false,
      difficulty: 'hard',
      description: 'Practice derivative problems and review chain rule',
      goals: ['Solve 10 derivative problems', 'Review chain rule examples']
    },
    {
      id: '2',
      subject: 'Physics',
      topic: 'Quantum Mechanics',
      duration: 90,
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      completed: false,
      difficulty: 'hard'
    },
    {
      id: '3',
      subject: 'History',
      topic: 'World War II',
      duration: 45,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      completed: true,
      difficulty: 'medium'
    },
    {
      id: '4',
      subject: 'Mathematics',
      topic: 'Linear Algebra',
      duration: 75,
      startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      completed: true,
      difficulty: 'medium'
    }
  ]);

  const [subjects] = useState([
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Literature',
    'Computer Science',
    'Economics'
  ]);

  const handleAddSession = () => {
    setEditingSession(undefined);
    setShowSessionForm(true);
  };

  const handleEditSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const handleSaveSession = (sessionData: Omit<StudySession, 'id' | 'completed'>) => {
    if (editingSession) {
      // Update existing session
      setSessions(prev => prev.map(s => 
        s.id === editingSession.id 
          ? { ...sessionData, id: s.id, completed: s.completed }
          : s
      ));
      toast.success('Session updated successfully');
    } else {
      // Create new session
      const newSession: StudySession = {
        ...sessionData,
        id: Date.now().toString(),
        completed: false
      };
      setSessions(prev => [...prev, newSession]);
      toast.success('Session created successfully');
    }
    setShowSessionForm(false);
    setEditingSession(undefined);
  };

  const handleStartSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveTimer(session);
    }
  };

  const handleCompleteSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, completed: true } : s
    ));
    toast.success('Session completed! Great work! 🎉');
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleCreateSessionsFromPlan = (planSessions: any[]) => {
    const newSessions = planSessions.map(sessionData => ({
      ...sessionData,
      id: Date.now().toString() + Math.random().toString(36),
      completed: false
    }));
    setSessions(prev => [...prev, ...newSessions]);
  };

  const handleAddSubject = (subject: string) => {
    // In a real app, you'd add this to your subjects list
    console.log('Adding subject:', subject);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navigationItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'schedule' as const, label: 'Schedule', icon: Calendar },
    { id: 'progress' as const, label: 'Progress', icon: BarChart3 },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <ThemeProvider>
        <Auth />
        <Toaster />
      </ThemeProvider>
    );
  }

  // If timer is active, show only the timer
  if (activeTimer) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background p-4">
          <StudyTimer
            session={activeTimer}
            onComplete={handleCompleteSession}
            onClose={() => setActiveTimer(undefined)}
          />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // If session form is open, show only the form
  if (showSessionForm) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background p-4">
          <SessionForm
            session={editingSession}
            subjects={subjects}
            onSave={handleSaveSession}
            onCancel={() => {
              setShowSessionForm(false);
              setEditingSession(undefined);
            }}
            onAddSubject={handleAddSubject}
          />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <NotificationManager sessions={sessions} settings={notificationSettings} />
      <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl">StudySmart</h1>
              </div>
              
              <div className="flex gap-1">
                {navigationItems.map(item => (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => setCurrentView(item.id)}
                    className="gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" />
                {user.email}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {sessions.filter(s => s.completed).length} completed
              </Badge>
              <Button onClick={() => setShowPlanGenerator(true)} variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Plan
              </Button>
              <Button onClick={handleAddSession} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Session
              </Button>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard
            sessions={sessions}
            onStartSession={handleStartSession}
            goals={goals}
            onUpdateGoals={setGoals}
            onOpenPlanGenerator={() => setShowPlanGenerator(true)}
          />
        )}
        
        {currentView === 'schedule' && (
          <ScheduleView
            sessions={sessions}
            onAddSession={handleAddSession}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
        
        {currentView === 'progress' && (
          <ProgressView
            sessions={sessions}
            goals={goals}
            onUpdateGoals={setGoals}
          />
        )}
        
        {currentView === 'settings' && (
          <Settings
            notificationSettings={notificationSettings}
            onNotificationSettingsChange={setNotificationSettings}
            sessions={sessions}
          />
        )}
      </main>
      
      {/* Study Plan Generator */}
      <StudyPlanGenerator
        open={showPlanGenerator}
        onOpenChange={setShowPlanGenerator}
        onCreateSessions={handleCreateSessionsFromPlan}
      />
      
      <Toaster />
      </div>
    </ThemeProvider>
  );
}