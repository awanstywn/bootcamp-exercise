# Todo REST API

This is a RESTful API for managing a Todo list, built with Node.js, Express, TypeScript, and Supabase (PostgreSQL).

## Features

- **TypeScript Implementation**: Fully typed with strict mode enabled.
- **Supabase Integration**: Uses a hosted PostgreSQL database via Supabase.
- **RESTful Endpoints**: Standard CRUD operations (Create, Read, Update, Delete).
- **Error Handling**: Centralized inline error management middleware that prevents sensitive stack trace leaks.
- **Minimalist Architecture**: Highly concise, single-server file architecture tailored for simplicity and quick development, without sacrificing robustness.

## Architecture & Project Structure

The project follows a simplified, minimalist architecture to reduce boilerplate and file switching, perfect for bootcamp exercises and straightforward REST APIs:

```
src/
├── config/
│   └── db.ts               # Database connection pool configuration
├── routes/
│   └── todo.routes.ts      # Defines API endpoints and contains inline controller logic
├── server.ts               # Application entry point, Express config, and error handler
└── setup-db.ts             # Utility script to initialize database tables
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- A [Supabase](https://supabase.com/) project

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables. Duplicate the `.env.example` file to `.env` and fill in your Supabase connection details:
   ```env
   PORT=3000
   DB_HOST=aws-0-xx-region-1.pooler.supabase.com
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres.xxxxxxxxxx
   DB_PASSWORD=your_password
   ```

3. Initialize the database schema:
   ```bash
   npm run setup-db
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/todos` | Retrieve all todos |
| `GET` | `/todos/:id` | Retrieve a specific todo by its ID |
| `POST` | `/todos` | Create a new todo. Body: `{ "title": "Buy milk" }` |
| `PUT` | `/todos/:id` | Update an existing todo. Body: `{ "title": "Buy milk", "completed": true }` |
| `DELETE` | `/todos/:id` | Delete a todo |
