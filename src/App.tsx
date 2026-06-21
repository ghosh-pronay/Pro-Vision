import { Routes, Route, useLocation } from "react-router";
import { lazy, Suspense, useState, memo, useMemo } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";
import CoachFloating from "@/components/coach/CoachFloating";
import { Mic } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import VoiceCommands from "@/components/voice/VoiceCommands";
import PWARegister from "@/components/PWARegister";
import PushNotificationBanner from "@/components/PushNotificationBanner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useNavigate } from "react-router";

const Landing = lazy(() => import("@/pages/Landing"));
const AuthPage = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const DashboardLayout = lazy(() => import("@/components/DashboardLayout"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Todo = lazy(() => import("@/pages/Todo"));
const Habits = lazy(() => import("@/pages/Habits"));
const Expense = lazy(() => import("@/pages/Expense"));
const Focus = lazy(() => import("@/pages/Focus"));
const News = lazy(() => import("@/pages/News"));
const Reports = lazy(() => import("@/pages/Reports"));
const Wellbeing = lazy(() => import("@/pages/Wellbeing"));
const Settings = lazy(() => import("@/pages/Settings"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminAPI = lazy(() => import("@/pages/AdminAPI"));
const AdminPortal = lazy(() => import("@/pages/AdminPortal"));
const AdminPortalDashboard = lazy(() => import("@/pages/AdminPortalDashboard"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Goals = lazy(() => import("@/pages/Goals"));
const Journal = lazy(() => import("@/pages/Journal"));
const Reading = lazy(() => import("@/pages/Reading"));
const Nutrition = lazy(() => import("@/pages/Nutrition"));
const Challenges = lazy(() => import("@/pages/Challenges"));
const CRM = lazy(() => import("@/pages/CRM"));
const SleepTracker = lazy(() => import("@/pages/SleepTracker"));
const SavingsGoals = lazy(() => import("@/pages/SavingsGoals"));
const Fitness = lazy(() => import("@/pages/Fitness"));
const StudyTracker = lazy(() => import("@/pages/StudyTracker"));
const GratitudeJar = lazy(() => import("@/pages/GratitudeJar"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const HabitHeatmap = lazy(() => import("@/pages/HabitHeatmap"));
const DailyCheckin = lazy(() => import("@/pages/DailyCheckin"));
const MoodCorrelation = lazy(() => import("@/pages/MoodCorrelation"));
const LearningPaths = lazy(() => import("@/pages/LearningPaths"));
const AccountabilityPartner = lazy(
  () => import("@/pages/AccountabilityPartner"),
);
const Gamification = lazy(() => import("@/pages/Gamification"));
const HealthDashboard = lazy(() => import("@/pages/HealthDashboard"));
const FinancialDashboard = lazy(() => import("@/pages/FinancialDashboard"));
const QRProfile = lazy(() => import("@/pages/QRProfile"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Payment = lazy(() => import("@/pages/Payment"));
const Wallets = lazy(() => import("@/pages/Wallets"));
const OfflineMode = lazy(() => import("@/pages/OfflineMode"));
const DataEncryption = lazy(() => import("@/pages/DataEncryption"));
const FamilyDashboard = lazy(() => import("@/pages/FamilyDashboard"));
const FamilySharing = lazy(() => import("@/pages/FamilySharing"));
const SocialChallenges = lazy(() => import("@/pages/SocialChallenges"));
const AILifeCoach = lazy(() => import("@/pages/AILifeCoach"));
const BillSplit = lazy(() => import("@/pages/BillSplit"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));
const MarketPrices = lazy(() => import("@/pages/MarketPrices"));
const BengaliCalendar = lazy(() => import("@/pages/BengaliCalendar"));
const EmergencySOS = lazy(() => import("@/pages/EmergencySOS"));
const CarbonFootprint = lazy(() => import("@/pages/CarbonFootprint"));
const MealPlanning = lazy(() => import("@/pages/MealPlanning"));
const CommuteTracker = lazy(() => import("@/pages/CommuteTracker"));
const VoiceNotes = lazy(() => import("@/pages/VoiceNotes"));
const AchievementSharing = lazy(() => import("@/pages/AchievementSharing"));
const DailyStreaks = lazy(() => import("@/pages/DailyStreaks"));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

const VoiceButton = memo(function VoiceButton() {
  const [showVoice, setShowVoice] = useState(false);
  const navigate = useNavigate();

  const handleCommand = (command: {
    action: string;
    params?: Record<string, string>;
  }) => {
    switch (command.action) {
      case "navigate":
        if (command.params?.page) {
          navigate(`/${command.params.page}`);
        }
        break;
      case "addTask":
      case "addExpense":
      case "addIncome":
      case "startFocus":
      case "stopFocus":
      case "logMood":
      case "checkHabit":
      case "completeTask":
      case "showHelp":
        break;
    }
    setShowVoice(false);
  };

  return (
    <>
      <button
        onClick={() => setShowVoice(true)}
        className="fixed z-40 h-14 w-14 rounded-full bg-[var(--pv-blue)] text-white shadow-lg flex items-center justify-center hover:brightness-110 transition-all active:scale-95
          bottom-6 left-6
          max-md:bottom-[calc(env(safe-area-inset-bottom,0px)+80px)]"
        aria-label="Voice commands"
      >
        <Mic className="size-6" />
      </button>
      <AnimatePresence>
        {showVoice && (
          <VoiceCommands
            onCommand={handleCommand}
            onClose={() => setShowVoice(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

const HIDDEN_COACH_ROUTES = ["/", "/auth", "/onboarding"];

export default function App() {
  const location = useLocation();
  const showCoach = useMemo(
    () =>
      !HIDDEN_COACH_ROUTES.includes(location.pathname) &&
      !location.pathname.startsWith("/404"),
    [location.pathname],
  );

  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<RouteLoading />}>
        <Routes key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route
            path="/auth"
            element={<AuthPage redirectAfterAuth="/dashboard" />}
          />
          <Route
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoading />}>
                  <DashboardLayout />
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/news" element={<News />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/wellbeing" element={<Wellbeing />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/sleep" element={<SleepTracker />} />
            <Route path="/savings" element={<SavingsGoals />} />
            <Route path="/fitness" element={<Fitness />} />
            <Route path="/study" element={<StudyTracker />} />
            <Route path="/gratitude" element={<GratitudeJar />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/heatmap" element={<HabitHeatmap />} />
            <Route path="/checkin" element={<DailyCheckin />} />
            <Route path="/correlation" element={<MoodCorrelation />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route
              path="/accountability-partner"
              element={<AccountabilityPartner />}
            />
            <Route path="/gamification" element={<Gamification />} />
            <Route path="/health-dashboard" element={<HealthDashboard />} />
            <Route
              path="/financial-dashboard"
              element={<FinancialDashboard />}
            />
            <Route path="/qr-profile" element={<QRProfile />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/offline" element={<OfflineMode />} />
            <Route path="/encryption" element={<DataEncryption />} />
            <Route path="/family" element={<FamilyDashboard />} />
            <Route path="/family-sharing" element={<FamilySharing />} />
            <Route path="/social-challenges" element={<SocialChallenges />} />
            <Route path="/ai-life-coach" element={<AILifeCoach />} />
            <Route path="/bill-split" element={<BillSplit />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/market-prices" element={<MarketPrices />} />
            <Route path="/bengali-calendar" element={<BengaliCalendar />} />
            <Route path="/emergency-sos" element={<EmergencySOS />} />
            <Route path="/carbon-footprint" element={<CarbonFootprint />} />
            <Route path="/meal-planning" element={<MealPlanning />} />
            <Route path="/commute-tracker" element={<CommuteTracker />} />
            <Route path="/voice-notes" element={<VoiceNotes />} />
            <Route
              path="/achievement-sharing"
              element={<AchievementSharing />}
            />
            <Route path="/daily-streaks" element={<DailyStreaks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/api" element={<AdminAPI />} />
          </Route>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/admin-portal" element={<AdminPortal />} />
          <Route
            path="/admin-portal/dashboard"
            element={<AdminPortalDashboard />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {showCoach && <CoachFloating />}
      {showCoach && <VoiceButton />}
      <PWARegister />
      <PushNotificationBanner />
    </ErrorBoundary>
  );
}
