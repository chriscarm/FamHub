# Smart Display Backend API Specification

> **Purpose**: This document provides a complete, technology-agnostic specification for building the Smart Display backend. It describes WHAT the API needs to do, not HOW to implement it. Choose whatever backend technologies (Node.js, Python, Go, etc.), database (PostgreSQL, MongoDB, SQLite, etc.), and hosting approach works best.

---

## Table of Contents

1. [Project Context](#project-context)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Google Calendar Integration](#google-calendar-integration)
5. [Authentication & Security](#authentication--security)
6. [Response Formats](#response-formats)
7. [Environment Variables](#environment-variables)
8. [Optional Enhancements](#optional-enhancements)

---

## Project Context

### What is Smart Display?

Smart Display is a tablet application designed to run as a digital photo frame with integrated family organization features. It displays on a wall-mounted tablet in the home.

### Core Features

1. **Photo Slideshow**: Cycles through family photos automatically
2. **Shared Calendar**: Shows upcoming events for two people (Chris and Christy) synced from their separate Google Calendar accounts
3. **Todo Lists**: Per-person todo lists manageable via voice commands
4. **Voice Control**: Wake-word activated voice commands (handled client-side)

### What Already Exists

The **React Native/Expo mobile app** is already built with:
- Slideshow component with image transitions
- Calendar overlay showing events color-coded by person
- Todo list display with per-person filtering
- Voice command parsing (client-side)
- Zustand state management

### What This Backend Provides

This backend API will:
- Store and serve slideshow images
- Sync and store calendar events from two Google accounts
- Persist todo items across sessions
- Provide RESTful endpoints for all data operations

The mobile app will replace its mock data with API calls to this backend.

---

## Data Models

### Person (Enum)

```
"chris" | "christy"
```

Used throughout the system to associate data with one of the two users.

---

### Image

Represents a photo in the slideshow rotation.

| Field       | Type     | Required | Description                                    |
|-------------|----------|----------|------------------------------------------------|
| id          | string   | Yes      | Unique identifier (UUID recommended)           |
| url         | string   | Yes      | Public URL to the image file                   |
| title       | string   | No       | Optional display title                         |
| uploadedAt  | datetime | Yes      | When the image was uploaded (ISO 8601)         |
| sortOrder   | integer  | Yes      | Display order in slideshow (lower = earlier)   |

**Example:**
```json
{
  "id": "img_abc123",
  "url": "https://your-storage.com/images/vacation-2024.jpg",
  "title": "Beach Vacation 2024",
  "uploadedAt": "2024-03-15T10:30:00Z",
  "sortOrder": 5
}
```

---

### CalendarEvent

Represents a calendar event synced from Google Calendar.

| Field         | Type     | Required | Description                                      |
|---------------|----------|----------|--------------------------------------------------|
| id            | string   | Yes      | Unique identifier (UUID recommended)             |
| title         | string   | Yes      | Event title/summary                              |
| date          | string   | Yes      | Event date in YYYY-MM-DD format                  |
| time          | string   | No       | Event time in HH:MM format (24-hour), null for all-day |
| person        | Person   | Yes      | Which person this event belongs to               |
| googleEventId | string   | No       | Original Google Calendar event ID for sync       |

**Example:**
```json
{
  "id": "evt_xyz789",
  "title": "Dentist Appointment",
  "date": "2024-03-20",
  "time": "14:30",
  "person": "christy",
  "googleEventId": "google_event_abc123xyz"
}
```

---

### TodoItem

Represents a todo item for one of the users.

| Field      | Type     | Required | Description                              |
|------------|----------|----------|------------------------------------------|
| id         | string   | Yes      | Unique identifier (UUID recommended)     |
| text       | string   | Yes      | The todo item text                       |
| person     | Person   | Yes      | Which person this todo belongs to        |
| completed  | boolean  | Yes      | Whether the item is completed            |
| createdAt  | datetime | Yes      | When the item was created (ISO 8601)     |

**Example:**
```json
{
  "id": "todo_def456",
  "text": "Pick up groceries",
  "person": "chris",
  "completed": false,
  "createdAt": "2024-03-18T09:15:00Z"
}
```

---

## API Endpoints

Base URL: `https://your-api-domain.com/api/v1`

---

### Health Check

#### `GET /health`

Returns API health status. Use for monitoring and deployment verification.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2024-03-18T12:00:00Z"
}
```

---

### Images API

#### `GET /images`

Retrieve all images for the slideshow, ordered by `sortOrder`.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "img_001",
      "url": "https://storage.example.com/images/photo1.jpg",
      "title": "Mountain Sunrise",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "sortOrder": 1
    },
    {
      "id": "img_002",
      "url": "https://storage.example.com/images/photo2.jpg",
      "title": null,
      "uploadedAt": "2024-02-20T14:45:00Z",
      "sortOrder": 2
    }
  ]
}
```

---

#### `GET /images/:id`

Retrieve a single image by ID.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "img_001",
    "url": "https://storage.example.com/images/photo1.jpg",
    "title": "Mountain Sunrise",
    "uploadedAt": "2024-01-15T10:30:00Z",
    "sortOrder": 1
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Image not found"
  }
}
```

---

#### `POST /images`

Upload a new image. Accepts multipart form data.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `file` (required): Image file (JPEG, PNG, WebP)
  - `title` (optional): String title for the image

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "img_003",
    "url": "https://storage.example.com/images/photo3.jpg",
    "title": "Family Dinner",
    "uploadedAt": "2024-03-18T16:20:00Z",
    "sortOrder": 3
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE",
    "message": "File must be a valid image (JPEG, PNG, or WebP)"
  }
}
```

---

#### `PATCH /images/:id`

Update image metadata (title, sortOrder).

**Request:**
```json
{
  "title": "Updated Title",
  "sortOrder": 5
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "img_001",
    "url": "https://storage.example.com/images/photo1.jpg",
    "title": "Updated Title",
    "uploadedAt": "2024-01-15T10:30:00Z",
    "sortOrder": 5
  }
}
```

---

#### `DELETE /images/:id`

Delete an image from the slideshow.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "id": "img_001"
  }
}
```

---

#### `PUT /images/reorder`

Bulk update the sort order of images.

**Request:**
```json
{
  "order": [
    { "id": "img_003", "sortOrder": 1 },
    { "id": "img_001", "sortOrder": 2 },
    { "id": "img_002", "sortOrder": 3 }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "updated": 3
  }
}
```

---

### Calendar API

#### `GET /calendar/events`

Retrieve calendar events. Supports filtering by person and date range.

**Query Parameters:**
| Parameter  | Type   | Required | Description                           |
|------------|--------|----------|---------------------------------------|
| person     | string | No       | Filter by "chris" or "christy"        |
| startDate  | string | No       | Start of date range (YYYY-MM-DD)      |
| endDate    | string | No       | End of date range (YYYY-MM-DD)        |

**Example Request:**
```
GET /calendar/events?person=chris&startDate=2024-03-01&endDate=2024-03-31
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "evt_001",
      "title": "Team Meeting",
      "date": "2024-03-15",
      "time": "10:00",
      "person": "chris",
      "googleEventId": "abc123"
    },
    {
      "id": "evt_002",
      "title": "Project Deadline",
      "date": "2024-03-20",
      "time": null,
      "person": "chris",
      "googleEventId": "def456"
    }
  ]
}
```

---

#### `POST /calendar/sync`

Trigger a manual sync of calendar events from Google Calendar.

**Request:**
```json
{
  "person": "chris"
}
```

If `person` is omitted, sync both accounts.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "synced": {
      "chris": 15,
      "christy": 12
    },
    "lastSyncAt": "2024-03-18T12:30:00Z"
  }
}
```

