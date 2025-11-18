/**
 * API Route Wrapper
 * Provides a standardized way to create API routes with built-in:
 * - Rate limiting
 * - Logging
 * - Error handling
 * - Authentication
 * - Request validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './rate-limit';
import { logger, createRequestContext, PerformanceTimer } from './logger';
import { ValidationError } from './validation';
import { createClient } from './supabase/server';

export interface ApiHandlerOptions {
  // Rate limiting
  rateLimit?: 'strict' | 'standard' | 'relaxed' | 'ai' | false;

  // Authentication
  requireAuth?: boolean;
  requireAdmin?: boolean;

  // Allowed HTTP methods
  methods?: ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')[];

  // Custom validation
  validate?: (data: any) => void | Promise<void>;

  // Performance monitoring
  logPerformance?: boolean;
}

export interface ApiContext {
  request: NextRequest;
  userId?: string;
  user?: any;
  isAdmin?: boolean;
}

export type ApiHandler<T = any> = (context: ApiContext, data?: any) => Promise<NextResponse<T>>;

/**
 * Creates a wrapped API handler with built-in features
 */
export function createApiHandler<T = any>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions = {},
): (request: NextRequest) => Promise<NextResponse> {
  const {
    rateLimit: rateLimitType = 'standard',
    requireAuth = false,
    requireAdmin = false,
    methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    validate,
    logPerformance = true,
  } = options;

  return async (request: NextRequest): Promise<NextResponse> => {
    const timer = logPerformance ? new PerformanceTimer('API Request') : null;
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Declare variables before try block so they're accessible in catch
    let userId: string | undefined;
    let user: any;
    let isAdmin = false;

    try {
      // Log incoming request
      logger.apiRequest(method, path);

      // Check HTTP method
      if (!methods.includes(method as any)) {
        return NextResponse.json(
          { error: `Method ${method} not allowed` },
          {
            status: 405,
            headers: { Allow: methods.join(', ') },
          },
        );
      }

      // Authentication check

      if (requireAuth || requireAdmin) {
        try {
          const supabase = await createClient();
          const {
            data: { user: authUser },
            error: authError,
          } = await supabase.auth.getUser();

          if (authError || !authUser) {
            return NextResponse.json(
              { error: 'Unauthorized', message: 'Authentication required' },
              { status: 401 },
            );
          }

          userId = authUser.id;
          user = authUser;

          // Check admin status if required
          if (requireAdmin) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', userId)
              .single();

            isAdmin = profile?.is_admin || false;

            if (!isAdmin) {
              return NextResponse.json(
                { error: 'Forbidden', message: 'Admin access required' },
                { status: 403 },
              );
            }
          }
        } catch (error: any) {
          logger.error('Authentication error', error, { path, method });
          return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }
      }

      // Rate limiting
      if (rateLimitType !== false) {
        const rateLimitResult = checkRateLimit(request, userId, rateLimitType);

        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              retryAfter: rateLimitResult.retryAfter,
            },
            {
              status: 429,
              headers: rateLimitResult.headers as HeadersInit,
            },
          );
        }
      }

      // Parse request body if applicable
      let data: any;
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          const contentType = request.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            data = await request.json();
          }
        } catch (error: any) {
          logger.warn('Failed to parse request body', { path, method, error: error.message });
          return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }
      }

      // Custom validation
      if (validate && data) {
        try {
          await validate(data);
        } catch (error: any) {
          if (error instanceof ValidationError) {
            return NextResponse.json(
              {
                error: 'Validation failed',
                message: error.message,
                errors: error.errors,
              },
              { status: 400 },
            );
          }
          throw error;
        }
      }

      // Execute handler
      const context: ApiContext = {
        request,
        userId,
        user,
        isAdmin,
      };

      const response = await handler(context, data);

      // Log successful response
      const status = response.status || 200;
      const duration = timer?.end({ path, method, status }) || 0;
      logger.apiResponse(method, path, status, duration);

      return response;
    } catch (error: any) {
      // Log error
      logger.apiError(method, path, error, createRequestContext(request, userId));

      // Handle different error types
      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: error.message,
            errors: error.errors,
          },
          { status: 400 },
        );
      }

      // Generic error response
      const isDevelopment = process.env.NODE_ENV === 'development';
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: isDevelopment ? error.message : 'An unexpected error occurred',
          ...(isDevelopment && { stack: error.stack }),
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Helper to create typed responses
 */
export function apiResponse<T = any>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Helper to create error responses
 */
export function apiError(
  message: string,
  status = 400,
  errors?: Record<string, string>,
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(errors && { errors }),
    },
    { status },
  );
}

/**
 * Helper to create success responses
 */
export function apiSuccess<T = any>(
  data: T,
  message?: string,
): NextResponse<{ success: true; data: T; message?: string }> {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
  });
}
