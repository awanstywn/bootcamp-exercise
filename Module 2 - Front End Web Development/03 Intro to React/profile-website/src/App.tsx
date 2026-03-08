/**
 * App.tsx - Root Component
 *
 * This is the root component that composes all portfolio sections.
 * It acts as the main container and data provider for child components.
 *
 * Component Structure:
 * The App component renders six main sections:
 * 1. HelloSection - Hero section with navigation and introduction
 * 2. AboutMeSection - Background info and career transition
 * 3. ProjectSection - Project portfolio (IT Risk Management projects)
 * 4. TechStackSection - Technologies being learned
 * 5. WorkExpSection - Work experience at Bank Mandiri
 * 6. ContactMeSection - Contact form and social links
 *
 * Data Flow:
 * All dynamic data (text, links, images) is passed as props to child components.
 * This makes the components reusable and the data centralized in one place.
 *
 * Props Structure:
 * - navItems: Array of navigation menu items with label and href
 * - paragraphs: Array of description strings for About section
 * - cvUrl: Link to downloadable CV
 * - riskManagementProjects: Array of project objects with details
 * - currentSkills: Array of tech skills with icons and categories
 * - experiences: Array of work experience objects
 * - email & linkedin: Contact information
 *
 * Customization:
 * To update portfolio content, modify the data passed as props below.
 * The component structure and styling remain the same.
 */

import { HelloSection } from './components/HelloSection'
import { AboutMeSection } from './components/AboutMeSection'
import { ProjectSection } from './components/ProjectSection'
import { TechStackSection } from './components/TechStachSection'
import { WorkExpSection } from './components/WorkExpSection'
import { ContactMeSection } from './components/ContactMeSection'
import './App.css'

