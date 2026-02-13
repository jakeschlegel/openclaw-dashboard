export interface Agent {
  id: string;
  name: string;
  emoji?: string;
  role?: string;
  model?: string;
  status: "online" | "offline";
  workspace?: string;
  lastActivity?: string;
  channels?: string[];
  cronJobCount?: number;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  scheduleHuman?: string;
  agentId: string;
  agentName?: string;
  enabled: boolean;
  lastRun?: string;
  lastResult?: "success" | "failure" | "running" | null;
  nextRun?: string;
  model?: string;
  prompt?: string;
  channel?: string;
}

export interface CronRun {
  id: string;
  jobId: string;
  status: "success" | "failure" | "running";
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  output?: string;
  error?: string;
}

export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalCronJobs: number;
  activeCronJobs: number;
  runsToday: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
