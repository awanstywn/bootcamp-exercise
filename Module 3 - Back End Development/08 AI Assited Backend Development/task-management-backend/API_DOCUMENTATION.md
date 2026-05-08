# Task Management Backend API Documentation

## Overview

This is a fully functional task management backend built with Express.js, TypeScript, Prisma ORM, and PostgreSQL (Supabase). It implements user authentication with JWT tokens and comprehensive task CRUD operations with filtering and pagination.

## Architecture

```
Express Server
├── Authentication Routes (register, login, profile)
├── Task Routes (CRUD + filtering + pagination)
├── Middleware Layer (JWT auth, error handling, validation)
├── Service Layer (business logic)
├── Prisma ORM (data persistence)
└── PostgreSQL Database (Supabase)
```

## Key Features

- **User Authentication**: JWT-based token authentication with bcrypt password hashing
- **Private Tasks**: Each user can only access their own tasks
- **Soft Delete**: Tasks are archived (deleted_at) rather than hard-deleted for audit trails
- **Advanced Filtering**: Filter by status, priority, date range, and search keywords
- **Page-based Pagination**: Default limit 20, max 100 items per page
- **Input Validation**: Express-validator on all endpoints
- **Error Handling**: Global error handler with proper HTTP status codes
- **CORS**: Enabled for cross-origin requests

## Project Structure

```
src/
├── routes/
│   ├── auth.routes.ts          # User authentication endpoints
│   └── task.routes.ts          # Task CRUD endpoints
├── services/
│   ├── auth.service.ts         # Authentication business logic
│   └── task.service.ts         # Task business logic
├── middlewares/
│   ├── auth.ts                 # JWT verification middleware
│   ├── errorHandler.ts         # Global error handling
│   └── validation.ts           # Request validation rules
├── utils/
│   ├── jwt.ts                  # JWT token generation/verification
│   ├── password.ts             # Password hashing/comparison
│   └── response.ts             # Standardized response format
├── prisma/
│   └── client.ts               # Prisma client singleton
└── server.ts                   # Express app entry point
```

## Database Schema

### Users Table
```
id          - CUID primary key
email       - Unique email address
name        - Optional user name
password    - Bcrypt hashed password
created_at  - Timestamp
updated_at  - Timestamp
deleted_at  - Soft delete marker (nullable)
```

### Tasks Table
```
id          - CUID primary key
user_id     - Foreign key to users
title       - Task title (required)
description - Optional task description
status      - Enum: TODO, IN_PROGRESS, DONE
priority    - Enum: LOW, MEDIUM, HIGH
due_date    - Optional deadline
created_at  - Timestamp
updated_at  - Timestamp
deleted_at  - Soft delete marker (nullable)
```

### Indexes for Performance
- Users: email (login lookup)
- Tasks: (user_id, deleted_at), (user_id, status, deleted_at), due_date, created_at

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx123abc",
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "timestamp": "2026-05-07T12:00:00Z"
}
```

**Validation Rules:**
- email: must be valid email format
- password: minimum 8 characters
- name: optional string

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx123abc",
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "timestamp": "2026-05-07T12:00:00Z"
}
```

#### Get User Profile
```
GET /api/auth/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "clx123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-05-01T10:00:00Z"
  },
  "timestamp": "2026-05-07T12:00:00Z"
}
```

### Task Management

#### Create Task
```
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design homepage mockup",
  "description": "Create Figma mockup for new landing page",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-05-15T17:00:00Z"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "task123",
    "userId": "clx123abc",
    "title": "Design homepage mockup",
    "description": "Create Figma mockup for new landing page",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-05-15T17:00:00Z",
    "createdAt": "2026-05-07T12:00:00Z",
    "updatedAt": "2026-05-07T12:00:00Z",
    "deletedAt": null
  },
  "timestamp": "2026-05-07T12:00:00Z"
}
```

**Validation Rules:**
- title: 1-255 characters (required)
- description: optional string
- status: TODO | IN_PROGRESS | DONE
- priority: LOW | MEDIUM | HIGH
- dueDate: optional ISO8601 datetime

#### List Tasks (with filtering & pagination)
```
GET /api/tasks?page=1&limit=20&status=TODO&priority=HIGH&due_after=2026-05-01&due_before=2026-06-01&search=design

Authorization: Bearer <token>

Query Parameters:
- page: 1-based page number (default: 1)
- limit: items per page, max 100 (default: 20)
- status: TODO | IN_PROGRESS | DONE (optional)
- priority: LOW | MEDIUM | HIGH (optional)
- due_after: filter tasks due after date (ISO8601, optional)
- due_before: filter tasks due before date (ISO8601, optional)
- search: search in title and description (optional)

Response: 200 OK
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "task123",
        "userId": "clx123abc",
        "title": "Design homepage mockup",
        "description": "Create Figma mockup for new landing page",
        "status": "TODO",
        "priority": "HIGH",
        "dueDate": "2026-05-15T17:00:00Z",
        "createdAt": "2026-05-07T12:00:00Z",
        "updatedAt": "2026-05-07T12:00:00Z",
        "deletedAt": null
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  },
  "timestamp": "2026-05-07T12:00:00Z"
}
```

