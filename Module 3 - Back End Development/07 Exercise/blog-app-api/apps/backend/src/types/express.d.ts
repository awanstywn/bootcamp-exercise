// src/types/express.d.ts
// Extends the Express Request interface to include a custom `user` property.
// Without this file, TypeScript would throw: "Property 'user' does not exist on type 'Request'".
//
// How it works: TypeScript "declaration merging" lets us add new fields to existing interfaces.
// When we write `req.user` in controllers/middleware, TypeScript now knows the shape of `user`.
// Documentation: https://www.typescriptlang.org/docs/handbook/declaration-merging.html

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;  // Decoded from JWT payload — maps to User.id in database
        email: string;   // Decoded from JWT payload — maps to User.email in database
      };
    }
  }
}

// `export {}` makes this file a module (not a script).
// Without it, `declare global` would not work correctly in TypeScript's module system.
export {};