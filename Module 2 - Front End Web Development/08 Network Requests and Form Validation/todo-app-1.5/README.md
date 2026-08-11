# Todo App 1.5 (Real Authentication with Backendless)

This is a React application built with TypeScript and Vite that demonstrates application data flow, global state management, and real network requests using Axios and the Backendless API.

## Features
- **Real Authentication**: Full registration and login flow connected to a Backendless database.
- **Global State**: Manages user sessions and secure tokens using Zustand.
- **Axios Interceptors**: Automatically injects authorization tokens into API requests and globally handles session expiration.
- **Data Persistence**: Uses Zustand's `persist` middleware to save the user token in the browser's `localStorage` to keep users logged in.

## How to Run Locally

1. Install the dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables:
   - Copy `.env.example` to a new file named `.env`.
   - Update the variables with your own Backendless Application ID and REST API Key (or use the keys provided separately in your assignment submission).
3. Start the development server:
   ```bash
   npm run dev
   ```

## How to Test the App (Demo Credentials)

Since this application connects to a real backend, you can either create your own account or use the provided demo credentials to test the features.

### Option 1: Create a New Account
1. Open the app and click on **Sign Up** (or navigate to the registration page).
2. Enter a Name, Email, and Password.
3. Submit the form to register your account in the database.
4. You will be redirected to Sign In. Use the credentials you just created to log in.

### Option 2: Use Demo Credentials
If you prefer not to register, you can use the following test accounts that are already seeded with data:

**User 1:**
- **Email**: `alice@example.com`
- **Password**: `password123`

**User 2:**
- **Email**: `bob@example.com`
- **Password**: `password123`

### Testing the Authorization Flow
1. **Login**: Enter the credentials and click **Sign In**. The backend will return a secure `user-token` which is saved locally.
2. **Persistence**: Refresh the page. You will notice you are still logged in because the token is persisted in `localStorage`.
3. **Protected Actions**: Try adding or deleting a Todo. The Axios Request Interceptor automatically attaches your token to these requests to authorize them.
4. **Logout**: Click **Sign Out**. This clears your session from the backend and wipes the token from `localStorage`, successfully returning you to an unauthenticated state.