---

#### `GET /calendar/sync/status`

Get the last sync status for each person.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "chris": {
      "lastSyncAt": "2024-03-18T12:30:00Z",
      "eventCount": 15,
      "status": "success"
    },
    "christy": {
      "lastSyncAt": "2024-03-18T12:30:00Z",
      "eventCount": 12,
      "status": "success"
    }
  }
}
```

---

### Todos API

#### `GET /todos`

Retrieve all todos. Supports filtering by person and completion status.

**Query Parameters:**
| Parameter  | Type    | Required | Description                           |
|------------|---------|----------|---------------------------------------|
| person     | string  | No       | Filter by "chris" or "christy"        |
| completed  | boolean | No       | Filter by completion status           |

**Example Request:**
```
GET /todos?person=christy&completed=false
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "todo_001",
      "text": "Call mom",
      "person": "christy",
      "completed": false,
      "createdAt": "2024-03-17T08:00:00Z"
    },
    {
      "id": "todo_002",
      "text": "Order birthday gift",
      "person": "christy",
      "completed": false,
      "createdAt": "2024-03-18T09:15:00Z"
    }
  ]
}
```

---

#### `GET /todos/:id`

Retrieve a single todo by ID.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "todo_001",
    "text": "Call mom",
    "person": "christy",
    "completed": false,
    "createdAt": "2024-03-17T08:00:00Z"
  }
}
```

