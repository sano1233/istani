# 📱 iOS n8n Integration System

**Complete n8n automation for iOS fitness apps with ISTANI platform.**

---

## 🎯 Overview

This system provides **100% open-source** automation between iOS apps and the ISTANI fitness platform using n8n workflows. All integrations use HMAC-secured webhooks for maximum security.

**Zero vendor lock-in • Zero API costs • 100% self-hosted**

---

## 🌐 iOS Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       iOS DEVICES                            │
│   (iPhone, iPad, Apple Watch)                                │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ HTTPS + HMAC Signatures
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                     n8n AUTOMATION HUB                        │
│                   (localhost:5678)                            │
├──────────────────────────────────────────────────────────────┤
│  1. iOS Shortcuts Integration                                │
│  2. iOS Health Data Sync                                     │
│  3. iOS Push Notifications                                   │
│  4. iOS App State Sync                                       │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ Store / Forward
                       │
┌──────────────────────▼───────────────────────────────────────┐
│              ISTANI PLATFORM BACKEND                          │
│    • WordPress API (workout logging)                         │
│    • PostgreSQL (n8n database)                               │
│    • Vercel (web app hosting)                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Start n8n with iOS workflows

```bash
# Start n8n service
docker compose -f compose.n8n.yml up -d

# Verify n8n is running
curl http://localhost:5678/healthz

# Check n8n logs
docker logs n8n
```

### 2. Set environment variables

Add to `.env`:

```bash
# n8n iOS Integration
N8N_ISTANI_SHARED_SECRET=your-secret-here-min-32-chars
N8N_ENCRYPTION_KEY=another-secret-32-chars-min

# iOS APNs (Apple Push Notifications) - Optional
APNS_AUTH_KEY_PATH=/path/to/AuthKey_XXXXXXXX.p8
APNS_KEY_ID=XXXXXXXXXX
APNS_TEAM_ID=XXXXXXXXXX
APNS_BUNDLE_ID=com.istani.fitness
```

### 3. Generate HMAC secret

```bash
# Generate secure 64-character secret
openssl rand -hex 32
```

---

## 📱 iOS Workflows

### 1. iOS Shortcuts Integration

**File**: `n8n/workflows/ios-shortcuts.json`

**Webhook URL**: `http://localhost:5678/webhook/ios-shortcuts`

**Purpose**: Allows iOS Shortcuts app to trigger ISTANI actions.

**Example iOS Shortcut** (Log Workout):

```
1. Dictionary:
   - exercise: "Bench Press"
   - sets: 4
   - reps: 8
   - weight: 80
   - user: "john@example.com"

2. Get Contents of URL:
   - URL: http://your-domain.com/webhook/ios-shortcuts
   - Method: POST
   - Headers:
     * Content-Type: application/json
     * X-Istani-Signature: [Calculate HMAC-SHA256]
   - Request Body: JSON from Dictionary

3. Show Result
```

**Supported Actions**:

- `log_workout` - Log workout from iOS Shortcuts
- `log_meal` - Log nutrition data
- `set_reminder` - Set fitness reminder
- `get_progress` - Retrieve user progress

**Sample Request**:

```json
{
  "action": "log_workout",
  "exercise": "Squat",
  "sets": 5,
  "reps": 5,
  "weight": 100,
  "notes": "Felt strong today",
  "user": "john@example.com",
  "timestamp": "2025-01-24T10:30:00Z"
}
```

---

### 2. iOS Health Data Integration

**File**: `n8n/workflows/ios-health-data.json`

**Webhook URL**: `http://localhost:5678/webhook/ios-health-data`

**Purpose**: Syncs Apple Health data (workouts, steps, heart rate, sleep) with ISTANI platform.

**Data Types Supported**:

1. **Workouts** (`type: "workout"`)
   - Apple Fitness workouts
   - Third-party app workouts
   - Duration, calories, heart rate, distance

2. **Steps** (`type: "steps"`)
   - Daily step count
   - Floors climbed
   - Distance walked/run

