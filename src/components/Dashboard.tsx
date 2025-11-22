import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, BookOpen, Target, TrendingUp, Sparkles } from "lucide-react";
import { GoalsAndStreaks } from "./GoalsAndStreaks";

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  startTime: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Goals {
  dailyMinutes: number;
  weeklyMinutes: number;
  weeklySessions: number;
}

interface DashboardProps {
  sessions: StudySession[];
  onStartSession: (sessionId: string) => void;
  goals: Goals;
  onUpdateGoals: (goals: Goals) => void;
  onOpenPlanGenerator?: () => void;
}

export function Dashboard({ sessions, onStartSession, goals, onUpdateGoals, onOpenPlanGenerator }: DashboardProps) {
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(session => 
    new Date(session.startTime).toDateString() === today
  );
  
  const completedToday = todaySessions.filter(s => s.completed).length;
  const totalToday = todaySessions.length;
  const progressPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;
  
  const totalStudyTime = todaySessions
    .filter(s => s.completed)
    .reduce((acc, s) => acc + s.duration, 0);
  
  const upcomingSessions = todaySessions
    .filter(s => !s.completed && new Date(s.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1>Today's Study Dashboard</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Sessions Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{completedToday}/{totalToday}</div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</div>
            <p className="text-xs text-muted-foreground">Today's total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {new Set(todaySessions.map(s => s.subject)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals and Streaks */}
      <GoalsAndStreaks
        sessions={sessions}
        goals={goals}
        onUpdateGoals={onUpdateGoals}
        compact={true}
      />

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No upcoming sessions for today. Great job if you're done, or add a new session to keep studying!
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{session.topic}</h4>
                      <Badge variant="secondary">{session.subject}</Badge>
                      <Badge 
                        variant={session.difficulty === 'hard' ? 'destructive' : 
                                session.difficulty === 'medium' ? 'default' : 'secondary'}
                      >
                        {session.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{new Date(session.startTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                      <span>{session.duration} minutes</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => onStartSession(session.id)}
                    size="sm"
                  >
                    Start Session
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {onOpenPlanGenerator && (
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-primary/50 hover:bg-primary/5"
                onClick={onOpenPlanGenerator}
              >
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm">AI Study Plan</span>
              </Button>
            )}
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Quick Study</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm">Review Notes</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Target className="h-5 w-5" />
              <span className="text-sm">Practice Test</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}