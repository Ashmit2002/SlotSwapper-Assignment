# SlotSwapper API Documentation

## Overview

SlotSwapper is a peer-to-peer time-slot scheduling application that allows users to swap their busy calendar slots with other users.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Events Management

#### Get User Events

```http
GET /events
Authorization: Bearer <token>
```

#### Create Event

```http
POST /events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "startTime": "2025-11-10T10:00:00.000Z",
  "endTime": "2025-11-10T11:00:00.000Z",
  "status": "BUSY",
  "description": "Weekly team sync meeting"
}
```

Status values: `BUSY`, `SWAPPABLE`, `SWAP_PENDING`

#### Update Event

```http
PUT /events/:eventId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Meeting Title",
  "status": "SWAPPABLE"
}
```

#### Delete Event

```http
DELETE /events/:eventId
Authorization: Bearer <token>
```

### Core Swap Functionality

#### Get Swappable Slots

Get all slots from other users that are marked as SWAPPABLE.

```http
GET /swappable-slots
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "slot_id",
      "title": "Focus Block",
      "startTime": "2025-11-12T14:00:00.000Z",
      "endTime": "2025-11-12T15:00:00.000Z",
      "status": "SWAPPABLE",
      "userId": {
        "_id": "user_id",
        "username": "janedoe",
        "fullName": {
          "firstName": "Jane",
          "lastName": "Doe"
        }
      }
    }
  ]
}
```

#### Create Swap Request

Request to swap your slot with another user's slot.

```http
POST /swap-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "mySlotId": "your_slot_id",
  "theirSlotId": "their_slot_id",
  "message": "Would like to swap my Tuesday meeting for your Wednesday focus block"
}
```

Response:

```json
{
  "success": true,
  "message": "Swap request created successfully",
  "data": {
    "_id": "swap_request_id",
    "requesterId": "your_user_id",
    "receiverId": "their_user_id",
    "requesterSlotId": "your_slot_id",
    "receiverSlotId": "their_slot_id",
    "status": "PENDING",
    "message": "Would like to swap...",
    "createdAt": "2025-11-05T...",
    "updatedAt": "2025-11-05T..."
  }
}
```

#### Respond to Swap Request

Accept or reject an incoming swap request.

```http
POST /swap-response/:requestId
Authorization: Bearer <token>
Content-Type: application/json

{
  "accept": true
}
```

For acceptance:

```json
{
  "success": true,
  "message": "Swap request accepted successfully. Events have been exchanged."
}
```

For rejection:

```json
{
  "success": true,
  "message": "Swap request rejected. Slots are now available for other swaps."
}
```

### Additional Endpoints

#### Get Swap Requests

Get swap requests for the current user.

```http
GET /swap-requests?type=all
Authorization: Bearer <token>
```

Query parameters:

- `type`: `sent` (requests you sent), `received` (requests you received), `all` (default)

## Event Status Flow

1. **BUSY**: Default status for events
2. **SWAPPABLE**: User marks event as available for swapping
3. **SWAP_PENDING**: Event is involved in a pending swap request
4. **BUSY**: Event returns to busy after successful swap or rejection

## Swap Request Flow

1. User A marks their event as `SWAPPABLE`
2. User B sees the event in `/swappable-slots`
3. User B creates a swap request via `/swap-request`
4. Both events become `SWAP_PENDING`
5. User A responds via `/swap-response/:requestId`
   - If **accepted**: Events exchange ownership and become `BUSY`
   - If **rejected**: Events return to `SWAPPABLE`

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found
- `500`: Internal Server Error

## Database Schema

### User

- `username`: String (unique)
- `email`: String (unique)
- `password`: String (hashed)
- `fullName`: { firstName, lastName }

### Event

- `title`: String
- `startTime`: Date
- `endTime`: Date
- `status`: Enum ['BUSY', 'SWAPPABLE', 'SWAP_PENDING']
- `userId`: ObjectId (ref: User)
- `description`: String

### SwapRequest

- `requesterId`: ObjectId (ref: User)
- `receiverId`: ObjectId (ref: User)
- `requesterSlotId`: ObjectId (ref: Event)
- `receiverSlotId`: ObjectId (ref: Event)
- `status`: Enum ['PENDING', 'ACCEPTED', 'REJECTED']
- `message`: String

## Getting Started

1. Install dependencies: `npm install`
2. Set up your `.env` file (see `.env.example`)
3. Start MongoDB
4. Run the server: `npm run dev`
5. Test the endpoints using Postman or similar tool

## Example Usage Flow

1. Register two users
2. Login as User A, create an event and mark it as `SWAPPABLE`
3. Login as User B, create an event and mark it as `SWAPPABLE`
4. As User A, get swappable slots and create a swap request
5. As User B, check received swap requests and respond (accept/reject)
6. Verify that events have been swapped between users
