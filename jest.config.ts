import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '<rootDir>/src/**/**.ts',
    '!<rootDir>/src/modules/**/domain/**/**.ts',
    '!<rootDir>/src/database/**/**.ts',
  ],
  coverageReporters: ['text-summary', 'lcov'],
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
};

export default config;
