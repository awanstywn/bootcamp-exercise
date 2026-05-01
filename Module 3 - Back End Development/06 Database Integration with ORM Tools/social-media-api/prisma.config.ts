// prisma.config.ts
// Configuration file introduced in Prisma v7.
// This defines where Prisma should look for schemas, migrations, and how to connect to the database.
// Documentation: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/prisma-config

// Loads environment variables from .env file into process.env automatically
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Path to the main schema file
  schema: "prisma/schema.prisma",

  // Directory where migration SQL files are stored
  migrations: {
    path: "prisma/migrations",
  },

  // Database connection settings
  datasource: {
    // Dynamically inject the database URL from the environment variable
    url: process.env["DATABASE_URL"],
  },
});