---

#### `POST /todos`

Create a new todo item.

**Request:**
```json
{
  "text": "Buy flowers for anniversary",
  "person": "chris"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "todo_003",
    "text": "Buy flowers for anniversary",
    "person": "chris",
    "completed": false,
    "createdAt": "2024-03-18T14:00:00Z"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "text is required",
    "details": {
      "field": "text"
    }
  }
}
```

---

#### `PATCH /todos/:id`

Update a todo item (text or completed status).

**Request:**
```json
{
  "completed": true
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "todo_001",
    "text": "Call mom",
    "person": "christy",
    "completed": true,
    "createdAt": "2024-03-17T08:00:00Z"
  }
}
```

---

#### `DELETE /todos/:id`

Delete a todo item.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "id": "todo_001"
  }
}
```

---

#### `DELETE /todos`

Bulk delete todos. Useful for clearing completed items.

**Query Parameters:**
| Parameter  | Type    | Required | Description                           |
|------------|---------|----------|---------------------------------------|
| person     | string  | No       | Only delete for this person           |
| completed  | boolean | No       | Only delete items matching this status|

**Example Request:**
```
DELETE /todos?person=chris&completed=true
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "deleted": 5
  }
}
```

---

## Google Calendar Integration

### Overview

The backend must sync calendar events from two separate Google accounts (one for Chris, one for Christy) and store them locally for fast retrieval by the mobile app.

### Firebase Auth with Google Sign-In

Instead of implementing OAuth manually, use **Firebase Authentication** with Google Sign-In. This handles all the complexity for you.

1. **Setup Firebase Project**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Google Sign-In under Authentication → Sign-in methods
   - Add your app (iOS/Android) and download config files
   - Enable Google Calendar API in linked Google Cloud project

2. **How It Works**
   - User taps "Sign in with Google" in the app
   - Firebase handles the entire sign-in flow
   - App receives Firebase ID token + Google OAuth access token
   - App sends tokens to backend for calendar access

3. **App-Side Implementation**
   ```javascript
   // Using @react-native-firebase/auth
   import auth from '@react-native-firebase/auth';
   import { GoogleSignin } from '@react-native-google-signin/google-signin';

   // Configure with your web client ID
   GoogleSignin.configure({
     webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
     scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
   });

   // Sign in
   const { idToken, accessToken } = await GoogleSignin.signIn();
   const credential = auth.GoogleAuthProvider.credential(idToken);
   await auth().signInWithCredential(credential);

   // Send accessToken to backend for calendar sync
   ```

4. **Backend Endpoints**

   #### `POST /auth/register-token`

   Store Google access token for calendar sync.

   **Request:**
   ```json
   {
     "person": "chris",
     "email": "chris@gmail.com",
     "accessToken": "ya29.xxx...",
     "refreshToken": "1//xxx..."
   }
   ```

   **Response 200:**
   ```json
   {
     "success": true,
     "data": {
       "person": "chris",
       "email": "chris@gmail.com",
       "registered": true
     }
   }
   ```

   ---

   #### `GET /auth/status`

   Check who is connected.

   **Response 200:**
   ```json
   {
     "success": true,
     "data": {
       "chris": {
         "connected": true,
         "email": "chris@gmail.com"
       },
       "christy": {
         "connected": true,
         "email": "christy@gmail.com"
       }
     }
   }
   ```

### Sync Strategy

1. **Automatic Sync**: Run every 15 minutes via background job/cron
2. **Manual Sync**: Triggered via `POST /calendar/sync`
3. **Sync Window**: Fetch events from 1 month ago to 3 months ahead
4. **Event Merging Logic**:
   - Use `googleEventId` to identify existing events
   - Update existing events if Google data changed
   - Delete local events that no longer exist in Google
   - Insert new events from Google

### Required Google Calendar Scopes

```
https://www.googleapis.com/auth/calendar.readonly
```

For future write access (creating events from the app):
```
https://www.googleapis.com/auth/calendar.events
```

---

## Authentication & Security

### API Key Authentication

The mobile app authenticates using a simple API key passed in the request header.

**Header Format:**
```
X-API-Key: your-api-key-here
```

**Implementation Notes:**
- Generate a secure random API key (minimum 32 characters)
- Validate the key on every request except `/health`
- Return 401 Unauthorized for missing/invalid keys

**Response 401:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

### CORS Configuration

For development, allow requests from:
- `http://localhost:*` (Expo development)
- `exp://*` (Expo Go app)

