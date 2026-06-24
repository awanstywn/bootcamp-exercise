import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink } from "lucide-react";
import type { Project } from "../types";

// Brand icon — inline SVG
const GithubIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

interface PortfolioDetailModalProps {
  project: Project;
  onClose: () => void;
}

export function PortfolioDetailModal({ project, onClose }: PortfolioDetailModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const starSections = [
    { label: "Situation", content: project.situation, color: "var(--color-accent)" },
    { label: "Task", content: project.task, color: "#FF6B35" },
    { label: "Action", content: project.action, color: "#3B82F6" },
    { label: "Result", content: project.result, color: "#8B5CF6" },
  ];

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Project details: ${project.title}`}
    >
      <div className="modal-content">
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 border-b-2 border-border"
          style={{ background: "var(--color-bg-card)" }}
        >
          <div>
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
            >
              {project.category}
            </p>
            <h3
              className="text-xl md:text-2xl font-bold uppercase tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {project.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 border-2 border-border hover:bg-accent transition-colors"
            aria-label="Close modal"
            id="modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Tech Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.technologies.map((tech) => (
              <span key={tech} className="tech-tag">
                {tech}
              </span>
            ))}
          </div>

          {/* STAR Method Content */}
          <div className="space-y-6">
            {starSections.map((section) => (
              <div key={section.label} className="border-l-3 pl-4" style={{ borderLeftWidth: "3px", borderLeftColor: section.color }}>
                <h4
                  className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span
                    className="inline-block w-2 h-2"
                    style={{ background: section.color }}
                  />
                  {section.label}
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
                >
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t-2 border-border">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent"
              >
                <ExternalLink size={14} />
                Live Project
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <GithubIcon />
                Source Code
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
