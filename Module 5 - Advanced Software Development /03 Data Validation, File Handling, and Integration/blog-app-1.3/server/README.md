# Blog Application - Server (Backend)

This is the backend layer of the Fullstack Blog Application. It is a robust REST API built with Express.js and TypeScript, utilizing Prisma for database ORM and Zod for strict validation.

## 🚀 Tech Stack

- **Core:** Node.js, Express.js 5, TypeScript
- **Database ORM:** Prisma 7 (PostgreSQL)
- **Validation:** Zod 4
- **Authentication:** JWT, bcrypt
- **Security:** express-rate-limit
- **File Uploads:** Multer

## 📁 Folder Structure

```text
server/
├── prisma/        # Database schema and seed scripts
├── src/
│   ├── config/    # Environment and global configurations
│   ├── controllers/ # HTTP Request/Response handling
│   ├── middleware/ # Express middlewares (Auth, Error, Validation, RBAC)
│   ├── routes/    # API endpoint definitions
│   ├── services/  # Core business logic and database interactions
│   ├── utils/     # Helper functions
│   └── validators/ # Zod schema definitions
```

## 🛠️ Development

*Note: Because this project uses NPM Workspaces, you should generally run commands from the root directory of the monorepo.*

However, if you need to run specific backend tasks:

1. Ensure dependencies are installed at the root (`npm install`).
2. Ensure you have a `.env` file with a valid `DATABASE_URL` and `JWT_SECRET`.
3. Start the Express dev server:
   ```bash
   npm run dev
   ```
4. Manage database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

## 🔒 Security & Architecture Standards

- **Strict Validation:** All incoming data via `POST`, `PUT`, and `PATCH` MUST be validated by Zod in the route middleware before hitting the controller.
- **Rate Limiting:** Authentication-related and sensitive endpoints (e.g. login, register, password resets, file uploads) must utilize rate limiters.
- **DTO Mapping:** This backend relies on the `shared/` workspace for strict typing. When database models are fetched in the Service layer, they MUST be mapped to the strict `UserDTO` or `PostDTO` from `../../shared/src/types.ts` before being returned by the Controller.
- **Graceful Shutdown:** The server implements a graceful shutdown sequence to close DB connections cleanly, with a hard timeout as a fallback.
