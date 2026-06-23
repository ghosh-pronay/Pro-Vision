import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { useState, useCallback, useMemo } from "react";
import {
  Shield,
  Lock,
  Unlock,
  Key,
  Clock,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  FileText,
  Heart,
  Phone,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
  Settings,
  History,
  Link2,
  Timer,
} from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast-helpers";

const NOW = Date.now();
const SHARE_RANDOM_ID = Math.random().toString(36).substring(2, 15);

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface EncryptionEvent {
  id: string;
  action: "encrypt" | "decrypt" | "password_change" | "auto_lock" | "share";
  dataType?: string;
  timestamp: number;
  details?: string;
}

interface EncryptedFieldType {
  key: keyof EncryptedFields;
  labelKey: TranslationKey;
  icon: React.ElementType;
  color: string;
}

interface EncryptedFields {
  financial: boolean;
  notes: boolean;
  health: boolean;
  contacts: boolean;
}

const ENCRYPTED_FIELDS: EncryptedFieldType[] = [
  {
    key: "financial",
    labelKey: "encryption.financial",
    icon: DollarSign,
    color: "text-green-500",
  },
  {
    key: "notes",
    labelKey: "encryption.notes",
    icon: FileText,
    color: "text-blue-500",
  },
  {
    key: "health",
    labelKey: "encryption.health",
    icon: Heart,
    color: "text-red-500",
  },
  {
    key: "contacts",
    labelKey: "encryption.contacts",
    icon: Phone,
    color: "text-purple-500",
  },
];

const AUTO_LOCK_TIMEOUTS = [1, 5, 10, 15, 30];

const SHARE_EXPIRATIONS = [
  { value: 1, labelKey: "encryption.hours" as TranslationKey },
  { value: 24, labelKey: "encryption.hours" as TranslationKey },
  { value: 72, labelKey: "encryption.hours" as TranslationKey },
  { value: 168, labelKey: "encryption.hours" as TranslationKey },
];

function getPasswordStrength(password: string): {
  level: number;
  label: TranslationKey;
  color: string;
} {
  if (!password)
    return { level: 0, label: "encryption.weak", color: "bg-gray-400" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2)
    return { level: 1, label: "encryption.weak", color: "bg-red-500" };
  if (score <= 3)
    return { level: 2, label: "encryption.fair", color: "bg-orange-500" };
  if (score <= 4)
    return { level: 3, label: "encryption.strong", color: "bg-blue-500" };
  return { level: 4, label: "encryption.excellent", color: "bg-green-500" };
}

