# Todo App 1.4 (Mock Authentication)

This is a React application built with TypeScript and Vite that demonstrates application data flow and state management using Zustand.

## Features
- **State Management**: Uses Zustand to manage global state for authentication and todos.
- **Mock Authentication**: Simulates a login flow without a real backend.
- **Data Persistence**: Uses Zustand's `persist` middleware to save the user session and todos in the browser's `localStorage`.

## How to Run Locally

1. Install the dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## How to Test the App (Demo Credentials)

Because this version uses mock authentication, **you do not need a real account**. You can test the app in two ways:

### 1. Mock Login (Regular User)
1. Go to the Sign In page.
2. Enter any **Name** (e.g., `John Doe`).
3. Enter any **Email** (e.g., `john@example.com`).
4. Click **Sign In**.
5. You will be authenticated as a regular user, and your session will persist even if you refresh the page.

### 2. Guest Login
1. On the Sign In page, click the **Continue as Guest** button.
2. You will be logged in immediately without needing to provide any credentials.

> **Note**: In both cases, your "session" is securely saved in `localStorage`. To test the logout mechanism, simply click the **Sign Out** button inside the app.
