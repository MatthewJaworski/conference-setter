import { SpeakerEntity } from '@/modules/speakers/entities/speaker.entity';

export type SpeakerMockData = Omit<SpeakerEntity, 'id'>;

export const mockSpeakers: SpeakerMockData[] = [
  {
    email: 'sarah.johnson@techconf.com',
    fullName: 'Sarah Johnson',
    bio: 'Senior Software Architect with 15 years of experience in cloud-native applications and microservices architecture.',
    avatarUrl: 'https://example.com/avatars/sarah-johnson.jpg',
  },
  {
    email: 'michael.chen@devops.io',
    fullName: 'Michael Chen',
    bio: 'DevOps expert specializing in Kubernetes, CI/CD pipelines, and infrastructure automation.',
    avatarUrl: 'https://example.com/avatars/michael-chen.jpg',
  },
  {
    email: 'emily.rodriguez@business.com',
    fullName: 'Emily Rodriguez',
    bio: 'Business strategist and entrepreneur with multiple successful startups. Forbes 30 Under 30.',
    avatarUrl: 'https://example.com/avatars/emily-rodriguez.jpg',
  },
  {
    email: 'david.kim@startup.ventures',
    fullName: 'David Kim',
    bio: 'Venture capitalist and startup mentor. Former CEO of multiple tech companies.',
    avatarUrl: 'https://example.com/avatars/david-kim.jpg',
  },
  {
    email: 'dr.maria.silva@university.edu',
    fullName: 'Dr. Maria Silva',
    bio: 'Professor of Computer Science specializing in artificial intelligence and machine learning research.',
    avatarUrl: 'https://example.com/avatars/maria-silva.jpg',
  },
  {
    email: 'james.wilson@datascience.org',
    fullName: 'James Wilson',
    bio: 'Data scientist and author of "Modern Data Analytics". Expert in big data and statistical modeling.',
    avatarUrl: 'https://example.com/avatars/james-wilson.jpg',
  },
];