For production, restrict to your app's actual origin or use a more permissive policy since the app uses API key auth.

**Recommended CORS Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-API-Key
```

### Sensitive Data Protection

- Store Google access tokens encrypted at rest
- Never expose tokens in API responses
- Log API requests but redact sensitive headers
- Use HTTPS for all production endpoints

---

## Response Formats

### Standard Success Response

All successful responses follow this envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

For list endpoints, `data` is an array. For single-item endpoints, `data` is an object.

### Standard Error Response

All error responses follow this envelope:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### Error Codes

| Code              | HTTP Status | Description                          |
|-------------------|-------------|--------------------------------------|
| VALIDATION_ERROR  | 400         | Request body/params failed validation|
| INVALID_FILE      | 400         | Uploaded file is invalid             |
| UNAUTHORIZED      | 401         | Missing or invalid API key           |
| FORBIDDEN         | 403         | Action not permitted                 |
| NOT_FOUND         | 404         | Resource not found                   |
| CONFLICT          | 409         | Resource already exists              |
| INTERNAL_ERROR    | 500         | Server error                         |
| GOOGLE_API_ERROR  | 502         | Google Calendar API error            |
| GOOGLE_API_ERROR  | 502         | Google API request failed            |

### Pagination (Optional)

If implementing pagination for large datasets:

**Request:**
```
GET /images?page=2&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

## Environment Variables

The following environment variables are required:

### Required

| Variable                  | Description                                       |
|---------------------------|---------------------------------------------------|
| `API_KEY`                 | Secret key for mobile app authentication          |
| `DATABASE_URL`            | Connection string for database                    |
| `FIREBASE_PROJECT_ID`     | Firebase project ID                               |
| `ENCRYPTION_KEY`          | Key for encrypting stored tokens at rest          |

### Optional

