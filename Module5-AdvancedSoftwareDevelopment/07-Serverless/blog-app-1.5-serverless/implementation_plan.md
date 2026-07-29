# Unit Test Implementation Plan

## Goal Description
Implement a comprehensive, detailed, end-to-end unit testing setup for the Express server using Jest, Supertest, and Nock. This includes configuring the test runner, mocking database and internal dependencies (like Prisma, Redis, Cloudinary), and intercepting external network calls (e.g., Google OAuth, Nodemailer) with Nock.

> [!NOTE]
> The focus is to build a robust testing architecture that allows developers to test components in isolation (unit tests) and also test the API boundaries (integration tests with Supertest) without relying on actual external services or databases.

## Resolved Decisions (From Review)
- **Test Placement:** Colocation. Test files will be placed directly alongside their corresponding source files (e.g., `src/controllers/auth.controller.test.ts`).
- **Production Sanitization:** Test files will be explicitly excluded in `tsconfig.json` so they are not included in the Vercel production build. All testing packages are strictly `devDependencies`.
- **Test Coverage:** Coverage reporting will be enabled so developers can see what is tested, but a failing threshold will not be enforced yet.

## Proposed Changes

### 1. Dependencies and Configuration
#### [MODIFY] `server/package.json`
- Add devDependencies: `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`, `nock`, `@types/nock`, `jest-mock-extended`.
- Add NPM scripts: `"test": "jest"`, `"test:watch": "jest --watch"`, `"test:coverage": "jest --coverage"`.

#### [MODIFY] `server/tsconfig.json`
- Ensure `exclude` array contains `["**/*.test.ts", "jest.setup.ts", "**/*.spec.ts"]` to prevent tests from being compiled into the production Vercel deployment.

#### [NEW] `server/jest.config.ts`
- Jest configuration for TypeScript using `ts-jest`.
- Setup environment (Node.js) and point to the global setup file.

#### [NEW] `server/jest.setup.ts`
- Global test setup, including initializing Nock, silencing console logs during tests, and cleaning up mocks before/after each test.

### 2. Test Utilities & Mocks
#### [NEW] `server/src/__mocks__/prisma.ts`
- Centralized mock for PrismaClient using `jest-mock-extended` to ensure database calls are stubbed safely across all tests.

#### [NEW] `server/src/utils/test-utils.ts`
- Utility functions for testing, such as generating mock `req`, `res`, and `next` objects for middleware testing.
- Helper to initialize the Express app with necessary middlewares for Supertest.

### 3. Example Test Implementations (End-to-End coverage logic)
#### [NEW] `server/src/middleware/error.middleware.test.ts`
- Unit tests for the custom error handler using mocked request/response objects.

#### [NEW] `server/src/controllers/auth.controller.test.ts`
- Integration-style unit test using **Supertest** to hit the Express application instance directly.
- Uses **Nock** to intercept and mock the external Google Auth API network calls or other external services.
- Mocks Prisma calls to test business logic flows and error scenarios comprehensively.

#### [NEW] `server/src/services/auth.service.test.ts`
- Isolated unit test for the service layer using Jest mocks for dependencies.

## Verification Plan

### Automated Tests
- Run `npm run test` inside the `server` directory to execute the entire test suite and ensure it passes cleanly.
- Run `npm run test:coverage` to verify test coverage metrics.
