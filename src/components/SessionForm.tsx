import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { X, Plus, Clock, Calendar, BookOpen } from "lucide-react";

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

interface SessionFormProps {
  session?: StudySession;
  subjects: string[];
  onSave: (session: Omit<StudySession, 'id' | 'completed'>) => void;
  onCancel: () => void;
  onAddSubject: (subject: string) => void;
}

export function SessionForm({ session, subjects, onSave, onCancel, onAddSubject }: SessionFormProps) {
  const [formData, setFormData] = useState({
    subject: session?.subject || '',
    topic: session?.topic || '',
    duration: session?.duration || 60,
    startTime: session?.startTime || new Date().toISOString().slice(0, 16),
    difficulty: session?.difficulty || 'medium' as const,
    description: session?.description || '',
    goals: session?.goals || [] as string[]
  });

  const [newSubject, setNewSubject] = useState('');
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      onAddSubject(newSubject.trim());
      setFormData({ ...formData, subject: newSubject.trim() });
      setNewSubject('');
      setShowNewSubject(false);
    }
  };

  const addGoal = () => {
    if (newGoal.trim() && !formData.goals.includes(newGoal.trim())) {
      setFormData({
        ...formData,
        goals: [...formData.goals, newGoal.trim()]
      });
      setNewGoal('');
    }
  };

  const removeGoal = (goalToRemove: string) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter(goal => goal !== goalToRemove)
    });
  };

  const suggestedDurations = [25, 45, 60, 90, 120];
  const suggestedTopics = [
    'Review chapter notes',
    'Practice problems',
    'Flashcard review',
    'Mock exam',
    'Research assignment',
    'Video lecture',
    'Group study session',
    'Lab work'
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {session ? 'Edit Study Session' : 'New Study Session'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Selection */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              {!showNewSubject ? (
                <div className="flex gap-2">
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewSubject(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Enter new subject"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                  />
                  <Button type="button" onClick={addSubject}>
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewSubject(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="What will you study?"
                required
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {suggestedTopics.slice(0, 4).map((topic) => (
                  <Button
                    key={topic}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setFormData({ ...formData, topic })}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration and Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {suggestedDurations.map((duration) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {duration} minutes
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">
                      <Badge variant="secondary">Easy</Badge>
                    </SelectItem>
                    <SelectItem value="medium">
                      <Badge variant="default">Medium</Badge>
                    </SelectItem>
                    <SelectItem value="hard">
                      <Badge variant="destructive">Hard</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes about this study session..."
                rows={3}
              />
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <Label>Study Goals</Label>
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a goal for this session"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                />
                <Button type="button" onClick={addGoal}>
                  Add Goal
                </Button>
              </div>
              {formData.goals.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.goals.map((goal) => (
                    <Badge key={goal} variant="outline" className="gap-1">
                      {goal}
                      <button
                        type="button"
                        onClick={() => removeGoal(goal)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {session ? 'Update Session' : 'Create Session'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}