# Unit Testing Guide — Step by Step

This guide walks you through how to run, validate, and debug the unit tests in your `server/` project.

---

## 1. Available Commands

All commands must be run from the **server directory**:

```bash
cd server
```

| Command | What it does |
|---------|-------------|
| `npm test` | Runs **all** test files once and exits |
| `npm run test:watch` | Runs tests in **watch mode** — re-runs automatically when you save a file |
| `npm run test:coverage` | Runs all tests **and** generates a coverage report showing which lines are tested |
| `npm test -- src/middleware/error.middleware.test.ts` | Runs a **single test file** |
| `npm test -- --verbose` | Shows each individual test name (pass/fail) instead of just suite summaries |

---

## 2. Running the Tests

### Step 1: Open your terminal and navigate to the server directory

```bash
cd "/Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module5-AdvancedSoftwareDevelopment/09 TDD/blog-app-1.5-serverless/server"
```

### Step 2: Run the full test suite

```bash
npm test
```

### Step 3: Read the output

A **successful** run looks like this:

```
PASS src/middleware/error.middleware.test.ts
PASS src/services/auth.service.test.ts
PASS src/controllers/auth.controller.test.ts

Test Suites: 3 passed, 3 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        3.468 s
```

Key indicators:
- ✅ **PASS** = the test file passed all its tests
- ❌ **FAIL** = one or more tests in that file failed
- **Test Suites** = number of `.test.ts` files
- **Tests** = total number of individual `it()` / `test()` blocks

---

## 3. Understanding the Test Structure

Your project currently has **3 test suites** at **3 different layers**:

### Layer 1: Middleware (Isolated Unit Test)

