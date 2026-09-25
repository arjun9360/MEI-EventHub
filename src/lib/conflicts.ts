import { events as defaultEvents, venues as defaultVenues, type Event, type Venue } from '@/data/mockData';

export interface ScheduleCandidate {
  date: string;
  start: string;
  end: string;
  venue: string;
  organizer: string;
  capacity: number;
  excludeEventId?: string;
}

export interface Conflict {
  type: 'venue' | 'organizer' | 'capacity' | 'schedule';
  message: string;
  event?: string;
}

export interface Alternative {
  venue: string;
  start: string;
  end: string;
  reason: string;
}

export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  toMinutes(aStart) < toMinutes(bEnd) && toMinutes(aEnd) > toMinutes(bStart);

export function detectConflicts(
  candidate: ScheduleCandidate,
  allEvents: Event[] = defaultEvents,
  allVenues: Venue[] = defaultVenues
): Conflict[] {
  const conflicts: Conflict[] = [];
  const matchedVenue = allVenues.find((v) => v.name === candidate.venue);

  if (matchedVenue && candidate.capacity > matchedVenue.capacity) {
    conflicts.push({
      type: 'capacity',
      message: `Expected attendance (${candidate.capacity}) exceeds ${matchedVenue.name}'s capacity (${matchedVenue.capacity} seats).`,
    });
  }

  allEvents
    .filter(
      (e) =>
        e.id !== candidate.excludeEventId &&
        e.date === candidate.date &&
        !['cancelled', 'completed'].includes(e.status)
    )
    .forEach((event) => {
      if (!overlaps(candidate.start, candidate.end, event.time, event.endTime)) return;

      if (event.venue === candidate.venue) {
        conflicts.push({
          type: 'venue',
          event: event.title,
          message: `"${event.title}" already occupies ${event.venue} from ${event.time}–${event.endTime}.`,
        });
      }

      if (
        candidate.organizer &&
        event.organizer &&
        event.organizer.trim().toLowerCase() === candidate.organizer.trim().toLowerCase()
      ) {
        conflicts.push({
          type: 'organizer',
          event: event.title,
          message: `${candidate.organizer} is already assigned to "${event.title}" during ${event.time}–${event.endTime}.`,
        });
      }
    });

  return conflicts;
}

export function suggestAlternatives(
  candidate: ScheduleCandidate,
  allEvents: Event[] = defaultEvents,
  allVenues: Venue[] = defaultVenues
): Alternative[] {
  const alternatives: Alternative[] = [];

  // 1. Available alternative venues during same time slot with sufficient capacity
  const suitableVenues = allVenues
    .filter((v) => v.active && v.capacity >= candidate.capacity && v.name !== candidate.venue)
    .filter(
      (v) =>
        !allEvents.some(
          (e) =>
            e.id !== candidate.excludeEventId &&
            e.date === candidate.date &&
            e.venue === v.name &&
            !['cancelled', 'completed'].includes(e.status) &&
            overlaps(candidate.start, candidate.end, e.time, e.endTime)
        )
    );

  suitableVenues.slice(0, 2).forEach((v) => {
    alternatives.push({
      venue: v.name,
      start: candidate.start,
      end: candidate.end,
      reason: `Available at requested time · ${v.capacity} seats · ${v.type}`,
    });
  });

  // 2. Next available time slot at same venue or afternoon slot
  const duration = toMinutes(candidate.end) - toMinutes(candidate.start);
  const shiftedStart = '14:00';
  const shiftedEndMin = 14 * 60 + (duration > 0 ? duration : 120);
  const shiftedEnd = `${String(Math.floor(shiftedEndMin / 60)).padStart(2, '0')}:${String(
    shiftedEndMin % 60
  ).padStart(2, '0')}`;

  const sameVenueAfternoonFree = !allEvents.some(
    (e) =>
      e.id !== candidate.excludeEventId &&
      e.date === candidate.date &&
      e.venue === candidate.venue &&
      !['cancelled', 'completed'].includes(e.status) &&
      overlaps(shiftedStart, shiftedEnd, e.time, e.endTime)
  );

  if (sameVenueAfternoonFree) {
    alternatives.push({
      venue: candidate.venue,
      start: shiftedStart,
      end: shiftedEnd,
      reason: `Same venue (${candidate.venue}) during afternoon window (2:00 PM – 4:00 PM)`,
    });
  } else {
    alternatives.push({
      venue: 'Conference Hall',
      start: '10:30',
      end: '12:30',
      reason: 'Conference Hall · Available 10:30 AM – 12:30 PM',
    });
  }

  return alternatives;
}
