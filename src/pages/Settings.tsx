import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAppStore } from "@/store"
import { useAuth } from "@/hooks/use-auth"
import { useI18n } from "@/hooks/use-i18n"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Download,
  Upload,
  Trash2,
  Globe,
  Palette,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
  Clock,
  Database,
  LayoutGrid,
  Snowflake,
  Camera,
} from "lucide-react"
import NotificationsPanel from "@/components/NotificationsPanel"
import { DataBackup } from "@/components/ui/DataBackup"
import DashboardWidgetCustomizer from "@/components/DashboardWidgetCustomizer"
import StreakFreeze from "@/components/StreakFreeze"
import { TIMEZONE_OPTIONS, AVATAR_EMOJIS } from "@/lib/constants"
import { logger } from "@/lib/logger"

export default function Settings() {
  const { theme, setTheme, language, setLanguage } = useAppStore()
  const { signOut, user } = useAuth()
  const { t, lang } = useI18n()

  const profile = useQuery(api.userProfiles.get)
  const upsertProfile = useMutation(api.userProfiles.upsert, "userProfiles")
  const setupFirstAdmin = useMutation(api.admin.setupFirstAdmin, "admin")
  const hasAdmin = useQuery(api.admin.hasAdmin)
  const [adminMessage, setAdminMessage] = useState("")

  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formCurrency, setFormCurrency] = useState("BDT")
  const [formTimezone, setFormTimezone] = useState("Asia/Dhaka")
  const [formGender, setFormGender] = useState<string>("")
  const [formDob, setFormDob] = useState("")
  const [formNotifications, setFormNotifications] = useState(true)
  const [formWeeklyReport, setFormWeeklyReport] = useState(false)
  const [formAvatar, setFormAvatar] = useState("😀")
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const [darkModeSchedule, setDarkModeSchedule] = useState(false)
  const [darkModeStart, setDarkModeStart] = useState("20:00")
  const [darkModeEnd, setDarkModeEnd] = useState("06:00")

  const syncProfileRef = useRef<((p: unknown) => void) | null>(null)

  useEffect(() => {
    syncProfileRef.current = (p) => {
      const prof = p as {
        displayName?: string
        email?: string
        phone?: string
        currency?: string
        timezone?: string
        gender?: string
        dateOfBirth?: number
        notificationsEnabled?: boolean
        weeklyEmailReport?: boolean
        avatar?: string
      }
      setFormName(prof.displayName || "")
      setFormEmail(prof.email || "")
      setFormPhone(prof.phone || "")
      setFormCurrency(prof.currency || "BDT")
      setFormTimezone(prof.timezone || "Asia/Dhaka")
      setFormGender(prof.gender || "")
      if (prof.dateOfBirth) {
        const d = new Date(prof.dateOfBirth)
        setFormDob(d.toISOString().split("T")[0])
      }
      setFormNotifications(prof.notificationsEnabled ?? true)
      setFormWeeklyReport(prof.weeklyEmailReport ?? false)
      setFormAvatar(prof.avatar || "😀")
    }
  })

  useEffect(() => {
    if (profile) {
      syncProfileRef.current?.(profile)
    }
  }, [profile])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await upsertProfile({
        displayName: formName,
        email: formEmail || undefined,
        phone: formPhone,
        currency: formCurrency,
        timezone: formTimezone,
        gender: formGender || undefined,
        dateOfBirth: formDob ? new Date(formDob).getTime() : undefined,
        notificationsEnabled: formNotifications,
        weeklyEmailReport: formWeeklyReport,
        avatar: formAvatar,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme as "light" | "dark" | "oled" | "system")
    try {
      await upsertProfile({
        theme: newTheme as "light" | "dark" | "oled" | "system",
      })
    } catch (e) {
      logger.error("Settings", "operation failed", e)
    }
  }

  const handleLanguageChange = async (newLang: string) => {
    setLanguage(newLang as "en" | "bn")
    try {
      await upsertProfile({ language: newLang as "en" | "bn" })
    } catch (e) {
      logger.error("Settings", "operation failed", e)
    }
  }

  const sections = [
    {
      id: "profile",
      icon: User,
      title: t.settings.profile,
      description: t.settings.profileDescription,
    },
    {
      id: "appearance",
      icon: Palette,
      title: t.settings.appearance,
      description: t.settings.appearanceDescription,
    },
    {
      id: "notifications",
      icon: Bell,
      title: t.settings.notifications,
      description: t.settings.notificationsDescription,
    },
    {
      id: "premium",
      icon: CreditCard,
      title: t.settings.premiumTitle,
      description: t.settings.premiumDescription,
    },
    {
      id: "security",
      icon: Shield,
      title: t.settings.securityPrivacy,
      description: t.settings.securityDescription,
    },
    {
      id: "backup",
      icon: Download,
      title: t.settings.backupRestore,
      description: t.settings.backupDescription,
    },
    {
      id: "notifications-panel",
      icon: Bell,
      title: t.settings.smartNotifications,
      description: t.settings.smartNotificationsDescription,
    },
    {
      id: "data-backup",
      icon: Database,
      title: t.settings.dataBackup,
      description: t.settings.dataBackupDescription,
    },
    {
      id: "widgets",
      icon: LayoutGrid,
      title: t.settings.widgets,
      description: t.settings.widgetsDescription,
    },
    {
      id: "streak-freeze",
      icon: Snowflake,
      title: t.settings.streakFreeze,
      description: t.settings.streakFreezeDescription,
    },
    {
      id: "help",
      icon: HelpCircle,
      title: t.settings.helpSupport,
      description: t.settings.helpDescription,
    },
  ]

  const renderSection = () => {
    if (profile === undefined) {
      return <p className="text-muted-foreground">{t.common.loading}</p>
    }

    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t.settings.profileSettings}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="w-20 h-20 rounded-2xl bg-foreground/5 flex items-center justify-center text-4xl hover:bg-foreground/10 transition-colors border border-border"
                    aria-label={t.settings.changeAvatar}
                  >
                    {formAvatar}
                  </button>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1">
                    <Camera className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t.settings.profilePicture}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.selectAvatar}
                  </p>
                </div>
              </div>
              {showAvatarPicker && (
                <div className="grid grid-cols-8 gap-2 p-3 rounded-lg border bg-background">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setFormAvatar(emoji)
                        setShowAvatarPicker(false)
                      }}
                      className={`text-2xl p-1.5 rounded-lg hover:bg-foreground/5 transition-colors ${
                        formAvatar === emoji
                          ? "bg-primary/10 ring-2 ring-primary"
                          : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="text-sm font-medium">
                  {t.settings.displayName}
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder={t.settings.enterName}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t.settings.email}
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t.settings.phone}
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="+880"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t.settings.currency}
                </label>
                <select
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value)}
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t.settings.timezone}
                </label>
                <select
                  value={formTimezone}
                  onChange={(e) => setFormTimezone(e.target.value)}
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t.settings.gender}
                </label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value)}
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="">{t.settings.selectGender}</option>
                  <option value="male">{t.settings.genderMale}</option>
                  <option value="female">{t.settings.genderFemale}</option>
                  <option value="other">{t.settings.genderOther}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t.settings.dateOfBirth}
                </label>
                <input
                  type="date"
                  value={formDob}
                  onChange={(e) => setFormDob(e.target.value)}
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">
                    {t.settings.notifications}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.pushNotificationsDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formNotifications}
                  onChange={(e) => setFormNotifications(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">
                    {t.settings.weeklyReport}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.weeklyReportDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formWeeklyReport}
                  onChange={(e) => setFormWeeklyReport(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving
                  ? t.settings.saving
                  : saved
                    ? t.settings.saved
                    : t.settings.profile}
              </button>
            </div>
          </div>
        )

      case "appearance":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t.settings.appearanceSettings}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t.settings.theme}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "light", label: t.settings.themeLight },
                    { value: "dark", label: t.settings.themeDark },
                    { value: "oled", label: t.settings.themeOled },
                    { value: "system", label: t.settings.themeSystem },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        theme === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t.settings.language}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleLanguageChange("en")}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      language === "en"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    🇬🇧 {t.settings.english}
                  </button>
                  <button
                    onClick={() => handleLanguageChange("bn")}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      language === "bn"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    🇧🇩 {t.settings.bengali}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <label className="text-sm font-medium">
                    {language === "bn"
                      ? "সময়সূচী ডার্ক মোড"
                      : "Scheduled Dark Mode"}
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "bn"
                    ? "স্বয়ংক্রিয়ভাবে ডার্ক মোড চালু/বন্ধ করুন"
                    : "Automatically toggle dark mode on/off"}
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">
                      {language === "bn"
                        ? "সময়সূচী সক্রিয় করুন"
                        : "Enable Schedule"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={darkModeSchedule}
                    onChange={(e) => setDarkModeSchedule(e.target.checked)}
                    className="h-4 w-4"
                    aria-label="Dark mode schedule"
                  />
                </div>
                {darkModeSchedule && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        {language === "bn" ? "শুরু (ডার্ক)" : "Start (Dark)"}
                      </label>
                      <input
                        type="time"
                        value={darkModeStart}
                        onChange={(e) => setDarkModeStart(e.target.value)}
                        className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                        aria-label="Dark mode start time"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        {language === "bn" ? "শেষ (লাইট)" : "End (Light)"}
                      </label>
                      <input
                        type="time"
                        value={darkModeEnd}
                        onChange={(e) => setDarkModeEnd(e.target.value)}
                        className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                        aria-label="Dark mode end time"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t.settings.notificationsSettings}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">
                    {t.settings.pushNotifications}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.pushNotificationsDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4"
                  aria-label="Push notifications"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">
                    {t.settings.dailyReminders}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.dailyRemindersDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4"
                  aria-label="Daily reminders"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">
                    {t.settings.weeklyReport}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.weeklyReportDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  aria-label="Weekly report"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">
                    {t.settings.coachSuggestions}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.coachSuggestionsDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4"
                  aria-label="Coach suggestions"
                />
              </div>
            </div>
          </div>
        )

      case "premium":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.settings.premiumTitle}</h3>
            <div className="glass rounded-xl p-4 bg-gradient-to-br from-primary/20 to-primary/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-primary/20 p-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{t.settings.upgradeToPro}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.unlockAll}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>✓ Unlimited wallets</li>
                <li>✓ 200 Coach messages/day</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Priority support</li>
                <li>✓ Cloud backup</li>
              </ul>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ৳199<span className="text-sm font-normal">/month</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  or ৳1,590/year (save 33%)
                </p>
              </div>
              <button className="w-full mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {t.settings.upgradeNow}
              </button>
            </div>
          </div>
        )

      case "security":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t.settings.securityPrivacy}
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {t.settings.changePassword}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.settings.changePasswordDesc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {t.settings.twoFactorAuth}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.settings.twoFactorAuthDesc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {t.settings.connectedAccounts}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.settings.connectedAccountsDesc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="p-3 rounded-lg border border-destructive/50">
                <p className="text-sm font-medium text-destructive">
                  {t.settings.deleteAccount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.settings.clearAllDataDesc}
                </p>
              </div>
            </div>
          </div>
        )

      case "backup":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t.settings.backupRestore}
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent">
                <Download className="h-4 w-4" />
                <div className="text-left">
                  <p className="text-sm font-medium">{t.settings.exportData}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.exportDataDesc}
                  </p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent">
                <Upload className="h-4 w-4" />
                <div className="text-left">
                  <p className="text-sm font-medium">{t.settings.importData}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.importDataDesc}
                  </p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent">
                <Trash2 className="h-4 w-4 text-destructive" />
                <div className="text-left">
                  <p className="text-sm font-medium text-destructive">
                    {t.settings.clearAllData}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.clearAllDataDesc}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )

      case "help":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.settings.helpSupport}</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                <p className="text-sm font-medium">{t.settings.faq}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                <p className="text-sm font-medium">
                  {t.settings.contactSupport}
                </p>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                <p className="text-sm font-medium">{t.settings.reportBug}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                <p className="text-sm font-medium">
                  {t.settings.featureRequest}
                </p>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="text-center text-xs text-muted-foreground pt-4">
                <p>{t.settings.version}</p>
                <p>
                  {lang === "bn" ? (
                    <>
                      <a
                        href="https://pronayghosh.site/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-foreground hover:underline"
                      >
                        Pronay
                      </a>{" "}
                      {t.settings.madeWith}
                    </>
                  ) : (
                    <>
                      {t.settings.madeWith}{" "}
                      <a
                        href="https://pronayghosh.site/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-foreground hover:underline"
                      >
                        Pronay
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )

      case "notifications-panel":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t.settings.smartNotifications}
            </h3>
            <NotificationsPanel />
          </div>
        )

      case "data-backup":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.settings.dataBackup}</h3>
            <DataBackup />
          </div>
        )

      case "widgets":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.settings.widgets}</h3>
            <DashboardWidgetCustomizer />
          </div>
        )

      case "streak-freeze":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.settings.streakFreeze}</h3>
            <StreakFreeze />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      {activeSection ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveSection(null)}
            className="text-sm text-primary hover:underline"
          >
            {t.settings.backToSettings}
          </button>
          {renderSection()}
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <section.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{section.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}

          <div className="pt-4 space-y-2">
            {hasAdmin === false && (
              <>
                <button
                  onClick={async () => {
                    try {
                      await setupFirstAdmin()
                      setAdminMessage("You are now an admin! Go to /admin")
                    } catch (err: unknown) {
                      setAdminMessage(
                        err instanceof Error ? err.message : "Failed",
                      )
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                >
                  <Crown className="h-4 w-4" />
                  Become Admin (One-time setup)
                </button>
                {adminMessage && (
                  <p className="text-xs text-center text-muted-foreground">
                    {adminMessage}
                  </p>
                )}
              </>
            )}
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t.settings.signOut}
            </button>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-2">
            <p>
              {t.settings.signedInAs} {user?.email || "Unknown"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
