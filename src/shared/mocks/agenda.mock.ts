import { AgendaTrackEntity } from '@/modules/agenda/entities/agenda-track.entity';
import { PlaceholderAgendaSlotEntity } from '@/modules/agenda/entities/placeholder-agenda-slot.entity';
import { RegularAgendaSlotEntity } from '@/modules/agenda/entities/regular-agenda-slot.entity';

export type AgendaTrackMockData = Omit<
  AgendaTrackEntity,
  'id' | 'conference' | 'slots' | 'conferenceId'
> & {
  conferenceIndex: number;
};

export type PlaceholderSlotMockData = Omit<
  PlaceholderAgendaSlotEntity,
  'id' | 'track' | 'trackId'
> & {
  trackIndex: number;
};

export type RegularSlotMockData = Omit<
  RegularAgendaSlotEntity,
  'id' | 'track' | 'agendaItem' | 'trackId' | 'agendaItemId'
> & {
  trackIndex: number;
  agendaItemIndex: number;
};

export const mockAgendaTracks: AgendaTrackMockData[] = [
  {
    conferenceIndex: 0, // TechCon 2026
    name: 'Main Stage',
    version: 0,
  },
  {
    conferenceIndex: 0, // TechCon 2026
    name: 'Workshop Room A',
    version: 0,
  },
  {
    conferenceIndex: 1, // DevOps Summit 2026
    name: 'Technical Track',
    version: 0,
  },
  {
    conferenceIndex: 2, // Global Business Forum 2026
    name: 'Executive Hall',
    version: 0,
  },
  {
    conferenceIndex: 3, // Startup Connect 2026
    name: 'Pitch Arena',
    version: 0,
  },
  {
    conferenceIndex: 4, // International Research Symposium 2026
    name: 'Research Hall',
    version: 0,
  },
  {
    conferenceIndex: 5, // Data Science Conference 2026
    name: 'Analytics Track',
    version: 0,
  },
];

export const mockPlaceholderSlots: PlaceholderSlotMockData[] = [
  {
    trackIndex: 0, // TechCon Main Stage
    from: new Date('2026-03-15T09:00:00Z'),
    to: new Date('2026-03-15T09:30:00Z'),
    placeholder: 'Registration & Welcome Coffee',
  },
  {
    trackIndex: 0, // TechCon Main Stage
    from: new Date('2026-03-15T12:00:00Z'),
    to: new Date('2026-03-15T13:00:00Z'),
    placeholder: 'Lunch Break',
  },
  {
    trackIndex: 1, // TechCon Workshop Room A
    from: new Date('2026-03-15T10:30:00Z'),
    to: new Date('2026-03-15T10:45:00Z'),
    placeholder: 'Coffee Break',
  },
  {
    trackIndex: 2, // DevOps Technical Track
    from: new Date('2026-05-20T12:00:00Z'),
    to: new Date('2026-05-20T13:00:00Z'),
    placeholder: 'Networking Lunch',
  },
  {
    trackIndex: 3, // Global Business Executive Hall
    from: new Date('2026-04-10T15:00:00Z'),
    to: new Date('2026-04-10T15:30:00Z'),
    placeholder: 'Afternoon Tea Break',
  },
];

export const mockRegularSlots: RegularSlotMockData[] = [
  {
    trackIndex: 0, // TechCon Main Stage
    from: new Date('2026-03-15T09:30:00Z'),
    to: new Date('2026-03-15T10:30:00Z'),
    participantsLimit: 500,
    agendaItemIndex: 0, // Opening Keynote: The Future of AI
  },
  {
    trackIndex: 0, // TechCon Main Stage
    from: new Date('2026-03-15T10:45:00Z'),
    to: new Date('2026-03-15T11:45:00Z'),
    participantsLimit: 500,
    agendaItemIndex: 1, // Building Scalable Microservices
  },
  {
    trackIndex: 1, // TechCon Workshop Room A
    from: new Date('2026-03-15T14:00:00Z'),
    to: new Date('2026-03-15T17:00:00Z'),
    participantsLimit: 50,
    agendaItemIndex: 2, // Workshop: Kubernetes Deep Dive
  },
  {
    trackIndex: 2, // DevOps Technical Track
    from: new Date('2026-05-20T09:00:00Z'),
    to: new Date('2026-05-20T10:30:00Z'),
    participantsLimit: 300,
    agendaItemIndex: 3, // CI/CD Pipeline Automation
  },
  {
    trackIndex: 2, // DevOps Technical Track
    from: new Date('2026-05-20T10:45:00Z'),
    to: new Date('2026-05-20T12:00:00Z'),
    participantsLimit: 300,
    agendaItemIndex: 4, // Infrastructure as Code Best Practices
  },
  {
    trackIndex: 3, // Global Business Executive Hall
    from: new Date('2026-04-10T09:00:00Z'),
    to: new Date('2026-04-10T10:30:00Z'),
    participantsLimit: 1000,
    agendaItemIndex: 5, // Global Economic Trends 2026
  },
  {
    trackIndex: 3, // Global Business Executive Hall
    from: new Date('2026-04-10T10:45:00Z'),
    to: new Date('2026-04-10T12:15:00Z'),
    participantsLimit: 1000,
    agendaItemIndex: 6, // Leadership in the Digital Age
  },
  {
    trackIndex: 4, // Startup Pitch Arena
    from: new Date('2026-06-05T10:00:00Z'),
    to: new Date('2026-06-05T11:30:00Z'),
    participantsLimit: 250,
    agendaItemIndex: 7, // Pitching to Investors
  },
  {
    trackIndex: 4, // Startup Pitch Arena
    from: new Date('2026-06-05T13:00:00Z'),
    to: new Date('2026-06-05T14:30:00Z'),
    participantsLimit: 250,
    agendaItemIndex: 8, // Building a Successful Startup
  },
  {
    trackIndex: 5, // Research Hall
    from: new Date('2026-07-14T09:00:00Z'),
    to: new Date('2026-07-14T10:30:00Z'),
    participantsLimit: 400,
    agendaItemIndex: 9, // Advances in Machine Learning Research
  },
  {
    trackIndex: 6, // Analytics Track
    from: new Date('2026-09-08T09:00:00Z'),
    to: new Date('2026-09-08T10:30:00Z'),
    participantsLimit: 350,
    agendaItemIndex: 10, // Big Data Analytics at Scale
  },
  {
    trackIndex: 6, // Analytics Track
    from: new Date('2026-09-08T11:00:00Z'),
    to: new Date('2026-09-08T12:30:00Z'),
    participantsLimit: 350,
    agendaItemIndex: 11, // Statistical Modeling for Data Scientists
  },
];
