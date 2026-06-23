export interface ApiConfigItem {
  _id: string;
  endpoint: string;
  method: string;
  enabled: boolean;
  rateLimit: number;
  timeout: number;
  category: string;
  description?: string;
  totalRequests?: number;
  errorRequests?: number;
  errorRate?: number;
  avgResponseTime?: number;
  uptime?: number;
}

export interface ApiKeyItem {
  _id: string;
  key: string;
  name: string;
  permissions: string[];
  active: boolean;
  createdAt: number;
  lastUsed?: number;
  usageCount: number;
}

export interface ApiLogItem {
  _id: string;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  payloadSize: number;
  timestamp: number;
  error?: string;
  userId?: string;
}

export interface HealthItem extends ApiConfigItem {
  totalRequests: number;
  errorRequests: number;
  errorRate: number;
  avgResponseTime: number;
  uptime: number;
}

export interface StatsData {
  totalRequests: number;
  todayRequests: number;
  weekRequests: number;
  totalErrors: number;
  todayErrors: number;
  errorRate: number;
  avgResponseTime: number;
  topEndpoints: { endpoint: string; count: number }[];
  dailyCounts: Record<string, number>;
  activeKeys: number;
  totalKeys: number;
}

export interface DeploymentData {
  totalEndpoints: number;
  enabledEndpoints: number;
  disabledEndpoints: number;
  categories: string[];
  totalKeys: number;
  activeKeys: number;
  totalLogs: number;
  lastActivity: number | null;
}

export type Tab =
  | "health"
  | "config"
  | "logs"
  | "keys"
  | "analytics"
  | "deployment";

export const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-500/20 text-green-400",
  POST: "bg-blue-500/20 text-blue-400",
  PUT: "bg-yellow-500/20 text-yellow-400",
  DELETE: "bg-red-500/20 text-red-400",
};

export const STATUS_COLORS: Record<number, string> = {
  200: "text-green-400",
  201: "text-green-400",
  400: "text-yellow-400",
  401: "text-red-400",
  403: "text-red-400",
  404: "text-orange-400",
  500: "text-red-500",
};

export const CATEGORIES = [
  "all",
  "core",
  "finance",
  "wellbeing",
  "productivity",
  "learning",
  "admin",
  "content",
];
