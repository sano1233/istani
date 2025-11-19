import { NextRequest, NextResponse } from 'next/server';
import {
  createApiHandler,
  apiResponse,
  apiError,
  apiSuccess,
  ApiHandlerOptions,
  ApiContext,
} from '../api-wrapper';
import { ValidationError } from '../validation';

// Mock dependencies
jest.mock('../rate-limit', () => ({
  checkRateLimit: jest.fn((request, userId, type) => ({
    allowed: true,
    retryAfter: 0,
    headers: {},
  })),
}));

jest.mock('../logger', () => ({
  logger: {
    apiRequest: jest.fn(),
    apiResponse: jest.fn(),
    apiError: jest.fn(),
    error: jest.fn(),
  },
  createRequestContext: jest.fn(() => ({})),
  PerformanceTimer: jest.fn().mockImplementation(() => ({
    end: jest.fn(() => 100),
  })),
}));

jest.mock('../supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
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

describe('api-wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createApiHandler', () => {
    const mockUrl = 'https://example.com/api/test';

    const createMockRequest = (method: string = 'GET', body?: any): NextRequest => {
      const init: RequestInit = {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
      };

      if (body) {
        init.body = JSON.stringify(body);
      }

      return new NextRequest(mockUrl, init);
    };

    it('should handle successful GET requests', async () => {
      const handler = createApiHandler(async (context: ApiContext) => {
        return NextResponse.json({ success: true });
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
    });

    it('should handle successful POST requests with data', async () => {
      const handler = createApiHandler(async (context: ApiContext, data: any) => {
        return NextResponse.json({ received: data });
      });

      const request = createMockRequest('POST', { name: 'test' });
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: { name: 'test' } });
    });

    it('should reject methods not in allowed list', async () => {
      const handler = createApiHandler(
        async (context: ApiContext) => {
          return NextResponse.json({ success: true });
        },
        { methods: ['GET', 'POST'] },
      );

      const request = createMockRequest('DELETE');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toContain('Method DELETE not allowed');
      expect(response.headers.get('Allow')).toBe('GET, POST');
    });

    it('should handle authentication requirement', async () => {
      const { createClient } = require('../supabase/server');
      createClient.mockImplementationOnce(() => ({
        auth: {
          getUser: jest.fn(() => ({
            data: { user: null },
            error: new Error('Not authenticated'),
          })),
        },
      }));

      const handler = createApiHandler(
        async (context: ApiContext) => {
          return NextResponse.json({ success: true });
        },
        { requireAuth: true },
      );

      const request = createMockRequest('GET');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should provide user context when authenticated', async () => {
      let capturedContext: ApiContext | null = null;

      const handler = createApiHandler(
        async (context: ApiContext) => {
          capturedContext = context;
          return NextResponse.json({ success: true });
        },
        { requireAuth: true },
      );

      const request = createMockRequest('GET');
      await handler(request);

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.userId).toBe('user-123');
      expect(capturedContext!.user).toBeDefined();
    });

    it('should enforce admin requirement', async () => {
      const { createClient } = require('../supabase/server');
      createClient.mockImplementationOnce(() => ({
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
      }));

      const handler = createApiHandler(
        async (context: ApiContext) => {
          return NextResponse.json({ success: true });
        },
        { requireAuth: true, requireAdmin: true },
      );

      const request = createMockRequest('GET');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('should allow admin users when required', async () => {
      const { createClient } = require('../supabase/server');
      createClient.mockImplementationOnce(() => ({
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
      }));

      let capturedContext: ApiContext | null = null;
      const handler = createApiHandler(
        async (context: ApiContext) => {
          capturedContext = context;
          return NextResponse.json({ success: true });
        },
        { requireAuth: true, requireAdmin: true },
      );

      const request = createMockRequest('GET');
      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(capturedContext!.isAdmin).toBe(true);
    });

    it('should handle rate limiting', async () => {
      const { checkRateLimit } = require('../rate-limit');
      checkRateLimit.mockReturnValueOnce({
        allowed: false,
        retryAfter: 60,
        headers: { 'X-RateLimit-Limit': '100' },
      });

      const handler = createApiHandler(async (context: ApiContext) => {
        return NextResponse.json({ success: true });
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
      expect(data.retryAfter).toBe(60);
    });

    it('should skip rate limiting when disabled', async () => {
      const { checkRateLimit } = require('../rate-limit');
      checkRateLimit.mockClear();

      const handler = createApiHandler(
        async (context: ApiContext) => {
          return NextResponse.json({ success: true });
        },
        { rateLimit: false },
      );

      const request = createMockRequest('GET');
      await handler(request);

      expect(checkRateLimit).not.toHaveBeenCalled();
    });

    it('should parse JSON request body', async () => {
      let receivedData: any = null;

      const handler = createApiHandler(async (context: ApiContext, data: any) => {
        receivedData = data;
        return NextResponse.json({ success: true });
      });

      const body = { name: 'John', age: 30 };
      const request = createMockRequest('POST', body);
      await handler(request);

      expect(receivedData).toEqual(body);
    });

    it('should handle invalid JSON gracefully', async () => {
      const request = new NextRequest(mockUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{invalid json',
      });

      const handler = createApiHandler(async (context: ApiContext) => {
        return NextResponse.json({ success: true });
      });

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('should run custom validation', async () => {
      const validate = jest.fn(async (data: any) => {
        if (!data.email) {
          throw new ValidationError('Email is required', 'email');
        }
      });

      const handler = createApiHandler(
        async (context: ApiContext) => {
          return NextResponse.json({ success: true });
        },
        { validate },
      );

      const request = createMockRequest('POST', { name: 'John' });
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(validate).toHaveBeenCalled();
    });

    it('should pass validation and proceed', async () => {
      const validate = jest.fn(async (data: any) => {
        if (!data.email) {
          throw new ValidationError('Email is required');
        }
      });

      const handler = createApiHandler(
        async (context: ApiContext) => {
          return NextResponse.json({ success: true });
        },
        { validate },
      );

      const request = createMockRequest('POST', { email: 'test@example.com' });
      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(validate).toHaveBeenCalled();
    });

    it('should handle ValidationError thrown in handler', async () => {
      const handler = createApiHandler(async (context: ApiContext) => {
        throw new ValidationError('Invalid input', 'field', { field: 'error' });
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.errors).toEqual({ field: 'error' });
    });

    it('should handle generic errors', async () => {
      const handler = createApiHandler(async (context: ApiContext) => {
        throw new Error('Something went wrong');
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should include error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const handler = createApiHandler(async (context: ApiContext) => {
        throw new Error('Dev error');
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      const data = await response.json();

      expect(data.message).toBe('Dev error');
      expect(data.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should hide error details in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const handler = createApiHandler(async (context: ApiContext) => {
        throw new Error('Prod error');
      });

      const request = createMockRequest('GET');
      const response = await handler(request);
      const data = await response.json();

      expect(data.message).toBe('An unexpected error occurred');
      expect(data.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('apiResponse', () => {
    it('should create a JSON response with data', () => {
      const response = apiResponse({ message: 'Success' });
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    it('should accept custom status code', () => {
      const response = apiResponse({ message: 'Created' }, 201);
      expect(response.status).toBe(201);
    });

    it('should handle various data types', () => {
      expect(apiResponse({ object: true }).status).toBe(200);
      expect(apiResponse(['array']).status).toBe(200);
      expect(apiResponse('string').status).toBe(200);
      expect(apiResponse(123).status).toBe(200);
      expect(apiResponse(null).status).toBe(200);
    });
  });

  describe('apiError', () => {
    it('should create an error response', () => {
      const response = apiError('Something went wrong');
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
    });

    it('should accept custom status code', () => {
      const response = apiError('Not found', 404);
      expect(response.status).toBe(404);
    });

    it('should include errors object when provided', async () => {
      const errors = { email: 'Invalid', password: 'Too short' };
      const response = apiError('Validation failed', 400, errors);
      const data = await response.json();

      expect(data.error).toBe('Validation failed');
      expect(data.errors).toEqual(errors);
    });
  });

  describe('apiSuccess', () => {
    it('should create a success response with data', async () => {
      const response = apiSuccess({ id: 123 });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({ id: 123 });
    });

    it('should include optional message', async () => {
      const response = apiSuccess({ id: 123 }, 'Created successfully');
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe('Created successfully');
      expect(data.data).toEqual({ id: 123 });
    });

    it('should work without message', async () => {
      const response = apiSuccess({ id: 123 });
      const data = await response.json();

      expect(data.message).toBeUndefined();
    });
  });
});
