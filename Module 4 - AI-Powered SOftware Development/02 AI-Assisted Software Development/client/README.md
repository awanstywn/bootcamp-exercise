# Antigravity Client UI

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tech](https://img.shields.io/badge/tech-React_19%20|%20Vite-blue.svg)

## Elevator Pitch
The Antigravity Client layer provides a responsive, modern web interface for the Product Management Dashboard. Built with React and styled with Tailwind CSS, it enables users to seamlessly interact with their inventory, offering real-time feedback, protected routing, and an intuitive user experience.

## Visuals Placeholder
![App Screenshot](../docs/client-screenshot.png)

## Tech Stack
- React 19
- Vite
- Tailwind CSS v4
- Zustand (State Management)
- React Router (Routing)
- Axios (HTTP Client)
- Lucide React (Icons)

## Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

## Installation & Local Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure the environment variables are set up (e.g., `VITE_API_URL=/api`).

## Usage
To start the Vite development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`. API requests starting with `/api` are automatically proxied to the backend.

## Monorepo Architecture
The `client` directory serves as the frontend application within the monorepo. It consumes the RESTful API exposed by the `server` layer and utilizes validation schemas imported directly from the `shared` workspace to guarantee type-safe form submissions.

## License
MIT License
