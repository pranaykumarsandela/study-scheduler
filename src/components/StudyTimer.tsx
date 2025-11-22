import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Play, Pause, Square, RotateCcw, Coffee, BookOpen, Clock, Timer } from "lucide-react";

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  startTime: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface StudyTimerProps {
  session: StudySession;
  onComplete: (sessionId: string) => void;
  onClose: () => void;
}

type TimerMode = 'study' | 'break';
type TimerState = 'idle' | 'running' | 'paused' | 'completed';
type TimerType = 'custom' | 'pomodoro';

export function StudyTimer({ session, onComplete, onClose }: StudyTimerProps) {
  const [timerType, setTimerType] = useState<TimerType>('custom');
  const [mode, setMode] = useState<TimerMode>('study');
  const [state, setState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(session.duration * 60); // Convert to seconds
  const [totalTime, setTotalTime] = useState(session.duration * 60);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const pomodoroStudyDuration = 25 * 60; // 25 minutes
  const breakDuration = pomodoroCount > 0 && (pomodoroCount + 1) % 4 === 0 ? 15 * 60 : 5 * 60; // Long break every 4 pomodoros

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished
            if (mode === 'study') {
              setState('completed');
              return 0;
            } else {
              // Break finished, switch back to study
              setMode('study');
              setState('idle');
              if (timerType === 'pomodoro') {
                setTimeLeft(pomodoroStudyDuration);
                setTotalTime(pomodoroStudyDuration);
              } else {
                setTimeLeft(session.duration * 60);
                setTotalTime(session.duration * 60);
              }
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state, timeLeft, mode, timerType, session.duration, pomodoroStudyDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const handleStart = () => {
    setState('running');
  };

  const handlePause = () => {
    setState('paused');
  };

  const handleReset = () => {
    setState('idle');
    if (mode === 'study') {
      const studyTime = timerType === 'pomodoro' ? pomodoroStudyDuration : session.duration * 60;
      setTimeLeft(studyTime);
      setTotalTime(studyTime);
    } else {
      setTimeLeft(breakDuration);
      setTotalTime(breakDuration);
    }
  };

  const handleStop = () => {
    setState('idle');
    setMode('study');
    const studyTime = timerType === 'pomodoro' ? pomodoroStudyDuration : session.duration * 60;
    setTimeLeft(studyTime);
    setTotalTime(studyTime);
  };

  const handleTimerTypeChange = (type: TimerType) => {
    if (state !== 'idle') return; // Don't allow changing timer type while running
    setTimerType(type);
    setPomodoroCount(0);
    if (type === 'pomodoro') {
      setTimeLeft(pomodoroStudyDuration);
      setTotalTime(pomodoroStudyDuration);
    } else {
      setTimeLeft(session.duration * 60);
      setTotalTime(session.duration * 60);
    }
  };

  const handleComplete = () => {
    onComplete(session.id);
    onClose();
  };

  const startBreak = () => {
    setPomodoroCount(prev => prev + 1);
    setMode('break');
    setTimeLeft(breakDuration);
    setTotalTime(breakDuration);
    setState('running');
  };

  const skipBreak = () => {
    setMode('study');
    const studyTime = timerType === 'pomodoro' ? pomodoroStudyDuration : session.duration * 60;
    setTimeLeft(studyTime);
    setTotalTime(studyTime);
    setState('idle');
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {mode === 'study' ? (
              <BookOpen className="h-5 w-5" />
            ) : (
              <Coffee className="h-5 w-5" />
            )}
            <CardTitle>
              {mode === 'study' ? 'Study Session' : 'Break Time'}
            </CardTitle>
          </div>
          
          {mode === 'study' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <h3 className="text-lg">{session.topic}</h3>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary">{session.subject}</Badge>
                  <Badge 
                    variant={session.difficulty === 'hard' ? 'destructive' : 
                            session.difficulty === 'medium' ? 'default' : 'secondary'}
                  >
                    {session.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Timer Type Selector */}
              {state === 'idle' && (
                <Tabs value={timerType} onValueChange={(v) => handleTimerTypeChange(v as TimerType)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="custom" className="gap-2">
                      <Clock className="h-4 w-4" />
                      Custom ({session.duration}m)
                    </TabsTrigger>
                    <TabsTrigger value="pomodoro" className="gap-2">
                      <Timer className="h-4 w-4" />
                      Pomodoro (25m)
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {state !== 'idle' && timerType === 'pomodoro' && (
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Timer className="h-3 w-3" />
                    Pomodoro Mode
                  </Badge>
                  {pomodoroCount > 0 && (
                    <Badge variant="secondary">
                      Session #{pomodoroCount + 1}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === 'break' && timerType === 'pomodoro' && (
            <div className="text-sm text-muted-foreground">
              Pomodoro #{pomodoroCount} complete • {(pomodoroCount) % 4 === 0 ? 'Long' : 'Short'} break
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-mono mb-4 tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <Progress value={getProgress()} className="mb-4" />
            <div className="text-sm text-muted-foreground">
              {mode === 'study' ? 'Time to study' : 'Break time'} • {formatTime(totalTime)} total
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-2">
            {state === 'idle' && (
              <Button onClick={handleStart} className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}
            
            {state === 'running' && (
              <Button onClick={handlePause} variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            
            {state === 'paused' && (
              <>
                <Button onClick={handleStart} className="gap-2">
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </>
            )}

            {(state === 'running' || state === 'paused') && (
              <Button onClick={handleStop} variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>

          {/* Session Completed */}
          {state === 'completed' && mode === 'study' && (
            <div className="text-center space-y-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h3 className="text-lg text-green-700 dark:text-green-300">
                Study Session Complete! 🎉
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Great job studying {session.topic}. Take a well-deserved break!
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={startBreak} className="gap-2">
                  <Coffee className="h-4 w-4" />
                  Start {pomodoroCount > 0 && (pomodoroCount + 1) % 4 === 0 ? '15min' : '5min'} Break
                </Button>
                <Button onClick={skipBreak} variant="outline">
                  Skip Break
                </Button>
                <Button onClick={handleComplete} variant="default">
                  Mark Complete
                </Button>
              </div>
            </div>
          )}

          {/* Study Tips */}
          {state === 'idle' && mode === 'study' && (
            <div className="text-center space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">
                {timerType === 'pomodoro' ? 'Pomodoro Technique' : 'Study Tips'}
              </h4>
              <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                {timerType === 'pomodoro' ? (
                  <>
                    <p>• Focus for 25 minutes without interruption</p>
                    <p>• Take a 5-minute break after each session</p>
                    <p>• Long 15-minute break after 4 sessions</p>
                    <p>• Track your progress with each pomodoro</p>
                  </>
                ) : (
                  <>
                    <p>• Remove distractions and focus on the task</p>
                    <p>• Take notes and review actively</p>
                    <p>• Take regular breaks to stay fresh</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Break Tips */}
          {mode === 'break' && (
            <div className="text-center space-y-2 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <h4 className="font-medium text-orange-700 dark:text-orange-300">Break Time!</h4>
              <div className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                <p>• Stand up and stretch</p>
                <p>• Get some fresh air</p>
                <p>• Stay hydrated</p>
                <p>• Avoid screens if possible</p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="text-center">
            <Button onClick={onClose} variant="ghost">
              Close Timer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}