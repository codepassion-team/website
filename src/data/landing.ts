/** Business content for the landing page. Keep destination URLs and claims here. */
export const company = {
  name: "CodePassion",
  legalName: "Code Passion Co., Ltd.",
  description:
    "We design and develop business software, from system architecture to integration with the tools you already use.",
  phone: "+66 88 638 4566",
  phoneUrl: "tel:+66886384566",
  academyUrl: "https://academy.codepassion.co/",
  contactUrl: "https://line.me/ti/p/@codepassion",
};

export const chapters = [
  {
    key: "stack",
    layer: "FULL STACK",
    eyebrow: "SOFTWARE DEVELOPMENT & ARCHITECTURE",
    lines: ["Software built", "around your", "business."],
    mobileLines: ["Software built", "around your work."],
    description:
      "We design and build software around your workflows, connecting your tools, data and AI.",
    action: "Talk about your project",
    href: "#contact",
    details: [
      "AI Agent",
      "Application",
      "Workflow Automation",
      "Data transformation",
      "Infrastructure",
    ],
  },
  {
    key: "agent",
    layer: "AI AGENT",
    eyebrow: "01 / THE AI AGENT LAYER",
    lines: ["AI agents.", "Connected to work."],
    mobileLines: ["AI agents for", "your workflows."],
    description:
      "Connect AI agents to your business tools and data, with defined tasks, permissions and human review where needed.",
    action: "Discuss your use case",
    href: "#contact",
    details: ["Business tools", "Task execution", "Human review"],
  },
  {
    key: "application",
    layer: "APPLICATION",
    eyebrow: "02 / THE APPLICATION LAYER",
    lines: ["Built around", "your work."],
    mobileLines: ["Built around", "your work."],
    description:
      "Web applications and business tools designed around the tasks your team and customers need to complete.",
    action: "Explore our expertise",
    href: "#expertise",
    details: ["Web applications", "Business tools", "User experience"],
  },
  {
    key: "automation",
    layer: "WORKFLOW AUTOMATION",
    eyebrow: "03 / THE WORKFLOW AUTOMATION LAYER",
    lines: ["Connect steps.", "Cut repeat work."],
    mobileLines: ["Connect steps.", "Cut repeat work."],
    description:
      "Connect actions across your existing tools through APIs and workflows, from receiving a request to updating the next system.",
    action: "Explore our expertise",
    href: "#expertise",
    details: ["APIs", "Workflows", "System integration"],
  },
  {
    key: "data",
    layer: "DATA TRANSFORMATION",
    eyebrow: "04 / THE DATA LAYER",
    lines: ["Different sources.", "Usable data."],
    mobileLines: ["Different sources.", "Usable data."],
    description:
      "Map fields, validate inputs and transform data into formats your connected systems can use.",
    action: "Explore our expertise",
    href: "#expertise",
    details: ["Field mapping", "Validation", "Data exchange"],
  },
  {
    key: "infrastructure",
    layer: "INFRASTRUCTURE",
    eyebrow: "05 / THE FOUNDATION",
    lines: ["A foundation", "you can build on."],
    mobileLines: ["A foundation", "you can build on."],
    description:
      "Plan cloud infrastructure, deployment and monitoring around how your software needs to run and be maintained.",
    action: "Talk about your system",
    href: "#contact",
    details: ["Cloud", "Deployment", "Monitoring"],
  },
];

export const services = [
  {
    number: "01",
    title: "Plan your system architecture.",
    category: "Solution architecture",
    description:
      "We help you make architecture decisions early and turn business requirements into a technical plan.",
    details: [
      "System design",
      "Architecture roadmaps",
      "Cloud & infrastructure",
    ],
    symbol: "architecture",
  },
  {
    number: "02",
    title: "Develop your software.",
    category: "Software development",
    description:
      "We develop web applications and enterprise platforms around the people who use them.",
    details: [
      "Web applications",
      "Enterprise platforms",
      "UX & interface design",
    ],
    symbol: "development",
  },
  {
    number: "03",
    title: "Integrate your systems.",
    category: "Systems integration",
    description:
      "We connect applications, data, and workflows through APIs and automation.",
    details: [
      "APIs & integrations",
      "LINE business solutions",
      "Data & automation",
    ],
    symbol: "integration",
  },
];

