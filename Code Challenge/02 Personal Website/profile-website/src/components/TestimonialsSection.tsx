/**
 * TestimonialsSection.tsx — Client/Colleague Testimonials
 *
 * Placeholder testimonials in Neo-Brutalist card style.
 * Content to be updated by user.
 */

import { Quote } from "lucide-react";
import type { Testimonial } from "../types";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section
      id="testimonials"
      className="below-fold py-16 md:py-24 px-4 sm:px-6 md:px-8"
      style={{ background: "var(--color-bg-primary)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <p className="section-label">What People Say</p>
          <h2 className="section-title">Testimonials</h2>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card-brutal flex flex-col">
              {/* Quote Icon */}
              <div
                className="w-10 h-10 flex items-center justify-center border-2 border-border mb-4"
                style={{ background: "var(--color-accent)" }}
              >
                <Quote size={18} />
              </div>

              {/* Quote Text */}
              <p
                className="text-sm leading-relaxed flex-1 mb-6"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
              >
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t-2 border-border">
                {testimonial.photoUrl ? (
                  <img
                    src={testimonial.photoUrl}
                    alt={testimonial.name}
                    className="w-10 h-10 object-cover border-2 border-border"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div
                    className="w-10 h-10 flex items-center justify-center border-2 border-border text-sm font-bold"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "var(--color-bg-primary)",
                    }}
                  >
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {testimonial.name}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
                  >
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
