import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Target, Flame, Trophy, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

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

interface GoalsAndStreaksProps {
  sessions: StudySession[];
  goals: Goals;
  onUpdateGoals: (goals: Goals) => void;
  compact?: boolean;
}

export function GoalsAndStreaks({ sessions, goals, onUpdateGoals, compact = false }: GoalsAndStreaksProps) {
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [newGoals, setNewGoals] = useState(goals);

  // Calculate current streak
  const calculateStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedDates = [...new Set(
      sessions
        .filter(s => s.completed)
        .map(s => {
          const date = new Date(s.startTime);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
    )].sort((a, b) => b - a);

    if (completedDates.length === 0) return 0;

    let streak = 0;
    let checkDate = today.getTime();

    for (const date of completedDates) {
      if (date === checkDate || date === checkDate - 86400000) {
        streak++;
        checkDate = date - 86400000;
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate longest streak
  const calculateLongestStreak = () => {
    const completedDates = [...new Set(
      sessions
        .filter(s => s.completed)
        .map(s => {
          const date = new Date(s.startTime);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
    )].sort((a, b) => a - b);

    if (completedDates.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < completedDates.length; i++) {
      if (completedDates[i] === completedDates[i - 1] + 86400000) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  // Calculate today's progress
  const getTodayProgress = () => {
    const today = new Date().toDateString();
    const todayMinutes = sessions
      .filter(s => s.completed && new Date(s.startTime).toDateString() === today)
      .reduce((acc, s) => acc + s.duration, 0);
    return { current: todayMinutes, target: goals.dailyMinutes };
  };

  // Calculate this week's progress
  const getWeekProgress = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      return s.completed && sessionDate >= startOfWeek;
    });

    const minutes = weekSessions.reduce((acc, s) => acc + s.duration, 0);
    const sessionCount = weekSessions.length;

    return {
      minutes: { current: minutes, target: goals.weeklyMinutes },
      sessions: { current: sessionCount, target: goals.weeklySessions }
    };
  };

  const currentStreak = calculateStreak();
  const longestStreak = calculateLongestStreak();
  const todayProgress = getTodayProgress();
  const weekProgress = getWeekProgress();

  const handleSaveGoals = () => {
    onUpdateGoals(newGoals);
    setShowGoalsDialog(false);
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl">{currentStreak}</div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl">{Math.round((todayProgress.current / todayProgress.target) * 100)}%</div>
                <p className="text-xs text-muted-foreground">Daily Goal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg">Goals & Streaks</h3>
          <p className="text-sm text-muted-foreground">Track your progress and achievements</p>
        </div>
        <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Edit Goals
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Your Study Goals</DialogTitle>
              <DialogDescription>
                Define your daily and weekly study targets
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="daily-minutes">Daily Minutes Goal</Label>
                <Input
                  id="daily-minutes"
                  type="number"
                  value={newGoals.dailyMinutes}
                  onChange={(e) => setNewGoals({ ...newGoals, dailyMinutes: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="weekly-minutes">Weekly Minutes Goal</Label>
                <Input
                  id="weekly-minutes"
                  type="number"
                  value={newGoals.weeklyMinutes}
                  onChange={(e) => setNewGoals({ ...newGoals, weeklyMinutes: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="weekly-sessions">Weekly Sessions Goal</Label>
                <Input
                  id="weekly-sessions"
                  type="number"
                  value={newGoals.weeklySessions}
                  onChange={(e) => setNewGoals({ ...newGoals, weeklySessions: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="mt-2"
                />
              </div>
              <Button onClick={handleSaveGoals} className="w-full">
                Save Goals
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">{currentStreak} days</div>
            <p className="text-sm text-muted-foreground">
              {currentStreak > 0 
                ? `Keep it up! Study today to maintain your streak.`
                : `Start a streak by completing a study session today!`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">{longestStreak} days</div>
            <p className="text-sm text-muted-foreground">
              {currentStreak === longestStreak && currentStreak > 0
                ? `This is your best streak yet!`
                : `Your personal best. Can you beat it?`
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Today's Goal
            </span>
            <Badge variant={todayProgress.current >= todayProgress.target ? "default" : "secondary"}>
              {todayProgress.current} / {todayProgress.target} min
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={(todayProgress.current / todayProgress.target) * 100} />
          <p className="text-sm text-muted-foreground">
            {todayProgress.current >= todayProgress.target
              ? `🎉 Goal achieved! You've studied ${todayProgress.current} minutes today.`
              : `${todayProgress.target - todayProgress.current} minutes remaining to reach your goal.`
            }
          </p>
        </CardContent>
      </Card>

      {/* Weekly Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Weekly Minutes
              </span>
              <Badge variant="secondary">
                {weekProgress.minutes.current} / {weekProgress.minutes.target}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={(weekProgress.minutes.current / weekProgress.minutes.target) * 100} />
            <p className="text-sm text-muted-foreground">
              {Math.round((weekProgress.minutes.current / weekProgress.minutes.target) * 100)}% of weekly goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Weekly Sessions
              </span>
              <Badge variant="secondary">
                {weekProgress.sessions.current} / {weekProgress.sessions.target}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={(weekProgress.sessions.current / weekProgress.sessions.target) * 100} />
            <p className="text-sm text-muted-foreground">
              {Math.round((weekProgress.sessions.current / weekProgress.sessions.target) * 100)}% of weekly goal
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
