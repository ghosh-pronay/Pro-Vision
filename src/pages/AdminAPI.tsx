import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLang } from "@/i18n/LanguageContext";
import { t } from "@/i18n/translations";
import {
  Activity,
  Settings,
  FileText,
  Key,
  BarChart3,
  Server,
  RefreshCw,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Shield,
  Download,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toastSuccess, toastError } from "@/lib/toast-helpers";

type Tab = "health" | "config" | "logs" | "keys" | "analytics" | "deployment";

interface ApiConfigItem {
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

interface ApiKeyItem {
  _id: string;
  key: string;
  name: string;
  permissions: string[];
  active: boolean;
  createdAt: number;
  lastUsed?: number;
  usageCount: number;
}

interface ApiLogItem {
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

interface HealthItem extends ApiConfigItem {
  totalRequests: number;
  errorRequests: number;
  errorRate: number;
  avgResponseTime: number;
  uptime: number;
}

interface StatsData {
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

interface DeploymentData {
  totalEndpoints: number;
  enabledEndpoints: number;
  disabledEndpoints: number;
  categories: string[];
  totalKeys: number;
  activeKeys: number;
  totalLogs: number;
  lastActivity: number | null;
}

const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "health", label: "api.tab.health", icon: Activity },
  { id: "config", label: "api.tab.config", icon: Settings },
  { id: "logs", label: "api.tab.logs", icon: FileText },
  { id: "keys", label: "api.tab.keys", icon: Key },
  { id: "analytics", label: "api.tab.analytics", icon: BarChart3 },
  { id: "deployment", label: "api.tab.deployment", icon: Server },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-500/20 text-green-400",
  POST: "bg-blue-500/20 text-blue-400",
  PUT: "bg-yellow-500/20 text-yellow-400",
  DELETE: "bg-red-500/20 text-red-400",
};

const STATUS_COLORS: Record<number, string> = {
  200: "text-green-400",
  201: "text-green-400",
  400: "text-yellow-400",
  401: "text-red-400",
  403: "text-red-400",
  404: "text-orange-400",
  500: "text-red-500",
};

const CATEGORIES = [
  "all",
  "core",
  "finance",
  "wellbeing",
  "productivity",
  "learning",
  "admin",
  "content",
];

export default function AdminAPI() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>("health");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([
    "read",
  ]);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [logEndpointFilter, setLogEndpointFilter] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState<number | "">("");
  const [confirmDeleteKeyId, setConfirmDeleteKeyId] = useState<string | null>(
    null,
  );

  const configs = useQuery(api.apiManagement.getConfig);
  const health = useQuery(api.apiManagement.getHealth);
  const keys = useQuery(api.apiManagement.listKeys);
  const logs = useQuery(api.apiManagement.getLogs, {
    endpoint: logEndpointFilter || undefined,
    status: logStatusFilter !== "" ? logStatusFilter : undefined,
    limit: 200,
  });
  const stats = useQuery(api.apiManagement.getStats) as StatsData | null;
  const deployment = useQuery(
    api.apiManagement.getDeploymentInfo,
  ) as DeploymentData | null;

  const updateConfig = useMutation(api.apiManagement.updateConfig);
  const createKey = useMutation(api.apiManagement.createKey);
  const revokeKey = useMutation(api.apiManagement.revokeKey);
  const deleteKey = useMutation(api.apiManagement.deleteKey);
  const clearLogs = useMutation(api.apiManagement.clearLogs);

