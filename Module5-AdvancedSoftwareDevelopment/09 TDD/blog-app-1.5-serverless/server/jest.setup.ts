import nock from 'nock';
import { prismaMock } from './src/__mocks__/prisma';

// Ensure Nock cleans up after each test
afterEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

// Mock Prisma for all tests globally
jest.mock('./src/db/prisma', () => ({
  __esModule: true,
  default: prismaMock,
  prisma: prismaMock,
}));

jest.mock('./src/config/env.js', () => ({
  env: {
    NODE_ENV: 'test',
    JWT_ACCESS_SECRET: 'test-access-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    REDIS_URL: 'redis://localhost:6379',
    FRONTEND_URL: 'http://localhost:3000',
    PORT: 5000,
  }
}));

// Suppress console logs during tests to keep terminal clean (optional, remove if you want logs)
global.console = {
  ...console,
  // log: jest.fn(),
  // info: jest.fn(),
  // error: jest.fn(),
  warn: jest.fn(),
};

jest.mock('ioredis', () => {
  class RedisMock {
    on() {}
    get() { return null; }
    set() {}
    eval() {}
    disconnect() {}
    quit() {}
  }
  return {
    __esModule: true,
    default: RedisMock,
    Redis: RedisMock,
  };
});

jest.mock('bullmq', () => ({
  Queue: class {
    add = jest.fn();
    on = jest.fn();
    close = jest.fn();
  },
  Worker: class {
    on = jest.fn();
    close = jest.fn();
  }
}));
