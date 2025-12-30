import { AgendaItemEntity } from '@/modules/agenda/entities/agenda-item.entity';

export type AgendaItemMockData = Omit<AgendaItemEntity, 'id' | 'conference' | 'conferenceId'> & {
  conferenceIndex: number;
  speakerIndices: number[];
};

export const mockAgendaItems: AgendaItemMockData[] = [
  {
    conferenceIndex: 0, // TechCon 2026
    title: 'Opening Keynote: The Future of AI',
    description:
      'Explore the latest advancements in artificial intelligence and their impact on society.',
    level: 1,
    tags: ['AI', 'Keynote', 'Future Tech'],
    speakerIndices: [4], // Dr. Maria Silva
    version: 0,
  },
  {
    conferenceIndex: 0, // TechCon 2026
    title: 'Building Scalable Microservices',
    description: 'Best practices for designing and implementing microservices architecture.',
    level: 3,
    tags: ['Microservices', 'Architecture', 'Cloud'],
    speakerIndices: [0], // Sarah Johnson
    version: 0,
  },
  {
    conferenceIndex: 0, // TechCon 2026
    title: 'Workshop: Kubernetes Deep Dive',
    description: 'Hands-on workshop covering advanced Kubernetes concepts and patterns.',
    level: 4,
    tags: ['Kubernetes', 'Workshop', 'DevOps'],
    speakerIndices: [1], // Michael Chen
    version: 0,
  },
  {
    conferenceIndex: 1, // DevOps Summit 2026
    title: 'CI/CD Pipeline Automation',
    description: 'Automating your deployment pipeline for maximum efficiency.',
    level: 3,
    tags: ['CI/CD', 'Automation', 'DevOps'],
    speakerIndices: [1], // Michael Chen
    version: 0,
  },
  {
    conferenceIndex: 1, // DevOps Summit 2026
    title: 'Infrastructure as Code Best Practices',
    description: 'Learn how to manage infrastructure using code with Terraform and Ansible.',
    level: 3,
    tags: ['IaC', 'Terraform', 'Automation'],
    speakerIndices: [0], // Sarah Johnson
    version: 0,
  },
  {
    conferenceIndex: 2, // Global Business Forum 2026
    title: 'Global Economic Trends 2026',
    description: 'Analysis of current global economic trends and future predictions.',
    level: 2,
    tags: ['Economy', 'Business', 'Trends'],
    speakerIndices: [2], // Emily Rodriguez
    version: 0,
  },
  {
    conferenceIndex: 2, // Global Business Forum 2026
    title: 'Leadership in the Digital Age',
    description: 'How to lead organizations through digital transformation.',
    level: 2,
    tags: ['Leadership', 'Digital', 'Management'],
    speakerIndices: [3], // David Kim
    version: 0,
  },
  {
    conferenceIndex: 3, // Startup Connect 2026
    title: 'Pitching to Investors',
    description: 'Master the art of pitching your startup to venture capitalists.',
    level: 2,
    tags: ['Startup', 'Investment', 'Pitch'],
    speakerIndices: [3], // David Kim
    version: 0,
  },
  {
    conferenceIndex: 3, // Startup Connect 2026
    title: 'Building a Successful Startup',
    description: 'Lessons learned from building multiple successful startups.',
    level: 2,
    tags: ['Startup', 'Entrepreneurship', 'Business'],
    speakerIndices: [2], // Emily Rodriguez
    version: 0,
  },
  {
    conferenceIndex: 4, // International Research Symposium 2026
    title: 'Advances in Machine Learning Research',
    description: 'Latest research findings in machine learning and deep learning.',
    level: 5,
    tags: ['Machine Learning', 'Research', 'AI'],
    speakerIndices: [4], // Dr. Maria Silva
    version: 0,
  },
  {
    conferenceIndex: 5, // Data Science Conference 2026
    title: 'Big Data Analytics at Scale',
    description: 'Processing and analyzing massive datasets efficiently.',
    level: 4,
    tags: ['Big Data', 'Analytics', 'Data Science'],
    speakerIndices: [5], // James Wilson
    version: 0,
  },
  {
    conferenceIndex: 5, // Data Science Conference 2026
    title: 'Statistical Modeling for Data Scientists',
    description: 'Advanced statistical techniques for modern data science.',
    level: 4,
    tags: ['Statistics', 'Data Science', 'Modeling'],
    speakerIndices: [5], // James Wilson
    version: 0,
  },
];
