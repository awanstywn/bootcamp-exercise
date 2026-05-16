# User Management App (CRUD)

A premium, full-stack web application designed for simple and effective user management. It features a modern, responsive user interface and a robust backend API for seamless data persistence.

## Main Application Features

- **Create Users**: Add new users with a dynamic form that includes duplicate-email validation.
- **View Directory**: Display a real-time, scrollable list of all registered users.
- **Modern UI**: A responsive, dark-mode focused aesthetic built with modern utility classes and micro-animations.
- **Robust Persistence**: Data is securely stored in a relational PostgreSQL database.

## Tech Stack Used

**Frontend:**
- Vite
- React
- TypeScript
- TailwindCSS v4
- Axios

**Backend:**
- Node.js & Express
- TypeScript
- Prisma ORM (v7) with `@prisma/adapter-pg`
- PostgreSQL

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER {
        Int id PK
        String name
        String email UK
        DateTime createdAt
        DateTime updatedAt
    }
```
*(Currently a single-entity architecture; ready to be expanded with roles or related entities.)*

## Steps to Run the Project Locally

### 1. Prerequisites
- Node.js installed
- PostgreSQL instance running locally

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies (already done if you followed the initial setup):
   ```bash
   npm install
   ```
3. Configure your environment variables. Open `backend/.env` and replace the placeholder with your local PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/your_database_name?schema=public"
   ```
4. Push the Prisma schema to your database to create the tables:
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will run on http://localhost:3000.*

### 3. Frontend Setup
1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (already done if you followed the initial setup):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The UI will be accessible at http://localhost:5173.*

### 4. Run Seamlessly (Both Servers)
Instead of opening two separate terminals, you can start both the frontend and backend simultaneously from the **root directory** of the project using this single command:
```bash
npx concurrently "npm run dev --prefix backend" "npm run dev --prefix frontend"
```

## Deployment URLs

- **Frontend Application**: `[Pending Deployment]`
- **Backend API**: `[Pending Deployment]`


