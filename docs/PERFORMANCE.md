# Performance Optimization Guide

## Overview

This guide provides strategies for optimizing the performance of the ISTANI fitness platform.

## Table of Contents
- [Frontend Optimization](#frontend-optimization)
- [Backend Optimization](#backend-optimization)
- [Database Optimization](#database-optimization)
- [Caching Strategies](#caching-strategies)
- [Monitoring and Metrics](#monitoring-and-metrics)

## Frontend Optimization

### Image Optimization

#### Already Implemented
```typescript
// next.config.mjs
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

#### Best Practices
- Use Next.js Image component for automatic optimization
- Lazy load images below the fold
- Use appropriate image sizes for different viewports
- Compress images before upload

```typescript
import Image from 'next/image';

// Good
<Image
  src="/product.jpg"
  alt="Product"
  width={500}
  height={300}
  loading="lazy"
  placeholder="blur"
/>

// Bad
<img src="/product.jpg" alt="Product" />
```

### Code Splitting

#### Dynamic Imports
```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR if not needed
});

// Lazy load with named exports
const Dashboard = dynamic(
  () => import('./Dashboard').then((mod) => mod.Dashboard),
);
```

#### Route-based Splitting
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Code here is automatically split by Next.js
  return <Dashboard />;
}
```

### Bundle Size Optimization

#### Check Bundle Size
```bash
# Build and analyze
npm run build

# View bundle sizes in .next/analyze
```

#### Reduce Dependencies
```typescript
// Bad - imports entire library
import _ from 'lodash';

// Good - imports only what's needed
import debounce from 'lodash/debounce';

// Better - use native methods when possible
const unique = [...new Set(array)];
```

#### Package Import Optimization (Already Configured)
```typescript
// next.config.mjs
experimental: {
  optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
}
```

### React Performance

#### Memoization
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* render */}</div>;
});

// Memoize expensive calculations
function MyComponent({ items }) {
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.value - b.value),
    [items]
  );

  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <div>{/* render */}</div>;
}
```

#### Avoid Unnecessary Re-renders
```typescript
// Bad - new object on every render
<Component style={{ margin: 10 }} />

// Good - stable reference
const style = { margin: 10 };
<Component style={style} />
```

### Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Better performance
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

## Backend Optimization

### API Route Optimization

#### Use API Wrapper (Already Available)
```typescript
import { createApiHandler, apiResponse } from '@/lib/api-wrapper';

export const GET = createApiHandler(
  async (context) => {
    // Optimized with built-in:
    // - Rate limiting
    // - Performance logging
    // - Error handling
    return apiResponse({ data: 'result' });
  },
  {
    rateLimit: 'standard',
    logPerformance: true,
  },
);
```

#### Streaming Responses
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Stream large datasets
      for (const item of largeDataset) {
        controller.enqueue(encoder.encode(JSON.stringify(item) + '\n'));
      }
      controller.close();
    },
  });

  return new NextResponse(stream);
}
```

### Database Query Optimization

#### Use Database Helpers (Already Available)
```typescript
import { dbQuery, dbGetById } from '@/lib/db-helpers';

// Optimized queries with logging and error handling
const { data, error } = await dbQuery('products', {
  select: 'id, name, price', // Only select needed columns
  limit: 20,
  offset: 0,
  orderBy: { column: 'created_at', ascending: false },
});
```

#### Indexing Strategy
```sql
-- Already implemented indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Add custom indexes for frequent queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
```

#### Query Optimization
```typescript
// Bad - N+1 query problem
const users = await supabase.from('users').select('*');
for (const user of users.data) {
  const orders = await supabase.from('orders').eq('user_id', user.id).select('*');
}

// Good - Join query
const usersWithOrders = await supabase
  .from('users')
  .select(`
    *,
    orders (*)
  `);
```

