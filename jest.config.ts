import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '<rootDir>/src/**/**.ts',
    '!<rootDir>/src/@types/**/**.ts',
    '!<rootDir>/src/**/domain/**/**.ts',
    '!<rootDir>/src/**/models/**/**.ts',
    '!<rootDir>/src/shared/infra/typeorm/**/**.ts',
  ],
  coverageReporters: ['text-summary', 'lcov'],
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  testTimeout: 20000,
};

export default config;
