import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useCallback } from "react";
import {
  Users,
  Plus,
  X,
  Shield,
  Crown,
  UserMinus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Share2,
  Copy,
  Check,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Link,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Bell,
  Target,
  DollarSign,
  Phone,
  Activity,
  Settings,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronDown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Unlock,
  ClipboardList,
  CalendarDays,
  StickyNote,
  Heart,
  MessageCircle,
  Zap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock,
  UserPlus,
  Globe,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

type Role = "admin" | "parent" | "child";

interface FamilyGroup {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: number;
}

interface FamilyMember {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  isOnline: boolean;
  privacy: {
    tasks: boolean;
    expenses: boolean;
    calendar: boolean;
    notes: boolean;
  };
}

interface Activity {
  id: string;
  memberId: string;
  action: string;
  timestamp: number;
  type: "task" | "expense" | "calendar" | "note" | "member" | "goal" | "budget";
}

interface SharedGoal {
  id: string;
  title: string;
  progress: number;
  target: number;
  assignedTo?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  priority: number;
}

const AVATARS = ["👨", "👩", "👦", "👧", "👴", "👵", "🧑", "👶"];

const ROLE_CONFIG: Record<
  Role,
  { en: string; bn: string; color: string; icon: typeof Shield }
> = {
  admin: {
    en: "Admin",
    bn: "অ্যাডমিন",
    color: "text-amber-500 bg-amber-500/10",
    icon: Crown,
  },
  parent: {
    en: "Parent",
    bn: "বাবা/মা",
    color: "text-blue-500 bg-blue-500/10",
    icon: Shield,
  },
  child: {
    en: "Child",
    bn: "সন্তান",
    color: "text-green-500 bg-green-500/10",
    icon: Heart,
  },
};

const ACTIVITY_ICONS: Record<Activity["type"], typeof ClipboardList> = {
  task: ClipboardList,
  expense: DollarSign,
  calendar: CalendarDays,
  note: StickyNote,
  member: Users,
  goal: Target,
  budget: DollarSign,
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatTimeAgo(timestamp: number, lang: "en" | "bn"): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (lang === "bn") {
    if (minutes < 1) return "এইমাত্র";
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    return `${days} দিন আগে`;
  }

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function FamilySharing() {
  const { lang } = useLang();

  const [familyGroup, setFamilyGroup] = useState<FamilyGroup>({
    id: "1",
    name: lang === "bn" ? "আহমেদ পরিবার" : "Ahmed Family",
    inviteCode: generateInviteCode(),
    // eslint-disable-next-line react-hooks/purity
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  });

  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: "1",
      name: "Rahim Ahmed",
      role: "admin",
      avatar: "👨",
      isOnline: true,
      privacy: { tasks: true, expenses: true, calendar: true, notes: true },
    },
    {
      id: "2",
      name: "Fatima Rahman",
      role: "parent",
      avatar: "👩",
      isOnline: true,
      privacy: { tasks: true, expenses: true, calendar: true, notes: true },
    },
    {
      id: "3",
      name: "Samir Ahmed",
      role: "child",
      avatar: "👦",
      isOnline: false,
      privacy: { tasks: true, expenses: false, calendar: true, notes: false },
    },
    {
      id: "4",
      name: "Nadia Ahmed",
      role: "child",
      avatar: "👧",
      isOnline: true,
      privacy: { tasks: true, expenses: false, calendar: true, notes: false },
    },
  ]);

  const [activityFeed, setActivityFeed] = useState<Activity[]>([
    {
      id: "1",
      memberId: "1",
      action:
        lang === "bn"
          ? '"বাজারে যাওয়া" কাজ সম্পন্ন করেছেন'
          : 'completed "Go to market" task',
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 30 * 60 * 1000,
      type: "task",
    },
    {
      id: "2",
      memberId: "2",
      action: lang === "bn" ? "৳২,৫০০ খরচ যোগ করেছেন" : "added ৳2,500 expense",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      type: "expense",
    },
    {
      id: "3",
      memberId: "3",
      action:
        lang === "bn" ? "পরিবারের অনুষ্ঠানে যোগ করেছেন" : "added family event",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 5 * 60 * 60 * 1000,
      type: "calendar",
    },
    {
      id: "4",
      memberId: "4",
      action: lang === "bn" ? "একটি নোট লিখেছেন" : "wrote a note",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 8 * 60 * 60 * 1000,
      type: "note",
    },
    {
      id: "5",
      memberId: "1",
      action:
        lang === "bn" ? "শেয়ার্ড লক্ষ্য তৈরি করেছেন" : "created shared goal",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 12 * 60 * 60 * 1000,
      type: "goal",
    },
    {
      id: "6",
      memberId: "2",
      action: lang === "bn" ? "বাজেট আপডেট করেছেন" : "updated budget",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      type: "budget",
    },
  ]);

  const [sharedData, setSharedData] = useState({
    tasks: true,
    expenses: true,
    calendar: true,
    notes: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>([
    {
      id: "1",
      title: lang === "bn" ? "ছুটির জন্য সঞ্চয়" : "Save for vacation",
      progress: 65000,
      target: 100000,
      assignedTo: "1",
    },
    {
      id: "2",
      title: lang === "bn" ? "পরিবারিক ব্যায়াম" : "Family fitness",
      progress: 8,
      target: 12,
    },
    {
      id: "3",
      title: lang === "bn" ? "১০টি বই একসাথে পড়ুন" : "Read 10 books together",
      progress: 4,
      target: 10,
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [familyBudget, setFamilyBudget] = useState({
    total: 80000,
    spent: 52500,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([
    {
      id: "1",
      name: lang === "bn" ? "ডাঃ কামাল" : "Dr. Kamal",
      phone: "+8801712345678",
      relation: lang === "bn" ? "পারিবারিক ডাক্তার" : "Family Doctor",
      priority: 1,
    },
    {
      id: "2",
      name: lang === "bn" ? "অগ্নি নির্বাপক" : "Fire Service",
      phone: "999",
      relation: lang === "bn" ? "জরুরি" : "Emergency",
      priority: 2,
    },
    {
      id: "3",
      name: lang === "bn" ? "পুলিশ" : "Police",
      phone: "999",
      relation: lang === "bn" ? "জরুরি" : "Emergency",
      priority: 3,
    },
  ]);

  const [inviteCode, setInviteCode] = useState(familyGroup.inviteCode);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Role>("child");
  const [activeTab, setActiveTab] = useState<
    "members" | "shared" | "activity" | "goals" | "budget" | "emergency"
  >("members");

  const isAdmin = members.find((m) => m.role === "admin")?.id === "1";

  const toggleMemberPrivacy = useCallback(
    (memberId: string, field: keyof FamilyMember["privacy"]) => {
      if (!isAdmin) return;
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId
            ? { ...m, privacy: { ...m.privacy, [field]: !m.privacy[field] } }
            : m,
        ),
      );
      setActivityFeed((prev) => [
        {
          id: Date.now().toString(),
          memberId: "1",
          action:
            lang === "bn"
              ? `${members.find((m) => m.id === memberId)?.name} -র ${field} গোপনীয়তা পরিবর্তন করেছেন`
              : `changed ${members.find((m) => m.id === memberId)?.name}'s ${field} privacy`,
          timestamp: Date.now(),
          type: "member",
        },
        ...prev,
      ]);
    },
    [isAdmin, members, lang],
  );

  const changeMemberRole = useCallback(
    (memberId: string, newRole: Role) => {
      if (!isAdmin) return;
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
      setActivityFeed((prev) => [
        {
          id: Date.now().toString(),
          memberId: "1",
          action:
            lang === "bn"
              ? `${members.find((m) => m.id === memberId)?.name} -র ভূমিকা পরিবর্তন করেছেন`
              : `changed ${members.find((m) => m.id === memberId)?.name}'s role`,
          timestamp: Date.now(),
          type: "member",
        },
        ...prev,
      ]);
    },
    [isAdmin, members, lang],
  );

  const removeMember = useCallback(
    (memberId: string) => {
      if (!isAdmin) return;
      const memberName = members.find((m) => m.id === memberId)?.name;
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setActivityFeed((prev) => [
        {
          id: Date.now().toString(),
          memberId: "1",
          action:
            lang === "bn"
              ? `${memberName} কে পরিবার থেকে সরিয়ে ফেলেছেন`
              : `removed ${memberName} from family`,
          timestamp: Date.now(),
          type: "member",
        },
        ...prev,
      ]);
    },
    [isAdmin, members, lang],
  );

  const addMember = useCallback(() => {
    if (!newMemberName.trim()) return;
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      role: newMemberRole,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      isOnline: false,
      privacy: { tasks: true, expenses: false, calendar: true, notes: false },
    };
    setMembers((prev) => [...prev, newMember]);
    setActivityFeed((prev) => [
      {
        id: Date.now().toString(),
        memberId: "1",
        action:
          lang === "bn"
            ? `${newMember.name} কে পরিবারে যোগ করেছেন`
            : `added ${newMember.name} to family`,
        timestamp: Date.now(),
        type: "member",
      },
      ...prev,
    ]);
    setNewMemberName("");
    setShowAddMemberModal(false);
  }, [newMemberName, newMemberRole, lang]);

  const generateNewInviteCode = useCallback(() => {
    const code = generateInviteCode();
    setInviteCode(code);
    setFamilyGroup((prev) => ({ ...prev, inviteCode: code }));
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, []);

  const shareViaWhatsApp = useCallback(() => {
    const text =
      lang === "bn"
        ? `পরিবারে যোগ দিন! আমন্ত্রণ কোড: ${inviteCode}`
        : `Join our family! Invite code: ${inviteCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }, [inviteCode, lang]);

  const shareViaSMS = useCallback(() => {
    const text =
      lang === "bn"
        ? `পরিবারে যোগ দিন! আমন্ত্রণ কোড: ${inviteCode}`
        : `Join our family! Invite code: ${inviteCode}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`, "_blank");
  }, [inviteCode, lang]);

  const tabs = [
    {
      key: "members" as const,
      labelEn: "Members",
      labelBn: "সদস্য",
      icon: Users,
    },
    {
      key: "shared" as const,
      labelEn: "Shared Data",
      labelBn: "শেয়ার্ড ডেটা",
      icon: Globe,
    },
    {
      key: "activity" as const,
      labelEn: "Activity",
      labelBn: "কার্যক্রম",
      icon: Activity,
    },
    {
      key: "goals" as const,
      labelEn: "Goals",
      labelBn: "লক্ষ্য",
      icon: Target,
    },
    {
      key: "budget" as const,
      labelEn: "Budget",
      labelBn: "বাজেট",
      icon: DollarSign,
    },
    {
      key: "emergency" as const,
      labelEn: "Emergency",
      labelBn: "জরুরি",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Users className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {lang === "bn" ? "পরিবার শেয়ারিং" : "Family Sharing"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {familyGroup.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="p-2 rounded-xl hover:bg-foreground/10 transition-colors"
              >
                <UserPlus className="size-5" />
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-xl hover:bg-foreground/10 transition-colors"
              >
                <Settings className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-4" />
              {members.length} {lang === "bn" ? "সদস্য" : "members"}
            </span>
            <span className="flex items-center gap-1">
              <Target className="size-4" />
              {sharedGoals.length} {lang === "bn" ? "লক্ষ্য" : "goals"}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="size-4" />
              {activityFeed.length} {lang === "bn" ? "কার্যক্রম" : "activities"}
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={fadeUp}
          className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-[var(--pv-blue)] text-white"
                    : "glass hover:bg-foreground/10"
                }`}
              >
                <Icon className="size-4" />
                {lang === "bn" ? tab.labelBn : tab.labelEn}
              </button>
            );
          })}
        </motion.div>

        {/* Members Tab */}
        {activeTab === "members" && (
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {lang === "bn" ? "পরিবারের সদস্য" : "Family Members"}
              </h2>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--pv-blue)] text-white text-sm hover:brightness-110 transition-all"
              >
                <Plus className="size-4" />
                {lang === "bn" ? "যোগ করুন" : "Add"}
              </button>
            </div>

            <div className="space-y-3">
              {members.map((member) => {
                const roleConfig = ROLE_CONFIG[member.role];
                const RoleIcon = roleConfig.icon;
                return (
                  <motion.div
                    key={member.id}
                    variants={fadeUp}
                    className="glass rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-foreground/10 flex items-center justify-center text-2xl">
                            {member.avatar}
                          </div>
                          {member.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit ${roleConfig.color}`}
                          >
                            <RoleIcon className="size-3" />
                            {roleConfig[lang]}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAdmin && member.role !== "admin" && (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) =>
                                changeMemberRole(
                                  member.id,
                                  e.target.value as Role,
                                )
                              }
                              className="bg-transparent border border-foreground/20 rounded-lg px-2 py-1 text-xs"
                            >
                              <option value="admin">
                                {lang === "bn" ? "অ্যাডমিন" : "Admin"}
                              </option>
                              <option value="parent">
                                {lang === "bn" ? "বাবা/মা" : "Parent"}
                              </option>
                              <option value="child">
                                {lang === "bn" ? "সন্তান" : "Child"}
                              </option>
                            </select>
                            <button
                              onClick={() => removeMember(member.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                            >
                              <UserMinus className="size-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Privacy Controls */}
                    {isAdmin && (
                      <div className="mt-3 pt-3 border-t border-foreground/10">
                        <div className="text-xs text-muted-foreground mb-2">
                          {lang === "bn"
                            ? "গোপনীয়তা নিয়ন্ত্রণ"
                            : "Privacy Controls"}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {(
                            ["tasks", "expenses", "calendar", "notes"] as const
                          ).map((field) => (
                            <button
                              key={field}
                              onClick={() =>
                                toggleMemberPrivacy(member.id, field)
                              }
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                                member.privacy[field]
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              {member.privacy[field] ? (
                                <Eye className="size-3" />
                              ) : (
                                <EyeOff className="size-3" />
                              )}
                              {field === "tasks" &&
                                (lang === "bn" ? "কাজ" : "Tasks")}
                              {field === "expenses" &&
                                (lang === "bn" ? "খরচ" : "Expenses")}
                              {field === "calendar" &&
                                (lang === "bn" ? "ক্যালেন্ডার" : "Calendar")}
                              {field === "notes" &&
                                (lang === "bn" ? "নোট" : "Notes")}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Shared Data Tab */}
        {activeTab === "shared" && (
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-lg font-semibold">
              {lang === "bn" ? "শেয়ার্ড ডেটা সেটিংস" : "Shared Data Settings"}
            </h2>

            <div className="space-y-3">
              {[
                {
                  key: "tasks" as const,
                  icon: ClipboardList,
                  labelEn: "Tasks",
                  labelBn: "কাজ",
                },
                {
                  key: "expenses" as const,
                  icon: DollarSign,
                  labelEn: "Expenses",
                  labelBn: "খরচ",
                },
                {
                  key: "calendar" as const,
                  icon: CalendarDays,
                  labelEn: "Calendar",
                  labelBn: "ক্যালেন্ডার",
                },
                {
                  key: "notes" as const,
                  icon: StickyNote,
                  labelEn: "Notes",
                  labelBn: "নোট",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                          <Icon className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {lang === "bn" ? item.labelBn : item.labelEn}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sharedData[item.key]
                              ? lang === "bn"
                                ? "সবার সাথে শেয়ার করা হয়েছে"
                                : "Shared with all members"
                              : lang === "bn"
                                ? "শেয়ার করা হয়নি"
                                : "Not shared"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSharedData((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key],
                          }))
                        }
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          sharedData[item.key]
                            ? "bg-[var(--pv-blue)]"
                            : "bg-foreground/20"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            sharedData[item.key] ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="size-5 text-muted-foreground" />
                <span className="font-medium">
                  {lang === "bn" ? "ডিফল্ট গোপনীয়তা" : "Default Privacy"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {lang === "bn"
                  ? "নতুন সদস্যদের জন্য ডিফল্ট গোপনীয়তা সেটিংস। এটি বদলালে বিদ্যমান সদস্যদের উপর প্রভাব ফেলবে না।"
                  : "Default privacy setting for new members. Changing this won't affect existing members."}
              </p>
            </div>
          </motion.div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-lg font-semibold">
              {lang === "bn" ? "পরিবারের কার্যক্রম" : "Family Activity"}
            </h2>

            <div className="space-y-2">
              {activityFeed.map((activity) => {
                const member = members.find((m) => m.id === activity.memberId);
                const Icon = ACTIVITY_ICONS[activity.type];
                return (
                  <motion.div
                    key={activity.id}
                    variants={fadeUp}
                    className="glass rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">
                          {member?.name || "Unknown"}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {activity.action}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp, lang)}
                      </div>
                    </div>
                    <div className="text-2xl">{member?.avatar}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Goals Tab */}
        {activeTab === "goals" && (
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {lang === "bn" ? "শেয়ার্ড লক্ষ্য" : "Shared Goals"}
              </h2>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--pv-blue)] text-white text-sm hover:brightness-110 transition-all">
                <Plus className="size-4" />
                {lang === "bn" ? "যোগ করুন" : "Add"}
              </button>
            </div>

            <div className="space-y-3">
              {sharedGoals.map((goal) => {
                const progress = Math.round(
                  (goal.progress / goal.target) * 100,
                );
                const assignedMember = goal.assignedTo
                  ? members.find((m) => m.id === goal.assignedTo)
                  : null;
                return (
                  <motion.div
                    key={goal.id}
                    variants={fadeUp}
                    className="glass rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium">{goal.title}</div>
                        {assignedMember && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span>{assignedMember.avatar}</span>
                            {assignedMember.name}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-[var(--pv-blue)]">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {goal.progress.toLocaleString()} /{" "}
                      {goal.target.toLocaleString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Budget Tab */}
        {activeTab === "budget" && (
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-lg font-semibold">
              {lang === "bn" ? "পারিবারিক বাজেট" : "Family Budget"}
            </h2>

            <div className="glass rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold">
                  ৳{familyBudget.spent.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {lang === "bn" ? "ব্যবহৃত" : "of"} ৳
                  {familyBudget.total.toLocaleString()}{" "}
                  {lang === "bn" ? "ব্যবহৃত" : "spent"}
                </div>
              </div>

              <div className="w-full h-3 bg-foreground/10 rounded-full overflow-hidden mb-4">
                <motion.div
                  className={`h-full rounded-full ${
                    familyBudget.spent / familyBudget.total > 0.9
                      ? "bg-red-500"
                      : familyBudget.spent / familyBudget.total > 0.7
                        ? "bg-amber-500"
                        : "bg-green-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(familyBudget.spent / familyBudget.total) * 100}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {lang === "bn" ? "বাকি" : "Remaining"}:{" "}
                  <span className="font-medium text-foreground">
                    ৳
                    {(familyBudget.total - familyBudget.spent).toLocaleString()}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {Math.round((familyBudget.spent / familyBudget.total) * 100)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  ৳{(familyBudget.total * 0.6).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === "bn" ? "খাদ্য ও বাসস্থান" : "Food & Housing"}
                </div>
              </div>
              <div className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  ৳{(familyBudget.total * 0.15).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === "bn" ? "শিক্ষা" : "Education"}
                </div>
              </div>
              <div className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-500">
                  ৳{(familyBudget.total * 0.15).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === "bn" ? "বিনোদন" : "Entertainment"}
                </div>
              </div>
              <div className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-500">
                  ৳{(familyBudget.total * 0.1).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === "bn" ? "সঞ্চয়" : "Savings"}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Emergency Tab */}
        {activeTab === "emergency" && (
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {lang === "bn" ? "জরুরি যোগাযোগ" : "Emergency Contacts"}
              </h2>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--pv-blue)] text-white text-sm hover:brightness-110 transition-all">
                <Plus className="size-4" />
                {lang === "bn" ? "যোগ করুন" : "Add"}
              </button>
            </div>

            <div className="space-y-3">
              {emergencyContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  variants={fadeUp}
                  className="glass rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <Phone className="size-5 text-red-500" />
                      </div>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {contact.relation}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:brightness-110 transition-all"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="size-5" />
                <span className="font-medium">
                  {lang === "bn" ? "জরুরি নম্বর" : "Emergency Numbers"}
                </span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{lang === "bn" ? "পুলিশ" : "Police"}</span>
                  <span className="font-medium">999</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {lang === "bn" ? "অগ্নি নির্বাপক" : "Fire Service"}
                  </span>
                  <span className="font-medium">999</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === "bn" ? "অ্যাম্বুলেন্স" : "Ambulance"}</span>
                  <span className="font-medium">999</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {lang === "bn" ? "সদস্য আমন্ত্রণ" : "Invite Member"}
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    {lang === "bn" ? "আমন্ত্রণ কোড" : "Invite Code"}
                  </div>
                  <div className="text-3xl font-mono font-bold tracking-wider text-[var(--pv-blue)]">
                    {inviteCode}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(inviteCode)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl glass hover:bg-foreground/10 transition-colors"
                  >
                    {copiedCode ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    {copiedCode
                      ? lang === "bn"
                        ? "কপি হয়েছে!"
                        : "Copied!"
                      : lang === "bn"
                        ? "কোড কপি"
                        : "Copy Code"}
                  </button>
                  <button
                    onClick={generateNewInviteCode}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-foreground/10 transition-colors"
                  >
                    <Zap className="size-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white hover:brightness-110 transition-all"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={shareViaSMS}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white hover:brightness-110 transition-all"
                  >
                    <Smartphone className="size-4" />
                    SMS
                  </button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  {lang === "bn"
                    ? "আমন্ত্রণ কোড শেয়ার করুন এবং পরিবারে যোগ দিতে দিন"
                    : "Share the invite code and let them join your family"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {lang === "bn" ? "পরিবার সেটিংস" : "Family Settings"}
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {lang === "bn" ? "পরিবারের নাম" : "Group Name"}
                  </label>
                  <input
                    type="text"
                    value={familyGroup.name}
                    onChange={(e) =>
                      setFamilyGroup((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl glass border border-foreground/20 focus:outline-none focus:border-[var(--pv-blue)]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    {lang === "bn" ? "নোটিফিকেশন" : "Notifications"}
                  </div>
                  {[
                    { labelEn: "Task Updates", labelBn: "কাজ আপডেট" },
                    { labelEn: "Expense Alerts", labelBn: "খরচ সতর্কতা" },
                    {
                      labelEn: "Calendar Events",
                      labelBn: "ক্যালেন্ডার ইভেন্ট",
                    },
                    { labelEn: "Member Activity", labelBn: "সদস্য কার্যক্রম" },
                  ].map((item) => (
                    <div
                      key={item.labelEn}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">
                        {lang === "bn" ? item.labelBn : item.labelEn}
                      </span>
                      <button className="relative w-10 h-5 rounded-full bg-[var(--pv-blue)]">
                        <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white translate-x-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    {lang === "bn" ? "ডিফল্ট গোপনীয়তা" : "Default Privacy"}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-xl bg-[var(--pv-blue)] text-white text-sm">
                      {lang === "bn" ? "সব শেয়ার" : "Share All"}
                    </button>
                    <button className="flex-1 py-2 rounded-xl glass text-sm">
                      {lang === "bn" ? "সীমিত" : "Limited"}
                    </button>
                    <button className="flex-1 py-2 rounded-xl glass text-sm">
                      {lang === "bn" ? "ব্যক্তিগত" : "Private"}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-foreground/10">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="w-full py-2.5 rounded-xl bg-[var(--pv-blue)] text-white font-medium hover:brightness-110 transition-all"
                  >
                    {lang === "bn" ? "সংরক্ষণ" : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddMemberModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {lang === "bn" ? "সদস্য যোগ করুন" : "Add Member"}
                </h3>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {lang === "bn" ? "নাম" : "Name"}
                  </label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder={lang === "bn" ? "সদস্যের নাম" : "Member name"}
                    className="w-full px-3 py-2 rounded-xl glass border border-foreground/20 focus:outline-none focus:border-[var(--pv-blue)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {lang === "bn" ? "ভূমিকা" : "Role"}
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl glass border border-foreground/20 focus:outline-none focus:border-[var(--pv-blue)]"
                  >
                    <option value="admin">
                      {lang === "bn" ? "অ্যাডমিন" : "Admin"}
                    </option>
                    <option value="parent">
                      {lang === "bn" ? "বাবা/মা" : "Parent"}
                    </option>
                    <option value="child">
                      {lang === "bn" ? "সন্তান" : "Child"}
                    </option>
                  </select>
                </div>

                <button
                  onClick={addMember}
                  disabled={!newMemberName.trim()}
                  className="w-full py-2.5 rounded-xl bg-[var(--pv-blue)] text-white font-medium hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {lang === "bn" ? "যোগ করুন" : "Add Member"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