3. **Heart Rate** (`type: "heart_rate"`)
   - Resting heart rate
   - Active heart rate
   - Heart rate variability (HRV)

4. **Sleep** (`type: "sleep"`)
   - Sleep duration
   - Sleep stages (deep, REM, light)
   - Sleep quality score

**Sample Request** (Workout):

```json
{
  "type": "workout",
  "workoutType": "Running",
  "duration": 32.5,
  "calories": 320,
  "distance": 5.2,
  "avgHeartRate": 155,
  "maxHeartRate": 178,
  "startTime": "2025-01-24T06:00:00Z",
  "endTime": "2025-01-24T06:32:30Z",
  "user": "john@example.com"
}
```

**Sample Request** (Sleep):

```json
{
  "type": "sleep",
  "duration": 7.5,
  "quality": "good",
  "deepSleep": 1.8,
  "remSleep": 1.5,
  "startTime": "2025-01-23T22:30:00Z",
  "endTime": "2025-01-24T06:00:00Z",
  "user": "john@example.com"
}
```

---

### 3. iOS Push Notifications

**File**: `n8n/workflows/ios-notifications.json`

**Webhook URL**: `http://localhost:5678/webhook/ios-send-notification`

**Purpose**: Send push notifications to iOS devices via APNs (Apple Push Notification service).

**APNs Setup Required**:

1. **Create APNs Auth Key** in Apple Developer Account:
   - Login to developer.apple.com
   - Certificates, Identifiers & Profiles → Keys
   - Create new key with APNs enabled
   - Download `.p8` file

2. **Get required IDs**:
   - **Team ID**: Found in developer.apple.com (top right)
   - **Key ID**: From the APNs key page
   - **Bundle ID**: Your iOS app bundle ID (e.g., `com.istani.fitness`)

3. **Add to environment variables** (see Quick Start above)

**Sample Request**:

```json
{
  "title": "Time for your workout! 💪",
  "body": "Today is Leg Day - 7-Day Rebuild Program",
  "badge": 1,
  "sound": "default",
  "category": "workout_reminder",
  "data": {
    "workout_id": "leg-day-1",
    "program": "7-day-rebuild"
  },
  "deviceToken": "abc123...",
  "user": "john@example.com"
}
```

**Notification Categories**:

- `workout_reminder` - Daily workout reminders
- `achievement` - Achievement unlocked notifications
- `community` - Community updates
- `progress` - Progress milestones

---

### 4. iOS App State Sync

**File**: `n8n/workflows/ios-app-sync.json`

**Webhook URL**: `http://localhost:5678/webhook/ios-app-sync`

**Purpose**: Synchronize iOS app state (workout programs, progress, settings) with backend.

**Sync Types**:

1. **Workout Program** (`syncType: "workout_program"`)

   ```json
   {
     "syncType": "workout_program",
     "user": "john@example.com",
     "programName": "7-Day Rebuild",
     "currentDay": 3,
     "totalDays": 7,
     "workouts": [
       {
         "day": 1,
         "name": "Upper Body Push",
         "exercises": [...],
         "completed": true
       }
     ],
     "appVersion": "1.0.0"
   }
   ```

2. **User Progress** (`syncType: "user_progress"`)

   ```json
   {
     "syncType": "user_progress",
     "user": "john@example.com",
     "totalWorkouts": 42,
     "currentStreak": 7,
     "longestStreak": 21,
     "totalVolume": 125000,
     "personalRecords": [{ "exercise": "Bench Press", "weight": 100, "reps": 5 }],
     "achievements": ["first_workout", "week_streak", "pr_bench_press"]
   }
   ```

3. **Settings** (`syncType: "settings"`)
   ```json
   {
     "syncType": "settings",
     "user": "john@example.com",
     "units": "metric",
     "theme": "dark",
     "notifications": true,
     "reminders": [{ "time": "06:00", "days": ["mon", "wed", "fri"] }],
     "preferences": {
       "restTimerSound": true,
       "formVideos": true
     }
   }
   ```

