import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, BookOpen, Calendar, CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface StudyPlanDay {
  day: number;
  topics: string[];
  focus: string;
}

interface StudyPlanGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSessions: (sessions: any[]) => void;
}

export function StudyPlanGenerator({ open, onOpenChange, onCreateSessions }: StudyPlanGeneratorProps) {
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('7');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlanDay[] | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  const csSubjects = [
    'Data Structures',
    'Algorithms',
    'Operating Systems',
    'Database Management',
    'Computer Networks',
    'Machine Learning',
    'Web Development',
    'Python Programming',
    'Java Programming',
    'C++ Programming',
    'Software Engineering',
    'Artificial Intelligence',
    'Cloud Computing',
    'Cybersecurity'
  ];

  const handleGenerate = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    setLoading(true);
    setPlan(null);
    setSelectedTopics(new Set());

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-21f11fcf/generate-study-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            subject,
            duration: parseInt(duration)
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate study plan');
      }

      const data = await response.json();

      if (data.success) {
        setPlan(data.plan);
        toast.success('Study plan generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate study plan');
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (dayIndex: number, topicIndex: number) => {
    const key = `${dayIndex}-${topicIndex}`;
    const newSelected = new Set(selectedTopics);
    
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    
    setSelectedTopics(newSelected);
  };

  const handleCreateSessions = () => {
    if (!plan || selectedTopics.size === 0) {
      toast.error('Please select at least one topic');
      return;
    }

    const sessions: any[] = [];
    const now = new Date();

    plan.forEach((dayPlan, dayIndex) => {
      dayPlan.topics.forEach((topic, topicIndex) => {
        const key = `${dayIndex}-${topicIndex}`;
        if (selectedTopics.has(key)) {
          // Create session for selected day
          const sessionDate = new Date(now);
          sessionDate.setDate(now.getDate() + dayPlan.day);
          sessionDate.setHours(9, 0, 0, 0); // Default to 9 AM

          sessions.push({
            subject: subject,
            topic: topic,
            duration: 60, // Default 1 hour
            startTime: sessionDate.toISOString(),
            difficulty: dayPlan.focus === 'Foundation' ? 'easy' : 
                       dayPlan.focus === 'Advanced Concepts' ? 'hard' : 'medium',
            description: `Day ${dayPlan.day}: ${dayPlan.focus}`,
            goals: [topic]
          });
        }
      });
    });

    if (sessions.length > 0) {
      onCreateSessions(sessions);
      toast.success(`Created ${sessions.length} study sessions!`);
      handleReset();
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setSubject('');
    setDuration('7');
    setPlan(null);
    setSelectedTopics(new Set());
  };

  const selectAllDay = (dayIndex: number) => {
    if (!plan) return;
    
    const newSelected = new Set(selectedTopics);
    const dayPlan = plan[dayIndex];
    
    dayPlan.topics.forEach((_, topicIndex) => {
      newSelected.add(`${dayIndex}-${topicIndex}`);
    });
    
    setSelectedTopics(newSelected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Study Plan Generator
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive day-by-day study plan for computer science subjects
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <div className="space-y-2">
                <Input
                  id="subject"
                  placeholder="e.g., Data Structures"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={loading}
                />
                <div className="flex flex-wrap gap-1">
                  {csSubjects.slice(0, 6).map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => setSubject(s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Days)</Label>
              <Select value={duration} onValueChange={setDuration} disabled={loading}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days (1 week)</SelectItem>
                  <SelectItem value="14">14 days (2 weeks)</SelectItem>
                  <SelectItem value="21">21 days (3 weeks)</SelectItem>
                  <SelectItem value="30">30 days (1 month)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !subject.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Study Plan
              </>
            )}
          </Button>

          {/* Plan Display */}
          {plan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg">Study Plan for {subject}</h3>
                </div>
                <Badge variant="secondary">
                  {selectedTopics.size} topics selected
                </Badge>
              </div>

              <div className="space-y-3">
                {plan.map((dayPlan, dayIndex) => (
                  <Card key={dayIndex}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span>Day {dayPlan.day}</span>
                              <Badge variant="outline" className="text-xs">
                                {dayPlan.focus}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {dayPlan.topics.length} topic{dayPlan.topics.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectAllDay(dayIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add All
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {dayPlan.topics.map((topic, topicIndex) => {
                          const key = `${dayIndex}-${topicIndex}`;
                          const isSelected = selectedTopics.has(key);

                          return (
                            <div
                              key={topicIndex}
                              className={`p-2 rounded-md border cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-primary/5 border-primary'
                                  : 'hover:bg-accent border-transparent'
                              }`}
                              onClick={() => toggleTopic(dayIndex, topicIndex)}
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                  {isSelected ? (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                                  )}
                                </div>
                                <span className="text-sm flex-1">{topic}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateSessions}
                  disabled={selectedTopics.size === 0}
                  className="flex-1"
                >
                  Create {selectedTopics.size} Study Session{selectedTopics.size !== 1 ? 's' : ''}
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
