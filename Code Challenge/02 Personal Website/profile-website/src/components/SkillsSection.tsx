/**
 * SkillsSection.tsx — Technical Skills Grid
 *
 * Categorized skill display based on grouped and nested structures.
 * Neo-Brutalist cards with tech icons from Devicons CDN.
 */

import type { SkillGroup, SkillItem } from "../types";

interface SkillsSectionProps {
  skills: SkillGroup[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const renderSkillItems = (items: SkillItem[]) => (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
      {items.map((skill) => (
        <div
          key={skill.name}
          className="group flex items-center gap-3 p-3 border border-border-light hover:border-border transition-all duration-200 hover:-translate-y-0.5 min-w-0"
          style={{ background: "var(--color-bg-primary)" }}
        >
          {/* Icon */}
          {skill.icon && skill.icon.startsWith("http") ? (
            <img
              src={skill.icon}
              alt={skill.name}
              className="w-6 h-6 object-contain group-hover:scale-110 transition-transform shrink-0"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="text-lg shrink-0">{skill.icon}</span>
          )}

          {/* Name */}
          <span
            className="text-[10px] sm:text-xs font-bold uppercase tracking-wide wrap-break-word whitespace-normal leading-tight min-w-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {skill.name}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <section
      id="skills"
      className="below-fold py-16 md:py-24 px-4 sm:px-6 md:px-8"
      style={{ background: "var(--color-bg-card)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <p className="section-label">What I Know</p>
          <h2 className="section-title">Skills</h2>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((group) => (
            <div key={group.category} className="card-brutal">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="px-3 py-1 border-2 border-border text-xs font-bold uppercase"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "var(--color-accent)",
                  }}
                >
                  {group.category}
                </div>
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--color-border-light)" }}
                />
              </div>

              {/* Subcategories or flat skills */}
              {group.subcategories ? (
                <div className="space-y-6">
                  {group.subcategories.map((sub) => (
                    <div key={sub.title}>
                      <h4
                        className="text-xs font-bold uppercase tracking-widest mb-3"
                        style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}
                      >
                        {sub.title}
                      </h4>
                      {renderSkillItems(sub.skills)}
                    </div>
                  ))}
                </div>
              ) : group.skills ? (
                renderSkillItems(group.skills)
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
