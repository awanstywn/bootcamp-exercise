import { Download, Briefcase, Award, Zap } from "lucide-react";

interface KeyValueItem {
  title: string;
  desc: string;
}

interface AboutSectionProps {
  bio: string;
  coreSkills: string;
  keyValues: KeyValueItem[];
  cvUrl: string;
}

export function AboutSection({ bio, coreSkills, keyValues, cvUrl }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="below-fold py-16 md:py-24 px-4 sm:px-6 md:px-8"
      style={{ background: "var(--color-bg-primary)" }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Section Header */}
        <div>
          <p className="section-label">Get To Know More</p>
          <h2 className="section-title">About Me</h2>
        </div>

        {/* Bio Card */}
        <div className="card-brutal">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={18} />
            <h3
              className="text-sm font-bold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Background
            </h3>
          </div>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
          >
            {bio}
          </p>
          <a href={cvUrl} download="Aries Setiawan_CV.pdf" className="btn-accent inline-flex">
            <Download size={16} />
            Download CV
          </a>
        </div>

        {/* Skills & Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Core Skills Card */}
          <div className="card-brutal flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award size={18} style={{ color: "var(--color-accent)" }} />
                <h3
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Core Skills
                </h3>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
              >
                {coreSkills}
              </p>
            </div>
          </div>

          {/* Key Values Card */}
          <div className="card-brutal">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} style={{ color: "#FF6B35" }} />
              <h3
                className="text-sm font-bold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Key Values
              </h3>
            </div>
            <ul className="space-y-4">
              {keyValues.map((val, idx) => (
                <li key={idx} className="space-y-1">
                  <h4
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    ✦ {val.title}
                  </h4>
                  <p
                    className="text-xs leading-relaxed pl-4"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
                  >
                    {val.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
