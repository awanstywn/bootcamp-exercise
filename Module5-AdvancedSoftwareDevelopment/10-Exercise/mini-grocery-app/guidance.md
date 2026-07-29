# Mini Grocery App Testing & Validation Guidance (Backend MVP)

This document provides a comprehensive, step-by-step guide to validate the API endpoints and logic of the Mini Grocery (Sembako) App backend.

---

## 1. Environment & Setup Verification

Before running API tests, verify that your backend environment is correctly bootstrapped.

### 1.1 Start the Application

You can validate the application either via local development mode or Docker.

**Option A: Local Development**

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed    # Seeds the admin account and sample categories
npm run dev            # Starts the Express backend API
```

**Option B: Docker Compose (Production Simulator)**
To run and test the backend completely isolated in Docker, first **ensure Docker Desktop (or your preferred Docker daemon) is running** on your machine.

1. **Start Services:** Run the following command to build the image and start the container in detached mode:
   ```bash
   docker compose up --build -d
   ```
   _Note: The Dockerfile is configured to automatically generate the Prisma client on startup._
2. **Check Logs:** To ensure Prisma connected to the database successfully and the server started, view the logs:
   ```bash
   docker compose logs -f app
   ```
   _Look for a message indicating the server is running._
3. **Stop Services:** Once you are done testing, tear down the container:
   ```bash
   docker compose down
   ```

### 1.2 Verify Services are Running

- **Backend (API):** Make a GET request to `http://localhost:3000/api/products`. You should receive a JSON response with an array of products.
- **Database (Seeding):** The startup script automatically seeds initial data for you. You can verify this by making a **POST** request to `http://localhost:3000/api/auth/login` to authenticate with the seeded admin account:
  - **Body (JSON):**
    ```json
    {
      "email": "admin@sembako.com",
      "password": "Admin123!"
    }
    ```

---

## 2. API Validation Scenarios (Yaak / Postman)

To validate the backend directly using API clients like **Yaak** or **Postman**, you need to configure your environment and understand the parameters for each endpoint.

### 2.1 Setup Yaak / Postman Environment

1. Set a base URL variable: `{{BASE_URL}}` = `http://localhost:3000/api`
2. **Handling Authentication:** The API uses HTTP-only cookies for authentication.
   - **Postman:** Postman automatically intercepts and stores `Set-Cookie` headers. After calling `/auth/login`, subsequent requests will automatically include the `accessToken` cookie.
   - **Yaak:** Ensure cookie jar / cookie management is enabled for the workspace so it automatically sends cookies received from the login endpoint.
   - _Manual fallback:_ If cookies aren't working, manually copy the `accessToken` from the login response headers and add a Header: `Cookie: accessToken=<your_token>`.

### 2.2 Detailed Endpoint Guide & Parameters

#### A. Auth & Roles

- **POST `{{BASE_URL}}/auth/login`** (Admin/Visitor)
  - **Description:** Authenticate user and receive cookies.
  - **Body (JSON):**
    ```json
    {
      "email": "buyer@sembako.com", // String, required, valid email
      "password": "Buyer123!" // String, required, min 8 chars
    }
    ```
  - **Expected:** `200 OK`. You should see `Set-Cookie` headers for `accessToken` and `refreshToken`.

- **POST `{{BASE_URL}}/auth/register`** (Visitor)
  - **Body (JSON):**
    ```json
    {
      "email": "newuser@test.com", // String, required, unique
      "password": "Password1!", // String, required, min 8 chars, 1 uppercase, 1 special char
      "name": "New User" // String, required
    }
    ```

#### B. Product & Stock Checks

