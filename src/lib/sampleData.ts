import type { CVProfile } from "@/types/cv";

export const sampleCVProfile: CVProfile = {
  id: "sample-senior-full-stack-developer",
  name: "Senior Full-Stack Developer",
  personalInfo: {
    fullName: "Alex Morgan",
    jobTitle: "Senior Full-Stack Developer",
    email: "alex.morgan@example.com",
    phone: "+1 (415) 555-0148",
    location: "San Francisco, CA",
    website: "https://alexmorgan.dev",
    linkedin: "https://www.linkedin.com/in/alexmorgan",
    github: "https://github.com/alexmorgan",
    portfolio: "https://alexmorgan.dev/work",
    photoShape: "circle",
    summary:
      "Senior Full-Stack Developer with 9+ years of experience building reliable, accessible products for SaaS and fintech teams. Specializes in TypeScript, React, Node.js, and cloud-native architecture, with a track record of leading teams from product discovery through measurable delivery.",
  },
  experience: [
    {
      id: "experience-cloudscale",
      jobTitle: "Senior Full-Stack Developer",
      company: "CloudScale Technologies",
      location: "San Francisco, CA",
      startDate: "2021-03",
      isCurrent: true,
      description:
        "Lead engineer for a multi-tenant analytics platform used by more than 1,200 businesses.",
      achievements: [
        "Led a five-person product squad delivering a real-time reporting workspace that increased customer feature adoption by 34%.",
        "Redesigned the Node.js data ingestion pipeline with Kafka and PostgreSQL partitioning, reducing processing latency by 62%.",
        "Introduced contract testing, preview environments, and deployment checks that reduced production regressions by 41%.",
      ],
      technologies: [
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "PostgreSQL",
        "Kafka",
        "AWS",
      ],
    },
    {
      id: "experience-finhub",
      jobTitle: "Full-Stack Developer",
      company: "FinHub",
      location: "New York, NY",
      startDate: "2018-06",
      endDate: "2021-02",
      isCurrent: false,
      description:
        "Built customer-facing investment and account management experiences for a growing fintech platform.",
      achievements: [
        "Shipped a responsive React application used by 80,000+ monthly active customers across web and mobile browsers.",
        "Implemented secure OAuth2 integrations and role-based access controls for enterprise account administration.",
        "Partnered with design and compliance to improve onboarding completion by 22% while meeting WCAG 2.1 AA requirements.",
      ],
      technologies: [
        "JavaScript",
        "React",
        "Express",
        "GraphQL",
        "Redis",
        "Docker",
        "Jest",
      ],
    },
    {
      id: "experience-brightlabs",
      jobTitle: "Software Engineer",
      company: "BrightLabs",
      location: "Boston, MA",
      startDate: "2016-08",
      endDate: "2018-05",
      isCurrent: false,
      description:
        "Developed internal tools and APIs for a digital product consultancy serving healthcare and education clients.",
      achievements: [
        "Delivered 12 client projects across scheduling, payments, and content management domains.",
        "Created a reusable component library that shortened feature delivery time for new projects by approximately 25%.",
        "Mentored two junior engineers through code reviews, pairing sessions, and release planning.",
      ],
      technologies: ["JavaScript", "Vue.js", "Python", "Django", "MySQL", "Git"],
    },
  ],
  education: [
    {
      id: "education-northeastern",
      degree: "B.S. in Computer Science",
      institution: "Northeastern University",
      location: "Boston, MA",
      startDate: "2012",
      endDate: "2016",
      isCurrent: false,
      description:
        "Focus areas: distributed systems, human-computer interaction, and software engineering.",
      achievements: ["Dean's List, 2014-2016", "Teaching assistant for Web Development"],
    },
  ],
  skills: [
    { id: "skill-typescript", name: "TypeScript", category: "Languages", yearsOfExperience: 7 },
    { id: "skill-javascript", name: "JavaScript", category: "Languages", yearsOfExperience: 9 },
    { id: "skill-python", name: "Python", category: "Languages", yearsOfExperience: 5 },
    { id: "skill-react", name: "React", category: "Frontend", yearsOfExperience: 8 },
    { id: "skill-nextjs", name: "Next.js", category: "Frontend", yearsOfExperience: 5 },
    { id: "skill-node", name: "Node.js", category: "Backend", yearsOfExperience: 8 },
    { id: "skill-graphql", name: "GraphQL", category: "Backend", yearsOfExperience: 5 },
    { id: "skill-postgresql", name: "PostgreSQL", category: "Data", yearsOfExperience: 7 },
    { id: "skill-aws", name: "AWS", category: "Cloud & DevOps", yearsOfExperience: 6 },
    { id: "skill-docker", name: "Docker", category: "Cloud & DevOps", yearsOfExperience: 7 },
  ],
  projects: [
    {
      id: "project-openbrief",
      name: "OpenBrief",
      description:
        "An open-source collaborative briefing tool that helps distributed teams turn research into structured project plans.",
      url: "https://openbrief.dev",
      repositoryUrl: "https://github.com/alexmorgan/openbrief",
      startDate: "2023",
      technologies: ["Next.js", "TypeScript", "tRPC", "PostgreSQL", "Vercel"],
      highlights: [
        "Designed a keyboard-first editor and live collaboration model used by 2,000+ registered users.",
        "Maintained 95+ Lighthouse accessibility and performance scores across the public product.",
      ],
    },
    {
      id: "project-budgetwise",
      name: "BudgetWise",
      description:
        "A privacy-focused personal finance dashboard that imports transactions locally and provides spending insights.",
      repositoryUrl: "https://github.com/alexmorgan/budgetwise",
      startDate: "2020",
      endDate: "2021",
      technologies: ["React", "TypeScript", "Web Workers", "IndexedDB"],
      highlights: [
        "Built an offline-first architecture with zero server-side storage of financial data.",
        "Reached 4,500 organic users through technical writing and community demonstrations.",
      ],
    },
  ],
  languages: [
    {
      id: "language-english",
      language: "English",
      proficiency: "C2",
    },
    {
      id: "language-spanish",
      language: "Spanish",
      proficiency: "B2",
      certification: "DELE B2",
    },
  ],
  customSections: [
    {
      id: "custom-speaking",
      title: "Speaking & Community",
      items: [
        {
          id: "speaking-react-performance",
          title: "React Performance in Practice",
          content: "Frontend Forward Conference, 2024",
        },
        {
          id: "speaking-mentoring",
          title: "Volunteer Mentor",
          content: "CodePath and Women Who Code, 2020-present",
        },
      ],
    },
  ],
  settings: {
    template: "modern",
    accentColor: "#2563eb",
    fontFamily: "inter",
    fontSize: 10,
    sectionOrder: [
      "summary",
      "experience",
      "projects",
      "education",
      "skills",
      "languages",
      "custom",
    ],
    showPhoto: true,
    showIcons: true,
    lineHeight: 1.45,
  },
  createdAt: "2026-01-15T09:00:00.000Z",
  updatedAt: "2026-01-15T09:00:00.000Z",
};

export default sampleCVProfile;