---

## 🔒 Security

### HMAC Signature Verification

All iOS webhooks require HMAC-SHA256 signature for authentication.

**Calculate Signature** (JavaScript example):

```javascript
const crypto = require('crypto');

function calculateHMAC(payload, secret) {
  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return signature;
}

// Usage
const payload = { action: 'log_workout', ... };
const secret = process.env.N8N_ISTANI_SHARED_SECRET;
const signature = calculateHMAC(payload, secret);

// Send request with header: X-Istani-Signature: <signature>
```

**Calculate Signature** (iOS Swift example):

```swift
import CryptoKit

func calculateHMAC(payload: Data, secret: String) -> String {
    let key = SymmetricKey(data: Data(secret.utf8))
    let signature = HMAC<SHA256>.authenticationCode(for: payload, using: key)
    return signature.map { String(format: "%02x", $0) }.joined()
}

// Usage
let payload = try JSONEncoder().encode(myData)
let secret = "your-secret-here"
let signature = calculateHMAC(payload: payload, secret: secret)

// Add header: "X-Istani-Signature": signature
```

---

## 🧪 Testing iOS Integrations

### Test with curl

```bash
# Generate signature
SECRET="your-secret-here"
PAYLOAD='{"action":"log_workout","exercise":"Test","sets":3,"reps":10,"weight":50,"user":"test@example.com"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# Send request
curl -X POST http://localhost:5678/webhook/ios-shortcuts \
  -H "Content-Type: application/json" \
  -H "X-Istani-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Test with Postman

1. Create POST request to `http://localhost:5678/webhook/ios-shortcuts`
2. Add header: `Content-Type: application/json`
3. Add body (JSON):
   ```json
   {
     "action": "log_workout",
     "exercise": "Bench Press",
     "sets": 4,
     "reps": 8,
     "weight": 80,
     "user": "test@example.com"
   }
   ```
4. Generate HMAC signature using Pre-request Script:
   ```javascript
   const CryptoJS = require('crypto-js');
   const secret = 'your-secret-here';
   const body = pm.request.body.raw;
   const signature = CryptoJS.HmacSHA256(body, secret).toString();
   pm.request.headers.add({
     key: 'X-Istani-Signature',
     value: signature
   });
   ```

---

## 📊 iOS Integration Use Cases

### Use Case 1: Log Workout from iOS Shortcuts

**Scenario**: User completes workout at gym, uses iOS Shortcut to log it instantly.

**Flow**:

1. User opens iOS Shortcuts app
2. Runs "Log Workout" shortcut
3. Enters exercise, sets, reps, weight
4. Shortcut calculates HMAC signature
5. Sends POST to n8n webhook
6. n8n verifies signature
7. n8n stores workout in WordPress
8. User sees confirmation on iPhone

**Benefits**:

- ✅ 5-second workout logging
- ✅ No app switching required
- ✅ Works offline (queued for later sync)

---

### Use Case 2: Apple Health Auto-Sync

**Scenario**: User's Apple Watch tracks workout automatically, data syncs to ISTANI.

**Flow**:

1. User wears Apple Watch during workout
2. Apple Fitness tracks workout automatically
3. iOS Health app receives workout data
4. Third-party app (or Shortcuts automation) sends data to n8n
5. n8n processes workout data
6. Data appears in ISTANI web app
7. User sees detailed analytics on istani.org

**Benefits**:

- ✅ Zero manual logging
- ✅ Accurate heart rate, calories, duration
- ✅ Unified fitness tracking

---

### Use Case 3: Smart Workout Reminders

**Scenario**: n8n sends daily workout reminder to user's iPhone.

**Flow**:

1. n8n checks user's workout schedule
2. At 6:00 AM, triggers iOS notification workflow
3. Sends push notification via APNs
4. User receives notification on iPhone/Apple Watch
5. User taps notification → Opens ISTANI app
6. Workout program loads automatically

**Benefits**:

- ✅ Never miss a workout
- ✅ Personalized timing
- ✅ Direct deep-link to workout

