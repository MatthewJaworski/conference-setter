import { ConferenceEntity } from '@/modules/conferences/entities/conference.entity';

export type ConferenceMockData = Omit<ConferenceEntity, 'id' | 'host' | 'hostId'> & {
  hostIndex: number;
};

export const mockConferences: ConferenceMockData[] = [
  {
    hostIndex: 0, // Tech Innovators Inc.
    name: 'TechCon 2026',
    description:
      'Annual technology conference featuring the latest in AI, cloud computing, and software development.',
    location: 'San Francisco, CA',
    logoUrl: 'https://example.com/logos/techcon2026.png',
    participantsLimit: 500,
    from: new Date('2026-03-15T09:00:00Z'),
    to: new Date('2026-03-17T18:00:00Z'),
  },
  {
    hostIndex: 0, // Tech Innovators Inc.
    name: 'DevOps Summit 2026',
    description: 'Deep dive into DevOps practices, CI/CD, and container orchestration.',
    location: 'Austin, TX',
    logoUrl: 'https://example.com/logos/devops2026.png',
    participantsLimit: 300,
    from: new Date('2026-05-20T08:00:00Z'),
    to: new Date('2026-05-22T17:00:00Z'),
  },
  {
    hostIndex: 1, // Business Leaders Forum
    name: 'Global Business Forum 2026',
    description:
      'International forum for business leaders to discuss global economic trends and strategies.',
    location: 'New York, NY',
    logoUrl: 'https://example.com/logos/gbf2026.png',
    participantsLimit: 1000,
    from: new Date('2026-04-10T09:00:00Z'),
    to: new Date('2026-04-12T18:00:00Z'),
  },
  {
    hostIndex: 1, // Business Leaders Forum
    name: 'Startup Connect 2026',
    description: 'Networking conference for startups, investors, and entrepreneurs.',
    location: 'Boston, MA',
    logoUrl: 'https://example.com/logos/startup2026.png',
    participantsLimit: 250,
    from: new Date('2026-06-05T10:00:00Z'),
    to: new Date('2026-06-06T19:00:00Z'),
  },
  {
    hostIndex: 2, // Academic Research Society
    name: 'International Research Symposium 2026',
    description:
      'Academic conference presenting cutting-edge research across multiple disciplines.',
    location: 'Cambridge, UK',
    logoUrl: 'https://example.com/logos/research2026.png',
    participantsLimit: 400,
    from: new Date('2026-07-14T08:00:00Z'),
    to: new Date('2026-07-18T17:00:00Z'),
  },
  {
    hostIndex: 2, // Academic Research Society
    name: 'Data Science Conference 2026',
    description: 'Conference focused on data science, machine learning, and statistical analysis.',
    location: 'Seattle, WA',
    logoUrl: 'https://example.com/logos/datascience2026.png',
    participantsLimit: 350,
    from: new Date('2026-09-08T09:00:00Z'),
    to: new Date('2026-09-10T18:00:00Z'),
  },
];