export default function DataEncryption() {
  const { lang } = useLang();
  const tc = useCallback((key: TranslationKey) => t(key, lang), [lang]);

  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [encryptedFields, setEncryptedFields] = useState<EncryptedFields>({
    financial: true,
    notes: false,
    health: false,
    contacts: false,
  });
  const [passwordSet, setPasswordSet] = useState(true);
  const [autoLock, setAutoLock] = useState(true);
  const [autoLockTimeout, setAutoLockTimeout] = useState(5);
  const [lockAction, setLockAction] = useState<"encrypt" | "lockscreen">(
    "encrypt",
  );
  const [backupEncryption, setBackupEncryption] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [sharePassword, setSharePassword] = useState("");
  const [shareExpiration, setShareExpiration] = useState(24);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAutoLockSettings, setShowAutoLockSettings] = useState(false);
  const [showBackupSettings, setShowBackupSettings] = useState(false);

  const [encryptionHistory, setEncryptionHistory] = useState<EncryptionEvent[]>(
    [
      {
        id: "1",
        action: "encrypt",
        dataType: "encryption.financial",
        timestamp: NOW - 3600000,
        details: "AES-256",
      },
      {
        id: "2",
        action: "password_change",
        timestamp: NOW - 86400000,
      },
      {
        id: "3",
        action: "encrypt",
        dataType: "encryption.health",
        timestamp: NOW - 172800000,
        details: "AES-256",
      },
      {
        id: "4",
        action: "auto_lock",
        timestamp: NOW - 259200000,
      },
      {
        id: "5",
        action: "share",
        timestamp: NOW - 345600000,
        details: "72h expiration",
      },
    ],
  );

  const newStrength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword],
  );

  const securityScore = useMemo(() => {
    let score = 0;
    if (passwordSet) score += 25;
    const encryptedCount =
      Object.values(encryptedFields).filter(Boolean).length;
    score += (encryptedCount / 4) * 40;
    if (autoLock) score += 15;
    if (backupEncryption) score += 20;
    return Math.min(100, Math.round(score));
  }, [passwordSet, encryptedFields, autoLock, backupEncryption]);

  const handlePasswordChange = () => {
    if (!newPassword) {
      toastError(tc("encryption.passwordRequired"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError(tc("encryption.passwordsDoNotMatch"));
      return;
    }
    setPasswordSet(true);
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
    addHistoryEvent("password_change");
    toastSuccess(tc("encryption.passwordChanged"));
  };

  const handleToggleField = (field: keyof EncryptedFields) => {
    setEncryptedFields((prev) => {
      const newVal = !prev[field];
      addHistoryEvent(newVal ? "encrypt" : "decrypt", `encryption.${field}`);
      return { ...prev, [field]: newVal };
    });
  };

  const handleToggleEncryption = () => {
    setEncryptionEnabled((prev) => {
      addHistoryEvent(prev ? "decrypt" : "encrypt");
      return !prev;
    });
  };

  const generateShareLink = () => {
    if (!sharePassword) {
      toastError(tc("encryption.passwordRequired"));
      return;
    }
    const link = `https://pro-vision.app/share/${SHARE_RANDOM_ID}`;
    setGeneratedLink(link);
    setCopiedLink(false);
    addHistoryEvent("share", undefined, `${shareExpiration}h`);
    toastSuccess(tc("encryption.linkGenerated"));
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopiedLink(true);
      toastSuccess(tc("encryption.linkCopied"));
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error("[DataEncryption]", "encryption operation failed", e);
      toastError("Failed to copy link");
    }
  };

  const addHistoryEvent = (
    action: EncryptionEvent["action"],
    dataType?: string,
    details?: string,
  ) => {
    const event: EncryptionEvent = {
      id: Date.now().toString(),
      action,
      dataType,
      timestamp: Date.now(),
      details,
    };
    setEncryptionHistory((prev) => [event, ...prev].slice(0, 20));
  };

  const getScoreColor = () => {
    if (securityScore >= 80) return "from-green-500 to-emerald-500";
    if (securityScore >= 60) return "from-blue-500 to-cyan-500";
    if (securityScore >= 40) return "from-orange-500 to-yellow-500";
    return "from-red-500 to-pink-500";
  };

  const getScoreLabel = () => {
    if (securityScore >= 80) return tc("encryption.excellent");
    if (securityScore >= 60) return tc("encryption.strong");
    if (securityScore >= 40) return tc("encryption.fair");
    return tc("encryption.weak");
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor((nowRef.current - ms) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getActionIcon = (action: EncryptionEvent["action"]) => {
    switch (action) {
      case "encrypt":
        return Lock;
      case "decrypt":
        return Unlock;
      case "password_change":
        return Key;
      case "auto_lock":
        return Clock;
      case "share":
        return Share2;
      default:
        return Shield;
    }
  };

  const getActionColor = (action: EncryptionEvent["action"]) => {
    switch (action) {
      case "encrypt":
        return "text-green-500 bg-green-500/10";
      case "decrypt":
        return "text-orange-500 bg-orange-500/10";
      case "password_change":
        return "text-blue-500 bg-blue-500/10";
      case "auto_lock":
        return "text-purple-500 bg-purple-500/10";
      case "share":
        return "text-cyan-500 bg-cyan-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const SECURITY_TIPS = [
    tc("encryption.tip1"),
    tc("encryption.tip2"),
    tc("encryption.tip3"),
    tc("encryption.tip4"),
    tc("encryption.tip5"),
  ];

  return (
    <div className="space-y-6 pb-24">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-[var(--pv-blue)]/10 flex items-center justify-center">
            <Shield className="size-5 text-[var(--pv-blue)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tc("encryption.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {tc("encryption.subtitle")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Security Score Card */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.05 }}
      >
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            {securityScore >= 70 ? (
              <ShieldCheck className="size-6 text-green-500" />
            ) : (
              <ShieldAlert className="size-6 text-orange-500" />
            )}
            <div>
              <h2 className="font-semibold">
                {tc("encryption.securityScore")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {tc("encryption.securityScoreDesc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - securityScore / 100)}`}
                  className={`stroke-current bg-gradient-to-r ${getScoreColor()}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{securityScore}</span>
                <span className="text-[10px] text-muted-foreground">
                  {getScoreLabel()}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {tc("encryption.password")}
                </span>
                <Check
                  className={`size-4 ${passwordSet ? "text-green-500" : "text-red-500"}`}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {tc("encryption.encryptedFields")}
                </span>
                <span className="text-sm font-medium">
                  {Object.values(encryptedFields).filter(Boolean).length}/4
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {tc("encryption.autoLock")}
                </span>
                <Check
                  className={`size-4 ${autoLock ? "text-green-500" : "text-red-500"}`}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {tc("encryption.backupEncryption")}
                </span>
                <Check
                  className={`size-4 ${backupEncryption ? "text-green-500" : "text-red-500"}`}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Encryption Status */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lock className="size-5 text-muted-foreground" />
              <div>
                <h2 className="font-semibold">{tc("encryption.status")}</h2>
                <p className="text-xs text-muted-foreground">
                  {encryptionEnabled
                    ? tc("encryption.enabled")
                    : tc("encryption.disabled")}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleEncryption}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                encryptionEnabled ? "bg-green-500" : "bg-muted"
              }`}
            >
              <motion.div
                className="absolute top-1 h-4 w-4 rounded-full bg-white"
                animate={{ left: encryptionEnabled ? 28 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
            <Info className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              {tc("encryption.algorithm")}: AES-256 —{" "}
              {tc("encryption.algorithmDesc")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Encrypted Fields */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.15 }}
      >
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="size-5 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">
                {tc("encryption.encryptedFields")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {tc("encryption.encryptedFieldsDesc")}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {ENCRYPTED_FIELDS.map((field) => {
              const Icon = field.icon;
              const isActive = encryptedFields[field.key];
              return (
                <div
                  key={field.key}
                  className="flex items-center justify-between p-3 glass-subtle rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center`}
                    >
                      <Icon className={`size-4 ${field.color}`} />
                    </div>
                    <span className="text-sm font-medium">
                      {tc(field.labelKey)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleField(field.key)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      isActive ? "bg-green-500" : "bg-muted"
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
                      animate={{ left: isActive ? 22 : 2 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Password Management */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="size-5 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">{tc("encryption.password")}</h2>
              <p className="text-xs text-muted-foreground">
                {tc("encryption.changePassword")}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {tc("encryption.currentPassword")}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {tc("encryption.newPassword")}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {tc("encryption.passwordStrength")}:
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        newStrength.level >= 3
                          ? "text-green-500"
                          : newStrength.level >= 2
                            ? "text-blue-500"
                            : "text-orange-500"
                      }`}
                    >
                      {tc(newStrength.label)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= newStrength.level
                            ? newStrength.color
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {tc("encryption.confirmPassword")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              className="w-full py-2.5 rounded-xl bg-[var(--pv-blue)] text-white text-sm font-medium hover:brightness-110 transition-all"
            >
              {tc("encryption.changePassword")}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Auto-Lock Settings */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.25 }}
      >
        <div className="glass rounded-2xl p-6">
          <button
            onClick={() => setShowAutoLockSettings(!showAutoLockSettings)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Timer className="size-5 text-muted-foreground" />
              <div className="text-left">
                <h2 className="font-semibold">{tc("encryption.autoLock")}</h2>
                <p className="text-xs text-muted-foreground">
                  {tc("encryption.autoLockDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoLock(!autoLock);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoLock ? "bg-green-500" : "bg-muted"
                }`}
              >
                <motion.div
                  className="absolute top-1 h-4 w-4 rounded-full bg-white"
                  animate={{ left: autoLock ? 28 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              {showAutoLockSettings ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </div>
          </button>
          <AnimatePresence>
            {showAutoLockSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      {tc("encryption.lockTimeout")}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {AUTO_LOCK_TIMEOUTS.map((timeout) => (
                        <button
                          key={timeout}
                          onClick={() => setAutoLockTimeout(timeout)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            autoLockTimeout === timeout
                              ? "bg-[var(--pv-blue)] text-white"
                              : "glass-subtle hover:bg-muted/50"
                          }`}
                        >
                          {timeout} {tc("encryption.min")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      {tc("encryption.lockAction")}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLockAction("encrypt")}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          lockAction === "encrypt"
                            ? "bg-[var(--pv-blue)] text-white"
                            : "glass-subtle hover:bg-muted/50"
                        }`}
                      >
                        <Lock className="size-4" />
                        {tc("encryption.encryptAll")}
                      </button>
                      <button
                        onClick={() => setLockAction("lockscreen")}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          lockAction === "lockscreen"
                            ? "bg-[var(--pv-blue)] text-white"
                            : "glass-subtle hover:bg-muted/50"
                        }`}
                      >
                        <Shield className="size-4" />
                        {tc("encryption.lockScreen")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Backup Encryption */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        <div className="glass rounded-2xl p-6">
          <button
            onClick={() => setShowBackupSettings(!showBackupSettings)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Zap className="size-5 text-muted-foreground" />
              <div className="text-left">
                <h2 className="font-semibold">
                  {tc("encryption.backupEncryption")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {tc("encryption.backupEncryptionDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBackupEncryption(!backupEncryption);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  backupEncryption ? "bg-green-500" : "bg-muted"
                }`}
              >
                <motion.div
                  className="absolute top-1 h-4 w-4 rounded-full bg-white"
                  animate={{ left: backupEncryption ? 28 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              {showBackupSettings ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </div>
          </button>
          <AnimatePresence>
            {showBackupSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <button
                    onClick={() => setBackupEncryption(!backupEncryption)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      backupEncryption
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "glass-subtle hover:bg-muted/50"
                    }`}
                  >
                    {backupEncryption ? (
                      <>
                        <Lock className="size-4" />
                        {tc("encryption.enabled")}
                      </>
                    ) : (
                      <>
                        <Unlock className="size-4" />
                        {tc("encryption.enableBackupEncryption")}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Encryption History */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.35 }}
      >
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <History className="size-5 text-muted-foreground" />
            <h2 className="font-semibold">{tc("encryption.history")}</h2>
          </div>
          {encryptionHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {tc("encryption.noHistory")}
            </div>
          ) : (
            <div className="space-y-2">
              {encryptionHistory.map((event) => {
                const ActionIcon = getActionIcon(event.action);
                const colorClass = getActionColor(event.action);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 glass-subtle rounded-xl"
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorClass}`}
                    >
                      <ActionIcon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium capitalize">
                        {event.action.replace("_", " ")}
                      </div>
                      {event.dataType && (
                        <div className="text-xs text-muted-foreground">
                          {tc(event.dataType as TranslationKey)}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-muted-foreground">
                        {formatTime(event.timestamp)}
                      </div>
                      {event.details && (
                        <div className="text-[10px] text-muted-foreground">
                          {event.details}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Secure Share */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Link2 className="size-5 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">{tc("encryption.secureShare")}</h2>
              <p className="text-xs text-muted-foreground">
                {tc("encryption.generateLink")}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {tc("encryption.sharePassword")}
              </label>
              <input
                type="password"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={tc("encryption.sharePassword")}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {tc("encryption.expiration")}
              </label>
              <div className="flex gap-2">
                {SHARE_EXPIRATIONS.map((exp) => (
                  <button
                    key={exp.value}
                    onClick={() => setShareExpiration(exp.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      shareExpiration === exp.value
                        ? "bg-[var(--pv-blue)] text-white"
                        : "glass-subtle hover:bg-muted/50"
                    }`}
                  >
                    {exp.value < 24
                      ? `${exp.value}${tc("encryption.min").charAt(0)}`
                      : `${exp.value / 24}${tc("encryption.days").charAt(0)}`}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={generateShareLink}
              className="w-full py-2.5 rounded-xl bg-[var(--pv-blue)] text-white text-sm font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Link2 className="size-4" />
              {tc("encryption.generateLink")}
            </button>
            {generatedLink && (
              <div className="flex items-center gap-2 p-3 glass-subtle rounded-xl">
                <input
                  readOnly
                  value={generatedLink}
                  className="flex-1 bg-transparent text-sm text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={copyShareLink}
                  className="shrink-0 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {copiedLink ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Security Tips */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.45 }}
      >
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="size-5 text-yellow-500" />
            <h2 className="font-semibold">{tc("encryption.securityTips")}</h2>
          </div>
          <div className="space-y-3">
            {SECURITY_TIPS.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 glass-subtle rounded-xl"
              >
                <div className="h-6 w-6 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-yellow-500">
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
