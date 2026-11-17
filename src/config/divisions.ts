export interface DivisionService {
  id: string;
  name: string;
  description: string;
  status: "active" | "planned" | "scaling";
}

export interface BusinessDivision {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  badgeClass: string;
  iconName: string;
  services: DivisionService[];
  leadRole: string;
  code: string;
}

export const DIVISIONS: BusinessDivision[] = [
  {
    id: "div-tech",
    slug: "technology",
    name: "Technology & Development",
    shortName: "Technology",
    code: "TECH",
    description: "Enterprise web solutions, AI workflows, bespoke software, and process automation.",
    color: "#3b82f6",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    iconName: "Code2",
    leadRole: "Chief Technology Officer",
    services: [
      { id: "tech-web", name: "Web Development", description: "Modern full-stack web applications & portals", status: "active" },
      { id: "tech-ai", name: "AI Automation", description: "Autonomous workflows, agent integration, LLM pipelines", status: "active" },
      { id: "tech-software", name: "Custom Software Development", description: "Tailored enterprise software & API architectures", status: "active" },
      { id: "tech-bpa", name: "Business Process Automation", description: "Streamlining repetitive company operations", status: "active" },
    ],
  },
  {
    id: "div-creative",
    slug: "creative-design",
    name: "Creative & Design",
    shortName: "Creative & Design",
    code: "CRTV",
    description: "High-impact video editing, visual design systems, brand identities, and product UX.",
    color: "#ec4899",
    badgeClass: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    iconName: "Palette",
    leadRole: "Head of Creative",
    services: [
      { id: "crtv-video", name: "Video Editing", description: "Post-production, motion graphics, and color grading", status: "active" },
      { id: "crtv-graphic", name: "Graphic Designing", description: "Marketing collaterals, digital assets, print systems", status: "active" },
      { id: "crtv-uiux", name: "UI/UX Design", description: "User interfaces, wireframes, prototypes, design tokens", status: "active" },
      { id: "crtv-brand", name: "Branding & Visual Identity", description: "Brand books, logos, typography, visual voice", status: "active" },
    ],
  },
  {
    id: "div-marketing",
    slug: "digital-marketing",
    name: "Digital Marketing & Growth",
    shortName: "Digital Marketing",
    code: "MKTG",
    description: "Performance ad campaigns, social organic growth, content strategy, and conversion copywriting.",
    color: "#f59e0b",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    iconName: "TrendingUp",
    leadRole: "Head of Growth",
    services: [
      { id: "mktg-dm", name: "Digital Marketing", description: "Multi-channel inbound and outbound acquisition", status: "active" },
      { id: "mktg-smm", name: "Social Media Management", description: "Channel operations, publishing calendar, engagement", status: "active" },
      { id: "mktg-copy", name: "Copywriting", description: "High-converting sales copy, emails, and landing pages", status: "active" },
      { id: "mktg-content", name: "Content Strategy", description: "Long-term content calendars, SEO, thought leadership", status: "active" },
      { id: "mktg-ads", name: "Social Media Advertising", description: "Paid campaigns across Meta, Google, LinkedIn, TikTok", status: "active" },
    ],
  },
  {
    id: "div-media",
    slug: "media-house",
    name: "Media House",
    shortName: "Media House",
    code: "MDIA",
    description: "Commercial video production, brand films, creative shoots, and digital media production.",
    color: "#8b5cf6",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    iconName: "Film",
    leadRole: "Executive Producer",
    services: [
      { id: "mdia-prod", name: "Video Production", description: "End-to-end studio & on-location video shooting", status: "active" },
      { id: "mdia-promo", name: "Promotional Videos", description: "High-energy commercial advertisements & teasers", status: "active" },
      { id: "mdia-creative", name: "Creative Content Production", description: "Original digital series, podcasts, and shorts", status: "active" },
      { id: "mdia-campaigns", name: "Brand Campaigns", description: "Large-scale multimedia campaigns and narratives", status: "active" },
      { id: "mdia-digital", name: "Digital Media Production", description: "Omnichannel digital media formats and reels", status: "active" },
    ],
  },
  {
    id: "div-esports",
    slug: "gaming-esports",
    name: "Gaming & Esports",
    shortName: "Gaming & Esports",
    code: "GAMS",
    description: "Competitive gaming tournament management, team rosters, and esports community hubs.",
    color: "#10b981",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    iconName: "Trophy",
    leadRole: "Esports Director",
    services: [
      { id: "gams-mgmt", name: "Esports Management", description: "Pro player contracts, tournament logistics, sponsorships", status: "active" },
      { id: "gams-events", name: "Esports Events", description: "Live broadcast tournaments, lan parties, leagues", status: "active" },
      { id: "gams-comm", name: "Gaming Community Management", description: "Discord guilds, community moderation, retention", status: "active" },
      { id: "gams-gaming-events", name: "Gaming Events", description: "Showmatches, streamer invitationals, expos", status: "active" },
    ],
  },
  {
    id: "div-marketplace",
    slug: "gaming-marketplace",
    name: "Gaming Development & Marketplace",
    shortName: "Gaming Marketplace",
    code: "MKT",
    description: "FiveM server scripts, digital script marketplace, game modding, and specialized server solutions.",
    color: "#06b6d4",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    iconName: "Gamepad2",
    leadRole: "Lead FiveM Developer",
    services: [
      { id: "mkt-fivem-dev", name: "FiveM Script Development", description: "Custom Lua/C# frameworks, UI NUI scripts, systems", status: "active" },
      { id: "mkt-store", name: "FiveM Script Store", description: "Direct-to-consumer digital marketplace for scripts & assets", status: "active" },
      { id: "mkt-custom", name: "Custom Gaming Scripts", description: "Bespoke gameplay mechanics, anticheat, job systems", status: "active" },
      { id: "mkt-servers", name: "Gaming Server Solutions", description: "Dedicated server setup, optimization, database bridges", status: "active" },
    ],
  },
  {
    id: "div-freelance",
    slug: "freelancing",
    name: "Freelancing Agency",
    shortName: "Freelancing",
    code: "FREE",
    description: "Outsourced talent pipelines, contract project delivery, remote team coordination, and client acquisition.",
    color: "#6366f1",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    iconName: "Briefcase",
    leadRole: "Agency Operations Lead",
    services: [
      { id: "free-acq", name: "Client Acquisition", description: "Freelance client outreach, proposal drafting, closing", status: "active" },
      { id: "free-pm", name: "Freelance Project Management", description: "Milestone management, client reviews, delivery cycles", status: "active" },
      { id: "free-res", name: "Resource Management", description: "Contractor bench, vetting, hourly capacity tracking", status: "active" },
      { id: "free-out", name: "Outsourcing Services", description: "Flexible staff augmentation for external agencies", status: "active" },
      { id: "free-coord", name: "Freelance Team Coordination", description: "Distributed squad sync, code reviews, QA oversight", status: "active" },
    ],
  },
];

export function getDivisionBySlug(slug: string): BusinessDivision | undefined {
  return DIVISIONS.find((d) => d.slug === slug);
}

export function getDivisionById(id: string): BusinessDivision | undefined {
  return DIVISIONS.find((d) => d.id === id);
}

