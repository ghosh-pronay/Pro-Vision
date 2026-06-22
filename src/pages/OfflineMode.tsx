import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { useState, useEffect, useCallback } from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  HardDrive,
  Database,
  Trash2,
  Download,
  Upload,
  Clock,
  Settings,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  ListChecks,
  Activity,
  BookOpen,
  Wallet,
  Target,
  Brain,
  Loader2,
  Zap,
} from "lucide-react";

const NOW = Date.now();

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface SyncItem {
  id: string;
  type: string;
  action: string;
  timestamp: number;
  status: "pending" | "syncing" | "error";
}

interface StorageCategory {
  name: string;
  size: number;
  icon: React.ElementType;
  color: string;
}

const OFFLINE_FEATURES = [
  {
    key: "offlineMode.feature.tasks",
    icon: ListChecks,
    color: "text-blue-500",
  },
  {
    key: "offlineMode.feature.habits",
    icon: Activity,
    color: "text-green-500",
  },
  {
    key: "offlineMode.feature.journal",
    icon: BookOpen,
    color: "text-purple-500",
  },
  {
    key: "offlineMode.feature.expenses",
    icon: Wallet,
    color: "text-yellow-500",
  },
  { key: "offlineMode.feature.focus", icon: Zap, color: "text-orange-500" },
  { key: "offlineMode.feature.goals", icon: Target, color: "text-red-500" },
  { key: "offlineMode.feature.wellbeing", icon: Brain, color: "text-pink-500" },
];

const SYNC_INTERVALS = [15, 30, 60, 120, 300];