- **GET `{{BASE_URL}}/products`** (Public)
  - **Description:** Fetch a paginated list of products.
  - **Query Parameters:**
    - `page` (Integer, default: 1): The page number.
    - `limit` (Integer, default: 10): Items per page.
    - `search` (String, optional): Filter by product name.
    - `categoryId` (String UUID, optional): Filter by category (e.g., `cat_sayuran` or `cat_sembako`).
  - **Example URL:** `{{BASE_URL}}/products?page=1&limit=5&categoryId=cat_sayuran`
  - **Expected:** `200 OK`. You will see seeded dummy products like `prod_kangkung` or `prod_beras` in `data.products`.

#### C. Cart Logic (Requires Auth Cookie)

- **POST `{{BASE_URL}}/cart/items`** (Visitor)
  - **Description:** Add a product to the cart. Use our hardcoded dummy product `prod_kangkung`.
  - **Body (JSON):**
    ```json
    {
      "productId": "prod_kangkung", // String, required
      "quantity": 2 // Integer, required, min 1, must not exceed product stock
    }
    ```
  - **Expected:** `200 OK` or `201 Created`.

- **PUT `{{BASE_URL}}/cart/items/prod_kangkung`** (Visitor)
  - **Description:** Update the quantity of a specific item in the cart.
  - **Path Parameter:**
    - `:productId` -> `prod_kangkung`: The explicit ID of the product in the cart.
  - **Body (JSON):**
    ```json
    {
      "quantity": 5 // Integer, required, min 1
    }
    ```

#### D. Order State Machine Rules (Requires Auth Cookie)

- **POST `{{BASE_URL}}/orders/checkout`** (Visitor)
  - **Description:** Checkout the current cart.
  - **Body (JSON):**
    ```json
    {
      "deliveryMethod": "DELIVERY", // Enum: "DELIVERY" | "PICKUP", required
      "shippingAddress": "Jl. Sudirman No 10, Jakarta" // String, required if DELIVERY
    }
    ```
  - **Expected:** `201 Created`. **Grab the `order.id`** from the response to use in the following requests!

- **PUT `{{BASE_URL}}/orders/<insert_order_id_here>/payment`** (Visitor)
  - **Description:** Upload payment proof. Use `multipart/form-data` instead of JSON.
  - **Path Parameter:**
    - `:id` -> Your generated order ID.
  - **Body (Form-Data):**
    - `paymentProof`: (File upload - Image format like .jpg or .png, max 5MB)
  - **Expected:** `200 OK`. Status changes to `WAITING_VERIFICATION`.

- **PUT `{{BASE_URL}}/orders/<insert_order_id_here>/status`** (Admin)
  - **Description:** Update order status. Make sure you use the Admin login token!
  - **Path Parameter:**
    - `:id` -> Your generated order ID.
  - **Body (JSON):**
    ```json
    {
      "status": "VERIFIED" // Enum: "VERIFIED" | "PROCESSING" | "SHIPPED" | "DELIVERED", required
    }
    ```
  - **Note:** Strict validation ensures you cannot skip states (e.g., jump from PENDING_PAYMENT to DELIVERED).

- **PUT `{{BASE_URL}}/orders/<insert_order_id_here>/reject`** (Admin)
  - **Description:** Reject an order and restore stock. Make sure you use the Admin login token!
  - **Path Parameter:**
    - `:id` -> Your generated order ID.
  - **Body (JSON):**
    ```json
    {
      "rejectionReason": "Payment amount mismatch" // String, required
    }
    ```

---

## 3. Edge Cases to Monitor

1. **Concurrency (Race Conditions):** Simulate two users trying to checkout the last 5 items of stock simultaneously. Prisma's `$transaction` should cause one to succeed and one to fail gracefully.
2. **Token Expiration:** Test with an expired JWT token (or wait out the `JWT_ACCESS_EXPIRY` time). Ensure the backend properly responds with a `401 Unauthorized` status.
3. **Invalid File Uploads:** Attempt to upload a `.pdf` or a massive 20MB file to the `/payment-proof` endpoint. Ensure the backend (Multer) rejects the file type/size gracefully without crashing the server.