#### Pagination
```typescript
import { validatePagination } from '@/lib/validation';

export const GET = createApiHandler(async (context) => {
  const url = new URL(context.request.url);
  const { page, limit, offset } = validatePagination(
    url.searchParams.get('page'),
    url.searchParams.get('limit'),
  );

  const { data, count } = await dbQuery('products', {
    limit,
    offset,
    orderBy: { column: 'created_at', ascending: false },
  });

  return apiResponse({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: offset + limit < (count || 0),
    },
  });
});
```

## Caching Strategies

### Static Page Generation
```typescript
// app/products/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function ProductsPage() {
  const products = await fetchProducts();
  return <ProductList products={products} />;
}
```

### API Response Caching
```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: 'result' });

  // Cache for 1 hour
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=7200'
  );

  return response;
}
```

### Client-Side Caching
```typescript
// Use SWR for data fetching
import useSWR from 'swr';

function Profile() {
  const { data, error } = useSWR('/api/user', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000, // Refresh every minute
  });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return <div>{data.name}</div>;
}
```

### Memo Cache (React 19+)
```typescript
import { cache } from 'react';

const getUser = cache(async (id: string) => {
  // This function will be memoized
  const supabase = await createClient();
  return supabase.from('users').select('*').eq('id', id).single();
});
```

## External API Optimization

### Rate Limiting and Caching
```typescript
import { rateLimit } from '@/lib/rate-limit';

// Cache external API responses
const cache = new Map();

async function fetchFromExternalAPI(endpoint: string) {
  // Check cache first
  if (cache.has(endpoint)) {
    const { data, timestamp } = cache.get(endpoint);
    if (Date.now() - timestamp < 300000) { // 5 minutes
      return data;
    }
  }

  // Fetch and cache
  const response = await fetch(endpoint);
  const data = await response.json();

  cache.set(endpoint, { data, timestamp: Date.now() });
  return data;
}
```

### Parallel Requests
```typescript
// Bad - Sequential requests
const user = await fetchUser();
const posts = await fetchPosts();
const comments = await fetchComments();

// Good - Parallel requests
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments(),
]);
```

## Monitoring and Metrics

### Core Web Vitals

Monitor in Vercel Analytics:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Performance Monitoring
```typescript
import { PerformanceTimer } from '@/lib/logger';

async function expensiveOperation() {
  const timer = new PerformanceTimer('Database Query');

  const result = await supabase.from('users').select('*');

  timer.end(); // Logs duration automatically

  return result;
}
```

### Database Query Performance
```sql
-- Enable query timing in Supabase
EXPLAIN ANALYZE
SELECT * FROM products WHERE category = 'supplements';

-- Look for:
-- - Sequential Scans (add index if needed)
-- - High execution time
-- - High number of rows examined
```

### API Response Times

Monitor with logging:
```typescript
// Already built into api-wrapper
export const GET = createApiHandler(
  async (context) => {
    // Automatically logs duration
    return apiResponse({ data: 'result' });
  },
  {
    logPerformance: true,
  },
);
```

## Performance Checklist

### Before Deployment
- [ ] Enable production build optimizations
- [ ] Minimize bundle size
- [ ] Implement code splitting
- [ ] Optimize images
- [ ] Add proper caching headers
- [ ] Enable compression (already configured)
- [ ] Test Core Web Vitals
- [ ] Profile database queries
- [ ] Set up monitoring

### Regular Maintenance
- [ ] Review Vercel Analytics weekly
- [ ] Monitor database query performance
- [ ] Update dependencies for performance fixes
- [ ] Review and optimize slow API routes
- [ ] Check bundle size after updates
- [ ] Profile client-side performance

## Tools and Resources

- **Vercel Analytics**: Built-in performance monitoring
- **Lighthouse**: Automated performance audits
- **React DevTools Profiler**: Component performance
- **Chrome DevTools**: Network and runtime performance
- **Supabase Logs**: Database query performance

## Performance Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| Initial Load | < 3s | Monitor |
| Time to Interactive | < 5s | Monitor |
| API Response Time | < 500ms | Monitor |
| Database Query Time | < 100ms | Monitor |
| Bundle Size | < 200KB | Monitor |

---

For more information, see:
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Web.dev Performance](https://web.dev/performance/)
