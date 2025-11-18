# Neon Comments Integration Setup

This document outlines the setup for integrating Neon Database comments system into the Istani Fitness platform.

## Overview

Neon Comments provides a serverless, real-time commenting system powered by Neon Database. This integration enables:
- Real-time comment threads
- User authentication integration
- Threaded replies
- Moderation capabilities
- Analytics and insights

## Worktree Setup

The Neon Comments integration is developed in a separate worktree:

```bash
# Setup worktree for Neon Comments branch
npm run worktree:neon

# Or manually
bash scripts/setup-neon-comments-worktree.sh
```

This creates a worktree at `../worktrees/setup-neon-comments` for the branch `claude/setup-neon-comments-01EvegQGSSGcFAdMDxQEZAwe`.

## Prerequisites

1. **Neon Database Account**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Get your connection string

2. **Environment Variables**
   ```env
   NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   NEON_API_KEY=your-neon-api-key
   ```

## Installation

### Option 1: Neon Serverless Driver

```bash
npm install @neondatabase/serverless
```

### Option 2: Neon Comments Package (if available)

```bash
npm install neon-comments
```

## Integration Steps

### 1. Database Schema

Create the comments table in Neon:

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

### 2. API Routes

Create API routes for comments:

- `app/api/comments/route.ts` - List/create comments
- `app/api/comments/[id]/route.ts` - Get/update/delete comment
- `app/api/comments/[id]/replies/route.ts` - Get replies

### 3. Components

Create React components:

- `components/comments/comment-thread.tsx` - Main comment thread
- `components/comments/comment-item.tsx` - Individual comment
- `components/comments/comment-form.tsx` - Comment input form
- `components/comments/comment-replies.tsx` - Nested replies

### 4. Real-time Updates

Use Neon's real-time capabilities or integrate with Supabase Realtime for live comment updates.

## Development

### Start Development Server

```bash
cd ../worktrees/setup-neon-comments
npm run dev:turbo
```

### Testing

```bash
npm run test
```

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Neon API Reference](https://neon.tech/docs/api-reference)

## Worktree Management

```bash
# List all worktrees
npm run worktree:list

# Remove Neon Comments worktree
npm run worktree:remove ../worktrees/setup-neon-comments
```

## Integration with Existing Stack

The Neon Comments system integrates with:
- **Supabase Auth** - User authentication
- **Next.js 15** - App Router and API routes
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Next Steps

1. Set up Neon database project
2. Configure environment variables
3. Create database schema
4. Implement API routes
5. Build React components
6. Add real-time updates
7. Test integration
8. Deploy to production

