// src/server.ts
// Entry point — starts the HTTP server and listens on the configured port.
// Why separate from app.ts? So we can import the Express app in tests
// without actually opening a network port (app.ts exports the app, this file starts it).

import app from './app';

// Read port from environment or fall back to 3000 for local development
const PORT = process.env.PORT || 3000;

// app.listen() binds the Express app to a TCP port and starts accepting connections
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});