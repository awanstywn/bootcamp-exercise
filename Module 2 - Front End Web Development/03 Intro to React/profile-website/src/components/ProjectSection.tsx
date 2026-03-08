/**
 * ProjectSection Component
 *
 * Displays the user's project portfolio with two categories:
 * - IT Risk Management Projects (4 projects from Bank Mandiri)
 * - Fullstack Web Development Projects (Coming Soon + Bootcamp Link)
 *
 * Features:
 * - 2x2 grid layout for project cards
 * - Each card shows project image, name, description, and link
 * - Disclaimer that these are risk management projects
 * - Link to bootcamp exercises for web development work
 */

interface Project {
  name: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  category: "Risk Management" | "Web Development";
}

interface ProjectSectionProps {
  riskManagementProjects: Project[];
}

export function ProjectSection({ riskManagementProjects }: ProjectSectionProps) {
  return (
    <section id="project" className="flex flex-col items-center justify-center min-h-fit bg-gray-950 text-white py-12 md:py-16 px-6 sm:px-8 md:px-12 lg:px-4">
      <div className="max-w-6xl w-full">
        {/* Section Header with Disclaimer */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">Browse My Recent</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Projects</h2>
          <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto px-4">
            Note: These are projects I contributed to as an IT Risk Manager at Bank Mandiri, ensuring security and compliance.
          </p>
        </div>

        {/* Projects Grid - 2x2 Layout (2 rows, 2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
          {riskManagementProjects.slice(0, 4).map((project, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-600 transition-all duration-300"
            >
              {/* Project Image - Maintains 16:9 aspect ratio */}
              <div className="aspect-video w-full bg-gray-800 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Project Details */}
              <div className="p-4 md:p-6">
                <h4 className="text-lg md:text-xl font-bold text-white mb-3">
                  {project.name}
                </h4>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Action Button - Opens project URL in new tab */}
                <div className="flex gap-3">
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                  >
                    Check the Apps
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Card for Web Development Projects */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 md:p-12 text-center mx-auto max-w-4xl">
          <div className="flex flex-col items-center">
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">
              Fullstack Web Development Projects
            </h3>
            <p className="text-sm md:text-base text-gray-500 max-w-2xl mb-6 px-4">
              Coming soon - I'm currently working on exciting web development projects using modern technologies like React, TypeScript, and Node.js.
            </p>

            {/* Link to Bootcamp Exercises - Shows current learning progress */}
            <a
              href="https://awanstywn.github.io/bootcamp-exercise/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View My Bootcamp Exercises
            </a>
          </div>
        </div>

        {/* Scroll Indicator - Points to next section */}
        <div className="flex justify-center mt-8">
          <svg className="w-6 h-6 text-gray-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