export default function OfflineMode() {
  const { lang } = useLang();
  const tc = useCallback((key: TranslationKey) => t(key, lang), [lang]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([
    {
      id: "1",
      type: "task",
      action: "create",
      timestamp: NOW - 300000,
      status: "pending",
    },
    {
      id: "2",
      type: "habit",
      action: "update",
      timestamp: NOW - 600000,
      status: "pending",
    },
    {
      id: "3",
      type: "journal",
      action: "create",
      timestamp: NOW - 900000,
      status: "pending",
    },
  ]);
  const [storageUsed, setStorageUsed] = useState(() => {
    const total = storageCategories.reduce((sum, cat) => sum + cat.size, 0);
    return total;
  });
  const [storageLimit] = useState(50 * 1024 * 1024);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(
    new Date(NOW - 3600000),
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [featuresEnabled, setFeaturesEnabled] = useState<
    Record<string, boolean>
  >({
    "offlineMode.feature.tasks": true,
    "offlineMode.feature.habits": true,
    "offlineMode.feature.journal": true,
    "offlineMode.feature.expenses": true,
    "offlineMode.feature.focus": true,
    "offlineMode.feature.goals": true,
    "offlineMode.feature.wellbeing": true,
  });
  const [showStorageBreakdown, setShowStorageBreakdown] = useState(false);
  const [showAutoSyncSettings, setShowAutoSyncSettings] = useState(false);

  const storageCategories: StorageCategory[] = [
    {
      name: tc("offlineMode.storage.tasks"),
      size: 1.2 * 1024 * 1024,
      icon: ListChecks,
      color: "bg-blue-500",
    },
    {
      name: tc("offlineMode.storage.habits"),
      size: 0.8 * 1024 * 1024,
      icon: Activity,
      color: "bg-green-500",
    },
    {
      name: tc("offlineMode.storage.journal"),
      size: 2.5 * 1024 * 1024,
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      name: tc("offlineMode.storage.expenses"),
      size: 1.5 * 1024 * 1024,
      icon: Wallet,
      color: "bg-yellow-500",
    },
    {
      name: tc("offlineMode.storage.cache"),
      size: 3.0 * 1024 * 1024,
      icon: Database,
      color: "bg-gray-500",
    },
  ];

  const handleSyncAll = useCallback(async () => {
    setIsSyncing(true);
    for (const item of syncQueue) {
      if (item.status === "pending") {
        setSyncQueue((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "syncing" } : i)),
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        setSyncQueue((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "pending" } : i)),
        );
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSyncQueue([]);
    setLastSynced(new Date());
    setIsSyncing(false);
  }, [syncQueue]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoSync && (!wifiOnly || navigator.onLine)) {
        handleSyncAll();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [autoSync, wifiOnly, handleSyncAll]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((NOW - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(
      lang === "bn" ? "bn-BD" : "en-US",
      { hour: "2-digit", minute: "2-digit" },
    );
  };

  const handleClearCache = () => {
    const categories = storageCategories.find(
      (c) => c.name === tc("offlineMode.storage.cache"),
    );
    if (categories) {
      setStorageUsed((prev) => prev - categories.size);
    }
  };

  const handleClearAllData = () => {
    setStorageUsed(0);
    setSyncQueue([]);
  };

  const handleExportData = () => {
    const data = {
      storageUsed,
      syncQueue,
      featuresEnabled,
      lastSynced: lastSynced?.toISOString(),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pro-vision-offline-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadOfflineData = () => {
    const data = {
      tasks: [],
      habits: [],
      journal: [],
      expenses: [],
      downloadedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pro-vision-offline-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFeature = (key: string) => {
    setFeaturesEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-6 w-6 text-green-500" />
            ) : (
              <WifiOff className="h-6 w-6 text-red-500" />
            )}
            {tc("offlineMode.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tc("offlineMode.subtitle")}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ${
            isOnline ? "bg-green-500/10" : "bg-red-500/10"
          }`}
        >
          <div
            className={`h-2 w-2 rounded-full ${
              isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              isOnline ? "text-green-500" : "text-red-500"
            }`}
          >
            {isOnline ? tc("offlineMode.online") : tc("offlineMode.offline")}
          </span>
        </div>
      </motion.div>

      {/* Connection Status Card */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{tc("offlineMode.status")}</h2>
          <button
            onClick={handleSyncAll}
            disabled={isSyncing || !isOnline}
            className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {tc("offlineMode.syncNow")}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-subtle rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {tc("offlineMode.syncStatus")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {syncQueue.length > 0
                  ? `${syncQueue.length} ${tc("offlineMode.pendingItems")}`
                  : isOnline
                    ? tc("offlineMode.online")
                    : tc("offlineMode.offline")}
              </span>
            </div>
          </div>

          <div className="glass-subtle rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {tc("offlineMode.lastSynced")}
              </span>
            </div>
            <div className="font-medium">
              {lastSynced ? formatTimeAgo(lastSynced) : "—"}
            </div>
          </div>

          <div className="glass-subtle rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {tc("offlineMode.pendingItems")}
              </span>
            </div>
            <div className="font-medium">
              {syncQueue.filter((i) => i.status === "pending").length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Storage Usage */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            {tc("offlineMode.storage")}
          </h2>
          <button
            onClick={() => setShowStorageBreakdown(!showStorageBreakdown)}
            className="cursor-pointer flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showStorageBreakdown ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>
              {formatBytes(storageUsed)} {tc("offlineMode.used")}
            </span>
            <span>{formatBytes(storageLimit)}</span>
          </div>
          <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${storagePercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                storagePercent > 80
                  ? "bg-red-500"
                  : storagePercent > 60
                    ? "bg-yellow-500"
                    : "bg-primary"
              }`}
            />
          </div>
        </div>

        {showStorageBreakdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="space-y-3 mb-4"
          >
            {storageCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className={`${cat.color} rounded-lg p-2`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{cat.name}</span>
                      <span className="text-muted-foreground">
                        {formatBytes(cat.size)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${cat.color} rounded-full`}
                        style={{
                          width: `${(cat.size / storageLimit) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        <button
          onClick={handleClearCache}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-foreground/5 px-4 py-2 text-sm font-medium hover:bg-foreground/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          {tc("offlineMode.clearCache")}
        </button>
      </motion.div>

      {/* Sync Queue */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            {tc("offlineMode.syncQueue")}
          </h2>
          {syncQueue.length > 0 && (
            <button
              onClick={handleSyncAll}
              disabled={isSyncing || !isOnline}
              className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {tc("offlineMode.syncAll")}
            </button>
          )}
        </div>

        {syncQueue.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p>{tc("offlineMode.noPendingItems")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {syncQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between glass-subtle rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      item.status === "syncing"
                        ? "bg-yellow-500 animate-pulse"
                        : item.status === "error"
                          ? "bg-red-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <span className="text-sm font-medium capitalize">
                      {item.type}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {item.action}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Offline Features */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5" />
          {tc("offlineMode.features")}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {tc("offlineMode.offlineFeaturesList")}
        </p>
        <div className="space-y-2">
          {OFFLINE_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isEnabled = featuresEnabled[feature.key] ?? true;
            return (
              <div
                key={feature.key}
                className="flex items-center justify-between glass-subtle rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                  <span className="text-sm font-medium">
                    {tc(feature.key as TranslationKey)}
                  </span>
                </div>
                <button
                  onClick={() => toggleFeature(feature.key)}
                  className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled ? "bg-primary" : "bg-foreground/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5" />
          {tc("offlineMode.dataManagement")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownloadOfflineData}
            className="cursor-pointer flex items-center justify-center gap-2 glass-subtle rounded-xl p-4 hover:bg-foreground/10 transition-colors"
          >
            <Download className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">
              {tc("offlineMode.downloadData")}
            </span>
          </button>
          <button
            onClick={handleClearAllData}
            className="cursor-pointer flex items-center justify-center gap-2 glass-subtle rounded-xl p-4 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-500">
              {tc("offlineMode.clearData")}
            </span>
          </button>
          <button
            onClick={handleExportData}
            className="cursor-pointer flex items-center justify-center gap-2 glass-subtle rounded-xl p-4 hover:bg-foreground/10 transition-colors"
          >
            <Upload className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">
              {tc("offlineMode.exportData")}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Auto Sync Settings */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {tc("offlineMode.autoSync")}
          </h2>
          <button
            onClick={() => setShowAutoSyncSettings(!showAutoSyncSettings)}
            className="cursor-pointer flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAutoSyncSettings ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="space-y-4">
          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between glass-subtle rounded-xl p-4">
            <div>
              <p className="text-sm font-medium">
                {tc("offlineMode.autoSync")}
              </p>
              <p className="text-xs text-muted-foreground">
                {tc("offlineMode.autoSyncDesc")}
              </p>
            </div>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoSync ? "bg-primary" : "bg-foreground/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoSync ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {showAutoSyncSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-4"
            >
              {/* Sync Interval */}
              <div className="glass-subtle rounded-xl p-4">
                <p className="text-sm font-medium mb-2">
                  {tc("offlineMode.syncInterval")}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {tc("offlineMode.syncIntervalDesc")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SYNC_INTERVALS.map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setSyncInterval(interval)}
                      className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                        syncInterval === interval
                          ? "bg-primary text-primary-foreground"
                          : "bg-foreground/5 hover:bg-foreground/10"
                      }`}
                    >
                      {interval} {tc("offlineMode.seconds")}
                    </button>
                  ))}
                </div>
              </div>

              {/* WiFi Only */}
              <div className="flex items-center justify-between glass-subtle rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium">
                    {tc("offlineMode.wifiOnly")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tc("offlineMode.wifiOnlyDesc")}
                  </p>
                </div>
                <button
                  onClick={() => setWifiOnly(!wifiOnly)}
                  className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    wifiOnly ? "bg-primary" : "bg-foreground/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      wifiOnly ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
