// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { readFileSync } from 'node:fs';
import type { Config } from 'jest';

const config = JSON.parse(readFileSync(`${__dirname}/.swcrc`, 'utf-8'));

const jestConfig: Config = {
  setupFiles: ['<rootDir>/jest-setup-file.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  rootDir: 'src',
  coverageReporters: ['text', 'lcovonly', 'cobertura'],
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest', { ...config, sourceMaps: 'inline' }],
  },
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/modules/(.*)/types/*',
    '<rootDir>/modules/(.*)/models/*',
    '<rootDir>/modules/(.*)/schemas/*',
    '<rootDir>/modules/(.*)/enums/*',
    '<rootDir>/(.*)/*.module.ts',
    '<rootDir>/shared/mocks/*',
  ],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/$1',
  },
  clearMocks: true,
};

export default jestConfig;
