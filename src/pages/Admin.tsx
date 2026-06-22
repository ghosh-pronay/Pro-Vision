import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import {
  Shield,
  Users,
  Activity,
  Settings,
  Trash2,
  Crown,
  UserX,
  BarChart3,
  Search,
  Flag,
  FileText,
  DollarSign,
  Globe,
  ChevronRight,
  Edit,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type Tab =
  | "overview"
  | "users"
  | "features"
  | "content"
  | "system"
  | "finance"
  | "settings";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "admin.tab.overview", icon: BarChart3 },
  { id: "users", label: "admin.tab.users", icon: Users },
  { id: "features", label: "admin.tab.features", icon: Flag },
  { id: "content", label: "admin.tab.content", icon: FileText },
  { id: "system", label: "admin.tab.system", icon: Settings },
  { id: "finance", label: "admin.tab.finance", icon: DollarSign },
  { id: "settings", label: "admin.tab.settings", icon: Globe },
];

const NOW = Date.now();

const DEFAULT_FEATURES = {
  "features.habits": true,
  "features.expense": true,
  "features.focus": true,
  "features.wellbeing": true,
  "features.goals": true,
  "features.kanban": true,
  "features.news": true,
  "features.coach": true,
  "features.challenges": true,
  "features.adRewards": true,
};

const DEFAULT_LIMITS = {
  "limits.coachDailyMessages": 50,
  "limits.walletsPerUser": 10,
  "limits.freeTierWallets": 3,
};

const DEFAULT_SYSTEM = {
  "system.maintenanceMode": false,
  "system.announcementBanner": "",
};

const DEFAULT_ADS = {
  "ads.enabled": true,
  "ads.sidebar": true,
  "ads.header": true,
  "ads.footer": true,
  "ads.inContent": true,
  "ads.rewardedVideo": true,
};

