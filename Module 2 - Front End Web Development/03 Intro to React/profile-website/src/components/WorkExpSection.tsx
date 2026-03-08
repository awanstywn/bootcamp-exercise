/**
 * WorkExpSection Component
 *
 * Displays the user's work experience in a consolidated format:
 * - Single card showing all experience at one company (PT Bank Mandiri)
 * - Timeline of 5 roles progressed through over 6+ years
 * - Current role indicator
 *
 * Features:
 * - Condensed layout since all experience is at the same company
 * - Clean timeline with dots and role progression
 * - Responsive design with proper mobile spacing
 */

interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string[];
  current?: boolean;
}

interface WorkExpSectionProps {
  experiences: WorkExperience[];
}

export function WorkExpSection({ experiences }: WorkExpSectionProps) {
  return (
    <section id="work-experience" className="flex flex-col items-center justify-center min-h-fit bg-gray-950 text-white py-12 md:py-16 px-6 sm:px-8 md:px-12 lg:px-4">
      <div className="max-w-4xl w-full">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">My Journey</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Work Experience</h2>
        </div>

        {/* Single Card - Consolidates all experience at PT Bank Mandiri */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 md:p-8">
          {/* Company Header */}
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              PT Bank Mandiri (Persero) Tbk.
            </h3>
            <p className="text-sm md:text-base text-gray-400 mb-1">
              Jakarta, Indonesia
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              January 2019 - September 2025 · 6+ Years
            </p>
          </div>

          {/* Experience Details */}
          <div className="border-t border-gray-800 pt-6">
            {/* Summary Description */}
            <p className="text-sm text-gray-400 mb-6">
              Progressed through 5 roles from Officer Development Program to Credit System Risk Manager, managing risk assessment for digital banking platforms, IT projects, and wholesale channels.
            </p>

            {/* Role Timeline - Lists all 5 positions chronologically */}
            <div className="space-y-3 md:space-y-4">
              {experiences.map((exp, index) => (
                <div key={index} className="flex items-start gap-3 md:gap-4">
                  {/* Timeline Dot */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  </div>

                  {/* Role Information */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs md:text-sm font-semibold text-white">
                        {exp.title}
                      </h4>

                      {/* Current Role Badge */}
                      {exp.current && (
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full border border-gray-700">
                          Current
                        </span>
                      )}
                    </div>

                    {/* Date Range */}
                    <p className="text-xs text-gray-500">
                      {exp.startDate} - {exp.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
