/**
 * App.tsx - Root Component
 *
 * Composes all portfolio sections with centralized data.
 * Data sourced from CV & Portfolio PDFs of Aries Setiawan.
 *
 * Sections:
 * 1. Navbar - Tab-style navigation with active section tracking
 * 2. HeroSection - Introduction with CTAs
 * 3. AboutSection - Bio, key values, education, achievements
 * 4. SkillsSection - Categorized technical skills
 * 5. PortfolioSection - Projects with STAR method (Contentful CMS)
 * 6. ExperienceSection - Career timeline at Bank Mandiri
 * 7. TestimonialsSection - Colleague/client feedback
 * 8. ContactSection - Form and social links
 * 9. Footer - Copyright and links
 */

import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { SkillsSection } from "./components/SkillsSection";
import { PortfolioSection } from "./components/PortfolioSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { useThemeStore } from "./store/useThemeStore";

// Import assets
import photoUrl from "./assets/photo.jpeg";
import cvUrl from "./assets/cv.pdf";

import {
  NAV_ITEMS,
  BIO,
  CORE_SKILLS,
  KEY_VALUES,
  SKILLS,
  EXPERIENCES,
  TESTIMONIALS,
  CONTACT,
  PROJECTS,
} from "./data/constants";

// ============================================================
// APP COMPONENT
// ============================================================

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  return (
    <main>
      <Navbar navItems={NAV_ITEMS} />

      <HeroSection
        name="Aries Setiawan"
        title="Fullstack Web Developer"
        description="Leveraging over 6 years of enterprise IT risk management experience to build secure, robust, and data-driven web applications. Specializing in foundational full-stack development using TypeScript, React, Node.js, and PostgreSQL."
        photoUrl={photoUrl}
      />

      <AboutSection
        bio={BIO}
        coreSkills={CORE_SKILLS}
        keyValues={KEY_VALUES}
        cvUrl={cvUrl}
      />

      <SkillsSection skills={SKILLS} />

      <PortfolioSection
        projects={PROJECTS}
        loading={false}
        source={"static"}
      />

      <ExperienceSection experiences={EXPERIENCES} />

      <TestimonialsSection testimonials={TESTIMONIALS} />

      <ContactSection contact={CONTACT} />

      <Footer
        name="Aries Setiawan"
        github={CONTACT.github}
        linkedin={CONTACT.linkedin}
        email={CONTACT.email}
      />
    </main>
  );
}

export default App;