  const filteredConfigs = useMemo(() => {
    if (!configs) return [];
    let result = configs as ApiConfigItem[];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.endpoint.toLowerCase().includes(q) ||
          c.method.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((c) => c.category === categoryFilter);
    }
    return result;
  }, [configs, searchQuery, categoryFilter]);

  const t_ = (key: string) => t(lang, key as any);

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return t_("api.time.ago");
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const handleToggleEndpoint = async (
    endpoint: string,
    method: string,
    currentEnabled: boolean,
  ) => {
    try {
      await updateConfig({ endpoint, method, enabled: !currentEnabled });
      toastSuccess(
        lang === "bn" ? "আপডেট সফল হয়েছে" : "Configuration updated",
      );
    } catch {
      toastError(lang === "bn" ? "আপডেট ব্যর্থ" : "Failed to update");
    }
  };

  const handleUpdateRateLimit = async (
    endpoint: string,
    method: string,
    rateLimit: number,
  ) => {
    try {
      await updateConfig({ endpoint, method, rateLimit });
    } catch {
      toastError(
        lang === "bn" ? "আপডেট ব্যর্থ" : "Failed to update rate limit",
      );
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      await createKey({ name: newKeyName, permissions: newKeyPermissions });
      setNewKeyName("");
      setNewKeyPermissions(["read"]);
      setShowKeyForm(false);
      toastSuccess(lang === "bn" ? "API কী তৈরি হয়েছে" : "API key created");
    } catch {
      toastError(lang === "bn" ? "কী তৈরি ব্যর্থ" : "Failed to create key");
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await revokeKey({ id: id as any });
      toastSuccess(lang === "bn" ? "কী নিষ্ক্রিয় হয়েছে" : "Key revoked");
    } catch {
      toastError(
        lang === "bn" ? "নিষ্ক্রিয়করণ ব্যর্থ" : "Failed to revoke key",
      );
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteKey({ id: id as any });
      setConfirmDeleteKeyId(null);
      toastSuccess(lang === "bn" ? "কী মুছে ফেলা হয়েছে" : "Key deleted");
    } catch {
      toastError(lang === "bn" ? "মুছে ফেলা ব্যর্থ" : "Failed to delete key");
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearLogs();
      toastSuccess(lang === "bn" ? "লগ মুছে ফেলা হয়েছে" : "Logs cleared");
    } catch {
      toastError(
        lang === "bn" ? "লগ মুছে ফেলা ব্যর্থ" : "Failed to clear logs",
      );
    }
  };

  const toggleKeyReveal = (keyId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) next.delete(keyId);
      else next.add(keyId);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toastSuccess(lang === "bn" ? "কপি হয়েছে" : "Copied to clipboard");
  };

  const renderHealthTab = () => {
    const healthData = health as HealthItem[] | undefined;
    if (!healthData) {
      return (
        <div className="text-center py-8 text-white/50">
          {t_(lang === "bn" ? "api.loading" : "api.loading")}
        </div>
      );
    }

    const totalRequests = healthData.reduce((s, h) => s + h.totalRequests, 0);
    const avgUptime =
      healthData.length > 0
        ? healthData.reduce((s, h) => s + h.uptime, 0) / healthData.length
        : 100;
    const avgResponse =
      healthData.length > 0
        ? healthData.reduce((s, h) => s + h.avgResponseTime, 0) /
          healthData.length
        : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-sm">
                {t_(lang === "bn" ? "api.uptime" : "api.uptime")}
              </span>
            </div>
            <div
              className={cn(
                "text-2xl font-bold",
                avgUptime >= 99
                  ? "text-green-400"
                  : avgUptime >= 95
                    ? "text-yellow-400"
                    : "text-red-400",
              )}
            >
              {avgUptime.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-sm">
                {t_(lang === "bn" ? "api.avgResponse" : "api.avgResponse")}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round(avgResponse)}ms
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-sm">
                {t_(lang === "bn" ? "api.totalRequests" : "api.totalRequests")}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{totalRequests}</div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-medium">
              {t_(lang === "bn" ? "api.endpointStatus" : "api.endpointStatus")}
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {healthData.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      item.enabled ? "bg-green-400" : "bg-red-400",
                    )}
                  />
                  <div>
                    <span
                      className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded",
                        METHOD_COLORS[item.method] ||
                          "bg-gray-500/20 text-gray-400",
                      )}
                    >
                      {item.method}
                    </span>
                    <span className="text-white ml-2 font-mono text-sm">
                      {item.endpoint}
                    </span>
                    <span className="text-white/40 ml-2 text-xs">
                      {item.description}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-white/60">
                    {item.totalRequests} req
                  </span>
                  <span
                    className={cn(
                      item.errorRate > 5 ? "text-red-400" : "text-green-400",
                    )}
                  >
                    {item.errorRate.toFixed(1)}% err
                  </span>
                  <span className="text-white/60">
                    {item.avgResponseTime}ms
                  </span>
                  <button
                    onClick={() =>
                      handleToggleEndpoint(
                        item.endpoint,
                        item.method,
                        item.enabled,
                      )
                    }
                    className="text-white/60 hover:text-white"
                  >
                    {item.enabled ? (
                      <ToggleRight className="w-5 h-5 text-green-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-red-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderConfigTab = () => {
    if (!configs) {
      return (
        <div className="text-center py-8 text-white/50">
          {t_(lang === "bn" ? "api.loading" : "api.loading")}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t_(
                lang === "bn"
                  ? "api.searchPlaceholder"
                  : "api.searchPlaceholder",
              )}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  categoryFilter === cat
                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/30"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10",
                )}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {filteredConfigs.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-white/5"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-xs font-mono px-2 py-0.5 rounded shrink-0",
                      METHOD_COLORS[item.method] ||
                        "bg-gray-500/20 text-gray-400",
                    )}
                  >
                    {item.method}
                  </span>
                  <span className="text-white font-mono text-sm truncate">
                    {item.endpoint}
                  </span>
                  <span className="text-white/30 text-xs hidden md:inline">
                    {item.description}
                  </span>
                  <span className="text-white/20 text-xs px-2 py-0.5 rounded bg-white/5 hidden md:inline">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-white/40 text-xs">
                      {t_(lang === "bn" ? "api.rateLimit" : "api.rateLimit")}
                    </label>
                    <input
                      type="number"
                      value={item.rateLimit}
                      onChange={(e) =>
                        handleUpdateRateLimit(
                          item.endpoint,
                          item.method,
                          parseInt(e.target.value) || 60,
                        )
                      }
                      className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs text-center"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-white/40 text-xs">
                      {t_(lang === "bn" ? "api.timeout" : "api.timeout")}
                    </label>
                    <span className="text-white text-xs">{item.timeout}ms</span>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleEndpoint(
                        item.endpoint,
                        item.method,
                        item.enabled,
                      )
                    }
                    className="text-white/60 hover:text-white"
                  >
                    {item.enabled ? (
                      <ToggleRight className="w-6 h-6 text-green-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-red-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLogsTab = () => {
    if (!logs) {
      return (
        <div className="text-center py-8 text-white/50">
          {t_(lang === "bn" ? "api.loading" : "api.loading")}
        </div>
      );
    }

    const logData = logs as ApiLogItem[];

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <select
              value={logEndpointFilter}
              onChange={(e) => setLogEndpointFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="">
                {t_(lang === "bn" ? "api.allEndpoints" : "api.allEndpoints")}
              </option>
              {configs &&
                [
                  ...new Set(
                    (configs as ApiConfigItem[]).map((c) => c.endpoint),
                  ),
                ].map((ep) => (
                  <option key={ep} value={ep}>
                    {ep}
                  </option>
                ))}
            </select>
            <select
              value={logStatusFilter}
              onChange={(e) =>
                setLogStatusFilter(
                  e.target.value === "" ? "" : parseInt(e.target.value),
                )
              }
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="">
                {t_(lang === "bn" ? "api.allStatuses" : "api.allStatuses")}
              </option>
              <option value={200}>200 OK</option>
              <option value={201}>201 Created</option>
              <option value={400}>400 Bad Request</option>
              <option value={401}>401 Unauthorized</option>
              <option value={403}>403 Forbidden</option>
              <option value={404}>404 Not Found</option>
              <option value={500}>500 Server Error</option>
            </select>
          </div>
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
            {t_(lang === "bn" ? "api.clearLogs" : "api.clearLogs")}
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-white/60 font-medium">
                    {t_(lang === "bn" ? "api.time" : "api.time")}
                  </th>
                  <th className="text-left p-3 text-white/60 font-medium">
                    {t_(lang === "bn" ? "api.method" : "api.method")}
                  </th>
                  <th className="text-left p-3 text-white/60 font-medium">
                    {t_(lang === "bn" ? "api.endpoint" : "api.endpoint")}
                  </th>
                  <th className="text-left p-3 text-white/60 font-medium">
                    {t_(lang === "bn" ? "api.status" : "api.status")}
                  </th>
                  <th className="text-left p-3 text-white/60 font-medium">
                    {t_(lang === "bn" ? "api.response" : "api.response")}
                  </th>
                  <th className="text-left p-3 text-white/60 font-medium">
                    {t_(lang === "bn" ? "api.size" : "api.size")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logData.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5">
                    <td className="p-3 text-white/50 text-xs">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "text-xs font-mono px-2 py-0.5 rounded",
                          METHOD_COLORS[log.method] ||
                            "bg-gray-500/20 text-gray-400",
                        )}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="p-3 text-white font-mono text-xs">
                      {log.endpoint}
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "font-mono text-xs",
                          STATUS_COLORS[log.status] || "text-white/60",
                        )}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-white/60 text-xs">
                      {log.responseTime}ms
                    </td>
                    <td className="p-3 text-white/40 text-xs">
                      {log.payloadSize}B
                    </td>
                  </tr>
                ))}
                {logData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-white/40">
                      {t_(lang === "bn" ? "api.noLogs" : "api.noLogs")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderKeysTab = () => {
    if (!keys) {
      return (
        <div className="text-center py-8 text-white/50">
          {t_(lang === "bn" ? "api.loading" : "api.loading")}
        </div>
      );
    }

    const keyData = keys as ApiKeyItem[];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-medium">
            {t_(lang === "bn" ? "api.manageKeys" : "api.manageKeys")}
          </h3>
          <button
            onClick={() => setShowKeyForm(!showKeyForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-sm hover:bg-purple-500/30"
          >
            <Plus className="w-4 h-4" />
            {t_(lang === "bn" ? "api.generateKey" : "api.generateKey")}
          </button>
        </div>

        {showKeyForm && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">
                {t_(lang === "bn" ? "api.keyName" : "api.keyName")}
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder={
                  lang === "bn" ? "যেমন: মোবাইল অ্যাপ" : "e.g., Mobile App"
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">
                {t_(lang === "bn" ? "api.permissions" : "api.permissions")}
              </label>
              <div className="flex gap-2 flex-wrap">
                {["read", "write", "admin"].map((perm) => (
                  <button
                    key={perm}
                    onClick={() => {
                      setNewKeyPermissions((prev) =>
                        prev.includes(perm)
                          ? prev.filter((p) => p !== perm)
                          : [...prev, perm],
                      );
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      newKeyPermissions.includes(perm)
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-white/60 border border-white/10",
                    )}
                  >
                    {perm}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateKey}
                disabled={!newKeyName.trim()}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50"
              >
                {t_(lang === "bn" ? "api.create" : "api.create")}
              </button>
              <button
                onClick={() => setShowKeyForm(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20"
              >
                {t_(lang === "bn" ? "api.cancel" : "api.cancel")}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {keyData.map((k) => (
              <div
                key={k._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-white/5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{k.name}</span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        k.active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400",
                      )}
                    >
                      {k.active
                        ? lang === "bn"
                          ? "সক্রিয়"
                          : "Active"
                        : lang === "bn"
                          ? "নিষ্ক্রিয়"
                          : "Revoked"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-white/40 text-xs font-mono">
                      {revealedKeys.has(k._id)
                        ? k.key
                        : k.key.slice(0, 12) + "••••••••"}
                    </code>
                    <button
                      onClick={() => toggleKeyReveal(k._id)}
                      className="text-white/40 hover:text-white"
                    >
                      {revealedKeys.has(k._id) ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(k.key)}
                      className="text-white/40 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {k.permissions.map((p) => (
                      <span
                        key={p}
                        className="text-xs px-1.5 py-0.5 bg-white/5 text-white/40 rounded"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="text-white/30 text-xs mt-1">
                    {t_(lang === "bn" ? "api.uses" : "api.uses")}:{" "}
                    {k.usageCount} ·{" "}
                    {t_(lang === "bn" ? "api.created" : "api.created")}:{" "}
                    {formatTimestamp(k.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {k.active ? (
                    <button
                      onClick={() => handleRevokeKey(k._id)}
                      className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs hover:bg-yellow-500/20"
                    >
                      {t_(lang === "bn" ? "api.revoke" : "api.revoke")}
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteKeyId(k._id)}
                      className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" />
                      {t_(lang === "bn" ? "api.delete" : "api.delete")}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {keyData.length === 0 && (
              <div className="p-8 text-center text-white/40">
                {t_(lang === "bn" ? "api.noKeys" : "api.noKeys")}
              </div>
            )}
          </div>
        </div>

        {confirmDeleteKeyId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-white font-medium">
                  {t_(
                    lang === "bn" ? "api.confirmDelete" : "api.confirmDelete",
                  )}
                </h3>
              </div>
              <p className="text-white/60 text-sm mb-6">
                {t_(
                  lang === "bn"
                    ? "api.confirmDeleteMsg"
                    : "api.confirmDeleteMsg",
                )}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDeleteKeyId(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20"
                >
                  {t_(lang === "bn" ? "api.cancel" : "api.cancel")}
                </button>
                <button
                  onClick={() => handleDeleteKey(confirmDeleteKeyId)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                >
                  {t_(lang === "bn" ? "api.confirm" : "api.confirm")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalyticsTab = () => {
    if (!stats) {
      return (
        <div className="text-center py-8 text-white/50">
          {t_(lang === "bn" ? "api.loading" : "api.loading")}
        </div>
      );
    }

    const s = stats as StatsData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs mb-1">
              {t_(lang === "bn" ? "api.totalReq" : "api.totalReq")}
            </div>
            <div className="text-2xl font-bold text-white">
              {s.totalRequests}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs mb-1">
              {t_(lang === "bn" ? "api.today" : "api.today")}
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {s.todayRequests}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs mb-1">
              {t_(lang === "bn" ? "api.errorRate" : "api.errorRate")}
            </div>
            <div
              className={cn(
                "text-2xl font-bold",
                s.errorRate > 5 ? "text-red-400" : "text-green-400",
              )}
            >
              {s.errorRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs mb-1">
              {t_(lang === "bn" ? "api.avgResp" : "api.avgResp")}
            </div>
            <div className="text-2xl font-bold text-white">
              {s.avgResponseTime}ms
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-4">
              {t_(lang === "bn" ? "api.topEndpoints" : "api.topEndpoints")}
            </h3>
            <div className="space-y-2">
              {s.topEndpoints.map((ep, i) => {
                const maxCount = s.topEndpoints[0]?.count || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-white/60 text-xs font-mono truncate w-40">
                      {ep.endpoint}
                    </span>
                    <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        style={{ width: `${(ep.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/40 text-xs w-10 text-right">
                      {ep.count}
                    </span>
                  </div>
                );
              })}
              {s.topEndpoints.length === 0 && (
                <div className="text-white/40 text-sm text-center py-4">
                  {t_(lang === "bn" ? "api.noData" : "api.noData")}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-4">
              {t_(lang === "bn" ? "api.weeklyActivity" : "api.weeklyActivity")}
            </h3>
            <div className="space-y-2">
              {Object.entries(s.dailyCounts)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, count]) => {
                  const maxDay = Math.max(...Object.values(s.dailyCounts), 1);
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <span className="text-white/60 text-xs w-20">
                        {day.slice(5)}
                      </span>
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${(count / maxDay) * 100}%` }}
                        />
                      </div>
                      <span className="text-white/40 text-xs w-10 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              {Object.keys(s.dailyCounts).length === 0 && (
                <div className="text-white/40 text-sm text-center py-4">
                  {t_(lang === "bn" ? "api.noData" : "api.noData")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-medium mb-2">
            {t_(lang === "bn" ? "api.keysOverview" : "api.keysOverview")}
          </h3>
          <div className="flex gap-6">
            <div>
              <span className="text-white/60 text-sm">
                {t_(lang === "bn" ? "api.activeKeys" : "api.activeKeys")}:{" "}
              </span>
              <span className="text-green-400 font-bold">{s.activeKeys}</span>
            </div>
            <div>
              <span className="text-white/60 text-sm">
                {t_(lang === "bn" ? "api.totalKeys" : "api.totalKeys")}:{" "}
              </span>
              <span className="text-white font-bold">{s.totalKeys}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeploymentTab = () => {
    if (!deployment) {
      return (
        <div className="text-center py-8 text-white/50">
          {t_(lang === "bn" ? "api.loading" : "api.loading")}
        </div>
      );
    }

    const d = deployment as DeploymentData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-xs">
                {t_(
                  lang === "bn" ? "api.totalEndpoints" : "api.totalEndpoints",
                )}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {d.totalEndpoints}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">
                {t_(lang === "bn" ? "api.enabled" : "api.enabled")}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {d.enabledEndpoints}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-white/60 text-xs">
                {t_(lang === "bn" ? "api.disabled" : "api.disabled")}
              </span>
            </div>
            <div className="text-2xl font-bold text-red-400">
              {d.disabledEndpoints}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">
                {t_(lang === "bn" ? "api.apiKeys" : "api.apiKeys")}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {d.activeKeys}/{d.totalKeys}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-medium mb-3">
            {t_(lang === "bn" ? "api.categories" : "api.categories")}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {d.categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg text-xs"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-medium mb-3">
            {t_(lang === "bn" ? "api.deploymentInfo" : "api.deploymentInfo")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">
                  {t_(lang === "bn" ? "api.totalLogs" : "api.totalLogs")}
                </span>
                <span className="text-white font-medium">{d.totalLogs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">
                  {t_(lang === "bn" ? "api.lastActivity" : "api.lastActivity")}
                </span>
                <span className="text-white font-medium">
                  {d.lastActivity
                    ? formatTimestamp(d.lastActivity)
                    : lang === "bn"
                      ? "কখনো নয়"
                      : "Never"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">
                  {t_(lang === "bn" ? "api.storage" : "api.storage")}
                </span>
                <span className="text-white font-medium">localStorage</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">
                  {t_(lang === "bn" ? "api.environment" : "api.environment")}
                </span>
                <span className="text-white font-medium">Development</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-medium mb-3">
            {t_(
              lang === "bn" ? "api.backendFunctions" : "api.backendFunctions",
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[
              "getConfig",
              "updateConfig",
              "getHealth",
              "listKeys",
              "createKey",
              "revokeKey",
              "deleteKey",
              "getLogs",
              "getStats",
              "getDeploymentInfo",
              "logRequest",
              "clearLogs",
            ].map((fn) => (
              <div
                key={fn}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg"
              >
                <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                <span className="text-white/70 text-xs font-mono">{fn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case "health":
        return renderHealthTab();
      case "config":
        return renderConfigTab();
      case "logs":
        return renderLogsTab();
      case "keys":
        return renderKeysTab();
      case "analytics":
        return renderAnalyticsTab();
      case "deployment":
        return renderDeploymentTab();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t_(lang === "bn" ? "api.title" : "api.title")}
            </h1>
            <p className="text-white/50 text-sm">
              {t_(lang === "bn" ? "api.subtitle" : "api.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 scrollbar-thin">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  activeTab === tab.id
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon className="w-4 h-4" />
                {t_(tab.label as any)}
              </button>
            );
          })}
        </div>

        {renderTab()}
      </div>
    </div>
  );
}
