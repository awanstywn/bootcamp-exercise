/**
 * PortfolioSection.tsx — Portfolio / Projects Section
 *
 * Displays projects from Contentful CMS (with static fallback).
 * Category tabs: Web Development / Risk Management.
 * Click to view STAR method detail modal.
 */

import { useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { PortfolioDetailModal } from "./PortfolioDetailModal";
import type { Project } from "../types";

interface PortfolioSectionProps {
  projects: Project[];
  loading: boolean;
  source: "contentful" | "static";
}

export function PortfolioSection({ projects, loading, source }: PortfolioSectionProps) {
  const [activeCategory, setActiveCategory] = useState<"All" | "Web Development" | "Risk Management">("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = ["All", "Web Development", "Risk Management"] as const;

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section
      id="portfolio"
      className="below-fold py-16 md:py-24 px-4 sm:px-6 md:px-8"
      style={{ background: "var(--color-bg-primary)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <p className="section-label">Browse My Work</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="section-title">Portfolio</h2>
            {source === "contentful" && (
              <span
                className="text-xs px-2 py-1 border border-border self-start"
                style={{ fontFamily: "var(--font-mono)", background: "var(--color-accent-muted)" }}
              >
                ✓ Powered by Contentful
              </span>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`nav-tab ${activeCategory === cat ? "active" : ""}`}
              id={`portfolio-tab-${cat.toLowerCase().replace(/ /g, "-")}`}
            >
              {cat.replace(/ /g, "_")}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-accent)" }} />
            <span className="ml-3 text-sm font-mono">Loading projects...</span>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="card-brutal text-left cursor-pointer group"
                id={`project-card-${project.slug}`}
              >
                {/* Thumbnail */}
                {project.thumbnailUrl && (
                  <div
                    className="w-full h-40 sm:h-48 border-b-2 border-border overflow-hidden -mt-6 -mx-6 mb-4"
                    style={{ width: "calc(100% + 3rem)" }}
                  >
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}

                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="tech-tag tech-tag--accent">
                    {project.category === "Web Development" ? "DEV" : "RISK"}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--color-accent)" }}
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-bold uppercase tracking-tight mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {project.title}
                </h3>

                {/* Brief Description */}
                <p
                  className="text-xs leading-relaxed mb-4 line-clamp-2"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
                >
                  {project.description || project.situation}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span key={tech} className="tech-tag text-[10px]">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span
                      className="tech-tag text-[10px]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <PortfolioDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