function App() {
  return (
    <div className="App">
      {/* ========================================
       HERO SECTION - Navigation and Introduction
       ======================================== */}
      <HelloSection
        name="Aries Setiawan"
        title="Aspiring Web Developer"
        description="Hello, I'm Aries Setiawan, a career switcher from an IT Risk Manager background who is currently transitioning into Fullstack Web Development. I enjoy building scalable web applications and solving problems through code while continuously improving my skills in modern web technologies."
        photoUrl="./src/assets/photo.jpeg"
        navItems={[
          { label: "Home", href: "#home" },
          { label: "About Me", href: "#about" },
          { label: "Project", href: "#project" },
          { label: "Tech Stack", href: "#tech-stack" },
          { label: "Work Experience", href: "#work-experience" },
          { label: "Contact Me", href: "#contact" }
        ]}
      />

      {/* ========================================
       ABOUT SECTION - Background and Transition
       ======================================== */}
      <AboutMeSection
        paragraphs={[
          "I have a professional background as an IT Risk Manager, where I focused on data analysis and risk assessment to support the development of IT products such as mobile banking platforms, IT security systems, and other digital services. Through this role, I developed strong analytical thinking and gained a deeper understanding of how technology systems are designed, evaluated, and secured to ensure reliability and efficiency.",
          "Currently, I am transitioning into Fullstack Web Development and actively improving my technical skills through continuous learning and an intensive web development bootcamp. By combining my previous experience in the IT industry with new development skills, I am excited to contribute to building reliable digital products and ready to take on new challenges in the field of web development. 🚀"
        ]}
        cvUrl="./src/assets/cv.pdf"
      />

      {/* ========================================
       PROJECTS SECTION - IT Risk Management Projects
       ======================================== */}
      <ProjectSection
        riskManagementProjects={[
          {
            name: "Kopra by Mandiri",
            description: "Corporate digital banking platform for business customers. Facilitates seamless banking transactions, cash management, and financial services for enterprises with enhanced security features.",
            imageUrl: "./src/assets/projects/kopra.png",
            projectUrl: "https://www.bankmandiri.co.id/en/business-e-banking/kopra",
            category: "Risk Management"
          },
          {
            name: "Livin' by Mandiri",
            description: "Super app for retail banking customers. Provides comprehensive digital banking services including transfers, bill payments, investments, and lifestyle features with millions of active users.",
            imageUrl: "./src/assets/projects/livin.png",
            projectUrl: "https://www.bankmandiri.co.id/en/personal/e-banking/livin-by-mandiri",
            category: "Risk Management"
          },
          {
            name: "Mandiri Agent",
            description: "Digital agent banking network that extends banking services to underserved communities. Enables agents to perform transactions on behalf of customers, promoting financial inclusion.",
            imageUrl: "./src/assets/projects/agent.png",
            projectUrl: "https://www.bankmandiri.co.id/en/aplikasi-agent-banking-system",
            category: "Risk Management"
          },
          {
            name: "Mandiri Open API",
            description: "Open banking API platform that enables third-party developers to integrate Mandiri's services. Facilitates fintech partnerships and innovative digital ecosystem development.",
            imageUrl: "./src/assets/projects/openapi.png",
            projectUrl: "https://developers.bankmandiri.co.id/",
            category: "Risk Management"
          }
        ]}
      />

      {/* ========================================
       TECH STACK SECTION - Learning Technologies
       ======================================== */}
      <TechStackSection
        currentSkills={[
          {
            name: "HTML5",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
            category: "Frontend"
          },
          {
            name: "CSS3",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
            category: "Frontend"
          },
          {
            name: "JavaScript",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
            category: "Frontend"
          },
          {
            name: "TypeScript",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
            category: "Frontend"
          },
          {
            name: "React",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
            category: "Frontend"
          },
          {
            name: "Git",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
            category: "Tools"
          }
        ]}
      />

      {/* ========================================
       WORK EXPERIENCE SECTION - Career Timeline
       ======================================== */}
      <WorkExpSection
        experiences={[
          {
            title: "Credit System Risk Manager",
            company: "PT Bank Mandiri (Persero) Tbk.",
            location: "Jakarta, Indonesia",
            startDate: "January 2025",
            endDate: "September 2025",
            current: true,
            description: [
              "Managed risk for loan systems across all segments (consumer loan, micro loan, SME loan, and wholesale loan), from acquisition and underwriting to collection, to support loan growth.",
              "Conducted credit risk analysis and assessment for various banking products.",
              "Collaborated with cross-functional teams to implement risk management strategies."
            ]
          },
          {
            title: "Wholesale Channel Risk Manager",
            company: "PT Bank Mandiri (Persero) Tbk.",
            location: "Jakarta, Indonesia",
            startDate: "January 2024",
            endDate: "December 2024",
            current: false,
            description: [
              "Conducted risk assessments and evaluations on wholesale channel development (Kopra, Cash Management, H2H Product - Mandiri Bill Payment & Mandiri Corporate Payable).",
              "Ensured fraud mitigation and supported product growth for wholesale banking channels.",
              "Analyzed risk factors in B2B payment systems and corporate cash management solutions."
            ]
          },
          {
            title: "Personal E-Channel Risk Manager",
            company: "PT Bank Mandiri (Persero) Tbk.",
            location: "Jakarta, Indonesia",
            startDate: "January 2022",
            endDate: "January 2024",
            current: false,
            description: [
              "Conducted risk assessments and evaluations for retail channels, including Livin' by Mandiri, Laku Pandai Channel (Agent Banking System), Mandiri Value Chain, and Mandiri Pintar.",
              "Conducted risk analysis for the onboarding Livin' Sukha partners.",
              "Managed risk assessment for merchant acquiring and digital banking products."
            ]
          },
          {
            title: "IT Improvement & Application Risk Manager",
            company: "PT Bank Mandiri (Persero) Tbk.",
            location: "Jakarta, Indonesia",
            startDate: "August 2019",
            endDate: "December 2021",
            current: false,
            description: [
              "Acted as a risk manager in IT projects (application stabilization, SOA development, core banking upgrade, and security system procurement and maintenance).",
              "Conducted risk analysis for the acquisition of Open API Partners.",
              "Evaluated IT risk in software development and system integration projects."
            ]
          },
          {
            title: "Officer Development Program (ODP)",
            company: "PT Bank Mandiri (Persero) Tbk.",
            location: "Jakarta, Indonesia",
            startDate: "January 2019",
            endDate: "July 2019",
            current: false,
            description: [
              "Officer Development Program Batch 167",
              "Risk Management Development Program Batch 8",
              "Rotated through various departments to gain comprehensive banking knowledge."
            ]
          }
        ]}
      />

      {/* ========================================
       CONTACT SECTION - Form and Social Links
       ======================================== */}
      <ContactMeSection
        email="ariessetiawan2804@gmail.com"
        linkedin="https://www.linkedin.com/in/ariesstywn/"
      />
    </div>
  )
}

/**
 * Export App component as the default export
 * This allows it to be imported in main.tsx as: import App from './App.tsx'
 */
export default App