export default function Admin() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const adminApi = api.admin;

  const stats = useQuery(adminApi.getStats);
  const users = useQuery(adminApi.listUsers);
  const config = useQuery(adminApi.getConfig);
  const challenges = useQuery(adminApi.getChallenges);
  const financeStats = useQuery(adminApi.getFinanceStats);
  const userDetail = useQuery(
    adminApi.getUserDetail,
    selectedUser ? { userId: selectedUser } : "skip",
  );

  const grantPremium = useMutation(adminApi.grantPremium);
  const revokePremium = useMutation(adminApi.revokePremium);
  const deleteUser = useMutation(adminApi.deleteUser);
  const updateUser = useMutation(adminApi.updateUser);
  const setConfig = useMutation(adminApi.setConfig);
  useMutation(adminApi.bulkSetConfig);
  const createChallenge = useMutation(adminApi.createChallenge);
  const updateChallenge = useMutation(adminApi.updateChallenge);
  const deleteChallenge = useMutation(adminApi.deleteChallenge);

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    type: "habit_streak",
    goal: 7,
    unit: "days",
    startDate: NOW,
    endDate: NOW + 30 * 24 * 60 * 60 * 1000,
  });

  const features = { ...DEFAULT_FEATURES };
  const limits = { ...DEFAULT_LIMITS };
  const system = { ...DEFAULT_SYSTEM };
  const ads = { ...DEFAULT_ADS };

  if (config) {
    Object.entries(config).forEach(([key, value]) => {
      if (key.startsWith("features.") && typeof value === "boolean")
        features[key as keyof typeof features] = value;
      if (key.startsWith("limits.") && typeof value === "number")
        limits[key as keyof typeof limits] = value;
      if (key === "system.maintenanceMode" && typeof value === "boolean")
        system["system.maintenanceMode"] = value;
      if (key === "system.announcementBanner" && typeof value === "string")
        system["system.announcementBanner"] = value;
      if (key.startsWith("ads.") && typeof value === "boolean")
        ads[key as keyof typeof ads] = value;
    });
  }

  const filteredUsers = (users ?? []).filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggleConfig = async (key: string, value: boolean | string) => {
    await setConfig({ key, value });
  };

  const handleSetLimit = async (key: string, value: number) => {
    await setConfig({ key, value });
  };

  const handleSaveUser = async (userId: string) => {
    await updateUser({
      userId: userId as Id<"users">,
      name: editName,
      email: editEmail,
    });
    setEditingUser(null);
  };

  const handleGrantPremium = async (userId: string) => {
    const expiresAt = NOW + 30 * 24 * 60 * 60 * 1000;
    await grantPremium({ userId: userId as Id<"users">, expiresAt });
  };

  const handleRevokePremium = async (userId: string) => {
    await revokePremium({ userId: userId as Id<"users"> });
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser({ userId: userId as Id<"users"> });
    }
  };

  const handleCreateChallenge = async () => {
    await createChallenge({
      title: newChallenge.title,
      description: newChallenge.description,
      type: newChallenge.type,
      goal: newChallenge.goal,
      unit: newChallenge.unit,
      startDate: newChallenge.startDate,
      endDate: newChallenge.endDate,
    });
    setNewChallenge({
      title: "",
      description: "",
      type: "habit_streak",
      goal: 7,
      unit: "days",
      startDate: Date.now(),
      endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
  };

  const formatRole = (role?: string) => (role === "admin" ? "Admin" : "User");
  const formatStatus = (user: { isPremium?: boolean }) => {
    if (user.isPremium) return "premium";
    return "active";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/20 p-2">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {t("admin.dashboardTitle", lang)}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.dashboardDesc", lang)}
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/10 pb-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer",
              activeTab === tab.id
                ? "bg-primary/20 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {t(tab.label as TranslationKey, lang)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: t("admin.totalUsers", lang),
                value: stats?.totalUsers ?? 0,
                icon: Users,
                color: "text-blue-500",
              },
              {
                label: t("admin.activeToday", lang),
                value: stats?.activeToday ?? 0,
                icon: Activity,
                color: "text-green-500",
              },
              {
                label: t("admin.premiumUsers", lang),
                value: stats?.premiumUsers ?? 0,
                icon: Crown,
                color: "text-yellow-500",
              },
              {
                label: t("admin.totalTasks", lang),
                value: stats?.totalTasks ?? 0,
                icon: Target,
                color: "text-purple-500",
              },
              {
                label: t("admin.totalHabits", lang),
                value: stats?.totalHabits ?? 0,
                icon: Zap,
                color: "text-orange-500",
              },
              {
                label: t("admin.totalExpenses", lang),
                value: stats?.totalTransactions ?? 0,
                icon: DollarSign,
                color: "text-emerald-500",
              },
              {
                label: t("admin.totalFocus", lang),
                value: stats?.totalFocusSessions ?? 0,
                icon: Clock,
                color: "text-cyan-500",
              },
              {
                label: "Goals",
                value: stats?.totalGoals ?? 0,
                icon: Trophy,
                color: "text-pink-500",
              },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 hover-lift">
                <div className="flex items-center justify-between">
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("admin.recentUsers", lang)}
              </h3>
              <div className="space-y-3">
                {(users ?? []).slice(0, 5).map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between rounded-lg bg-white/5 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name?.[0] || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {user.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        user.role === "admin"
                          ? "bg-primary/20 text-primary"
                          : "bg-white/10 text-muted-foreground",
                      )}
                    >
                      {formatRole(user.role)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("admin.quickActions", lang)}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("users")}
                  className="w-full flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    {t("admin.manageUsers", lang)}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className="w-full flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Flag className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {t("admin.toggleFeatures", lang)}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("system")}
                  className="w-full flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">
                    {t("admin.systemSettings", lang)}
                  </span>
                </button>
                <button
                  onClick={() => navigate("/admin/api")}
                  className="w-full flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Globe className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">
                    {lang === "bn" ? "API ব্যবস্থাপনা" : "API Management"}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("finance")}
                  className="w-full flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">
                    {t("admin.financeOverview", lang)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">
                {t("admin.userManagement", lang)} ({filteredUsers.length})
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("admin.searchUsers", lang)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                      {t("admin.user", lang)}
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                      {t("admin.role", lang)}
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                      {t("admin.status", lang)}
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                      {t("admin.actions", lang)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4">
                        {editingUser === user._id ? (
                          <div className="space-y-1">
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2 py-1 rounded bg-white/10 text-sm border border-white/10"
                              placeholder="Name"
                            />
                            <input
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full px-2 py-1 rounded bg-white/10 text-sm border border-white/10"
                              placeholder="Email"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">
                              {user.name || "Anonymous"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            user.role === "admin"
                              ? "bg-primary/20 text-primary"
                              : "bg-white/10 text-muted-foreground",
                          )}
                        >
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            user.isPremium
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-green-500/20 text-green-500",
                          )}
                        >
                          {formatStatus(user)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {editingUser === user._id ? (
                            <>
                              <button
                                onClick={() => handleSaveUser(user._id)}
                                className="rounded-lg p-1.5 hover:bg-green-500/20 hover:text-green-400 transition-colors cursor-pointer"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="rounded-lg p-1.5 hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingUser(user._id);
                                  setEditName(user.name || "");
                                  setEditEmail(user.email || "");
                                }}
                                className="rounded-lg p-1.5 hover:bg-blue-500/20 hover:text-blue-400 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setSelectedUser(
                                    selectedUser === user._id ? null : user._id,
                                  )
                                }
                                className="rounded-lg p-1.5 hover:bg-purple-500/20 hover:text-purple-400 transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                              {user.isPremium ? (
                                <button
                                  onClick={() => handleRevokePremium(user._id)}
                                  className="rounded-lg p-1.5 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors cursor-pointer"
                                  title="Revoke Premium"
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleGrantPremium(user._id)}
                                  className="rounded-lg p-1.5 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors cursor-pointer"
                                  title="Grant Premium"
                                >
                                  <Crown className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="rounded-lg p-1.5 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {userDetail && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("admin.userDetails", lang)}:{" "}
                {userDetail.user.name || t("admin.anonymous", lang)}
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-white/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.tasks", lang)}
                  </p>
                  <p className="text-2xl font-bold">
                    {userDetail.tasks.length}
                  </p>
                </div>
                <div className="rounded-lg bg-white/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.habits", lang)}
                  </p>
                  <p className="text-2xl font-bold">
                    {userDetail.habits.length}
                  </p>
                </div>
                <div className="rounded-lg bg-white/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.transactions", lang)}
                  </p>
                  <p className="text-2xl font-bold">
                    {userDetail.transactions.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "features" && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.featureFlags", lang)}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("admin.featureFlagsDesc", lang)}
            </p>
            <div className="space-y-3">
              {Object.entries(features).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div>
                    <p className="font-medium">
                      {key.replace("features.", "")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {value
                        ? t("admin.enabled", lang)
                        : t("admin.disabled", lang)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleConfig(key, !value)}
                    className="cursor-pointer hover:bg-foreground/5 rounded transition-colors"
                  >
                    {value ? (
                      <ToggleRight className="h-8 w-8 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.adPlacements", lang)}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("admin.adPlacementsDesc", lang)}
            </p>
            <div className="space-y-3">
              {Object.entries(ads).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div>
                    <p className="font-medium">{key.replace("ads.", "")}</p>
                    <p className="text-xs text-muted-foreground">
                      {value
                        ? t("admin.active", lang)
                        : t("admin.inactive", lang)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleConfig(key, !value)}
                    className="cursor-pointer hover:bg-foreground/5 rounded transition-colors"
                  >
                    {value ? (
                      <ToggleRight className="h-8 w-8 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "content" && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {t("admin.challenges", lang)}
              </h3>
            </div>
            <div className="mb-4 p-4 rounded-lg bg-white/5">
              <h4 className="font-medium mb-3">
                {t("admin.createNewChallenge", lang)}
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={newChallenge.title}
                  onChange={(e) =>
                    setNewChallenge({ ...newChallenge, title: e.target.value })
                  }
                  placeholder={t("admin.titlePlaceholder", lang)}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm"
                />
                <input
                  value={newChallenge.description}
                  onChange={(e) =>
                    setNewChallenge({
                      ...newChallenge,
                      description: e.target.value,
                    })
                  }
                  placeholder={t("admin.descPlaceholder", lang)}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm"
                />
                <input
                  type="number"
                  value={newChallenge.goal}
                  onChange={(e) =>
                    setNewChallenge({
                      ...newChallenge,
                      goal: Number(e.target.value),
                    })
                  }
                  placeholder={t("admin.goalPlaceholder", lang)}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm"
                />
                <input
                  value={newChallenge.unit}
                  onChange={(e) =>
                    setNewChallenge({ ...newChallenge, unit: e.target.value })
                  }
                  placeholder={t("admin.unitPlaceholder", lang)}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm"
                />
              </div>
              <button
                onClick={handleCreateChallenge}
                className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
              >
                {t("admin.createChallenge", lang)}
              </button>
            </div>
            <div className="space-y-3">
              {(challenges ?? []).map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        c.isActive
                          ? "bg-green-500/20 text-green-500"
                          : "bg-white/10 text-muted-foreground",
                      )}
                    >
                      {c.isActive
                        ? t("admin.active", lang)
                        : t("admin.inactive", lang)}
                    </span>
                    <button
                      onClick={() =>
                        updateChallenge({
                          challengeId: c._id,
                          isActive: !c.isActive,
                        })
                      }
                      className="cursor-pointer hover:bg-foreground/5 rounded transition-colors"
                    >
                      {c.isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteChallenge({ challengeId: c._id })}
                      className="rounded-lg p-1.5 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.rateLimits", lang)}
            </h3>
            <div className="space-y-4">
              {Object.entries(limits).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div>
                    <p className="font-medium">
                      {key
                        .replace("limits.", "")
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.current", lang)}: {value}
                    </p>
                  </div>
                  <input
                    type="number"
                    defaultValue={value}
                    onBlur={(e) => handleSetLimit(key, Number(e.target.value))}
                    className="w-24 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-sm text-right"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.systemControls", lang)}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">
                      {t("admin.maintenanceMode", lang)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {system["system.maintenanceMode"]
                        ? t("admin.maintenanceActive", lang)
                        : t("admin.maintenanceInactive", lang)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleToggleConfig(
                      "system.maintenanceMode",
                      !system["system.maintenanceMode"],
                    )
                  }
                  className="cursor-pointer hover:bg-foreground/5 rounded transition-colors"
                >
                  {system["system.maintenanceMode"] ? (
                    <ToggleRight className="h-8 w-8 text-yellow-500" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="font-medium mb-2">
                  {t("admin.announcementBanner", lang)}
                </p>
                <div className="flex gap-2">
                  <input
                    defaultValue={system["system.announcementBanner"]}
                    onBlur={(e) =>
                      handleToggleConfig(
                        "system.announcementBanner",
                        e.target.value,
                      )
                    }
                    placeholder={t("admin.bannerPlaceholder", lang)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "finance" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass rounded-xl p-6">
              <p className="text-sm text-muted-foreground">
                {t("admin.premiumUsers", lang)}
              </p>
              <p className="text-3xl font-bold text-yellow-500">
                {financeStats?.premiumUsers ?? 0}
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <p className="text-sm text-muted-foreground">
                {t("admin.freeUsers", lang)}
              </p>
              <p className="text-3xl font-bold text-green-500">
                {financeStats?.freeUsers ?? 0}
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <p className="text-sm text-muted-foreground">
                {t("admin.totalTransactions", lang)}
              </p>
              <p className="text-3xl font-bold">
                {financeStats?.totalTransactions ?? 0}
              </p>
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.transactionOverview", lang)}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-sm text-muted-foreground">
                  {t("admin.totalIncome", lang)}
                </p>
                <p className="text-2xl font-bold text-green-500">
                  ৳{(financeStats?.totalIncome ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-sm text-muted-foreground">
                  {t("admin.totalExpense", lang)}
                </p>
                <p className="text-2xl font-bold text-red-500">
                  ৳{(financeStats?.totalExpense ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.appSettings", lang)}
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="font-medium mb-2">
                  {t("admin.defaultLanguage", lang)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleToggleConfig("settings.defaultLanguage", "en")
                    }
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                      (config as Record<string, unknown>)?.[
                        "settings.defaultLanguage"
                      ] === "en" || !config?.["settings.defaultLanguage"]
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/10 hover:bg-white/20",
                    )}
                  >
                    English
                  </button>
                  <button
                    onClick={() =>
                      handleToggleConfig("settings.defaultLanguage", "bn")
                    }
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                      (config as Record<string, unknown>)?.[
                        "settings.defaultLanguage"
                      ] === "bn"
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/10 hover:bg-white/20",
                    )}
                  >
                    বাংলা
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="font-medium">
                    {t("admin.requireEmailVerification", lang)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.requireEmailVerificationDesc", lang)}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleToggleConfig(
                      "settings.requireEmailVerification",
                      !(config as Record<string, unknown>)?.[
                        "settings.requireEmailVerification"
                      ],
                    )
                  }
                  className="cursor-pointer hover:bg-foreground/5 rounded transition-colors"
                >
                  {(config as Record<string, unknown>)?.[
                    "settings.requireEmailVerification"
                  ] ? (
                    <ToggleRight className="h-8 w-8 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="font-medium">
                    {t("admin.enableOnboarding", lang)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.enableOnboardingDesc", lang)}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleToggleConfig(
                      "settings.enableOnboarding",
                      !(config as Record<string, unknown>)?.[
                        "settings.enableOnboarding"
                      ],
                    )
                  }
                  className="cursor-pointer hover:bg-foreground/5 rounded transition-colors"
                >
                  {(config as Record<string, unknown>)?.[
                    "settings.enableOnboarding"
                  ] !== false ? (
                    <ToggleRight className="h-8 w-8 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
