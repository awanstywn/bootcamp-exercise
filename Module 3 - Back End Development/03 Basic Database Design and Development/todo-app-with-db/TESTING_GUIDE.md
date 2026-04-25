# System Testing Guide

Application: **Todo App with Database v2.0**

This document contains comprehensive steps to test the Todo App. Testing is divided into two main parts:
1. **API Testing (Backend)** using Postman, Yaak, or Insomnia.
2. **E2E / UI Testing (Frontend)** using a web browser directly.

---

## 🛠 Initial Setup

Before starting the tests, ensure the application is running properly on your local machine.

1. **Ensure Database is Active**: Make sure PostgreSQL or Supabase is running and accessible.
2. **Configure Environment**: Verify that the `.env` files in both backend and frontend are correctly configured (e.g., `DATABASE_URL`, `PORT`, `JWT_SECRET`, and `FRONTEND_URL`).
3. **Run the Application**:
   Run the frontend and backend concurrently from the root directory:
   ```bash
   npm run dev
   ```
   *Note: Assumes the backend runs on `http://localhost:4000` and the frontend on `http://localhost:5173`.*

---

## 🟢 Part 1: API Testing (Using Postman / Yaak)

Create a new *Collection* in Postman/Yaak named **"Todo App API"**. Set the *Base URL* to `http://localhost:4000`.

### 1. Authentication

#### A. Register New User (Positive)
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Expected Output:**
  Status: `201 Created`
  ```json
  {
    "message": "Registration successful",
    "user": {
      "id": "uuid-string",
      "name": "Test User",
      "email": "test@example.com"
    }
  }
  ```

#### B. Register User with Existing Email (Negative)
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Body (JSON):** Same as above
- **Expected Output:**
  Status: `409 Conflict` (or `400 Bad Request`)
  ```json
  {
    "error": "CONFLICT",
    "message": "Email already registered"
  }
  ```

#### C. Login User (Positive)
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Expected Output:**
  Status: `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "uuid-string",
      "name": "Test User",
      "email": "test@example.com"
    }
  }
  ```
> **IMPORTANT:** Save the `token` from the login response! You must use this token in the **Authorization** header (select *Bearer Token* type) for all requests below.

