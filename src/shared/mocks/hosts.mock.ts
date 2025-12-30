import { HostEntity } from '@/modules/conferences/entities/host.entity';

export type HostMockData = Omit<HostEntity, 'id' | 'conferences'>;

export const mockHosts: HostMockData[] = [
  {
    name: 'Tech Innovators Inc.',
    description:
      'Leading technology conference organizer specializing in software development and cloud computing.',
  },
  {
    name: 'Business Leaders Forum',
    description: 'Premier business conference organizer for executives and entrepreneurs.',
  },
  {
    name: 'Academic Research Society',
    description: 'Academic institution organizing research conferences and symposiums.',
  },
];
