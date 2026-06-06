# Parfume Marketplace - Client (Frontend)

This is the frontend workspace for the Parfume Marketplace application. It is built using modern web development standards to provide a seamless, highly responsive, and aesthetically premium user interface.

## 🛠 Tech Stack
- **Framework**: React 19 via Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM (v6)
- **Global State**: Zustand
- **Data Fetching & Caching**: SWR
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form with Zod (imported from `shared`)

## 📁 Directory Structure
- `/src/components`: Contains reusable UI components and layout wrappers.
  - `/ui`: Atomic, reusable design system components (Buttons, Inputs, Spinners).
  - `/layout`: Structural components (Header, Footer, Sidebar).
  - `/auth`, `/shop`, `/admin`: Domain-specific component blocks.
- `/src/pages`: React components representing entire routed views.
- `/src/stores`: Zustand global state slices (e.g., Auth, Cart).
- `/src/hooks`: Custom React hooks encapsulating specific logic (e.g., `useAddresses`).
- `/src/lib`: Utilities, API client configuration (`axios`), and formatters.

## 🚀 Development Setup

Make sure you have run `npm install` at the root of the monorepo first.

1. **Environment Variables**:
   Copy the example environment file and adjust the `VITE_API_BASE_URL` if needed.
   ```bash
   cp .env.example .env
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Alternatively, from the project root: `npm run dev:client`.

## 📖 Code Documentation Standards
All components and modules contain JSDoc documentation outlining:
- The objective/function of the file.
- Its relationship with other elements in the system.
- An explanation of how the internal code/logic works.

This standard ensures that new developers and mentors can quickly understand the flow of data, state, and rendering within the React ecosystem.
