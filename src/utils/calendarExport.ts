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

export function exportToICS(sessions: StudySession[], filename: string = 'study-sessions.ics') {
  const icsContent = generateICSContent(sessions);
  downloadICS(icsContent, filename);
}

export function exportSingleSessionToICS(session: StudySession) {
  const icsContent = generateICSContent([session]);
  const filename = `${session.subject}-${session.topic}.ics`.replace(/\s+/g, '-').toLowerCase();
  downloadICS(icsContent, filename);
}

function generateICSContent(sessions: StudySession[]): string {
  const events = sessions.map(session => generateEvent(session)).join('\n');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//StudySmart//Study Scheduler//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events}
END:VCALENDAR`;
}

function generateEvent(session: StudySession): string {
  const startDate = new Date(session.startTime);
  const endDate = new Date(startDate.getTime() + session.duration * 60000);
  
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  };

  let description = `Study session: ${session.topic}`;
  if (session.description) {
    description += `\\n\\n${escapeText(session.description)}`;
  }
  if (session.goals && session.goals.length > 0) {
    description += `\\n\\nGoals:\\n${session.goals.map(g => `- ${escapeText(g)}`).join('\\n')}`;
  }
  description += `\\n\\nDifficulty: ${session.difficulty}`;

  return `BEGIN:VEVENT
UID:${session.id}@studysmart.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${escapeText(`${session.subject}: ${session.topic}`)}
DESCRIPTION:${description}
STATUS:${session.completed ? 'CONFIRMED' : 'TENTATIVE'}
CATEGORIES:Study,${session.subject},${session.difficulty}
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Study session starting in 15 minutes
ACTION:DISPLAY
END:VALARM
END:VEVENT`;
}

function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
}

export function getGoogleCalendarUrl(session: StudySession): string {
  const startDate = new Date(session.startTime);
  const endDate = new Date(startDate.getTime() + session.duration * 60000);
  
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${session.subject}: ${session.topic}`,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: session.description || `Study session for ${session.topic}`,
    location: 'Study Area',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getOutlookCalendarUrl(session: StudySession): string {
  const startDate = new Date(session.startTime);
  const endDate = new Date(startDate.getTime() + session.duration * 60000);
  
  const formatOutlookDate = (date: Date): string => {
    return date.toISOString();
  };

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `${session.subject}: ${session.topic}`,
    startdt: formatOutlookDate(startDate),
    enddt: formatOutlookDate(endDate),
    body: session.description || `Study session for ${session.topic}`,
    location: 'Study Area',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