| Variable                  | Description                                       | Default |
|---------------------------|---------------------------------------------------|---------|
| `PORT`                    | HTTP server port                                  | 3000    |
| `NODE_ENV` / `ENVIRONMENT`| Environment (development/production)              | development |
| `STORAGE_BUCKET`          | Cloud storage bucket name for images              | (local) |
| `STORAGE_REGION`          | Cloud storage region                              | -       |
| `CALENDAR_SYNC_INTERVAL`  | Minutes between automatic calendar syncs          | 15      |
| `CORS_ORIGINS`            | Comma-separated allowed origins                   | *       |
| `LOG_LEVEL`               | Logging verbosity (debug/info/warn/error)         | info    |

---

## Optional Enhancements

These features are nice-to-have but not required for initial launch:

### 1. WebSocket for Real-Time Updates

Enable the tablet display to receive instant updates without polling.

**Events to broadcast:**
- `image:added` - New image uploaded
- `image:deleted` - Image removed
- `image:reordered` - Slideshow order changed
- `todo:created` - New todo added
- `todo:updated` - Todo marked complete/updated
- `todo:deleted` - Todo removed
- `calendar:synced` - Calendar sync completed

**Connection:**
```
wss://api.example.com/ws?apiKey=your-api-key
```

**Message Format:**
```json
{
  "event": "todo:created",
  "data": {
    "id": "todo_003",
    "text": "New todo item",
    "person": "chris",
    "completed": false,
    "createdAt": "2024-03-18T14:00:00Z"
  }
}
```

### 2. Image Optimization

Process uploaded images to optimize for display:
- Resize large images to max 1920x1200
- Convert to WebP format for smaller file sizes
- Generate thumbnails for list views
- Strip EXIF data for privacy

### 3. Caching Strategy

Implement caching for frequently accessed data:
- Cache GET /images response (invalidate on upload/delete/reorder)
- Cache GET /calendar/events response (invalidate on sync)
- Use ETags or Last-Modified headers for conditional requests
- Consider Redis or similar for production

### 4. Image Metadata Extraction

Extract and store image metadata on upload:
- Date taken (from EXIF)
- GPS location (optional, for organizing by trip/location)
- Camera/device info

### 5. Bulk Operations

Additional endpoints for efficiency:
- `POST /todos/bulk` - Create multiple todos at once
- `PATCH /todos/bulk` - Update multiple todos (e.g., complete all)

---

## Implementation Checklist

Use this checklist to track implementation progress:

### Core API
- [ ] Project setup with chosen framework
- [ ] Database schema/models created
- [ ] Health check endpoint
- [ ] API key authentication middleware
- [ ] Error handling middleware
- [ ] CORS configuration

### Images
- [ ] GET /images (list all)
- [ ] GET /images/:id
- [ ] POST /images (upload)
- [ ] PATCH /images/:id
- [ ] DELETE /images/:id
- [ ] PUT /images/reorder
- [ ] File storage integration

### Calendar
- [ ] GET /calendar/events (with filters)
- [ ] POST /calendar/sync
- [ ] GET /calendar/sync/status
- [ ] Background sync job

### Todos
- [ ] GET /todos (with filters)
- [ ] GET /todos/:id
- [ ] POST /todos
- [ ] PATCH /todos/:id
- [ ] DELETE /todos/:id
- [ ] DELETE /todos (bulk)

### Authentication (Firebase)
- [ ] POST /auth/register-token
- [ ] GET /auth/status
- [ ] Token encryption at rest

### Deployment
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Logging configured
- [ ] Error monitoring (optional)

---

## Questions?

If anything in this specification is unclear or you need additional details, the key decisions are:

1. **Technology choice is yours** - Use whatever backend stack you're comfortable with
2. **Database choice is yours** - SQL or NoSQL, whatever fits best
3. **Hosting is yours** - Deploy wherever makes sense (Replit, Railway, Render, etc.)
4. **File storage is yours** - Local filesystem, S3, Cloudflare R2, etc.

The mobile app expects the API to follow the request/response formats documented above. As long as the endpoints return data in these formats, the frontend will work correctly.
