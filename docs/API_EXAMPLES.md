# API Route Examples

## Using the API Wrapper

The `createApiHandler` function provides a standardized way to create API routes with built-in features.

### Basic Example

```typescript
// app/api/example/route.ts
import { createApiHandler, apiResponse } from '@/lib/api-wrapper';

export const GET = createApiHandler(async (context) => {
  return apiResponse({
    message: 'Hello, World!',
    timestamp: new Date().toISOString(),
  });
});
```

### With Authentication

```typescript
import { createApiHandler, apiResponse, apiError } from '@/lib/api-wrapper';

export const GET = createApiHandler(
  async (context) => {
    // context.userId is automatically available
    // context.user contains the full user object

    return apiResponse({
      message: `Hello, ${context.user.email}`,
      userId: context.userId,
    });
  },
  {
    requireAuth: true, // Require authentication
  },
);
```

### With Admin Protection

```typescript
import { createApiHandler, apiResponse } from '@/lib/api-wrapper';
import { createClient } from '@/lib/supabase/server';

export const POST = createApiHandler(
  async (context, data) => {
    const supabase = await createClient();

    // Only admins can access this route
    // Perform admin operations
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return apiError('Failed to fetch users', 500);
    }

    return apiResponse({ users });
  },
  {
    requireAuth: true,
    requireAdmin: true, // Require admin role
  },
);
```

### With Rate Limiting

```typescript
import { createApiHandler, apiResponse } from '@/lib/api-wrapper';

export const POST = createApiHandler(
  async (context, data) => {
    // Expensive AI operation
    const result = await processAIRequest(data);

    return apiResponse({ result });
  },
  {
    requireAuth: true,
    rateLimit: 'ai', // 5 requests per minute
  },
);
```

### With Input Validation

```typescript
import { createApiHandler, apiResponse, apiError } from '@/lib/api-wrapper';
import { validateRequired, isValidEmail } from '@/lib/validation';

export const POST = createApiHandler(
  async (context, data) => {
    // Validation is automatically called before handler
    // If validation fails, 400 error is returned automatically

    // Process validated data
    const supabase = await createClient();
    const { error } = await supabase.from('contacts').insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });

    if (error) {
      return apiError('Failed to save contact', 500);
    }

    return apiResponse({ success: true });
  },
  {
    methods: ['POST'],
    validate: async (data) => {
      // Validate required fields
      validateRequired(data, ['name', 'email', 'message']);

      // Validate email format
      if (!isValidEmail(data.email)) {
        throw new ValidationError('Invalid email address', 'email');
      }
    },
  },
);
```

### Complete Example

```typescript
import { createApiHandler, apiResponse, apiError } from '@/lib/api-wrapper';
import { createClient } from '@/lib/supabase/server';
import { validateRequired, validateStringLength } from '@/lib/validation';

export const POST = createApiHandler(
  async (context, data) => {
    const supabase = await createClient();

    // Create a new post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: context.userId,
        title: data.title,
        content: data.content,
        category: data.category,
      })
      .select()
      .single();

    if (error) {
      return apiError('Failed to create post', 500);
    }

    return apiResponse({ post }, 201);
  },
  {
    requireAuth: true,
    methods: ['POST'],
    rateLimit: 'standard',
    logPerformance: true,
    validate: async (data) => {
      validateRequired(data, ['title', 'content', 'category']);
      validateStringLength(data.title, 3, 100, 'Title');
      validateStringLength(data.content, 10, 10000, 'Content');
    },
  },
);
```

## Rate Limiting Examples

### Using Rate Limit Utility Directly

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = checkRateLimit(request, undefined, 'strict');

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

  // Continue with request
  return NextResponse.json({ success: true });
}
```

## Validation Examples

### Email Validation

```typescript
import { isValidEmail } from '@/lib/validation';

const email = 'user@example.com';
if (!isValidEmail(email)) {
  throw new Error('Invalid email');
}
```

### Password Strength

```typescript
import { validatePasswordStrength } from '@/lib/validation';

const result = validatePasswordStrength('MyP@ssw0rd123');
console.log(result.isStrong); // true/false
console.log(result.score); // 0-6
console.log(result.feedback); // Array of suggestions
```

### Pagination

```typescript
import { validatePagination } from '@/lib/validation';

