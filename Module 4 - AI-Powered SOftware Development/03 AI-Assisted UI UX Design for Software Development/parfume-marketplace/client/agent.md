# Client Agent Guidelines

## 1. Tech Stack
- React 19
- Vite
- TailwindCSS v4
- Zustand for Global State Management
- React Router DOM for routing
- SWR for data fetching
- Lucide React for icons

## 2. Component Architecture
- Use strictly functional components with React Hooks.
- All components must be strongly typed using TypeScript.
- Reusable UI elements belong in `/src/components/ui/`.
- Page-level or feature-specific components belong in `/src/components/<feature>/`.
- Pages should be located in `/src/pages/` and should generally delegate rendering complex parts to components.

## 3. Styling Rules
- Use TailwindCSS utility classes exclusively for styling.
- Avoid writing custom CSS unless absolutely necessary (e.g., custom animations or overriding complex third-party styles).
- Follow a consistent color naming convention mapping to the Tailwind config.

## 4. State Management
- Local component state: Use `useState` and `useReducer`.
- Server-state caching and fetching: Use `useSWR` mapped to the shared `apiClient`.
- Global App State (like auth, cart): Use `Zustand`.

## 5. Documentation Standard
- Provide JSDoc style comments at the top of each file explaining its objective, relations to other elements, and how it works to aid mentorship and team collaboration.
- Maintain a clean and concise component structure.