export const products = [
  {
    id: "sekweb",
    name: "Sekweb",
    category: "AI website builder",
    description: "An AI website builder for creating your business website.",
    href: "https://sekweb.site",
    action: "Explore Sekweb",
    glyph: "S",
  },
  {
    id: "memberconnex",
    name: "MemberConnex",
    category: "Membership management",
    description: "Manage your membership program through LINE OA.",
    href: "#contact",
    action: "Ask about MemberConnex",
    glyph: "M",
  },
  {
    id: "workery",
    name: "Workery",
    category: "A CodePassion product",
    description:
      "Contact our team for product details and to discuss whether Workery suits your business.",
    href: "#contact",
    action: "Ask about Workery",
    glyph: "W",
  },
  {
    id: "workengine",
    name: "WorkEngine 0.3",
    category: "Software Architecture Framework",
    description:
      "A software architecture framework for designing and building business applications.",
    href: "#contact",
    action: "Explore WorkEngine",
    glyph: "WE",
  },
];

export const projects = [
  {
    name: "Kantana Holdings",
    domain: "kantanaholdings.com",
    category: "Corporate",
    number: "01",
  },
  {
    name: "DDG Jewelry",
    domain: "ddgjewelry.com",
    category: "Jewelry",
    number: "02",
  },
  {
    name: "Natural Home",
    domain: "naturalhome.co.th",
    category: "Property",
    number: "03",
  },
  {
    name: "Smart SME Expo",
    domain: "smartsmeexpo.com",
    category: "Exhibition",
    number: "04",
  },
  {
    name: "Teeraporn",
    domain: "teerapornclinic.com",
    category: "Clinic",
    number: "05",
  },
  {
    name: "Franchise Expo Thailand",
    domain: "franchiseexpothailand.com",
    category: "Exhibition",
    number: "06",
  },
];

// Embedded pages unavailable in browser validation; keep a direct-first option.
export const unavailablePreviews = ["smartsmeexpo.com", "teerapornclinic.com"];

export const courses = [
  {
    name: "AI Fluency for Executives & SME",
    audience: "For business leaders",
    summary:
      "Put AI to work in your business. Explore practical workflows and build an agent you can use beyond the classroom.",
    slug: "ai-fluency-for-executives",
    number: "01",
  },
  {
    name: "AI Coding with Claude",
    audience: "For developers",
    summary:
      "Work with Claude Code across the software lifecycle, from planning and project context to testing and delivery.",
    slug: "ai-coding-with-claude",
    number: "02",
  },
  {
    name: "AI Coding Agent with Codex",
    audience: "For developers",
    summary:
      "Build an engineering workflow with Codex, including project instructions, sandbox boundaries, and approval policies.",
    slug: "ai-coding-agent-codex",
    number: "03",
  },
  {
    name: "AI Coding Agent",
    audience: "For developers & tech leads",
    summary:
      "Learn the principles behind effective coding agents and choose a workflow that fits your team and tools.",
    slug: "ai-coding-agent",
    number: "04",
  },
];

export const certificates = [
  {
    name: "ISO/IEC 29110",
    image: "/certifications/iso-29110.png",
    detail: "Software engineering process",
  },
  {
    name: "WCAG 2.2",
    image: "/certifications/wcag.png",
    detail: "Web accessibility standards",
  },
];

