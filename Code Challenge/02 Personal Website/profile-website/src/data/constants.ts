import type {
  NavItem,
  SkillGroup,
  Experience,
  Testimonial,
  ContactInfo,
  Project,
} from "../types";

import vibeflowPng from "../assets/projects/vibeflow.png";
import blogPng from "../assets/projects/blog.png";
import todoPng from "../assets/projects/todo.png";
import kopraPng from "../assets/projects/kopra.png";
import livinPng from "../assets/projects/livin.png";
import openApiPng from "../assets/projects/openapi.png";

export const NAV_ITEMS: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Experience", href: "#experience" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export const BIO = "I am a Full-Stack Web Developer who enjoys breaking down complex challenges and building practical, real-world solutions. With over six years of experience in enterprise banking risk management, I have a deep background in evaluating digital products, system architectures, and APIs for security and operational efficiency. Today, I am combining this analytical foundation with modern software engineering to build robust web applications and AI-powered automation systems. My focus is on creating reliable technology that improves productivity, solves meaningful business problems, and drives measurable impact.";

export const CORE_SKILLS = "Full-Stack Web Development (TypeScript, React.js, Node.js), Relational Databases (PostgreSQL), REST API Development, and AI-Assisted Engineering, all underpinned by a strong professional foundation in System Security and Risk Management.";

export const KEY_VALUES = [
  {
    title: "Security-First Mindset",
    desc: "Writing robust, secure code backed by enterprise risk management principles."
  },
  {
    title: "Practical Problem-Solving",
    desc: "Building efficient, automation-driven applications that directly address real business needs."
  },
  {
    title: "Clear Communication & Timeliness",
    desc: "Delivering projects on schedule while smoothly translating technical details into clear business value."
  }
];

