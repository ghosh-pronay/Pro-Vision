import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useCallback } from "react";
import {
  Users,
  Globe,
  Activity,
  Target,
  DollarSign,
  AlertTriangle,
  UserPlus,
  Settings,
} from "lucide-react";
import {
  MembersTab,
  SharedDataTab,
  ActivityTab,
  GoalsTab,
  BudgetTab,
  EmergencyTab,
  InviteModal,
  SettingsModal,
  AddMemberModal,
} from "@/components/family-sharing";
import type {
  Role,
  FamilyGroup,
  FamilyMember,
  Activity as ActivityType,
  SharedGoal,
  EmergencyContact,
} from "@/components/family-sharing";
import { AVATARS, generateInviteCode } from "@/components/family-sharing";

const NOW = Date.now();

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export default function FamilySharing() {
  const { lang } = useLang();

  const [familyGroup, setFamilyGroup] = useState<FamilyGroup>({
    id: "1",
    name: lang === "bn" ? "আহমেদ পরিবার" : "Ahmed Family",
    inviteCode: generateInviteCode(),
    createdAt: NOW - 30 * 24 * 60 * 60 * 1000,
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

  const [activityFeed, setActivityFeed] = useState<ActivityType[]>([
    {
      id: "1",
      memberId: "1",
      action:
        lang === "bn"
          ? '"বাজারে যাওয়া" কাজ সম্পন্ন করেছেন'
          : 'completed "Go to market" task',
      timestamp: NOW - 30 * 60 * 1000,
      type: "task",
    },
    {
      id: "2",
      memberId: "2",
      action: lang === "bn" ? "৳২,৫০০ খরচ যোগ করেছেন" : "added ৳2,500 expense",
      timestamp: NOW - 2 * 60 * 60 * 1000,
      type: "expense",
    },
    {
      id: "3",
      memberId: "3",
      action:
        lang === "bn" ? "পরিবারের অনুষ্ঠানে যোগ করেছেন" : "added family event",
      timestamp: NOW - 5 * 60 * 60 * 1000,
      type: "calendar",
    },
    {
      id: "4",
      memberId: "4",
      action: lang === "bn" ? "একটি নোট লিখেছেন" : "wrote a note",
      timestamp: NOW - 8 * 60 * 60 * 1000,
      type: "note",
    },
    {
      id: "5",
      memberId: "1",
      action:
        lang === "bn" ? "শেয়ার্ড লক্ষ্য তৈরি করেছেন" : "created shared goal",
      timestamp: NOW - 12 * 60 * 60 * 1000,
      type: "goal",
    },
    {
      id: "6",
      memberId: "2",
      action: lang === "bn" ? "বাজেট আপডেট করেছেন" : "updated budget",
      timestamp: NOW - 24 * 60 * 60 * 1000,
      type: "budget",
    },
  ]);

  const [sharedData, setSharedData] = useState({
    tasks: true,
    expenses: true,
    calendar: true,
    notes: false,
  });

  const [sharedGoals] = useState<SharedGoal[]>([
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

  const [familyBudget] = useState({
    total: 80000,
    spent: 52500,
  });

  const [emergencyContacts] = useState<EmergencyContact[]>([
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

        {/* Tab Content */}
        {activeTab === "members" && (
          <MembersTab
            members={members}
            isAdmin={isAdmin}
            lang={lang}
            onAddClick={() => setShowAddMemberModal(true)}
            onChangeRole={changeMemberRole}
            onRemoveMember={removeMember}
            onTogglePrivacy={toggleMemberPrivacy}
          />
        )}

        {activeTab === "shared" && (
          <SharedDataTab
            sharedData={sharedData}
            lang={lang}
            onToggle={(key) =>
              setSharedData((prev) => ({ ...prev, [key]: !prev[key] }))
            }
          />
        )}

        {activeTab === "activity" && (
          <ActivityTab
            activityFeed={activityFeed}
            members={members}
            lang={lang}
          />
        )}

        {activeTab === "goals" && (
          <GoalsTab sharedGoals={sharedGoals} members={members} lang={lang} />
        )}

        {activeTab === "budget" && (
          <BudgetTab familyBudget={familyBudget} lang={lang} />
        )}

        {activeTab === "emergency" && (
          <EmergencyTab emergencyContacts={emergencyContacts} lang={lang} />
        )}
      </motion.div>

      {/* Modals */}
      <InviteModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteCode={inviteCode}
        copiedCode={copiedCode}
        lang={lang}
        onCopy={copyToClipboard}
        onGenerate={generateNewInviteCode}
        onShareWhatsApp={shareViaWhatsApp}
        onShareSMS={shareViaSMS}
      />

      <SettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        familyGroup={familyGroup}
        lang={lang}
        onUpdateGroup={(name) => setFamilyGroup((prev) => ({ ...prev, name }))}
      />

      <AddMemberModal
        open={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        name={newMemberName}
        role={newMemberRole}
        lang={lang}
        onNameChange={setNewMemberName}
        onRoleChange={setNewMemberRole}
        onAdd={addMember}
      />
    </div>
  );
}
