import { beforeAll, afterEach, vi } from 'vitest';

// Mock environment variables for testing
beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
});

afterEach(() => {
  vi.clearAllMocks();
});

/**
 * Test Setup Configuration
 *
 * This file is automatically loaded before all tests run.
 * It sets up:
 * - Mock environment variables for testing
 * - Global test utilities and mocks
 * - Cleanup hooks to reset state between tests
 *
 * Modify this file to add global test configuration that applies
 * to all test files.
 */
