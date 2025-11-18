# ISTANI Fitness Platform - API Documentation

## Overview

The ISTANI API provides comprehensive endpoints for managing fitness data, nutrition tracking, workouts, social features, and AI-powered recommendations.

**Base URL:** `https://istani.org/api`

**Authentication:** Bearer token (JWT) via Supabase Auth

---

## Table of Contents

1. [Authentication](#authentication)
2. [Food & Nutrition](#food--nutrition)
3. [Workouts](#workouts)
4. [AI Features](#ai-features)
5. [Social Features](#social-features)
6. [Analytics](#analytics)
7. [Payments](#payments)
8. [Health Integrations](#health-integrations)

---

## Authentication

### POST `/api/auth`

Authenticate user and obtain JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

## Food & Nutrition

### GET `/api/food/search`

Search for foods in USDA and OpenFoodFacts databases.

**Query Parameters:**
- `query` (required): Search term
- `source`: `usda` | `openfoodfacts` | `both` (default: `both`)
- `page_size`: Number of results (default: 25, max: 100)
- `page`: Page number (default: 1)
- `data_type`: Filter by food type (`Branded`, `SR Legacy`, etc.)
- `autocomplete`: Set to `true` for autocomplete suggestions

**Example Request:**
```
GET /api/food/search?query=chicken%20breast&source=usda&page_size=10
```

**Response:**
```json
{
  "query": "chicken breast",
  "source": "usda",
  "page": 1,
  "pageSize": 10,
  "results": {
    "usda": {
      "foods": [
        {
          "fdcId": 171477,
          "description": "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
          "nutrientProfile": {
            "calories": 165,
            "protein": 31,
            "carbs": 0,
            "fat": 3.6,
            "fiber": 0,
            "vitaminA": 21,
            "vitaminC": 0,
            "calcium": 15,
            "iron": 1.04
          }
        }
      ],
      "totalHits": 342,
      "currentPage": 1,
      "totalPages": 35
    }
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### GET `/api/food/barcode`

Look up food by barcode (UPC/EAN).

**Query Parameters:**
- `code` (required): Barcode number (8-14 digits)
- `source`: `usda` | `openfoodfacts` | `both` (default: `both`)

**Example Request:**
```
GET /api/food/barcode?code=012345678901
```

**Response:**
```json
{
  "success": true,
  "product": {
    "name": "Organic Whole Milk",
    "brand": "Example Brand",
    "barcode": "012345678901",
    "nutrition": {
      "calories": 150,
      "protein": 8,
      "carbs": 12,
      "fats": 8,
      "fiber": 0,
      "sugar": 12,
      "sodium": 120,
      "vitaminA": 500,
      "vitaminD": 2.5,
      "calcium": 300
    },
    "fullNutrientProfile": { /* 30+ micronutrients */ },
    "image": "https://images.openfoodfacts.org/...",
    "servingSize": "240ml",
    "source": "USDA FoodData Central",
    "fdcId": 123456
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## Workouts

### POST `/api/workouts`

Log a workout session.

**Request:**
```json
{
  "type": "strength_training",
  "duration": 60,
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 3,
      "reps": 10,
      "weight": 185,
      "unit": "lbs"
    },
    {
      "name": "Squats",
      "sets": 4,
      "reps": 8,
      "weight": 225,
      "unit": "lbs"
    }
  ],
  "notes": "Felt strong today, increased weight on bench"
}
```

**Response:**
```json
{
  "id": "workout_uuid",
  "user_id": "user_uuid",
  "type": "strength_training",
  "duration": 60,
  "calories_burned": 350,
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

## AI Features

### POST `/api/ai/meal`

Get AI-powered meal recommendations.

**Request:**
```json
{
  "user_profile": {
    "goals": ["muscle_gain", "high_protein"],
    "dietary_restrictions": ["dairy_free"],
    "calorie_target": 2500,
    "macro_targets": {
      "protein": 180,
      "carbs": 250,
      "fat": 80
    },
    "recent_meals": ["Chicken and rice", "Salmon salad"]
  }
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "meal": "Grilled Steak with Sweet Potato and Broccoli",
      "calories": 650,
      "macros": {
        "protein": 52,
        "carbs": 48,
        "fat": 22
      },
      "reason": "High protein, complex carbs for muscle recovery"
    }
  ],
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### POST `/api/ai/workout`

Get AI-powered workout recommendations.

**Request:**
```json
{
  "user_profile": {
    "goals": ["strength", "hypertrophy"],
    "experience": "intermediate",
    "equipment": ["barbell", "dumbbells", "bench"],
    "time_available": 60,
    "recent_workouts": [
      {
        "type": "upper_body",
        "date": "2024-01-14"
      }
    ]
  }
}
```

**Response:**
```json
{
  "workout": {
    "name": "Lower Body Strength",
    "duration": 60,
    "exercises": [
      {
        "name": "Barbell Squats",
        "sets": 4,
        "reps": "6-8",
        "rest": 180,
        "notes": "Focus on depth and control"
      }
    ]
  }
}
```

### POST `/api/ai/photo-recognition`

Analyze food photo and identify items.

**Request:**
```json
{
  "image": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "foods": [
    {
      "name": "Grilled Chicken Breast",
      "confidence": 0.95,
      "nutrition": {
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6
      }
    },
    {
      "name": "Brown Rice",
      "confidence": 0.88,
      "nutrition": {
        "calories": 215,
        "protein": 5,
        "carbs": 45,
        "fat": 1.6
      }
    }
  ],
  "suggestions": [
    "Consider adding vegetables for more fiber and micronutrients",
    "Great protein-to-calorie ratio!"
  ]
}
```

---

## Social Features

### GET `/api/social/friends`

Get user's friends list.

**Response:**
```json
{
  "friends": [
    {
      "id": "friend_uuid",
      "username": "fitness_buddy",
      "avatar_url": "https://...",
      "status": "accepted",
      "created_at": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### POST `/api/social/friend-request`

Send a friend request.

**Request:**
```json
{
  "friend_id": "user_uuid"
}
```

### GET `/api/social/feed`

Get activity feed from friends.

**Query Parameters:**
- `limit`: Number of items (default: 50)

**Response:**
```json
{
  "activities": [
    {
      "id": "activity_uuid",
      "user": {
        "id": "user_uuid",
        "username": "fitness_pro",
        "avatar_url": "https://..."
      },
      "type": "workout",
      "title": "Completed Leg Day",
      "description": "Crushed 4x8 squats at 225lbs!",
      "likes_count": 15,
      "comments_count": 3,
      "created_at": "2024-01-15T09:30:00Z"
    }
  ]
}
```

### GET `/api/social/challenges`

Get active challenges.

**Response:**
```json
{
  "challenges": [
    {
      "id": "challenge_uuid",
      "name": "30-Day Plank Challenge",
      "type": "duration",
      "goal": 1800,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "participants_count": 542,
      "is_public": true
    }
  ]
}
```

---

## Analytics

### GET `/api/analytics/progress`

Get user progress analytics.

**Query Parameters:**
- `start_date`: ISO date
- `end_date`: ISO date
- `metrics`: Comma-separated list (e.g., `weight,calories,workouts`)

**Response:**
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-15"
  },
  "metrics": {
    "weight": {
      "current": 185,
      "start": 190,
      "change": -5,
      "change_percent": -2.6,
      "trend": "decreasing"
    },
    "workouts": {
      "total": 12,
      "average_per_week": 6,
      "total_duration": 720
    },
    "nutrition": {
      "average_calories": 2450,
      "average_protein": 175,
      "compliance_rate": 0.87
    }
  }
}
```

---

## Payments

### POST `/api/checkout`

Create Stripe checkout session.

**Request:**
```json
{
  "product_id": "prod_xyz",
  "quantity": 1,
  "success_url": "https://istani.org/checkout/success",
  "cancel_url": "https://istani.org/cart"
}
```

**Response:**
```json
{
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/webhooks/stripe`

Stripe webhook handler (automatic).

**Events Handled:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Health Integrations

### POST `/api/integrations/apple-health/sync`

Sync data from Apple Health.

**Request:**
```json
{
  "data": {
    "steps": 8542,
    "calories": 2340,
    "heart_rate": 72,
    "weight": 185,
    "sleep": {
      "duration": 480,
      "quality": "good"
    }
  },
  "date": "2024-01-15"
}
```

### POST `/api/integrations/fitbit/sync`

Sync data from Fitbit.

**Request:**
```json
{
  "access_token": "fitbit_token",
  "date": "2024-01-15"
}
```

---

## Rate Limits

- **Free Tier:** 100 requests/hour
- **Pro Tier:** 1,000 requests/hour
- **Enterprise:** Unlimited

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Error Response Format

```json
{
  "error": "Error message",
  "category": "validation",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## SDKs & Libraries

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- iOS SDK
- Android SDK

---

## Support

- **Email:** api@istani.org
- **Docs:** https://docs.istani.org
- **Status:** https://status.istani.org