#### D. Login with Invalid Credentials (Negative)
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "test@example.com",
    "password": "wrongpassword"
  }
  ```
- **Expected Output:**
  Status: `401 Unauthorized`
  ```json
  {
    "error": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
  ```

---

### 2. Todo Management

*(Ensure you have set the Bearer Token in the Authorization header)*

#### A. Create Todo (Positive)
- **Method:** `POST`
- **URL:** `/api/todos`
- **Body (JSON):**
  ```json
  {
    "text": "Learn Node.js and PostgreSQL"
  }
  ```
- **Expected Output:**
  Status: `201 Created`
  ```json
  {
    "todo": {
      "id": "uuid-string",
      "user_id": "uuid-string",
      "text": "Learn Node.js and PostgreSQL",
      "completed": false,
      "manual_index": 0,
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```

#### B. Create Todo with Missing Data (Negative)
- **Method:** `POST`
- **URL:** `/api/todos`
- **Body (JSON):** `{}`
- **Expected Output:**
  Status: `400 Bad Request`
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Missing required fields: text"
  }
  ```

#### C. Get All Todos (Positive)
- **Method:** `GET`
- **URL:** `/api/todos`
- **Expected Output:**
  Status: `200 OK`
  Returns an array of todos belonging to the logged-in user.

#### D. Access Todos Without Token (Negative)
- **Method:** `GET`
- **URL:** `/api/todos`
- **Expected Output:**
  Status: `401 Unauthorized`
  ```json
  {
    "error": "UNAUTHORIZED",
    "message": "No token provided"
  }
  ```

#### E. Update Todo (Positive)
- **Method:** `PUT`
- **URL:** `/api/todos/:id` *(Replace `:id` with the ID from step A)*
- **Body (JSON):**
  ```json
  {
    "completed": true,
    "text": "Learn Node.js and PostgreSQL (Done)"
  }
  ```
- **Expected Output:**
  Status: `200 OK`. The returned todo will have `completed: true`.

#### F. Update Non-Existent Todo (Negative)
- **Method:** `PUT`
- **URL:** `/api/todos/00000000-0000-0000-0000-000000000000`
- **Body (JSON):**
  ```json
  {
    "completed": true
  }
  ```
- **Expected Output:**
  Status: `404 Not Found`
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Todo not found"
  }
  ```

#### G. Search Todo (Positive)
- **Method:** `GET`
- **URL:** `/api/todos/search?q=Learn`
- **Expected Output:**
  Status: `200 OK`. Returns an array of todos containing the word "Learn".

#### H. Delete Todo (Positive)
- **Method:** `DELETE`
- **URL:** `/api/todos/:id` *(Replace `:id` with the Todo ID)*
- **Expected Output:**
  Status: `200 OK`
  ```json
  {
    "message": "Todo deleted successfully"
  }
  ```

---

### 3. Analytics & Share Links

#### A. Get Analytics Summary (Positive)
- **Method:** `GET`
- **URL:** `/api/analytics`
- **Expected Output:**
  Status: `200 OK`
  ```json
  {
    "summary": {
      "total_count": 5,
      "completed_count": 2,
      "active_count": 3,
      "completion_rate": 40
    },
    "dailyTrend": [ ... ]
  }
  ```

#### B. Create Share Link (Positive)
- **Method:** `POST`
- **URL:** `/api/share`
- **Body (JSON):**
  ```json
  {
    "todo_id": "insert-valid-todo-id-here"
  }
  ```
- **Expected Output:**
  Status: `201 Created`
  ```json
  {
    "code": "A1B2C3",
    "url": "http://localhost:4000/s/A1B2C3",
    "todo_id": "..."
  }
  ```

#### C. Create Share Link for Invalid Todo (Negative)
- **Method:** `POST`
- **URL:** `/api/share`
- **Body (JSON):**
  ```json
  {
    "todo_id": "00000000-0000-0000-0000-000000000000"
  }
  ```
- **Expected Output:**
  Status: `404 Not Found` (or Database foreign key error handled gracefully).

#### D. Fetch Public Shared Todo Details (Positive)
- **Method:** `GET`
- **URL:** `/api/todos/shared/:todo_id` *(Replace with valid todo_id from step B)*
- **Expected Output:**
  Status: `200 OK`. Returns the public details (text, completion status, created_at) without requiring a token.

#### E. Fetch Invalid Public Shared Todo (Negative)
- **Method:** `GET`
- **URL:** `/api/todos/shared/00000000-0000-0000-0000-000000000000`
- **Expected Output:**
  Status: `404 Not Found`
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Todo not found"
  }
  ```

#### F. Test Share Redirect (Browser/API)
- **Method:** `GET`
- **URL:** `http://localhost:4000/s/A1B2C3` *(Replace with the code from step B)*
- **Expected Output:**
  Status: `302 Found`. Automatically redirects to the frontend public shared page (e.g., `http://localhost:5173/shared/:todo_id`).

#### G. Test Invalid Share Redirect (Negative)
- **Method:** `GET`
- **URL:** `http://localhost:4000/s/INVALIDCODE`
- **Expected Output:**
  Status: `302 Found`. Redirects to the frontend 404/not-found route (e.g., `http://localhost:5173/not-found`).

---

## 🔵 Part 2: E2E / UI Testing (Browser)

Open the application in your browser (usually `http://localhost:5173`).

### 1. Authentication Flow
- **Positive - Register & Login:**
  - **Action:** Click "Register", fill the form with valid data, submit.
  - **Expected:** Redirected to Login, then log in with the same credentials. Directed to the Dashboard.
- **Negative - Invalid Registration:**
  - **Action:** Submit the registration form empty or with an invalid email format (`testemail.com`).
  - **Expected:** Formik validation error messages appear (e.g., "Invalid email format") preventing submission.
- **Negative - Invalid Login:**
  - **Action:** Enter wrong email/password and submit.
  - **Expected:** A toast/alert appears indicating invalid credentials.
- **Negative - Route Protection:**
  - **Action:** While logged out, manually type `http://localhost:5173/dashboard` or `/` in the address bar.
  - **Expected:** Immediate redirect back to `/signin`.

### 2. Todo Operations
- **Positive - Create:**
  - **Action:** Type "Team Meeting" in the input field and press Enter.
  - **Expected:** The task appears in the list instantly (Optimistic UI).
- **Negative - Empty Create:**
  - **Action:** Leave the input blank and press Enter or the Add button.
  - **Expected:** Button is disabled or no action occurs.
- **Positive - Toggle Completion:**
  - **Action:** Click the checkbox next to a task.
  - **Expected:** Text becomes strikethrough and styling updates immediately.
- **Positive - Edit:**
  - **Action:** Double-click on a task, change the text, press Enter.
  - **Expected:** The task's text is updated successfully.
- **Positive - Delete:**
  - **Action:** Hover over a task and click the delete (X) icon.
  - **Expected:** The task disappears instantly from the list.

### 3. Sidebar Analytics & Real-time Updates
- **Positive - Analytics Display:**
  - **Action:** Open the Profile Sidebar (burger menu in the header).
  - **Expected:** The Analytics Widget displays your email, a progress bar, Total/Completed/Active counts, and a 7-day trend chart.
- **Positive - Real-time Sync:**
  - **Action:** Keep the sidebar open (or toggle it frequently) while checking off a task or adding a new one.
  - **Expected:** The analytics counts and progress bar update automatically in the sidebar without requiring a page refresh.
- **Positive - Trend Interactivity:**
  - **Action:** Hover over the bars in the 7-day trend chart inside the Analytics Widget.
  - **Expected:** A custom tooltip appears showing the date and task count for that specific day.

### 4. Share Links Integration
- **Positive - Generate Share Link:**
  - **Action:** Hover over a task in the list and click the Share (chain link) icon.
  - **Expected:** An alert/toast confirms the link has been copied to your clipboard.
- **Positive - View Shared Link:**
  - **Action:** Open a new incognito window and paste the copied link (`http://localhost:4000/s/CODE`).
  - **Expected:** You are redirected to `http://localhost:5173/shared/:id` and can see the read-only details of the task without being logged in.
- **Negative - View Inactive/Invalid Link:**
  - **Action:** Visit a shared link with an invalid UUID (`http://localhost:5173/shared/invalid-id`).
  - **Expected:** An error message "Todo not found or link is inactive" is displayed on the UI.

### 5. Logout & Session
- **Positive - Logout:**
  - **Action:** Click the "Logout" button in the Profile Sidebar.
  - **Expected:** You are redirected to `/signin` and your local storage token is cleared.
- **Negative - Inactive Session:**
  - **Action:** Leave the app open and inactive for more than 5 minutes (or delete the token manually from LocalStorage).
  - **Expected:** The app automatically logs you out and returns to the login screen.
