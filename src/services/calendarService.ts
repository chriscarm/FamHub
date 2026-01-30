import { getValidAccessToken } from './authService';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor: string;
  foregroundColor: string;
  accessRole: 'owner' | 'writer' | 'reader' | 'freeBusyReader';
  primary?: boolean;
  selected?: boolean;
}

export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;  // For timed events
    date?: string;      // For all-day events
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  organizer?: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  created?: string;
  updated?: string;
  calendarId?: string; // Added when fetching
}

export interface FetchCalendarsResult {
  calendars: GoogleCalendar[];
  error?: string;
}

export interface FetchEventsResult {
  events: GoogleEvent[];
  error?: string;
}

// Fetch all calendars for an account
export async function fetchCalendars(accountId: string): Promise<FetchCalendarsResult> {
  const accessToken = await getValidAccessToken(accountId);

  if (!accessToken) {
    return { calendars: [], error: 'No valid access token' };
  }

  try {
    const response = await fetch(`${CALENDAR_API_BASE}/users/me/calendarList`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { calendars: [], error: `Failed to fetch calendars: ${error}` };
    }

    const data = await response.json();
    const calendars: GoogleCalendar[] = (data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary || item.summaryOverride || 'Untitled',
      description: item.description,
      backgroundColor: item.backgroundColor || '#4285f4',
      foregroundColor: item.foregroundColor || '#ffffff',
      accessRole: item.accessRole,
      primary: item.primary || false,
      selected: item.selected || false,
    }));

    return { calendars };
  } catch (error) {
    return { calendars: [], error: `Network error: ${error}` };
  }
}

// Fetch events from a specific calendar
export async function fetchCalendarEvents(
  accountId: string,
  calendarId: string,
  timeMin?: Date,
  timeMax?: Date
): Promise<FetchEventsResult> {
  const accessToken = await getValidAccessToken(accountId);

  if (!accessToken) {
    return { events: [], error: 'No valid access token' };
  }

  // Default to fetching 1 month of events
  const now = new Date();
  const minDate = timeMin || new Date(now.getFullYear(), now.getMonth(), 1);
  const maxDate = timeMax || new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const params = new URLSearchParams({
    timeMin: minDate.toISOString(),
    timeMax: maxDate.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  try {
    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { events: [], error: `Failed to fetch events: ${error}` };
    }

    const data = await response.json();
    const events: GoogleEvent[] = (data.items || [])
      .filter((item: any) => item.status !== 'cancelled')
      .map((item: any) => ({
        id: item.id,
        summary: item.summary || 'No Title',
        description: item.description,
        location: item.location,
        start: item.start,
        end: item.end,
        attendees: item.attendees,
        organizer: item.organizer,
        status: item.status || 'confirmed',
        htmlLink: item.htmlLink,
        created: item.created,
        updated: item.updated,
        calendarId,
      }));

    return { events };
  } catch (error) {
    return { events: [], error: `Network error: ${error}` };
  }
}

// Fetch events from multiple calendars
export async function fetchAllEvents(
  accountId: string,
  calendarIds: string[],
  timeMin?: Date,
  timeMax?: Date
): Promise<FetchEventsResult> {
  const results = await Promise.all(
    calendarIds.map(calendarId =>
      fetchCalendarEvents(accountId, calendarId, timeMin, timeMax)
    )
  );

  const allEvents: GoogleEvent[] = [];
  const errors: string[] = [];

  results.forEach(result => {
    if (result.error) {
      errors.push(result.error);
    }
    allEvents.push(...result.events);
  });

  // Sort all events by start time
  allEvents.sort((a, b) => {
    const aTime = a.start.dateTime || a.start.date || '';
    const bTime = b.start.dateTime || b.start.date || '';
    return aTime.localeCompare(bTime);
  });

  return {
    events: allEvents,
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}

// Convert Google event to app CalendarEvent format
export function convertGoogleEventToCalendarEvent(
  googleEvent: GoogleEvent,
  accountId: string,
  accountColor: string,
  accountName: string,
  accountPicture?: string
): any {
  // Parse date from Google event
  const startDate = googleEvent.start.dateTime || googleEvent.start.date || '';
  let date: string;
  let time: string | undefined;

  if (googleEvent.start.dateTime) {
    // Timed event
    const d = new Date(googleEvent.start.dateTime);
    date = d.toISOString().split('T')[0];
    time = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else {
    // All-day event
    date = googleEvent.start.date || '';
  }

  return {
    id: `${accountId}_${googleEvent.id}`,
    title: googleEvent.summary,
    date,
    time,
    person: accountName.toLowerCase().split(' ')[0] as any, // Use first name as person
    // Extended properties for Google integration
    accountId,
    accountColor,
    accountName,
    accountPicture,
    googleEventId: googleEvent.id,
    calendarId: googleEvent.calendarId,
    location: googleEvent.location,
    description: googleEvent.description,
  };
}

// Sync all events from all accounts
export async function syncAllAccountEvents(
  accounts: Array<{
    id: string;
    name: string;
    color: string;
    picture?: string;
    selectedCalendarIds: string[];
  }>,
  timeMin?: Date,
  timeMax?: Date
): Promise<{ events: any[]; errors: string[] }> {
  const allEvents: any[] = [];
  const errors: string[] = [];

  for (const account of accounts) {
    if (account.selectedCalendarIds.length === 0) {
      continue;
    }

    const result = await fetchAllEvents(
      account.id,
      account.selectedCalendarIds,
      timeMin,
      timeMax
    );

    if (result.error) {
      errors.push(`${account.name}: ${result.error}`);
    }

    // Convert events to app format
    const convertedEvents = result.events.map(event =>
      convertGoogleEventToCalendarEvent(
        event,
        account.id,
        account.color,
        account.name,
        account.picture
      )
    );

    allEvents.push(...convertedEvents);
  }

  // Sort all events by date and time
  allEvents.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });

  return { events: allEvents, errors };
}
