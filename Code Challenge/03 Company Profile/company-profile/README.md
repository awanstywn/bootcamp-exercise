# PayStream (Stripe Redesign Clone)

PayStream is a full-stack company profile website built as a modern redesign of [Stripe](https://stripe.com). This project was created to demonstrate advanced React frontend development, responsive design, and Backendless CMS integration, while capturing the premium, high-trust aesthetic of industry-leading financial infrastructure platforms.

## 🎨 Design & Engineering Decisions

When redesigning the Stripe experience, several deliberate choices were made:

1. **Brand Identity & Typography**:
   - Adopted a tailored Stripe-inspired color palette, anchoring on a vibrant purple (`#635bff`) and deep navy (`#0a2540`) to convey both innovation and institutional trust.
   - Utilized the `Inter` font family (with `display=swap`) to match Stripe's highly legible, geometric typography.

2. **Component Architecture**:
   - Built a modular React structure with reusable UI components (buttons, layout wrappers).
   - Employed `lazy()` loading and `Suspense` for all top-level routes to ensure the initial JS bundle remains small, significantly improving the Largest Contentful Paint (LCP) and overall Performance scores.

3. **Animations (Framer Motion)**:
   - Added subtle scroll-triggered fade-ins to elements as they enter the viewport, emulating the fluid, dynamic feel of top-tier SaaS landing pages.

4. **Headless CMS & Auth (Backendless)**:
   - Replaced static content with a dynamic Backendless database.
   - Built a fully functioning Blog with Markdown support (`@uiw/react-md-editor`) and authentication-gated posting features.
   - Implemented a custom Zustand store for global session management, bypassing default Backendless UI in favor of seamless local integration.

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS, Framer Motion
- **Routing & Meta**: React Router DOM v7, React Helmet Async
- **State Management**: Zustand
- **Backend / CMS**: Backendless
- **Icons**: Lucide React

## ✨ Features
- **Modern Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Zustand.
- **Dynamic Content:** Blog, Services, and Testimonials fetched from Backendless with graceful static fallbacks.
- **Authentication:** Secure user registration, login, and robust session recovery via Backendless SDK.
- **Admin Moderation:** Automated feature tagging, and Edit/Delete controls exclusively available to users with the `admin` role.
- **Media Uploads:** Native integration with Backendless File Storage allowing authors to upload custom cover images directly from the browser.
- **Code-Splitting:** Dynamic route imports (`React.lazy`) for lightning-fast initial load times.
- **Fully Responsive:** Mobile-first layout optimizations and interactive Framer Motion animations.

## 📁 Key Features

- **Dynamic Homepage**: Features an animated hero section, statistical overview, and dynamic services loaded directly from Backendless.
- **Services Portfolio**: Alternating layout with detailed service descriptions, pricing, and inline testimonials.
- **Team Roster**: Dynamic team listing populated by the `randomuser.me` API (per assignment requirements).
- **Full Blog System**:
  - Browse featured and community posts.
  - Read full articles rendered from Markdown.
  - Authenticated users can write and publish new posts.
- **Complete Auth Flow**: Custom Register and Login forms utilizing Backendless user management.
- **Legal Pages**: Comprehensive placeholder routes for Privacy Policy, Terms of Service, and Security.

## 🛠️ Getting Started

### Admin Credentials (Mentor Review)
To test the admin moderation features (Editing/Deleting posts, auto-featuring posts):
- **Email:** `admin@admin.com`
- **Password:** `password123`

### Prerequisites
- Node.js 18+
- A Backendless account with your App ID and REST API Key.

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd company-profile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Backendless credentials:
   ```env
   VITE_BACKENDLESS_APP_ID=your_app_id_here
   VITE_BACKENDLESS_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Building for Production

To create a production-ready build:
```bash
npm run build
```
The output will be generated in the `dist` directory. You can preview it using:
```bash
npm run preview
```

## 📄 License
This project is for educational purposes. All design inspirations belong to their respective original creators.
