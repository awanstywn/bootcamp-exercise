/**
 * TechStackSection Component
 *
 * Displays the technologies and tools the user is learning:
 * - Currently learning skills with icons (6 skills displayed)
 * - Future skills to learn (shown as tags)
 *
 * Features:
 * - Responsive grid: 2 columns mobile → 6 columns desktop
 * - Uses Devicons CDN for professional tech logos
 * - Hover effects with scale animation
 * - Disclaimer that these are learning technologies
 */

interface Skill {
  name: string;
  icon: string;
  category: "Frontend" | "Backend" | "Tools" | "Learning";
}

interface TechStackSectionProps {
  currentSkills: Skill[];
  futureSkills?: string[];
}

export function TechStackSection({ currentSkills, futureSkills = ["Node.js", "Express", "MongoDB", "PostgreSQL", "Docker"] }: TechStackSectionProps) {
  // Helper function to check if icon is a URL or emoji
  const isIconUrl = (icon: string) => icon.startsWith('http');

  return (
    <section id="tech-stack" className="flex flex-col items-center justify-center min-h-fit bg-gray-950 text-white py-12 md:py-16 px-6 sm:px-8 md:px-12 lg:px-4">
      <div className="max-w-6xl w-full">
        {/* Section Header with Disclaimer */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">What I Know</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Tech Stack</h2>
          <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto px-4">
            These are the technologies I'm currently learning and mastering through my bootcamp and personal projects.
          </p>
        </div>

        {/* Tech Stack Grid - Responsive: 2 cols (mobile) → 3 cols (tablet) → 6 cols (desktop) */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {currentSkills.map((skill, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-xl p-4 md:p-6 text-center border border-gray-800 hover:border-gray-600 transition-all duration-300 group"
              >
                {/* Tech Icon/Emoji - Scales up on hover */}
                <div className="h-12 md:h-16 mb-4 flex items-center justify-center transition-all duration-300">
                  {isIconUrl(skill.icon) ? (
                    // External icon URL (Devicons CDN)
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="h-full w-auto object-contain transition-all duration-300 group-hover:scale-110"
                    />
                  ) : (
                    // Emoji fallback
                    <span className="text-4xl md:text-6xl">{skill.icon}</span>
                  )}
                </div>

                {/* Skill Name */}
                <h4 className="text-xs md:text-sm font-semibold text-white group-hover:text-gray-200">
                  {skill.name}
                </h4>

                {/* Category Label */}
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
                  {skill.category}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Future Skills Section - Technologies planned to learn next */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 md:p-8 max-w-4xl mx-auto">
          <h3 className="text-base md:text-lg font-bold uppercase mb-4 md:mb-6 text-center">Learning Next</h3>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {futureSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 md:px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-xs md:text-sm font-medium border border-gray-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-8">
          <svg className="w-6 h-6 text-gray-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
