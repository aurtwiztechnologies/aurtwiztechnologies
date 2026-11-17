export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "success";
  description?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        description: "Unified company overview and live metrics",
      },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      {
        title: "Leads",
        href: "/leads",
        icon: "UserPlus",
        description: "Prospects and inbound inquiries across divisions",
      },
      {
        title: "Clients",
        href: "/clients",
        icon: "Building2",
        description: "Corporate accounts, clients, and partners",
      },
      {
        title: "Sales Pipeline",
        href: "/pipeline",
        icon: "GitBranch",
        description: "Deal stages, forecasting, and conversion rates",
      },
      {
        title: "Services",
        href: "/services",
        icon: "Layers",
        description: "Company catalog across all 7 business divisions",
      },
      {
        title: "Projects",
        href: "/projects",
        icon: "FolderKanban",
        description: "Active delivery milestones and project status",
      },
      {
        title: "Tasks",
        href: "/tasks",
        icon: "CheckSquare",
        description: "Division task queues, assignments, and deadlines",
      },
    ],
  },
  {
    title: "DIVISIONS",
    items: [
      {
        title: "Technology",
        href: "/divisions/technology",
        icon: "Code2",
        badge: "4 Services",
        description: "Web development, AI automation, custom software",
      },
      {
        title: "Creative & Design",
        href: "/divisions/creative-design",
        icon: "Palette",
        badge: "4 Services",
        description: "Video editing, UI/UX, visual identity, branding",
      },
      {
        title: "Digital Marketing",
        href: "/divisions/digital-marketing",
        icon: "TrendingUp",
        badge: "5 Services",
        description: "Growth, social media, copywriting, advertising",
      },
      {
        title: "Media House",
        href: "/divisions/media-house",
        icon: "Film",
        badge: "5 Services",
        description: "Video production, brand campaigns, digital media",
      },
      {
        title: "Gaming & Esports",
        href: "/divisions/gaming-esports",
        icon: "Trophy",
        badge: "4 Services",
        description: "Esports management, tournaments, community",
      },
      {
        title: "Gaming Marketplace",
        href: "/divisions/gaming-marketplace",
        icon: "Gamepad2",
        badge: "4 Services",
        description: "FiveM scripts, digital store, server solutions",
      },
      {
        title: "Freelancing",
        href: "/divisions/freelancing",
        icon: "Briefcase",
        badge: "5 Services",
        description: "Client acquisition, project coordination, staffing",
      },
    ],
  },
  {
    title: "FINANCE",
    items: [
      {
        title: "Payments",
        href: "/finance/payments",
        icon: "CreditCard",
        description: "Inbound revenue, gateway logs, payment receipts",
      },
      {
        title: "Invoices",
        href: "/finance/invoices",
        icon: "FileText",
        description: "Client invoices, recurring billing, and quotes",
      },
      {
        title: "Expenses",
        href: "/finance/expenses",
        icon: "Receipt",
        description: "Operational expenditure and division budgets",
      },
    ],
  },
  {
    title: "TEAM",
    items: [
      {
        title: "Team Members",
        href: "/team",
        icon: "Users",
        description: "Internal staff directory, division heads, roles",
      },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: "BarChart3",
        description: "Division performance, revenue breakdown, velocity",
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        title: "Notifications",
        href: "/notifications",
        icon: "Bell",
        badge: "3",
        badgeVariant: "default",
        description: "System alerts, project mentions, and audit updates",
      },
      {
        title: "Settings",
        href: "/settings",
        icon: "Settings",
        description: "Platform preferences, security, API keys, and logs",
      },
    ],
  },
];

