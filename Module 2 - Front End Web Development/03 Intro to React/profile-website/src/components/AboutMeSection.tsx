/**
 * AboutMeSection Component
 *
 * This section provides information about the user's background and transition:
 * - Two info cards displaying Experience and Transitioning status
 * - Detailed paragraphs about professional background
 * - Action buttons (Hire Me and Download CV)
 *
 * Features:
 * - Responsive card grid (1 column mobile, 2 columns tablet+)
 * - Centered content with maximum width constraints
 * - Clean card design with icons
 */

interface AboutMeSectionProps {
  title?: string;
  paragraphs: string[];
  cvUrl: string;
}

export function AboutMeSection({ title = "About Me", paragraphs, cvUrl }: AboutMeSectionProps) {
  return (
    <section id="about" className="flex flex-col items-center justify-center min-h-fit bg-gray-950 text-white py-12 md:py-16 px-6 sm:px-8 md:px-12 lg:px-4">
      <div className="max-w-6xl w-full">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">Get To Know More</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">{title}</h2>
        </div>

        {/* Info Cards Grid - Displays Experience and Transitioning info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12 max-w-2xl mx-auto">
          {/* Experience Card - Shows 6+ years of IT Risk Management experience */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold uppercase mb-2">Experience</h3>
            <p className="text-sm text-gray-400">6+ Years</p>
            <p className="text-xs text-gray-500 mt-2">IT Risk Management</p>
          </div>

          {/* Transitioning Card - Shows career switch to Web Development */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold uppercase mb-2">Transitioning</h3>
            <p className="text-sm text-gray-400">Career Switch</p>
            <p className="text-xs text-gray-500 mt-2">To Web Development</p>
          </div>
        </div>

        {/* Description Paragraphs - Dynamic content passed as props */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12 px-0 md:px-4">
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-base text-gray-400 leading-relaxed text-center">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Action Buttons - Hire Me and Download CV */}
        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="#contact"
            className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-all duration-300"
          >
            Hire Me
          </a>
          <a
            href={cvUrl}
            download
            className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 border border-gray-700"
          >
            Download CV
          </a>
        </div>
      </div>
    </section>
  )
}
