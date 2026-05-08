# Blog App — Frontend

React single-page application for the Blog App. Provides a modern, dark-themed UI for reading, creating, and managing blog articles.

## 🚀 Tech Stack
- **Framework:** React 19
- **Language:** TypeScript
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS v4 (CSS-first config)
- **State Management:** Zustand 5
- **HTTP Client:** Axios (with interceptors)
- **Routing:** React Router DOM 7
- **Validation:** Zod (imported from `@blog-app/shared`)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 📂 Architecture
```
src/
├── main.tsx                    ← React entry point
├── App.tsx                     ← Root component + route definitions
├── index.css                   ← Tailwind v4 directives + custom design system
│
├── api/                        ← Axios service layer
│   ├── client.ts               ← Axios instance + JWT/401 interceptors
│   ├── auth.api.ts             ← Auth endpoints
│   ├── article.api.ts          ← Article CRUD endpoints
│   └── user.api.ts             ← User endpoints
│
├── stores/                     ← Zustand state management
│   ├── auth.store.ts           ← Auth state (user, token, login, register, logout)
│   └── article.store.ts        ← Article state (CRUD operations)
│
├── components/
│   ├── layout/                 ← App shell
│   │   ├── Layout.tsx          ← Navbar + Outlet + Footer wrapper
│   │   ├── Navbar.tsx          ← Fixed nav with auth modals + responsive menu
│   │   └── Footer.tsx          ← Page footer
│   ├── ui/                     ← Reusable primitives
│   │   ├── Button.tsx          ← Multi-variant button (primary/outline/danger/ghost)
│   │   ├── Input.tsx           ← Form input with label + error
│   │   ├── Modal.tsx           ← Animated overlay modal
│   │   ├── Loader.tsx          ← Spinning loader
│   │   ├── Badge.tsx           ← Status badge (published/draft)
│   │   └── EmptyState.tsx      ← Empty data placeholder
│   ├── article/                ← Article-specific components
│   │   ├── ArticleCard.tsx     ← Article preview card
│   │   ├── ArticleList.tsx     ← Grid of ArticleCards
│   │   └── ArticleForm.tsx     ← Create/Edit form with Zod validation
│   └── auth/                   ← Auth-specific components
│       ├── LoginForm.tsx       ← Login form with shared Zod schema
│       ├── RegisterForm.tsx    ← Register form with shared Zod schema
│       └── ProtectedRoute.tsx  ← Auth guard component
│
├── pages/                      ← Route-level page components
│   ├── HomePage.tsx            ← Hero + public article grid
│   ├── ArticleDetailPage.tsx   ← Full article view
│   ├── DashboardPage.tsx       ← User's articles CRUD
│   ├── ProfilePage.tsx         ← User profile + their articles
│   └── NotFoundPage.tsx        ← 404 page
│
└── lib/                        ← Utilities
    ├── utils.ts                ← Date formatting, text truncation
    └── constants.ts            ← App-wide constants
```

## ⚙️ Commands
```bash
# From monorepo root:
npm run dev:frontend      # Start Vite dev server (port 5173)

# From this directory:
npm run dev               # Start dev server
npm run build             # Production build
npm run preview           # Preview production build
```

## 🎨 Design System
- **Theme:** Dark mode with glassmorphism and gradient accents
- **Colors:** Violet primary (`#8b5cf6`), Pink secondary (`#ec4899`)
- **Font:** Outfit (Google Fonts)
- **Effects:** Glow orb backgrounds, card hover animations, gradient top borders
