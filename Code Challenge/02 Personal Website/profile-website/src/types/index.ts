// Shared TypeScript interfaces for the portfolio website

export interface NavItem {
  label: string;
  href: string;
}

export interface SkillItem {
  name: string;
  icon?: string;
}

export interface SkillSubgroup {
  title: string;
  skills: SkillItem[];
}

export interface SkillGroup {
  category: string;
  subcategories?: SkillSubgroup[];
  skills?: SkillItem[];
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: "Web Development" | "Risk Management";
  technologies: string[];
  description?: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  thumbnailUrl: string;
  projectUrl?: string;
  githubUrl?: string;
  order: number;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
  achievements?: string[];
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  photoUrl?: string;
}

export interface ContactInfo {
  email: string;
  linkedin: string;
  github: string;
}


