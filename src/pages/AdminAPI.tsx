import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import {
  Activity,
  Settings,
  FileText,
  Key,
  BarChart3,
  Globe,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toastSuccess, toastError } from "@/lib/toast-helpers";
import {
  HealthTab,
  ConfigTab,
  LogsTab,
  KeysTab,
  AnalyticsTab,
  DeploymentTab,
} from "@/components/admin-api";
import type {
  Tab,
  ApiConfigItem,
  StatsData,
  DeploymentData,
} from "@/components/admin-api";

const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "health", label: "api.tab.health", icon: Activity },
  { id: "config", label: "api.tab.config", icon: Settings },
  { id: "logs", label: "api.tab.logs", icon: FileText },
  { id: "keys", label: "api.tab.keys", icon: Key },
  { id: "analytics", label: "api.tab.analytics", icon: BarChart3 },
  { id: "deployment", label: "api.tab.deployment", icon: Globe },
];

export default function AdminAPI() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>("health");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [logEndpointFilter, setLogEndpointFilter] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState<number | "">("");

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

  const t_ = (key: string) => t(key as TranslationKey, lang);

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
    } catch (e) {
      console.error("[AdminAPI]", "Failed to toggle endpoint", e);
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
    } catch (e) {
      console.error("[AdminAPI]", "Failed to update rate limit", e);
      toastError(
        lang === "bn" ? "আপডেট ব্যর্থ" : "Failed to update rate limit",
      );
    }
  };

  const handleCreateKey = async (name: string, permissions: string[]) => {
    try {
      await createKey({ name, permissions });
      toastSuccess(lang === "bn" ? "API কী তৈরি হয়েছে" : "API key created");
    } catch (e) {
      console.error("[AdminAPI]", "Failed to create API key", e);
      toastError(lang === "bn" ? "কী তৈরি ব্যর্থ" : "Failed to create key");
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await revokeKey({ id });
      toastSuccess(lang === "bn" ? "কী নিষ্ক্রিয় হয়েছে" : "Key revoked");
    } catch (e) {
      console.error("[AdminAPI]", "Failed to revoke key", e);
      toastError(
        lang === "bn" ? "নিষ্ক্রিয়করণ ব্যর্থ" : "Failed to revoke key",
      );
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteKey({ id });
      toastSuccess(lang === "bn" ? "কী মুছে ফেলা হয়েছে" : "Key deleted");
    } catch (e) {
      console.error("[AdminAPI]", "Failed to delete API key", e);
      toastError(lang === "bn" ? "মুছে ফেলা ব্যর্থ" : "Failed to delete key");
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearLogs();
      toastSuccess(lang === "bn" ? "লগ মুছে ফেলা হয়েছে" : "Logs cleared");
    } catch (e) {
      console.error("[AdminAPI]", "Failed to clear logs", e);
      toastError(
        lang === "bn" ? "লগ মুছে ফেলা ব্যর্থ" : "Failed to clear logs",
      );
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
                {t_(tab.label)}
              </button>
            );
          })}
        </div>

        {activeTab === "health" && (
          <HealthTab
            health={health as any}
            t_={t_}
            onToggle={handleToggleEndpoint}
          />
        )}

        {activeTab === "config" && (
          <ConfigTab
            configs={configs as any}
            filteredConfigs={filteredConfigs}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            t_={t_}
            onSearchChange={setSearchQuery}
            onCategoryChange={setCategoryFilter}
            onToggle={handleToggleEndpoint}
            onUpdateRateLimit={handleUpdateRateLimit}
          />
        )}

        {activeTab === "logs" && (
          <LogsTab
            logs={logs as any}
            configs={configs as any}
            endpointFilter={logEndpointFilter}
            statusFilter={logStatusFilter}
            t_={t_}
            formatTimestamp={formatTimestamp}
            onEndpointFilterChange={setLogEndpointFilter}
            onStatusFilterChange={setLogStatusFilter}
            onClearLogs={handleClearLogs}
          />
        )}

        {activeTab === "keys" && (
          <KeysTab
            keys={keys as any}
            t_={t_}
            lang={lang}
            formatTimestamp={formatTimestamp}
            onCreateKey={handleCreateKey}
            onRevokeKey={handleRevokeKey}
            onDeleteKey={handleDeleteKey}
          />
        )}

        {activeTab === "analytics" && <AnalyticsTab stats={stats} t_={t_} />}

        {activeTab === "deployment" && (
          <DeploymentTab
            deployment={deployment}
            t_={t_}
            formatTimestamp={formatTimestamp}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}