export const SKILLS: SkillGroup[] = [
  {
    category: "Technical Skills (Software Engineering)",
    subcategories: [
      {
        title: "Front-End Skills",
        skills: [
          { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
          { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
          { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
          { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
          { name: "React.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
          { name: "Tailwind CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
          { name: "Vite", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" },
        ]
      },
      {
        title: "Back-End Skills",
        skills: [
          { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
          { name: "Express.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
          { name: "REST API Development", icon: "🔗" },
          { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
          { name: "Prisma ORM", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" },
          { name: "SQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuresqldatabase/azuresqldatabase-original.svg" },
          { name: "C++ (Basic)", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
        ]
      },
      {
        title: "DevOps, Tools & Automation",
        skills: [
          { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
          { name: "GitHub", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
          { name: "n8n", icon: "🔌" },
        ]
      },
      {
        title: "AI Engineering",
        skills: [
          { name: "AI-Assisted Development", icon: "🤖" },
          { name: "AI Integration", icon: "🧠" },
        ]
      }
    ]
  },
  {
    category: "Domain Expertise & Professional Skills",
    subcategories: [
      {
        title: "Industry Domain",
        skills: [
          { name: "Enterprise Risk Management", icon: "🛡️" },
          { name: "Operational Risk", icon: "📉" },
          { name: "Fraud Risk Assessment", icon: "🔒" },
          { name: "Data Analytics", icon: "📊" },
        ]
      },
      {
        title: "Professional (Soft) Skills",
        skills: [
          { name: "Clear Communication", icon: "🗣️" },
          { name: "Practical Problem-Solving", icon: "🧩" },
          { name: "Adaptability", icon: "🔄" },
          { name: "Cross-functional Team Collaboration", icon: "🤝" },
        ]
      }
    ]
  }
];

export const EXPERIENCES: Experience[] = [
  {
    title: "Software Engineering & AI Projects",
    company: "Independent Developer",
    location: "Remote / Self-employed",
    startDate: "Oct 2025",
    endDate: "Present",
    current: true,
    description: [
      "Architecting and building full-stack internal tools that combine React, Node.js, and workflow automation (e.g., n8n) to streamline business workflows and eliminate manual data entry.",
      "Implementing AI engineering concepts—including AI-assisted development, prompt engineering, and agentic AI workflows—to accelerate application development and solve complex logic challenges."
    ]
  },
  {
    title: "Team Leader Credit System Risk",
    company: "PT Bank Mandiri (Persero) Tbk.",
    location: "Jakarta, Indonesia",
    startDate: "Jan 2025",
    endDate: "Sept 2025",
    current: false,
    description: [
      "Audited complex backend system logic using SQL, discovering and remediating a critical database mapping gap that prevented widespread data anomalies across consumer loan systems.",
      "Collaborated directly with software engineering teams to ensure the secure architecture and deployment of enterprise financial applications."
    ]
  },
  {
    title: "Officer Wholesale Channel Risk",
    company: "PT Bank Mandiri (Persero) Tbk.",
    location: "Jakarta, Indonesia",
    startDate: "Jan 2024",
    endDate: "Dec 2024",
    current: false,
    description: [
      "Leveraged advanced SQL for deep data analysis, identifying backend logic flaws that allowed accounts to bypass segmentation rules, directly driving critical engineering updates.",
      "Evaluated system architecture and data flows to identify technical vulnerabilities during the development of enterprise digital platforms."
    ]
  },
  {
    title: "Officer Personal E-Channel Risk",
    company: "PT Bank Mandiri (Persero) Tbk.",
    location: "Jakarta, Indonesia",
    startDate: "Jan 2022",
    endDate: "Jan 2024",
    current: false,
    description: [
      "Validated technical integration logic and data flow for 57+ third-party APIs, maintaining strict system compliance and a zero-fraud record.",
      "Uncovered critical backend security gaps (e.g., missing 2FA controls) and actively collaborated with engineers to deploy system patches preventing Account Takeover (ATO) vulnerabilities."
    ]
  },
  {
    title: "Officer IT Improvement & Application Risk",
    company: "PT Bank Mandiri (Persero) Tbk.",
    location: "Jakarta, Indonesia",
    startDate: "Aug 2019",
    endDate: "Dec 2021",
    current: false,
    description: [
      "Facilitated the secure backend onboarding and technical integration of 50+ Open API partners.",
      "Spearheaded technical improvement initiatives by executing in-depth system architecture analyses for new enterprise software deployments."
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Aries demonstrates exceptional analytical skills and a strong attention to detail. His transition from risk management to web development has been impressive, bringing a unique perspective to software quality.",
    name: "Senior Manager",
    title: "IT Risk Division, Bank Mandiri",
  },
  {
    quote:
      "Aries possesses a rare ability to deeply understand complex system architectures. His data-driven approach to identifying backend vulnerabilities and his seamless collaboration with our developers made him an invaluable asset to the engineering team.",
    name: "Lead Software Engineer",
    title: "IT Application Development, Bank Mandiri",
  },
  {
    quote:
      "Working with Aries on cross-functional projects was a great experience. He bridges the gap between business requirements and technical implementation effectively.",
    name: "Product Manager",
    title: "Digital Banking Division, Bank Mandiri",
  },
];

export const CONTACT: ContactInfo = {
  email: "ariessetiawan2804@gmail.com",
  linkedin: "https://www.linkedin.com/in/ariesstywn/",
  github: "https://github.com/awanstywn",
};

export const PROJECTS: Project[] = [
  {
    id: "vibeflow-inspector",
    title: "VibeFlow Inspector (Agentic AI Code Review Platform)",
    slug: "vibeflow-inspector",
    category: "Web Development",
    technologies: [
      "TypeScript",
      "React",
      "Node.js",
      "Express.js",
      "PostgreSQL",
      "Google AI Studio",
      "Cloud Run",
    ],
    description:
      "A prototype AI-driven code review platform developed for the Google Cloud #JuaraVibeCoding competition to automate repository audits across critical security and compliance domains.",
    situation:
      "AI-driven development enables rapid application building but often lacks proper security, architecture, compliance, and quality reviews, leaving codebases vulnerable before deployment.",
    task: "Engineer a modern web application for the Google Cloud #JuaraVibeCoding competition that acts as an automated Senior Reviewer, scanning repositories across 8 critical domains.",
    action:
      "Built an agentic AI platform using AI-assisted 'prompt-to-production' workflows, integrating Google AI Studio for rapid prototyping and deploying via Google Cloud Run for secure, serverless scalability.",
    result:
      "Developed a functional full-stack prototype enabling comprehensive repository audits through a single dashboard. The platform generates a Vibe Risk Score, identifies issues at line-level precision, and recommends code fixes.",
    thumbnailUrl: vibeflowPng,
    projectUrl: "https://vibeflow-inspector-403001261229.asia-southeast1.run.app/",
    githubUrl: "",
    order: 1,
  },
  {
    id: "todo-list-app",
    title: "Fullstack Todo List Application",
    slug: "todo-list-app",
    category: "Web Development",
    technologies: [
      "TypeScript",
      "React",
      "Node.js",
      "Express.js",
      "PostgreSQL",
      "Zustand",
      "JWT",
    ],
    description:
      "A robust task management tool featuring intuitive drag-and-drop mechanics and real-time productivity analytics designed for efficient task tracking.",
    situation:
      "Modern teams need efficient task management tools with intuitive interfaces, real-time updates, and insightful productivity analytics.",
    task: "Engineer a fullstack task management application featuring drag-and-drop, optimistic UI updates, and a custom analytics dashboard.",
    action:
      "Developed backend services with Node.js and Express.js, implementing custom regex search and secure PostgreSQL integration. Built a responsive React frontend with Zustand state management.",
    result:
      "Delivered a fully functional task management app with smooth drag-and-drop interactions, real-time optimistic updates, and productivity insights through a custom analytics dashboard.",
    thumbnailUrl: todoPng,
    projectUrl: "https://awanstywn.github.io/bootcamp-exercise/demos/todo-app-with-db/signin",
    githubUrl: "",
    order: 2,
  },
  {
    id: "blog-app",
    title: "Fullstack Blog Platform",
    slug: "blog-app",
    category: "Web Development",
    technologies: [
      "TypeScript",
      "React",
      "Node.js",
      "Express.js",
      "Prisma ORM",
      "PostgreSQL",
      "JWT",
    ],
    description:
      "A secure and responsive article publishing platform designed for content creators and developers to manage and read content seamlessly across devices.",
    situation:
      "Content creators and developers need a reliable platform for publishing articles with secure authentication and a responsive reading experience.",
    task: "Develop a responsive fullstack article platform with JWT authentication, protected routes, and scalable REST APIs.",
    action:
      "Built a React frontend with protected routes and JWT-based auth flow. Developed scalable REST APIs using Node.js, Express.js, and Prisma ORM to manage complex PostgreSQL database relations.",
    result:
      "Delivered a fully functional blog platform with secure user authentication, CRUD article management, and a responsive reading interface across all devices.",
    thumbnailUrl: blogPng,
    projectUrl: "https://awanstywn.github.io/",
    githubUrl: "",
    order: 3,
  },
  {
    id: "kopra-mandiri",
    title: "Kopra by Mandiri Digital Wholesale Platform",
    slug: "kopra-mandiri",
    category: "Risk Management",
    technologies: [
      "SQL",
      "Excel",
      "Enterprise Risk Management Frameworks",
    ],
    description:
      "A system vulnerability evaluation and risk mitigation initiative for Bank Mandiri's enterprise digital wholesale banking platform.",
    situation:
      "Bank Mandiri's digital wholesale banking platform KOPRA needed enhanced capabilities while addressing security, fraud, and operational risk gaps across enterprise financial services.",
    task: "Evaluate system vulnerabilities and mitigate operational risks for the development and enhancement of the Kopra application and enterprise digital wholesale platforms.",
    action:
      "Conducted comprehensive system reviews and data analysis using SQL/Excel, identifying critical control weaknesses including more than 20% of cash management accounts bypassing segmentation rules.",
    result:
      "Findings led to system logic improvements, reducing potential account abuse risks. Strengthened security controls through 2FA implementation and transaction anomaly monitoring.",
    thumbnailUrl: kopraPng,
    projectUrl: "https://www.bankmandiri.co.id/en/business-e-banking/kopra",
    order: 4,
  },
  {
    id: "livin-sukha",
    title: "Livin' Sukha Third-Party Partner Integration",
    slug: "livin-sukha",
    category: "Risk Management",
    technologies: [
      "API Integrations",
      "Risk Assessment Methodologies",
    ],
    description:
      "End-to-end risk review and technical integration assessment for third-party services connecting to the Livin' by Mandiri digital ecosystem.",
    situation:
      "Livin' Sukha, a digital ecosystem within Livin' by Mandiri, connects users with third-party services. The platform required secure partner integration balancing business growth and fraud prevention.",
    task: "Perform end-to-end risk reviews and technical integration assessments for partner organizations, defining onboarding procedures and risk acceptance criteria.",
    action:
      "Executed comprehensive domain risk evaluations for 57+ third-party partner integrations, assessing technical, operational, and fraud risks at each stage of the onboarding process.",
    result:
      "Maintained 100% compliance with established controls and achieved a zero-fraud record throughout involvement, supporting safe expansion of the platform ecosystem.",
    thumbnailUrl: livinPng,
    projectUrl:
      "https://www.bankmandiri.co.id/en/personal/e-banking/livin-by-mandiri",
    order: 5,
  },
  {
    id: "mandiri-open-api",
    title: "Mandiri Open API Governance",
    slug: "mandiri-open-api",
    category: "Risk Management",
    technologies: [
      "Open API Architecture",
      "Security & Compliance Controls",
    ],
    description:
      "Comprehensive risk assessments and partner onboarding evaluations for Bank Mandiri's secure Open API platform ecosystem.",
    situation:
      "Bank Mandiri's Open API platform enables secure integration between banking services and external applications, requiring robust risk governance for partner ecosystem expansion.",
    task: "Conduct comprehensive risk assessments for new platform capabilities and end-to-end evaluations for Open API partner integrations.",
    action:
      "Performed end-to-end risk evaluations for 50+ Open API partner integrations, assessing technical, operational, security, and compliance risks at each stage of partner onboarding.",
    result:
      "Supported secure ecosystem expansion while maintaining a zero-fraud and zero-compliance breach record, ensuring trusted and reliable API connectivity for external partners.",
    thumbnailUrl: openApiPng,
    projectUrl: "https://developers.bankmandiri.co.id/",
    order: 6,
  },
];