const { page, limit, offset } = validatePagination(
  request.nextUrl.searchParams.get('page'),
  request.nextUrl.searchParams.get('limit'),
);

// Use in database query
const { data } = await supabase
  .from('items')
  .select('*')
  .range(offset, offset + limit - 1);
```

## Logging Examples

### API Request Logging

```typescript
import { logger, createRequestContext } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const context = createRequestContext(request);

  logger.apiRequest(request.method, context.path, context);

  try {
    // Process request
    const result = await processData();

    logger.apiResponse(request.method, context.path, 200, undefined, context);

    return NextResponse.json(result);
  } catch (error) {
    logger.apiError(request.method, context.path, error as Error, context);
    throw error;
  }
}
```

### Database Query Logging

```typescript
import { logger } from '@/lib/logger';

try {
  logger.dbQuery('insert', 'users', { userId: '123' });

  const { data, error } = await supabase.from('users').insert(userData);

  if (error) {
    logger.dbError('insert', 'users', error, { userId: '123' });
    throw error;
  }
} catch (error) {
  // Error already logged
  throw error;
}
```

### Performance Monitoring

```typescript
import { PerformanceTimer } from '@/lib/logger';

const timer = new PerformanceTimer('Expensive Operation');

// Perform operation
await expensiveOperation();

// Log duration
const duration = timer.end({ operationId: '123' });
console.log(`Operation took ${duration}ms`);
```

### External API Logging

```typescript
import { logger } from '@/lib/logger';

try {
  logger.externalApiRequest('OpenAI', '/v1/chat/completions');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    // ...
  });

  return response.json();
} catch (error) {
  logger.externalApiError('OpenAI', '/v1/chat/completions', error as Error);
  throw error;
}
```

## Environment Validation Examples

### Check Environment

```typescript
import { checkEnvironment, logEnvironmentStatus } from '@/lib/env-validation';

// Check what's configured
const status = checkEnvironment();
console.log('Valid:', status.valid);
console.log('Missing:', status.missing);
console.log('Configured:', status.configured);

// Log status (development only)
if (process.env.NODE_ENV === 'development') {
  logEnvironmentStatus(true); // true to show masked values
}
```

### Validate Before Operations

```typescript
import { getEnvironmentConfig } from '@/lib/env-validation';

// Get config with validation
try {
  const config = getEnvironmentConfig({
    requireStripe: true,
    requireOpenAI: true,
  });

  // Config is guaranteed to have required values
  const stripe = new Stripe(config.stripeSecretKey!);
} catch (error) {
  console.error('Missing required environment variables:', error.message);
}
```

## Error Response Examples

### Validation Error

```typescript
import { apiError } from '@/lib/api-wrapper';

// Simple error
return apiError('Invalid input', 400);

// Error with field details
return apiError('Validation failed', 400, {
  email: 'Email is required',
  password: 'Password must be at least 8 characters',
});
```

### Success Response

```typescript
import { apiSuccess } from '@/lib/api-wrapper';

return apiSuccess(
  {
    id: '123',
    name: 'John Doe',
  },
  'User created successfully',
);

// Returns:
// {
//   "success": true,
//   "data": { "id": "123", "name": "John Doe" },
//   "message": "User created successfully"
// }
```

## Testing Examples

### Test Rate Limiting

```bash
# Test rate limit with multiple requests
for i in {1..15}; do
  curl -X POST https://istani.org/api/test -H "Content-Type: application/json"
  echo "Request $i"
done

# Should see 429 errors after limit is reached
```

### Test Authentication

```bash
# Without auth (should fail)
curl https://istani.org/api/protected

# With auth
curl https://istani.org/api/protected \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Validation

```bash
# Invalid data (should return 400)
curl -X POST https://istani.org/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'

# Valid data
curl -X POST https://istani.org/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe"}'
```

## Best Practices

1. **Always use the API wrapper** for consistent error handling
2. **Validate all inputs** before processing
3. **Apply appropriate rate limits** based on operation cost
4. **Log important operations** for debugging
5. **Return meaningful error messages** to clients
6. **Use TypeScript types** for request/response data
7. **Test edge cases** and error scenarios
8. **Monitor API performance** in production
9. **Document API endpoints** with examples
10. **Version your APIs** for breaking changes