> [error.middleware.test.ts](file:///Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module5-AdvancedSoftwareDevelopment/09 TDD/blog-app-1.5-serverless/server/src/middleware/error.middleware.test.ts)

Tests the error handler in **complete isolation** using mock `req`, `res`, `next` objects. No Express server is started.

| Test | What it validates |
|------|------------------|
| `should handle AppError (operational) correctly` | `NotFoundError` → returns status `404` with `ERR_NOT_FOUND` code |
| `should normalize ZodError into ValidationError` | `ZodError` → returns status `422` with `"Invalid input data"` message |
| `should handle unknown generic errors as 500` | Generic `Error` → returns status `500` with `ERR_INTERNAL_SERVER` code |

### Layer 2: Service (Business Logic Unit Test)

> [auth.service.test.ts](file:///Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module5-AdvancedSoftwareDevelopment/09 TDD/blog-app-1.5-serverless/server/src/services/auth.service.test.ts)

Tests `AuthService.register()` logic by mocking `prisma`, `bcrypt`, and `EmailService`. No HTTP requests.

| Test | What it validates |
|------|------------------|
| `should throw BadRequestError if email already exists` | Duplicate email → throws `BadRequestError` |
| `should initiate registration and send verification email` | New email → returns `{ message: 'Verification email sent' }` and calls `sendVerificationEmail` |

### Layer 3: Controller (E2E Integration with Supertest)

> [auth.controller.test.ts](file:///Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module5-AdvancedSoftwareDevelopment/09 TDD/blog-app-1.5-serverless/server/src/controllers/auth.controller.test.ts)

Fires **real HTTP requests** against the Express app using `supertest`. The full middleware chain executes (except rate limiter, which is mocked).

| Test | What it validates |
|------|------------------|
| `should return 201 when registration starts successfully` | `POST /api/auth/register` with valid body → status `201`, body `{ message: 'Verification email sent' }` |

---

## 4. How to Validate Test Results

### ✅ All tests pass

```
Test Suites: 3 passed, 3 total
Tests:       6 passed, 6 total
```

**Exit code: 0** (success). No action needed.

### ❌ A test fails

A failure looks like this:

```
FAIL src/controllers/auth.controller.test.ts
  ● AuthController (E2E Integration) › POST /api/auth/register › should return 201

    expect(received).toBe(expected) // Object.is equality

    Expected: 201
    Received: 500

      > 32 |       expect(response.status).toBe(201);
           |                               ^
```

**How to read this:**
1. **File** — `FAIL src/controllers/auth.controller.test.ts` tells you which file
2. **Test name** — `POST /api/auth/register › should return 201` tells you which test
3. **Expected vs Received** — `Expected: 201, Received: 500` tells you what went wrong
4. **Line pointer** — `> 32 |` shows exactly which assertion failed

### Common failure patterns and fixes

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `Expected: 201, Received: 500` | The controller threw an unhandled error internally | Check the console output above the failure for the actual error message. Often a missing mock. |
| `Cannot find module '...'` | A `jest.mock()` path is wrong | Verify the import path matches the actual file location. Remember `.js` extensions are stripped by `moduleNameMapper`. |
| `TypeError: X is not a constructor` | A mock is returning the wrong shape | Update the mock in `jest.setup.ts` to export the correct structure (named export, default export, class, etc.). |
| `Test suite failed to run` | The test file itself has a syntax/import error | Read the stack trace — it shows which import chain broke. Usually a missing mock for a dependency. |
| `Jest did not exit one second after the test run has completed` | An open handle (Redis connection, timer, etc.) wasn't closed | Ensure all external dependencies (ioredis, bullmq) are mocked in `jest.setup.ts`. |

---

## 5. Running with Verbose Output

To see each individual test name:

```bash
npm test -- --verbose
```

Output:

```
 PASS  src/middleware/error.middleware.test.ts
  Error Middleware
    ✓ should handle AppError (operational) correctly (5 ms)
    ✓ should normalize ZodError into ValidationError (2 ms)
    ✓ should handle unknown generic errors as 500 (1 ms)

 PASS  src/services/auth.service.test.ts
  AuthService
    register
      ✓ should throw BadRequestError if email already exists (3 ms)
      ✓ should initiate registration and send verification email (2 ms)

 PASS  src/controllers/auth.controller.test.ts
  AuthController (E2E Integration)
    POST /api/auth/register
      ✓ should return 201 when registration starts successfully (150 ms)
```

---

## 6. Running with Coverage

```bash
npm run test:coverage
```

This generates a table like:

```
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
src/middleware/             |         |          |         |         |
  error.middleware.ts       |   85.71 |    66.67 |   100   |   85.71 |
src/services/              |         |          |         |         |
  auth.service.ts           |   45.00 |    30.00 |   40.00 |   45.00 |
```

**How to read it:**
- **% Stmts** — Percentage of code statements executed by tests
- **% Branch** — Percentage of `if/else` branches covered
- **% Funcs** — Percentage of functions that were called
- **% Lines** — Percentage of lines that were executed

> [!TIP]
> A detailed HTML report is also generated in `server/coverage/lcov-report/index.html`. You can open it in a browser for a visual, file-by-file breakdown.

---

## 7. Running a Single Test File

If you only want to run one specific test file:

```bash
npm test -- src/middleware/error.middleware.test.ts
```

Or with a **name pattern filter** (runs any test whose name matches the string):

```bash
npm test -- -t "should handle AppError"
```

---

## 8. Debugging a Failing Test

### Step 1: Run only the failing file with verbose

```bash
npm test -- src/controllers/auth.controller.test.ts --verbose
```

### Step 2: Check the console output above the failure

Jest captures `console.log` and `console.error` calls. Look for lines like:

```
console.log
  2026-07-16T07:48:48.302Z [error] [abc123] : Unhandled Error:
```

This tells you the real error that happened inside your Express app.

### Step 3: Temporarily add `console.log` to the source

If the error message is not helpful enough, add a `console.log(response.body)` in the test:

```typescript
const response = await request(app)
  .post('/api/auth/register')
  .send({ email: 'test@example.com', name: 'Test User', password: 'Password123!' });

console.log('Response body:', response.body);  // <-- Add this
expect(response.status).toBe(201);
```

### Step 4: Check if a mock is missing

The most common cause of 500 errors in tests is a **missing mock**. If your controller calls a service that calls an external API or database, every link in that chain must be mocked.

The mock hierarchy in this project:
```
jest.setup.ts (global mocks)
  ├── prisma          → mocked via jest-mock-extended
  ├── ioredis          → mocked with a class stub
  ├── bullmq           → mocked with class stubs (Queue, Worker)
  └── env              → mocked with test values

Individual test files (local mocks)
  ├── EmailService     → jest.mock('../services/email.service')
  ├── rateLimiter      → jest.mock('../middleware/rateLimiter.middleware.js')
  └── bcrypt           → jest.mock('bcrypt')
```

### Step 5: Run with open handle detection

If Jest hangs and doesn't exit:

```bash
npm test -- --detectOpenHandles
```

This tells you which asynchronous operation is keeping the process alive.

---

## 9. Key Files Reference

| File | Purpose |
|------|---------|
| [jest.config.js](file:///Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module5-AdvancedSoftwareDevelopment/09 TDD/blog-app-1.5-serverless/server/jest.config.js) | Jest configuration — presets, transforms, module mappers |
| [jest.setup.ts](file:///Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module5-AdvancedSoftwareDevelopment/09 TDD/blog-app-1.5-serverless/server/jest.setup.ts) | Global mocks loaded before every test (Prisma, Redis, BullMQ, env) |
| [src/__mocks__/prisma.ts](file:///Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module5-AdvancedSoftwareDevelopment/09 TDD/blog-app-1.5-serverless/server/src/__mocks__/prisma.ts) | Type-safe Prisma mock using `jest-mock-extended` |
| [src/utils/test-utils.ts](file:///Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module5-AdvancedSoftwareDevelopment/09 TDD/blog-app-1.5-serverless/server/src/utils/test-utils.ts) | Helpers to create mock `req`, `res`, `next` objects |

---

## 10. Quick Checklist Before Committing

- [ ] Run `npm test` — all tests pass
- [ ] Run `npm test -- --verbose` — review test names make sense
- [ ] Run `npm run test:coverage` — review coverage is reasonable
- [ ] No `console.log` debug statements left in test files
- [ ] Test files are excluded from production build (confirmed in `tsconfig.json` → `exclude`)
