/**
 * HeroSection.tsx — Landing / Hero Section
 *
 * Full viewport hero with developer name, title, intro, photo, and CTAs.
 * Neo-Brutalist style with dotted texture background, thick borders.
 */

import { ArrowDown, Eye, Mail } from "lucide-react";

interface HeroSectionProps {
  name: string;
  title: string;
  description: string;
  photoUrl: string;
}

export function HeroSection({ name, title, description, photoUrl }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 pt-16 md:pt-20"
      style={{ background: "var(--color-bg-primary)" }}
    >
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            <p className="section-label mb-4">Introduction</p>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-none mb-4 uppercase tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {name.split(" ")[0]}
              <br />
              <span style={{ color: "var(--color-accent)" }}>
                {name.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-[2px] w-12"
                style={{ background: "var(--color-accent)" }}
              />
              <p
                className="text-sm font-bold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
              >
                {title}
              </p>
            </div>

            <p
              className="text-sm leading-relaxed mb-8 max-w-lg"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
            >
              {description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a href="#portfolio" className="btn-accent">
                <Eye size={16} />
                View Portfolio
              </a>
              <a href="#contact" className="btn-outline">
                <Mail size={16} />
                Contact Me
              </a>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Dotted texture behind */}
              <div
                className="absolute -top-4 -right-4 w-full h-full dotted-bg border-2 border-border"
                style={{ background: "var(--color-bg-card)" }}
              />
              {/* Photo */}
              <div className="relative border-2 border-border overflow-hidden"
                   style={{ background: "var(--color-bg-card)" }}>
                <img
                  src={photoUrl}
                  alt={`${name}'s professional portrait`}
                  className="w-56 h-64 sm:w-64 sm:h-72 md:w-72 md:h-80 object-cover"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              {/* Green accent corner */}
              <div
                className="absolute -bottom-3 -left-3 w-16 h-16 border-2 border-border"
                style={{ background: "var(--color-accent)" }}
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden lg:flex justify-center mt-16">
          <a
            href="#about"
            className="flex flex-col items-center gap-2 animate-bounce"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Scroll to About section"
          >
            <span className="text-xs font-mono uppercase tracking-widest">Scroll</span>
            <ArrowDown size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
