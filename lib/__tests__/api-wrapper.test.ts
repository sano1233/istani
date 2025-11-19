import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler, apiResponse } from '../api-wrapper';
import { ValidationError } from '../validation';

// Mock dependencies
vi.mock('../supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../logger', () => ({
  logger: {
    apiRequest: vi.fn(),
    apiResponse: vi.fn(),
    apiError: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    dbQuery: vi.fn(),
    dbError: vi.fn(),
  },
  createRequestContext: vi.fn(() => ({})),
  PerformanceTimer: vi.fn().mockImplementation(() => ({
    end: vi.fn(() => 100),
  })),
}));

vi.mock('../rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, headers: {} })),
}));

describe('createApiHandler', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api/test',
      headers: new Headers(),
      nextUrl: { pathname: '/api/test' },
    } as unknown as NextRequest;
  });

  it('should create a working API handler', async () => {
    const handler = createApiHandler(async () => {
      return NextResponse.json({ message: 'Success' });
    });

    const response = await handler(mockRequest);
    expect(response).toBeInstanceOf(NextResponse);
  });

  it('should handle ValidationError with 400 status', async () => {
    const handler = createApiHandler(async () => {
      throw new ValidationError('Invalid input', 'email');
    });

    const response = await handler(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.message).toBe('Invalid input');
  });

  it('should handle generic errors with 500 status', async () => {
    const handler = createApiHandler(async () => {
      throw new Error('Unexpected error');
    });

    const response = await handler(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should reject disallowed HTTP methods', async () => {
    const handler = createApiHandler(async () => NextResponse.json({ ok: true }), {
      methods: ['GET', 'POST'],
    });

    const putRequest = { ...mockRequest, method: 'PUT' } as NextRequest;
    const response = await handler(putRequest);
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toContain('GET');
    expect(response.headers.get('Allow')).toContain('POST');
  });

  it('should parse JSON body for POST requests', async () => {
    const requestData = { name: 'Test', value: 123 };
    const postRequest = {
      ...mockRequest,
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    let capturedData: any;
    const handler = createApiHandler(async (context, data) => {
      capturedData = data;
      return NextResponse.json({ received: data });
    });

    await handler(postRequest);
    expect(capturedData).toEqual(requestData);
  });

  it('should handle invalid JSON body', async () => {
    const badRequest = {
      ...mockRequest,
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as NextRequest;

    const handler = createApiHandler(async () => NextResponse.json({ ok: true }));

    const response = await handler(badRequest);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid JSON in request body');
  });

  it('should skip body parsing for GET requests', async () => {
    let bodyReceived: any = 'not-undefined';
    const handler = createApiHandler(async (context, data) => {
      bodyReceived = data;
      return NextResponse.json({ ok: true });
    });

    await handler(mockRequest);
    expect(bodyReceived).toBeUndefined();
  });

  it('should enforce custom validation', async () => {
    const handler = createApiHandler(
      async () => NextResponse.json({ ok: true }),
      {
        validate: (data: any) => {
          if (!data.email) throw new ValidationError('Email is required');
        },
      }
    );

    const postRequest = {
      ...mockRequest,
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({ name: 'Test' }),
    } as unknown as NextRequest;

    const response = await handler(postRequest);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should require authentication when configured', async () => {
    const { createClient } = await import('../supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const handler = createApiHandler(
      async () => NextResponse.json({ ok: true }),
      { requireAuth: true }
    );

    const response = await handler(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should provide authenticated user in context', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const { createClient } = await import('../supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    let capturedContext: any;
    const handler = createApiHandler(
      async (context) => {
        capturedContext = context;
        return NextResponse.json({ ok: true });
      },
      { requireAuth: true }
    );

    await handler(mockRequest);
    expect(capturedContext.user).toEqual(mockUser);
    expect(capturedContext.userId).toBe('user-123');
  });

  it('should check admin status when required', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const { createClient } = await import('../supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { is_admin: false },
              error: null,
            }),
          }),
        }),
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const handler = createApiHandler(
      async () => NextResponse.json({ ok: true }),
      { requireAdmin: true }
    );

    const response = await handler(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should enforce rate limiting', async () => {
    const { checkRateLimit } = await import('../rate-limit');
    (checkRateLimit as any).mockReturnValue({
      allowed: false,
      retryAfter: 60,
      headers: { 'X-RateLimit-Remaining': '0' },
    });

    const handler = createApiHandler(async () => NextResponse.json({ ok: true }));

    const response = await handler(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded');
    expect(data.retryAfter).toBe(60);
  });

  it('should allow disabling rate limiting', async () => {
    const { checkRateLimit } = await import('../rate-limit');
    const checkSpy = vi.mocked(checkRateLimit);

    const handler = createApiHandler(
      async () => NextResponse.json({ ok: true }),
      { rateLimit: false }
    );

    await handler(mockRequest);
    expect(checkSpy).not.toHaveBeenCalled();
  });

  it('should handle authentication errors gracefully', async () => {
    const { createClient } = await import('../supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockRejectedValue(new Error('Auth service error')),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const handler = createApiHandler(
      async () => NextResponse.json({ ok: true }),
      { requireAuth: true }
    );

    const response = await handler(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication failed');
  });
});

describe('apiResponse', () => {
  it('should create response with data and status', () => {
    const data = { message: 'Success', id: 123 };
    const response = apiResponse(data, 201);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(201);
  });

  it('should default to 200 status', () => {
    const response = apiResponse({ ok: true });
    expect(response.status).toBe(200);
  });

  it('should handle null data', () => {
    const response = apiResponse(null);
    expect(response).toBeInstanceOf(NextResponse);
  });
});