/**
 * ExperienceSection.tsx — Work Experience Timeline
 *
 * Vertical timeline layout with Neo-Brutalist styling.
 * Consolidated view for Bank Mandiri career progression.
 */

import type { Experience } from "../types";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <section
      id="experience"
      className="below-fold py-16 md:py-24 px-4 sm:px-6 md:px-8"
      style={{ background: "var(--color-bg-card)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <p className="section-label">My Journey</p>
          <h2 className="section-title">Experience</h2>
        </div>

        {/* Timeline */}
        <div className="relative pl-8 md:pl-10">
          {/* Vertical Line */}
          <div className="timeline-line" />

          {/* Experience Items */}
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={index} className="relative">
                {/* Timeline Dot */}
                <div
                  className={`timeline-dot ${
                    exp.current ? "" : "timeline-dot--inactive"
                  }`}
                />

                {/* Content Card */}
                <div className="card-brutal ml-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className="text-sm font-bold uppercase tracking-tight"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {exp.title}
                        </h4>
                        {exp.current && (
                          <span
                            className="text-[10px] font-bold uppercase px-2 py-0.5 border-2 border-border"
                            style={{
                              fontFamily: "var(--font-mono)",
                              background: "var(--color-accent)",
                            }}
                          >
                            Current
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs font-bold font-mono"
                        style={{ color: "var(--color-accent-hover)" }}
                      >
                        {exp.company}
                      </p>
                    </div>
                    <span
                      className="text-xs shrink-0 font-mono"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>

                  {/* Description */}
                  <ul className="space-y-2">
                    {exp.description.map((item, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed">
                        <span
                          className="shrink-0 mt-0.5"
                          style={{ color: "var(--color-accent)" }}
                        >
                          ▸
                        </span>
                        <span
                          style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Achievements */}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border-light">
                      {exp.achievements.map((ach, i) => (
                        <p
                          key={i}
                          className="text-xs mt-1"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--color-accent-hover)",
                          }}
                        >
                          ★ {ach}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
