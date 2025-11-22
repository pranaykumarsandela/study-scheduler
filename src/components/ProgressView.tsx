import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Clock, BookOpen, Target, TrendingUp, Award } from "lucide-react";
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

interface ProgressViewProps {
  sessions: StudySession[];
  goals: Goals;
  onUpdateGoals: (goals: Goals) => void;
}

export function ProgressView({ sessions, goals, onUpdateGoals }: ProgressViewProps) {
  const completedSessions = sessions.filter(s => s.completed);
  
  // Calculate daily study data for the last 7 days
  const getDailyData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayData = completedSessions.filter(session => 
        new Date(session.startTime).toDateString() === date.toDateString()
      );
      
      last7Days.push({
        day: dayName,
        sessions: dayData.length,
        duration: dayData.reduce((acc, s) => acc + s.duration, 0),
        date: date.toDateString()
      });
    }
    return last7Days;
  };

  // Subject distribution
  const getSubjectData = () => {
    const subjectMap = new Map();
    completedSessions.forEach(session => {
      const current = subjectMap.get(session.subject) || { subject: session.subject, sessions: 0, duration: 0 };
      current.sessions += 1;
      current.duration += session.duration;
      subjectMap.set(session.subject, current);
    });
    return Array.from(subjectMap.values());
  };

  // Difficulty distribution
  const getDifficultyData = () => {
    const difficulties = { easy: 0, medium: 0, hard: 0 };
    completedSessions.forEach(session => {
      difficulties[session.difficulty]++;
    });
    
    return [
      { name: 'Easy', value: difficulties.easy, color: '#10b981' },
      { name: 'Medium', value: difficulties.medium, color: '#f59e0b' },
      { name: 'Hard', value: difficulties.hard, color: '#ef4444' }
    ];
  };

  const dailyData = getDailyData();
  const subjectData = getSubjectData();
  const difficultyData = getDifficultyData();
  
  const totalStudyTime = completedSessions.reduce((acc, s) => acc + s.duration, 0);
  const averageSessionLength = completedSessions.length > 0 ? Math.round(totalStudyTime / completedSessions.length) : 0;
  const studyStreak = dailyData.filter(day => day.sessions > 0).length;
  const totalSessions = completedSessions.length;

  const achievements = [
    { name: "First Session", completed: totalSessions >= 1, icon: "🎯" },
    { name: "Study Streak", completed: studyStreak >= 3, icon: "🔥" },
    { name: "Time Master", completed: totalStudyTime >= 300, icon: "⏰" },
    { name: "Subject Explorer", completed: subjectData.length >= 3, icon: "📚" },
    { name: "Consistency King", completed: studyStreak >= 7, icon: "👑" },
    { name: "Marathon Learner", completed: totalStudyTime >= 1200, icon: "🏃‍♂️" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Study Progress</h1>
        <p className="text-muted-foreground">Track your learning journey and achievements</p>
      </div>

      {/* Goals and Streaks Section */}
      <GoalsAndStreaks
        sessions={sessions}
        goals={goals}
        onUpdateGoals={onUpdateGoals}
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Sessions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              +{dailyData[dailyData.length - 1]?.sessions || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</div>
            <p className="text-xs text-muted-foreground">
              Total time studied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Average Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{averageSessionLength}m</div>
            <p className="text-xs text-muted-foreground">
              Per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Study Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{studyStreak}</div>
            <p className="text-xs text-muted-foreground">
              Days with activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Study Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'duration' ? `${value} minutes` : value,
                    name === 'duration' ? 'Study Time' : 'Sessions'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="duration" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Study Time by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} minutes`, 'Study Time']} />
                <Bar dataKey="duration" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Distribution and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Session Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {difficultyData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`p-3 rounded-lg border text-center ${
                    achievement.completed 
                      ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {achievement.completed ? achievement.icon : '⚪'}
                  </div>
                  <div className={`text-sm ${
                    achievement.completed 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-muted-foreground'
                  }`}>
                    {achievement.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectData.map((subject) => {
              const percentage = Math.round((subject.duration / totalStudyTime) * 100);
              return (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{subject.subject}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {subject.sessions} sessions
                      </span>
                    </div>
                    <span className="text-sm">
                      {Math.floor(subject.duration / 60)}h {subject.duration % 60}m ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}