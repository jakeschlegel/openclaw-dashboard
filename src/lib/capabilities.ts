export type Difficulty = "starter" | "moderate" | "advanced";

export interface Capability {
  id: string;
  name: string;
  emoji: string;
  difficulty: Difficulty;
  description: string;
  whatHappens: string;
  userEffort: "None" | "Minimal" | "Some setup" | "Moderate" | "Significant";
  userEffortDetail: string;
  securityRisks: string[];
  riskLevel: "Low" | "Medium" | "High";
  suggestedRole: string;
  examplePrompt: string;
  requirements: string[];
  xpReward: number;
}

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; stars: number; icon: string }> = {
  starter: { label: "EASY", color: "#39FF14", stars: 1, icon: "🟢" },
  moderate: { label: "MEDIUM", color: "#FFD700", stars: 2, icon: "🟡" },
  advanced: { label: "HARD", color: "#FF0040", stars: 3, icon: "🔴" },
};

export const CAPABILITIES: Capability[] = [
  // ═══════════════════════════════════════
  // STARTER — Easy, low risk, minimal setup
  // ═══════════════════════════════════════
  {
    id: "web-research",
    name: "Web Research",
    emoji: "🔍",
    difficulty: "starter",
    description: "Agent searches the web and summarizes findings on any topic you ask about.",
    whatHappens: "The agent uses Brave Search API to query the web, fetches relevant pages, and writes a structured summary with sources. All processing happens in your OpenClaw session.",
    userEffort: "None",
    userEffortDetail: "Just ask a question. No setup required — web search is built into OpenClaw.",
    securityRisks: [
      "Search queries are sent to Brave Search API (third-party)",
      "Fetched web pages may contain tracking pixels",
    ],
    riskLevel: "Low",
    suggestedRole: "research",
    examplePrompt: "Research the pros and cons of using Convex vs Supabase for a real-time app. Give me a comparison table.",
    requirements: [],
    xpReward: 50,
  },
  {
    id: "file-organizer",
    name: "File Organizer",
    emoji: "📁",
    difficulty: "starter",
    description: "Agent scans a folder, suggests an organization structure, and moves files into categorized subfolders.",
    whatHappens: "The agent reads your directory listing (file names and sizes — not file contents), proposes a folder structure, asks for your approval, then moves files using `mv` commands.",
    userEffort: "Minimal",
    userEffortDetail: "Point the agent at a folder path. Review and approve the proposed structure before it moves anything.",
    securityRisks: [
      "Agent reads file/folder names in the specified directory",
      "Files are moved (not copied) — recoverable via `trash` if configured",
    ],
    riskLevel: "Low",
    suggestedRole: "coding",
    examplePrompt: "Organize my ~/Downloads folder. Group files by type (documents, images, code, etc). Ask me before moving anything.",
    requirements: ["A messy folder to organize"],
    xpReward: 75,
  },
  {
    id: "daily-briefing",
    name: "Daily Briefing",
    emoji: "📰",
    difficulty: "starter",
    description: "Agent delivers a morning briefing with weather, calendar events, and top news in your interests.",
    whatHappens: "The agent checks weather APIs and searches for news on topics you specify. Delivered as a formatted message to your chat channel. Can be scheduled as a daily cron job.",
    userEffort: "Minimal",
    userEffortDetail: "Tell the agent your location and interests. Optionally set up a cron job for automatic daily delivery.",
    securityRisks: [
      "Your location is sent to weather API",
      "Your interest topics are sent to search API",
    ],
    riskLevel: "Low",
    suggestedRole: "chief-of-staff",
    examplePrompt: "Give me a morning briefing every day at 8am. Include weather for Indianapolis, top AI news, and any interesting tech launches.",
    requirements: [],
    xpReward: 75,
  },
  {
    id: "code-review",
    name: "Code Reviewer",
    emoji: "🔎",
    difficulty: "starter",
    description: "Agent reviews a code file or PR and provides feedback on bugs, style, and improvements.",
    whatHappens: "The agent reads the specified file(s) from your workspace, analyzes the code, and provides a structured review with severity levels. Read-only — no changes made unless you ask.",
    userEffort: "None",
    userEffortDetail: "Paste code or point to a file path. The agent reads and reviews it.",
    securityRisks: [
      "Agent reads source code files in your workspace",
      "Code content is sent to the AI model for analysis",
    ],
    riskLevel: "Low",
    suggestedRole: "coding",
    examplePrompt: "Review src/app/api/deploy/route.ts — look for bugs, security issues, and suggest improvements.",
    requirements: ["Code files in the workspace"],
    xpReward: 50,
  },

  // ═══════════════════════════════════════
  // MODERATE — Some setup, medium risk
  // ═══════════════════════════════════════
  {
    id: "github-pr-manager",
    name: "GitHub PR Manager",
    emoji: "🐙",
    difficulty: "moderate",
    description: "Agent monitors your GitHub repos, summarizes open PRs, and can create issues or comment on PRs.",
    whatHappens: "Uses the `gh` CLI to list PRs, read diffs, post comments, and create issues. The agent acts as your GitHub account via the authenticated CLI.",
    userEffort: "Some setup",
    userEffortDetail: "Requires `gh` CLI installed and authenticated (`gh auth login`). The agent uses your GitHub identity for all actions.",
    securityRisks: [
      "Agent acts as YOUR GitHub account — comments, issues, and reviews appear as you",
      "Can read private repo code and metadata",
      "PR comments and issues are public actions",
    ],
    riskLevel: "Medium",
    suggestedRole: "coding",
    examplePrompt: "Check my open PRs on jakeschlegel/openclaw-dashboard. Summarize what each one does and flag any that have merge conflicts.",
    requirements: ["`gh` CLI installed and authenticated"],
    xpReward: 150,
  },
  {
    id: "cron-automation",
    name: "Scheduled Automations",
    emoji: "⏰",
    difficulty: "moderate",
    description: "Agent creates cron jobs that run automatically — periodic checks, reminders, or recurring tasks.",
    whatHappens: "Creates OpenClaw cron jobs that fire at specified intervals. Each run spawns an isolated agent session that executes the task and reports results to your chat.",
    userEffort: "Some setup",
    userEffortDetail: "Describe what you want automated and when. The agent creates the cron job. You may need to refine the schedule or task description.",
    securityRisks: [
      "Cron jobs run automatically without your approval each time",
      "Each run consumes API credits (model tokens)",
      "Isolated sessions can use any tools the agent has access to",
    ],
    riskLevel: "Medium",
    suggestedRole: "chief-of-staff",
    examplePrompt: "Set up a cron job that checks my GitHub notifications every 2 hours and pings me on Telegram if anything urgent comes in.",
    requirements: [],
    xpReward: 200,
  },
  {
    id: "blog-writer",
    name: "Blog Post Writer",
    emoji: "✍️",
    difficulty: "moderate",
    description: "Agent researches a topic, writes a full blog post draft, and can publish to your CMS via API.",
    whatHappens: "The agent searches the web for research, outlines the post, writes a full draft with headings/images, and optionally pushes to a CMS (Webflow, Ghost, etc) via API.",
    userEffort: "Moderate",
    userEffortDetail: "Provide the topic, tone, and target audience. If publishing to a CMS, you'll need to provide API credentials. Review the draft before publishing.",
    securityRisks: [
      "If CMS credentials are provided, agent can publish content publicly",
      "Research queries reveal your content interests to search APIs",
      "Published content represents your brand — always review first",
    ],
    riskLevel: "Medium",
    suggestedRole: "content",
    examplePrompt: "Write a 1500-word blog post about 'Why Every Company Needs AI Security Training in 2026'. Professional tone, include stats. Save as draft — don't publish yet.",
    requirements: ["CMS API key (optional, for publishing)"],
    xpReward: 200,
  },
  {
    id: "project-scaffolder",
    name: "Project Scaffolder",
    emoji: "🏗️",
    difficulty: "moderate",
    description: "Agent creates a full project structure — files, configs, boilerplate — for any framework you specify.",
    whatHappens: "The agent creates directories, writes config files (package.json, tsconfig, etc), sets up boilerplate components, and initializes git. All files are created in your workspace.",
    userEffort: "Some setup",
    userEffortDetail: "Describe the project (framework, features, structure). Review the generated files. Run `npm install` or equivalent after scaffolding.",
    securityRisks: [
      "Creates files and directories in your workspace",
      "May overwrite existing files if names collide",
      "Generated configs may include default settings you'll want to customize",
    ],
    riskLevel: "Medium",
    suggestedRole: "coding",
    examplePrompt: "Scaffold a Next.js 15 project with TypeScript, Tailwind, and Convex. Include auth with Clerk, a landing page, and a dashboard layout.",
    requirements: ["Node.js installed"],
    xpReward: 175,
  },

  // ═══════════════════════════════════════
  // ADVANCED — Significant setup, higher risk
  // ═══════════════════════════════════════
  {
    id: "multi-agent-delegation",
    name: "Multi-Agent Delegation",
    emoji: "👥",
    difficulty: "advanced",
    description: "A chief-of-staff agent breaks down complex tasks and delegates subtasks to specialized agents.",
    whatHappens: "The lead agent analyzes your request, creates a plan, then spawns sub-agent sessions for each subtask. Each agent works in parallel with its own tools and context. Results are collected and synthesized.",
    userEffort: "Moderate",
    userEffortDetail: "Describe the high-level goal. You'll need multiple agents configured with different roles. The lead agent handles coordination.",
    securityRisks: [
      "Multiple agents run simultaneously — harder to monitor each one",
      "Each sub-agent has full tool access for its role",
      "Higher API credit usage (multiple model calls in parallel)",
      "Complex task chains may produce unexpected interactions",
    ],
    riskLevel: "High",
    suggestedRole: "chief-of-staff",
    examplePrompt: "I need to launch a new product page. Have the research agent analyze competitor landing pages, the content agent write copy, and the coding agent build the page. Coordinate everything.",
    requirements: ["Multiple agents configured", "Clear role assignments"],
    xpReward: 500,
  },
  {
    id: "security-audit",
    name: "Security Hardening",
    emoji: "🛡️",
    difficulty: "advanced",
    description: "Agent audits your machine's security posture — firewall, SSH, updates, exposed ports — and fixes issues.",
    whatHappens: "Runs system commands to check firewall status, open ports, SSH config, software updates, and file permissions. Generates a report with findings and can apply fixes with your approval.",
    userEffort: "Significant",
    userEffortDetail: "Agent needs elevated permissions for some checks. Review each recommended fix carefully before approving. Some changes (firewall rules, SSH config) can lock you out if misconfigured.",
    securityRisks: [
      "Agent runs system-level diagnostic commands",
      "Fixing issues may require sudo/elevated permissions",
      "Incorrect firewall rules could block your own access",
      "SSH config changes could lock you out of remote machines",
    ],
    riskLevel: "High",
    suggestedRole: "security",
    examplePrompt: "Run a security audit on this machine. Check firewall, open ports, SSH config, and pending updates. Show me the findings before making any changes.",
    requirements: ["Elevated permissions may be needed", "Backup your SSH config first"],
    xpReward: 400,
  },
  {
    id: "full-stack-app",
    name: "Full-Stack App Builder",
    emoji: "🚀",
    difficulty: "advanced",
    description: "Agent builds a complete web application from a description — frontend, backend, database, and deployment.",
    whatHappens: "The agent scaffolds the full project, writes application code (components, API routes, database schema), sets up deployment configs, and can push to GitHub and deploy to Railway/Vercel.",
    userEffort: "Significant",
    userEffortDetail: "Provide a detailed description of what you want built. Review generated code. Run installs and test locally. Set up deployment credentials if auto-deploying.",
    securityRisks: [
      "Creates many files across your workspace",
      "May install npm packages (supply chain risk)",
      "If deploying, exposes the app publicly",
      "Generated code may have security vulnerabilities — always review",
      "Database credentials may be stored in env files",
    ],
    riskLevel: "High",
    suggestedRole: "coding",
    examplePrompt: "Build me a habit tracker app with Next.js, Convex for the database, and Clerk for auth. Include: daily check-ins, streak tracking, and a dashboard with charts. Deploy to Railway.",
    requirements: ["Node.js", "GitHub account", "Deployment platform account"],
    xpReward: 750,
  },
  {
    id: "email-assistant",
    name: "Email & Comms Assistant",
    emoji: "📧",
    difficulty: "advanced",
    description: "Agent monitors your inbox, drafts replies, and can send emails on your behalf with approval.",
    whatHappens: "Connects to your email via API or IMAP. Reads incoming messages, categorizes by priority, drafts context-aware replies, and sends approved responses. Can also manage calendar invites.",
    userEffort: "Significant",
    userEffortDetail: "Requires email API credentials or app password. Configure which emails the agent should handle vs. ignore. Always review drafts before sending.",
    securityRisks: [
      "Agent reads ALL emails in connected inbox",
      "Email credentials stored on your machine",
      "Sent emails come FROM you — recipients can't tell it's an AI",
      "Sensitive/confidential email content is processed by the AI model",
      "Misconfigured auto-send could send unreviewed messages",
    ],
    riskLevel: "High",
    suggestedRole: "chief-of-staff",
    examplePrompt: "Monitor my inbox for emails from clients. Draft polite, professional replies. Never auto-send — always show me the draft first and wait for my approval.",
    requirements: ["Email API credentials or app password", "Clear rules for which emails to handle"],
    xpReward: 500,
  },
];

export function getCapabilitiesByDifficulty(difficulty: Difficulty): Capability[] {
  return CAPABILITIES.filter((c) => c.difficulty === difficulty);
}
