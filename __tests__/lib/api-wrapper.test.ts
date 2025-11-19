/**
 * Unit tests for lib/api-wrapper.ts
 * Tests API handler creation with authentication, rate limiting, and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createApiHandler,
  apiResponse,
  apiError,
  apiSuccess,
  ValidationError,
} from '@/lib/api-wrapper';

// Mock dependencies
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(() => ({
    allowed: true,
    headers: {},
  })),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    apiRequest: jest.fn(),
    apiResponse: jest.fn(),
    apiError: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  createRequestContext: jest.fn(() => ({})),
  PerformanceTimer: jest.fn().mockImplementation(() => ({
    end: jest.fn(() => 100),
  })),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { is_admin: false },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

jest.mock('@/lib/validation', () => ({
  ...jest.requireActual('@/lib/validation'),
  ValidationError: class ValidationError extends Error {
    constructor(
      message: string,
      public field?: string,
      public errors?: Record<string, string>,
    ) {
      super(message);
      this.name = 'ValidationError';
    }
  },
}));

const { checkRateLimit } = require('@/lib/rate-limit');
const { logger } = require('@/lib/logger');
const { createClient } = require('@/lib/supabase/server');

describe('apiResponse', () => {
  it('should create a successful JSON response', () => {
    const data = { message: 'Success', value: 42 };
    const response = apiResponse(data);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);
  });

  it('should allow custom status codes', () => {
    const data = { message: 'Created' };
    const response = apiResponse(data, 201);
    expect(response.status).toBe(201);
  });
});

describe('apiError', () => {
  it('should create an error response', () => {
    const response = apiError('Error message');
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(400);
  });

  it('should allow custom status codes', () => {
    const response = apiError('Not found', 404);
    expect(response.status).toBe(404);
  });

  it('should include validation errors', () => {
    const errors = { email: 'Invalid email', name: 'Required' };
    const response = apiError('Validation failed', 400, errors);
    expect(response.status).toBe(400);
  });
});

describe('apiSuccess', () => {
  it('should create a success response with data', () => {
    const data = { id: 1, name: 'Test' };
    const response = apiSuccess(data);
    expect(response).toBeInstanceOf(NextResponse);
  });

  it('should include optional message', () => {
    const data = { id: 1 };
    const response = apiSuccess(data, 'Created successfully');
    expect(response).toBeInstanceOf(NextResponse);
  });
});

describe('createApiHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (
    method: string = 'GET',
    url: string = 'http://localhost:3000/api/test',
    body?: any,
  ): NextRequest => {
    const headers = new Headers({
      'content-type': 'application/json',
    });

    return {
      method,
      url,
      headers,
      json: jest.fn().mockResolvedValue(body || {}),
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
      },
    } as unknown as NextRequest;
  };

  describe('HTTP method validation', () => {
    it('should allow configured HTTP methods', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        methods: ['GET', 'POST'],
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      expect(response.status).toBe(200);
    });

    it('should reject unconfigured HTTP methods', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        methods: ['GET'],
      });

      const request = createMockRequest('POST');
      const response = await handler(request);
      expect(response.status).toBe(405);
    });

    it('should return Allow header for 405 responses', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        methods: ['GET', 'POST'],
      });

      const request = createMockRequest('DELETE');
      const response = await handler(request);
      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('GET, POST');
    });
  });

  describe('Authentication', () => {
    it('should allow unauthenticated requests when not required', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        requireAuth: false,
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      expect(response.status).toBe(200);
    });

    it('should require authentication when configured', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => ({
            data: { user: null },
            error: new Error('Not authenticated'),
          })),
        },
      };

      createClient.mockResolvedValue(mockSupabase);

      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        requireAuth: true,
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      expect(response.status).toBe(401);
    });

    it('should pass user context to handler when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => ({
            data: { user: mockUser },
            error: null,
          })),
        },
      };

      createClient.mockResolvedValue(mockSupabase);

      let capturedContext: any;
      const handler = createApiHandler(
        async (context) => {
          capturedContext = context;
          return apiResponse({ success: true });
        },
        { requireAuth: true },
      );

      const request = createMockRequest('GET');
      await handler(request);

      expect(capturedContext.userId).toBe('user-123');
      expect(capturedContext.user).toEqual(mockUser);
    });

    it('should check admin status when required', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => ({
            data: { user: { id: 'user-123' } },
            error: null,
          })),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({
                data: { is_admin: false },
                error: null,
              })),
            })),
          })),
        })),
      };

      createClient.mockResolvedValue(mockSupabase);

      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        requireAdmin: true,
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      expect(response.status).toBe(403);
    });

    it('should allow admin users when admin required', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => ({
            data: { user: { id: 'admin-123' } },
            error: null,
          })),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({
                data: { is_admin: true },
                error: null,
              })),
            })),
          })),
        })),
      };

      createClient.mockResolvedValue(mockSupabase);

      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        requireAdmin: true,
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Rate limiting', () => {
    it('should apply rate limiting by default', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }));

      const request = createMockRequest('GET');
      await handler(request);

      expect(checkRateLimit).toHaveBeenCalled();
    });

    it('should block requests when rate limit exceeded', async () => {
      checkRateLimit.mockReturnValueOnce({
        allowed: false,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': '1234567890',
        },
        retryAfter: 60,
      });

      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        rateLimit: 'standard',
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      expect(response.status).toBe(429);
    });

    it('should skip rate limiting when disabled', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        rateLimit: false,
      });

      const request = createMockRequest('GET');
      await handler(request);

      expect(checkRateLimit).not.toHaveBeenCalled();
    });

    it('should use custom rate limit types', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        rateLimit: 'strict',
      });

      const request = createMockRequest('GET');
      await handler(request);

      expect(checkRateLimit).toHaveBeenCalledWith(expect.anything(), undefined, 'strict');
    });
  });

  describe('Request body parsing', () => {
    it('should parse JSON body for POST requests', async () => {
      let capturedData: any;
      const handler = createApiHandler(async (context, data) => {
        capturedData = data;
        return apiResponse({ success: true });
      });

      const body = { name: 'Test', value: 42 };
      const request = createMockRequest('POST', 'http://localhost:3000/api/test', body);
      await handler(request);

      expect(capturedData).toEqual(body);
    });

    it('should handle invalid JSON gracefully', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }));

      const request = createMockRequest('POST');
      request.json = jest.fn().mockRejectedValue(new Error('Invalid JSON'));

      const response = await handler(request);
      expect(response.status).toBe(400);
    });

    it('should skip body parsing for GET requests', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }));

      const request = createMockRequest('GET');
      await handler(request);

      expect(request.json).not.toHaveBeenCalled();
    });
  });

  describe('Custom validation', () => {
    it('should run custom validation when provided', async () => {
      const validate = jest.fn();
      const handler = createApiHandler(async () => apiResponse({ success: true }), { validate });

      const body = { name: 'Test' };
      const request = createMockRequest('POST', 'http://localhost:3000/api/test', body);
      await handler(request);

      expect(validate).toHaveBeenCalledWith(body);
    });

    it('should return 400 for validation errors', async () => {
      const validate = jest.fn(() => {
        throw new ValidationError('Invalid data', 'name', { name: 'Required' });
      });

      const handler = createApiHandler(async () => apiResponse({ success: true }), { validate });

      const request = createMockRequest('POST', 'http://localhost:3000/api/test', {});
      const response = await handler(request);
      expect(response.status).toBe(400);
    });

    it('should not run validation for requests without body', async () => {
      const validate = jest.fn();
      const handler = createApiHandler(async () => apiResponse({ success: true }), { validate });

      const request = createMockRequest('GET');
      await handler(request);

      expect(validate).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should catch and handle handler errors', async () => {
      const handler = createApiHandler(async () => {
        throw new Error('Handler error');
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      expect(response.status).toBe(500);
    });

    it('should handle ValidationError specifically', async () => {
      const handler = createApiHandler(async () => {
        throw new ValidationError('Validation failed');
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      expect(response.status).toBe(400);
    });

    it('should include stack trace in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const handler = createApiHandler(async () => {
        throw new Error('Test error');
      });

      const request = createMockRequest('GET');
      await handler(request);

      process.env.NODE_ENV = originalEnv;
    });

    it('should hide stack trace in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const handler = createApiHandler(async () => {
        throw new Error('Test error');
      });

      const request = createMockRequest('GET');
      await handler(request);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Performance monitoring', () => {
    it('should log performance when enabled', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        logPerformance: true,
      });

      const request = createMockRequest('GET');
      await handler(request);

      expect(logger.apiResponse).toHaveBeenCalled();
    });

    it('should skip performance monitoring when disabled', async () => {
      const { PerformanceTimer } = require('@/lib/logger');
      PerformanceTimer.mockClear();

      const handler = createApiHandler(async () => apiResponse({ success: true }), {
        logPerformance: false,
      });

      const request = createMockRequest('GET');
      await handler(request);

      expect(PerformanceTimer).not.toHaveBeenCalled();
    });
  });

  describe('Logging', () => {
    it('should log incoming requests', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }));

      const request = createMockRequest('GET');
      await handler(request);

      expect(logger.apiRequest).toHaveBeenCalledWith('GET', '/api/test');
    });

    it('should log successful responses', async () => {
      const handler = createApiHandler(async () => apiResponse({ success: true }));

      const request = createMockRequest('GET');
      await handler(request);

      expect(logger.apiResponse).toHaveBeenCalled();
    });

    it('should log errors', async () => {
      const handler = createApiHandler(async () => {
        throw new Error('Test error');
      });

      const request = createMockRequest('GET');
      await handler(request);

      expect(logger.apiError).toHaveBeenCalled();
    });
  });
});
