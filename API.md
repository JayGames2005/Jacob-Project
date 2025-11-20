# API Documentation

Base URL: `http://localhost:3000/api`

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}

Response: 201
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "status": "OFFLINE"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

## Users

### Get Current User
```http
GET /users/me
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "display_name": null,
  "avatar": null,
  "status": "ONLINE"
}
```

### Update Profile
```http
PATCH /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "display_name": "Display Name",
  "bio": "My bio",
  "custom_status": "Playing games"
}

Response: 200
{ updated user object }
```

### Update Status
```http
PATCH /users/me/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "ONLINE" // ONLINE, IDLE, DND, OFFLINE
}

Response: 200
{
  "message": "Status updated",
  "status": "ONLINE"
}
```

## Servers

### Create Server
```http
POST /servers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Server",
  "description": "Server description"
}

Response: 201
{
  "id": "uuid",
  "name": "My Server",
  "description": "Server description",
  "owner_id": "user_uuid",
  "invite_code": "abc123xyz"
}
```

### Get User's Servers
```http
GET /servers
Authorization: Bearer {token}

Response: 200
[
  {
    "id": "uuid",
    "name": "Server 1",
    ...
  }
]
```

### Get Server Details
```http
GET /servers/:id
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "name": "Server Name",
  "channels": [...],
  "members": [...]
}
```

### Join Server
```http
POST /servers/join/:inviteCode
Authorization: Bearer {token}

Response: 200
{
  "message": "Joined server successfully",
  "server": { ... }
}
```

### Delete Server
```http
DELETE /servers/:id
Authorization: Bearer {token}

Response: 200
{
  "message": "Server deleted successfully"
}
```

## Channels

### Create Channel
```http
POST /channels
Authorization: Bearer {token}
Content-Type: application/json

{
  "server_id": "server_uuid",
  "name": "channel-name",
  "type": "TEXT", // TEXT, VOICE, VIDEO
  "category_id": null
}

Response: 201
{
  "id": "uuid",
  "server_id": "server_uuid",
  "name": "channel-name",
  "type": "TEXT"
}
```

### Get Channel
```http
GET /channels/:id
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "name": "channel-name",
  "type": "TEXT"
}
```

### Delete Channel
```http
DELETE /channels/:id
Authorization: Bearer {token}

Response: 200
{
  "message": "Channel deleted successfully"
}
```

## Messages

### Get Messages
```http
GET /messages/:channelId?limit=50&before=message_id
Authorization: Bearer {token}

Response: 200
[
  {
    "id": "uuid",
    "channel_id": "channel_uuid",
    "user_id": "user_uuid",
    "content": "Message text",
    "username": "username",
    "created_at": "timestamp"
  }
]
```

### Send Message (REST)
```http
POST /messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "channel_id": "channel_uuid",
  "content": "Message text",
  "attachments": []
}

Response: 201
{
  "id": "uuid",
  "content": "Message text",
  ...
}
```

### Delete Message
```http
DELETE /messages/:id
Authorization: Bearer {token}

Response: 200
{
  "message": "Message deleted successfully"
}
```

## WebSocket Events

Connect to: `ws://localhost:3000`

Authentication:
```javascript
const socket = io({
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Client → Server Events

#### Join Servers
```javascript
socket.emit('join:servers');
```

#### Join Channel
```javascript
socket.emit('channel:join', channelId);
```

#### Leave Channel
```javascript
socket.emit('channel:leave', channelId);
```

#### Send Message
```javascript
socket.emit('message:send', {
  channelId: 'channel_uuid',
  content: 'Message text',
  attachments: []
});
```

#### Typing Indicator
```javascript
// Start typing
socket.emit('typing:start', channelId);

// Stop typing
socket.emit('typing:stop', channelId);
```

#### Voice Channel
```javascript
// Join voice
socket.emit('voice:join', { channelId });

// Leave voice
socket.emit('voice:leave', { channelId });
```

#### WebRTC Signaling
```javascript
// Send offer
socket.emit('webrtc:offer', {
  targetUserId: 'user_uuid',
  offer: rtcSessionDescription
});

// Send answer
socket.emit('webrtc:answer', {
  targetUserId: 'user_uuid',
  answer: rtcSessionDescription
});

// Send ICE candidate
socket.emit('webrtc:ice-candidate', {
  targetUserId: 'user_uuid',
  candidate: iceCandidate
});
```

### Server → Client Events

#### New Message
```javascript
socket.on('message:new', (message) => {
  // Handle new message
});
```

#### User Status Update
```javascript
socket.on('user:status', (data) => {
  // { userId, status }
});
```

#### Typing Indicator
```javascript
socket.on('typing:start', (data) => {
  // { channelId, userId, username }
});

socket.on('typing:stop', (data) => {
  // { channelId, userId }
});
```

#### Voice Events
```javascript
socket.on('voice:user-joined', (data) => {
  // { userId, username }
});

socket.on('voice:user-left', (data) => {
  // { userId }
});

socket.on('voice:users-list', (users) => {
  // Array of users in voice channel
});
```

#### WebRTC Signaling
```javascript
socket.on('webrtc:offer', (data) => {
  // { fromUserId, offer }
});

socket.on('webrtc:answer', (data) => {
  // { fromUserId, answer }
});

socket.on('webrtc:ice-candidate', (data) => {
  // { fromUserId, candidate }
});
```

## Error Responses

All endpoints may return these error codes:

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error format:
```json
{
  "error": "Error message description"
}
```

## Rate Limiting

- 100 requests per minute per IP
- Applies to `/api/*` endpoints only
- Returns `429 Too Many Requests` when exceeded
