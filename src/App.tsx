import { Routes, Route, useLocation } from "react-router";
import { lazy, Suspense, useState, memo, useMemo } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";
import { Mic } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useNavigate } from "react-router";

const CoachFloating = lazy(() => import("@/components/coach/CoachFloating"));
const VoiceCommands = lazy(() => import("@/components/voice/VoiceCommands"));
const PWARegister = lazy(() => import("@/components/PWARegister"));

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
const QRProfile = lazy(() => import("@/pages/QRProfile"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Payment = lazy(() => import("@/pages/Payment"));
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

function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-sm text-muted-foreground mb-4">
              This page failed to load.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
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
          <Suspense fallback={null}>
            <VoiceCommands
              onCommand={handleCommand}
              onClose={() => setShowVoice(false)}
            />
          </Suspense>
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
          <Route
            path="/"
            element={
              <RouteErrorBoundary>
                <Landing />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/auth"
            element={
              <RouteErrorBoundary>
                <AuthPage redirectAfterAuth="/dashboard" />
              </RouteErrorBoundary>
            }
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
            <Route
              path="/dashboard"
              element={
                <RouteErrorBoundary>
                  <Dashboard />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/todo"
              element={
                <RouteErrorBoundary>
                  <Todo />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/habits"
              element={
                <RouteErrorBoundary>
                  <Habits />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/expense"
              element={
                <RouteErrorBoundary>
                  <Expense />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/focus"
              element={
                <RouteErrorBoundary>
                  <Focus />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/news"
              element={
                <RouteErrorBoundary>
                  <News />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/reports"
              element={
                <RouteErrorBoundary>
                  <Reports />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/wellbeing"
              element={
                <RouteErrorBoundary>
                  <Wellbeing />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/goals"
              element={
                <RouteErrorBoundary>
                  <Goals />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/journal"
              element={
                <RouteErrorBoundary>
                  <Journal />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/reading"
              element={
                <RouteErrorBoundary>
                  <Reading />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/nutrition"
              element={
                <RouteErrorBoundary>
                  <Nutrition />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/challenges"
              element={
                <RouteErrorBoundary>
                  <Challenges />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/crm"
              element={
                <RouteErrorBoundary>
                  <CRM />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/sleep"
              element={
                <RouteErrorBoundary>
                  <SleepTracker />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/fitness"
              element={
                <RouteErrorBoundary>
                  <Fitness />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/study"
              element={
                <RouteErrorBoundary>
                  <StudyTracker />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/gratitude"
              element={
                <RouteErrorBoundary>
                  <GratitudeJar />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/achievements"
              element={
                <RouteErrorBoundary>
                  <Achievements />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/heatmap"
              element={
                <RouteErrorBoundary>
                  <HabitHeatmap />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/checkin"
              element={
                <RouteErrorBoundary>
                  <DailyCheckin />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/correlation"
              element={
                <RouteErrorBoundary>
                  <MoodCorrelation />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/learning-paths"
              element={
                <RouteErrorBoundary>
                  <LearningPaths />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/accountability-partner"
              element={
                <RouteErrorBoundary>
                  <AccountabilityPartner />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/gamification"
              element={
                <RouteErrorBoundary>
                  <Gamification />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/health-dashboard"
              element={
                <RouteErrorBoundary>
                  <HealthDashboard />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/qr-profile"
              element={
                <RouteErrorBoundary>
                  <QRProfile />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/analytics"
              element={
                <RouteErrorBoundary>
                  <Analytics />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/payment"
              element={
                <RouteErrorBoundary>
                  <Payment />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/offline"
              element={
                <RouteErrorBoundary>
                  <OfflineMode />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/encryption"
              element={
                <RouteErrorBoundary>
                  <DataEncryption />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/family"
              element={
                <RouteErrorBoundary>
                  <FamilyDashboard />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/family-sharing"
              element={
                <RouteErrorBoundary>
                  <FamilySharing />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/social-challenges"
              element={
                <RouteErrorBoundary>
                  <SocialChallenges />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/ai-life-coach"
              element={
                <RouteErrorBoundary>
                  <AILifeCoach />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/bill-split"
              element={
                <RouteErrorBoundary>
                  <BillSplit />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <RouteErrorBoundary>
                  <Subscriptions />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/market-prices"
              element={
                <RouteErrorBoundary>
                  <MarketPrices />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/bengali-calendar"
              element={
                <RouteErrorBoundary>
                  <BengaliCalendar />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/emergency-sos"
              element={
                <RouteErrorBoundary>
                  <EmergencySOS />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/carbon-footprint"
              element={
                <RouteErrorBoundary>
                  <CarbonFootprint />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/meal-planning"
              element={
                <RouteErrorBoundary>
                  <MealPlanning />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/commute-tracker"
              element={
                <RouteErrorBoundary>
                  <CommuteTracker />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/voice-notes"
              element={
                <RouteErrorBoundary>
                  <VoiceNotes />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/achievement-sharing"
              element={
                <RouteErrorBoundary>
                  <AchievementSharing />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/daily-streaks"
              element={
                <RouteErrorBoundary>
                  <DailyStreaks />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/settings"
              element={
                <RouteErrorBoundary>
                  <Settings />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin"
              element={
                <RouteErrorBoundary>
                  <Admin />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin/api"
              element={
                <RouteErrorBoundary>
                  <AdminAPI />
                </RouteErrorBoundary>
              }
            />
          </Route>
          <Route
            path="/onboarding"
            element={
              <RouteErrorBoundary>
                <Onboarding />
              </RouteErrorBoundary>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/admin-portal"
              element={
                <RouteErrorBoundary>
                  <AdminPortal />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin-portal/dashboard"
              element={
                <RouteErrorBoundary>
                  <AdminPortalDashboard />
                </RouteErrorBoundary>
              }
            />
          </Route>
          <Route
            path="*"
            element={
              <RouteErrorBoundary>
                <NotFound />
              </RouteErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
      {showCoach && (
        <Suspense fallback={null}>
          <CoachFloating />
        </Suspense>
      )}
      {showCoach && <VoiceButton />}
      <Suspense fallback={null}>
        <PWARegister />
      </Suspense>
    </ErrorBoundary>
  );
}