#### Get Single Task
```
GET /api/tasks/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "task123",
    "userId": "clx123abc",
    "title": "Design homepage mockup",
    "description": "Create Figma mockup for new landing page",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-05-15T17:00:00Z",
    "createdAt": "2026-05-07T12:00:00Z",
    "updatedAt": "2026-05-07T12:00:00Z",
    "deletedAt": null
  },
  "timestamp": "2026-05-07T12:00:00Z"
}
```

#### Update Task
```
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design homepage mockup (Revised)",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "task123",
    "userId": "clx123abc",
    "title": "Design homepage mockup (Revised)",
    "description": "Create Figma mockup for new landing page",
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "dueDate": "2026-05-15T17:00:00Z",
    "createdAt": "2026-05-07T12:00:00Z",
    "updatedAt": "2026-05-07T12:30:00Z",
    "deletedAt": null
  },
  "timestamp": "2026-05-07T12:30:00Z"
}
```

**Note:** Only fields included in the request body are updated (partial updates supported).

#### Delete Task (Soft Delete)
```
DELETE /api/tasks/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "task123",
    "userId": "clx123abc",
    "title": "Design homepage mockup (Revised)",
    "description": "Create Figma mockup for new landing page",
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "dueDate": "2026-05-15T17:00:00Z",
    "createdAt": "2026-05-07T12:00:00Z",
    "updatedAt": "2026-05-07T12:30:00Z",
    "deletedAt": "2026-05-07T13:00:00Z"
  },
  "timestamp": "2026-05-07T13:00:00Z"
}
```

**Note:** The `deletedAt` field is set to current timestamp. The task is not removed from DB but excluded from all queries.

#### Restore Task
```
POST /api/tasks/:id/restore
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "task123",
    "userId": "clx123abc",
    "title": "Design homepage mockup (Revised)",
    "description": "Create Figma mockup for new landing page",
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "dueDate": "2026-05-15T17:00:00Z",
    "createdAt": "2026-05-07T12:00:00Z",
    "updatedAt": "2026-05-07T12:30:00Z",
    "deletedAt": null
  },
  "timestamp": "2026-05-07T13:05:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Title is required and must be 1-255 characters",
  "timestamp": "2026-05-07T12:00:00Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "timestamp": "2026-05-07T12:00:00Z"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Not authorized to access this task",
  "timestamp": "2026-05-07T12:00:00Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Task not found",
  "timestamp": "2026-05-07T12:00:00Z"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Email already registered",
  "timestamp": "2026-05-07T12:00:00Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "timestamp": "2026-05-07T12:00:00Z"
}
```

## Authentication

All task endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is obtained from `/api/auth/register` or `/api/auth/login` and expires in 24 hours.

## Best Practices Implemented

1. **Security**
   - Passwords hashed with bcrypt (12 rounds)
   - JWT tokens with 24-hour expiry
   - Row-level authorization (users can only access own tasks)
   - Input validation on all endpoints
   - CORS enabled

2. **Database**
   - Soft delete pattern for audit trails
   - Strategic indexes for query performance
   - Foreign key constraints with cascade delete
   - Proper timestamps (created_at, updated_at, deleted_at)

3. **API Design**
   - RESTful conventions
   - Consistent response format
   - Proper HTTP status codes
   - Comprehensive error messages

4. **Code Quality**
   - TypeScript for type safety
   - Layered architecture (routes → controllers → services)
   - Reusable middleware and utilities
   - Global error handling
   - Environment variable configuration

5. **Performance**
   - Pagination to limit result sets
   - Database indexes on frequently queried columns
   - Prisma query optimization
   - Efficient filtering without N+1 queries

## Getting Started

### Environment Setup

Update `.env` with your Supabase PostgreSQL connection:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=24h
PORT=3000
NODE_ENV=development
```

### Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Build TypeScript
npm run build

# Run development server
npm run dev
```

### Production

```bash
npm run build
npm run start
```

## Testing the API

### Example: Register and Create a Task

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'

# Extract token from response

# 2. Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My first task",
    "priority": "HIGH",
    "status": "TODO"
  }'

# 3. List tasks
curl -X GET "http://localhost:3000/api/tasks?page=1&limit=10&status=TODO" \
  -H "Authorization: Bearer <TOKEN>"
```

## Performance Considerations

- **Pagination**: Always use `limit` parameter to prevent large result sets
- **Filtering**: Use status/priority filters to reduce database load
- **Search**: Only searches title and description (indexed fields)
- **Date Range**: Efficient due_date index enables fast range queries
- **Soft Delete**: Queries automatically exclude deleted_at records

## Future Enhancements

- Refresh token implementation for longer sessions
- Task categories/tags system
- Task collaboration and sharing
- Due date reminders
- Task templates
- Activity audit log
- API rate limiting