export const customerLogos = [
  { file: "ktn.png", name: "Kantana" },
  { file: "ddg.png", name: "DDG Jewelry" },
  { file: "tlt.png", name: "Toyota Leasing Thailand" },
  { file: "amt.png", name: "Amity" },
  { file: "pmg.png", name: "PMG Corporation" },
  { file: "rid.png", name: "Royal Irrigation Department" },
  { file: "989.png", name: "989 HR Solution" },
  { file: "aes.png", name: "AESTEC" },
  { file: "fias.png", name: "Fynncorp" },
  { file: "hap.png", name: "happycard.io" },
  { file: "lns.png", name: "Law Nextstep" },
  { file: "per.png", name: "Permit+" },
  { file: "qas.png", name: "Qashup" },
  { file: "muz.png", name: "MUZ" },
  { file: "sml.png", name: "Smiley Assistance" },
  { file: "kcp.png", name: "KCP" },
  { file: "apo.png", name: "APO" },
  { file: "nnm.png", name: "NNM" },
  { file: "trp.png", name: "Teeraporn" },
  { file: "sss.png", name: "ThaiHealth" },
  { file: "ipac.png", name: "IPAC" },
  { file: "am.png", name: "aommoney" },
  { file: "koph.png", name: "Koph" },
  { file: "top.png", name: "Totop" },
  { file: "mom.png", name: "Mummily" },
  { file: "dtl.png", name: "Dental Land" },
  { file: "bbq.png", name: "BAR-BQ Resort" },
  { file: "local.png", name: "The Local" },
  { file: "uoe.png", name: "UOE4289" },
  { file: "ppg.png", name: "Plodpai Guard" },
  { file: "pir.png", name: "Pi-R-Square" },
  { file: "tpa.png", name: "Thai Programmer Association" },
  { file: "dte.png", name: "Digital Tech Entrepreneur Association" },
  { file: "des.png", name: "Design Alternative" },
  { file: "avos.png", name: "AIVOS" },
];

export const channels = [
  {
    name: "YouTube",
    label: "@code-passion",
    href: "https://www.youtube.com/@code-passion",
  },
  { name: "LINE OA", label: "@codepassion", href: company.contactUrl },
  {
    name: "Facebook",
    label: "CodePassion",
    href: "https://www.facebook.com/codepassion.co",
  },
  {
    name: "TikTok",
    label: "@codepassion",
    href: "https://www.tiktok.com/@codepassion",
  },
];

/** Names carried over from the technology section at https://codepassion.co/. */
export const technologyLayers = [
  {
    number: "01",
    name: "Infrastructure",
    description: "Cloud, deployment & hosting",
    items: [
      "AWS",
      "Google Cloud",
      "DigitalOcean",
      "Coolify",
      "Supabase",
      "Cloudflare",
    ],
  },
  {
    number: "02",
    name: "Presentation",
    description: "Frontend frameworks & API gateway",
    items: ["NestJS", "Next.js", "Supabase", "n8n"],
  },
  {
    number: "03",
    name: "Application",
    description: "Runtime & application logic",
    items: ["Nginx", "Flutter", "WordPress", "Astro"],
  },
  {
    number: "04",
    name: "Domain",
    description: "Data persistence & query layer",
    items: ["TypeORM", "Drizzle ORM"],
  },
];

/** Original logo URLs from the current company website. */
export const technologyLogos: Record<string, string> = {
  AWS: "https://img.icons8.com/color/96/amazon-web-services.png",
  "Google Cloud": "https://cdn.simpleicons.org/googlecloud/4285F4",
  DigitalOcean: "https://cdn.simpleicons.org/digitalocean/0080FF",
  Coolify: "https://cdn.simpleicons.org/coolify/6D28D9",
  Supabase: "https://cdn.simpleicons.org/supabase/3FCF8E",
  Cloudflare: "https://cdn.simpleicons.org/cloudflare/F38020",
  NestJS: "https://cdn.simpleicons.org/nestjs/E0234E",
  "Next.js": "https://cdn.simpleicons.org/nextdotjs/171717",
  n8n: "https://cdn.simpleicons.org/n8n/FF6D5A",
  Nginx: "https://cdn.simpleicons.org/nginx/009639",
  Flutter: "https://cdn.simpleicons.org/flutter/02569B",
  WordPress: "https://cdn.simpleicons.org/wordpress/21759B",
  Astro: "https://cdn.simpleicons.org/astro/FF5D01",
  TypeORM: "https://cdn.simpleicons.org/typeorm/3FCF8E",
  "Drizzle ORM": "https://cdn.simpleicons.org/drizzle/C5F74F",
};