---

### Use Case 4: Cross-Device Sync

**Scenario**: User works out on iOS app, data syncs to web app in real-time.

**Flow**:

1. User completes workout on iOS app
2. iOS app sends sync request to n8n
3. n8n updates backend database
4. Web app receives real-time update (via WebSockets or polling)
5. User opens istani.org on laptop
6. Sees workout just logged on iPhone

**Benefits**:

- ✅ Seamless multi-device experience
- ✅ No data loss
- ✅ Real-time synchronization

---

## 🔧 Advanced Configuration

### Enable APNs Production Mode

For production iOS apps, use production APNs server:

```bash
# Production APNs endpoint
APNS_ENDPOINT=https://api.push.apple.com/3/device/{deviceToken}

# Sandbox APNs endpoint (for development)
APNS_ENDPOINT=https://api.sandbox.push.apple.com/3/device/{deviceToken}
```

### Add Rate Limiting

Protect webhooks from abuse:

```javascript
// In n8n Code node
const redis = require('redis');
const client = redis.createClient();

const user = $json.user || 'anonymous';
const key = `rate_limit:${user}`;
const limit = 100; // 100 requests per hour

const count = await client.incr(key);
if (count === 1) {
  await client.expire(key, 3600); // 1 hour TTL
}

if (count > limit) {
  return [{ ok: false, reason: 'rate_limit_exceeded' }];
}

// Continue processing...
```

### Database Storage

Store iOS data in n8n's PostgreSQL database:

```javascript
// In n8n Code node
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DB_POSTGRESDB_URL
});

const workout = $json.workout;

await pool.query(
  `INSERT INTO workouts (user_id, exercise, sets, reps, weight, created_at)
   VALUES ($1, $2, $3, $4, $5, NOW())`,
  [workout.user, workout.exercise, workout.sets, workout.reps, workout.weight]
);
```

---

## 📚 iOS App Integration Guide

### SwiftUI Example

```swift
import SwiftUI

struct WorkoutLogger {
    let webhookURL = "https://your-domain.com/webhook/ios-shortcuts"
    let secret = "your-secret-here"

    func logWorkout(exercise: String, sets: Int, reps: Int, weight: Double) async throws {
        let payload = WorkoutPayload(
            action: "log_workout",
            exercise: exercise,
            sets: sets,
            reps: reps,
            weight: weight,
            user: "user@example.com",
            timestamp: ISO8601DateFormatter().string(from: Date())
        )

        let jsonData = try JSONEncoder().encode(payload)
        let signature = calculateHMAC(payload: jsonData, secret: secret)

        var request = URLRequest(url: URL(string: webhookURL)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(signature, forHTTPHeaderField: "X-Istani-Signature")
        request.httpBody = jsonData

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw WorkoutError.serverError
        }

        let result = try JSONDecoder().decode(WorkoutResponse.self, from: data)
        print("✅ Workout logged: \(result.message)")
    }
}
```

---

## 🎯 Next Steps

1. **Start n8n**: `docker compose -f compose.n8n.yml up -d`
2. **Test webhooks**: Use curl or Postman to test each endpoint
3. **Create iOS Shortcuts**: Build shortcuts for common actions
4. **Integrate iOS app**: Use Swift examples above
5. **Set up APNs**: Configure push notifications (optional)
6. **Monitor workflows**: Check n8n execution logs

---

## 📖 Resources

- **n8n Documentation**: https://docs.n8n.io
- **Apple Push Notifications**: https://developer.apple.com/documentation/usernotifications
- **iOS Shortcuts**: https://support.apple.com/guide/shortcuts/welcome/ios
- **HealthKit Integration**: https://developer.apple.com/documentation/healthkit

---

**Your iOS apps are now fully integrated with ISTANI platform! 📱💪**

**Repository**: `sano1233/istani`
**n8n Hub**: `http://localhost:5678`
**100% Open Source**: No vendor lock-in, no API costs
**HMAC Secured**: Military-grade authentication
