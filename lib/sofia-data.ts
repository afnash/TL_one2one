import { Course, Opportunity, OpportunityApplication } from "@/types";

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-multivariable-modelling",
    title: "Multivariable Modelling Workshop",
    track: "Business Mathematics Skill Path",
    activitiesCount: 0,
    duration: "Self-paced",
    progress: 0,
    status: "not_started",
    description: "Master multi-parameter decision algorithms, sensitivity analysis, and quantitative optimization for modern business workflows.",
    skills: ["Mathematical Modelling", "Optimization", "Sensitivity Analysis", "GraphSpace"]
  },
  {
    id: "course-ai-agents",
    title: "AI Agents for Managers",
    track: "AI for Management",
    activitiesCount: 18,
    duration: "245 min",
    progress: 28,
    status: "in_progress",
    currentActivity: "Map AI agent value and risk in GraphSpace",
    currentActivityModule: "How Agents Plan, Act, and Improve",
    currentActivityDuration: "20 min",
    description: "Learn how autonomous AI agents think, act, use external tools, and integrate safely into enterprise processes.",
    skills: ["AI Workflows", "Agent Architecture", "Risk Mapping", "Automation"]
  },
  {
    id: "course-python-algorithms",
    title: "Python for Algorithmic Thinking",
    track: "Computer Science Foundations",
    activitiesCount: 14,
    duration: "190 min",
    progress: 60,
    status: "in_progress",
    currentActivity: "Dynamic Programming and Graph Traversals",
    currentActivityModule: "Algorithmic Efficiency",
    currentActivityDuration: "35 min",
    description: "Deep dive into data structures, big-O complexity, recursion, and real-time interactive problem solving.",
    skills: ["Python", "Data Structures", "Algorithms", "Optimization"]
  },
  {
    id: "course-data-analytics",
    title: "Applied Retail Data Analytics",
    track: "Business Analytics Path",
    activitiesCount: 10,
    duration: "160 min",
    progress: 100,
    status: "completed",
    currentActivity: "Capstone: Demand Forecasting Model",
    currentActivityModule: "Predictive Modelling",
    currentActivityDuration: "40 min",
    description: "Hands-on data visualization, SQL queries, and demand forecasting with real partner datasets.",
    skills: ["SQL", "Data Analytics", "Forecasting", "Business Intelligence"]
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-retail-analytics",
    title: "Earn-while-you-learn: retail analytics",
    description: "Paid project work with partner firms.",
    type: "Project",
    workplace: "Remote",
    compensation: "Compensation not disclosed",
    eligible: true,
    company: "Apex Analytics Partner Group",
    badge: "OP",
    location: "Remote",
    deadline: "Open rolling",
    requirements: [
      "Completed or enrolled in Multivariable Modelling Workshop or Business Analytics",
      "Familiarity with data manipulation and spreadsheet models",
      "Availability for 5-8 hours per week"
    ]
  },
  {
    id: "opp-bakery-operations",
    title: "Bakery operations internship",
    description: "Apply modelling skills to a live production plan.",
    type: "Internship",
    workplace: "Remote",
    compensation: "Compensation not disclosed",
    eligible: true,
    company: "Artisan Foods Global",
    badge: "OP",
    location: "Remote",
    deadline: "Closes in 2 weeks",
    requirements: [
      "Understanding of production scheduling and supply chain math",
      "Ability to present weekly progress summaries",
      "Proficiency with digital whiteboard collaborative tools"
    ]
  },
  {
    id: "opp-ai-solutions",
    title: "Junior AI Solutions Associate",
    description: "Design and prototype AI-driven automation workflows with client teams.",
    type: "Project",
    workplace: "Remote",
    compensation: "$25/hr",
    eligible: true,
    company: "GraphSpace Labs",
    badge: "OP",
    location: "Remote",
    deadline: "Urgent hiring",
    requirements: [
      "Enrolled in AI Agents for Managers",
      "Demonstrated experience with prompt chaining and graph workflows",
      "Strong analytical and communication skills"
    ]
  },
  {
    id: "opp-quant-risk",
    title: "Quantitative Risk Analyst Intern",
    description: "Build multivariable risk models and present weekly briefs.",
    type: "Internship",
    workplace: "Hybrid",
    compensation: "$1,500/month",
    eligible: true,
    company: "Nexus Capital",
    badge: "OP",
    location: "Hybrid (Flexible)",
    deadline: "Next Cohort",
    requirements: [
      "Solid business mathematics and statistics background",
      "Experience analyzing financial and operational risk parameters"
    ]
  }
];

const SOFIA_APPLICATIONS_KEY = "sofia_user_applications";

export function getStoredApplications(): OpportunityApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SOFIA_APPLICATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredApplications(apps: OpportunityApplication[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SOFIA_APPLICATIONS_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error("Failed to persist applications", e);
  }
}
