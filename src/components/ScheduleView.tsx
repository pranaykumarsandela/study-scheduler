import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight, Plus, Download, ExternalLink, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useState } from "react";
import { exportSingleSessionToICS, getGoogleCalendarUrl, getOutlookCalendarUrl } from "../utils/calendarExport";
import { toast } from "sonner@2.0.3";

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  startTime: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ScheduleViewProps {
  sessions: StudySession[];
  onAddSession: () => void;
  onEditSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function ScheduleView({ sessions, onAddSession, onEditSession, onDeleteSession }: ScheduleViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);
  const today = new Date().toDateString();

  const getSessionsForDay = (date: Date) => {
    return sessions
      .filter(session => new Date(session.startTime).toDateString() === date.toDateString())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete);
      toast.success('Session deleted');
    }
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Study Schedule</h1>
          <p className="text-muted-foreground">
            Week of {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={onAddSession} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Session
          </Button>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const daySessions = getSessionsForDay(date);
          const isToday = date.toDateString() === today;
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNumber = date.getDate();

          return (
            <Card key={index} className={isToday ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-center">
                  <div className={`text-sm ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {dayName}
                  </div>
                  <div className={`text-lg ${isToday ? 'text-primary' : ''}`}>
                    {dayNumber}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {daySessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No sessions
                    </div>
                  ) : (
                    daySessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-lg border hover:bg-accent transition-colors ${
                          session.completed ? 'bg-muted/50' : 'bg-background'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${session.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {session.topic}
                            </span>
                            <div className="flex items-center gap-2">
                              {session.completed && (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs h-6 w-6 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                                    <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z" fill="currentColor"/>
                                  </svg>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onEditSession(session.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Session
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      window.open(getGoogleCalendarUrl(session), '_blank');
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Google Calendar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      window.open(getOutlookCalendarUrl(session), '_blank');
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Outlook Calendar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      exportSingleSessionToICS(session);
                                      toast.success('Session exported as .ics file');
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download .ics file
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(session.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Session
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {session.subject}
                            </Badge>
                            <Badge 
                              variant={session.difficulty === 'hard' ? 'destructive' : 
                                      session.difficulty === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {session.difficulty}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(session.startTime)} · {session.duration}m
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl">
                {sessions.filter(s => {
                  const sessionDate = new Date(s.startTime);
                  return weekDates.some(date => date.toDateString() === sessionDate.toDateString()) && s.completed;
                }).length}
              </div>
              <p className="text-sm text-muted-foreground">Sessions Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl">
                {Math.floor(sessions
                  .filter(s => {
                    const sessionDate = new Date(s.startTime);
                    return weekDates.some(date => date.toDateString() === sessionDate.toDateString()) && s.completed;
                  })
                  .reduce((acc, s) => acc + s.duration, 0) / 60)}h
              </div>
              <p className="text-sm text-muted-foreground">Total Study Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl">
                {new Set(sessions
                  .filter(s => {
                    const sessionDate = new Date(s.startTime);
                    return weekDates.some(date => date.toDateString() === sessionDate.toDateString());
                  })
                  .map(s => s.subject)
                ).size}
              </div>
              <p className="text-sm text-muted-foreground">Active Subjects</p>
            </div>
            <div className="text-center">
              <div className="text-2xl">
                {weekDates.filter(date => 
                  sessions.some(s => 
                    new Date(s.startTime).toDateString() === date.toDateString() && s.completed
                  )
                ).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Study Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this study session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}