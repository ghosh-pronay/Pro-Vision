import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";

import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";
import { useLang } from "@/i18n/LanguageContext";

import {
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  UserX,
  Eye,
  EyeOff,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const {
    isLoading: authLoading,
    isAuthenticated,
    isEmailVerified,
    signIn,
    signUp,
    sendVerificationEmail,
    reloadUser,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useLang();
  const [mode, setMode] = useState<"signin" | "signup" | "verify">(
    searchParams.get("mode") === "verify" ? "verify" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (searchParams.get("mode") === "verify") {
      setMode("verify");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isEmailVerified) {
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    }
  }, [
    authLoading,
    isAuthenticated,
    isEmailVerified,
    navigate,
    redirectAfterAuth,
  ]);

  useEffect(() => {
    if (mode !== "verify" || !isAuthenticated) return;
    const interval = setInterval(async () => {
      try {
        await reloadUser();
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [mode, isAuthenticated, reloadUser]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === "signin") {
        await signIn("password", { email, password });
        const redirect = redirectAfterAuth || "/dashboard";
        navigate(redirect);
      } else {
        await signUp(email, password);
        setMode("verify");
      }
    } catch (err) {
      console.error("Auth error:", err);
      let message = "Authentication failed. Please try again.";
      if (err instanceof Error) {
        if (err.message.includes("auth/user-not-found")) {
          message =
            lang === "bn"
              ? "ব্যবহারকারী পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন।"
              : "User not found. Please sign up.";
        } else if (err.message.includes("auth/wrong-password")) {
          message =
            lang === "bn"
              ? "ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।"
              : "Wrong password. Please try again.";
        } else if (err.message.includes("auth/email-already-in-use")) {
          message =
            lang === "bn"
              ? "এই ইমেইল ইতিমধ্যে ব্যবহৃত হচ্ছে। সাইন ইন করুন।"
              : "Email already in use. Please sign in.";
        } else if (err.message.includes("auth/weak-password")) {
          message =
            lang === "bn"
              ? "পাসওয়ার্ড কমজোর। কমপক্ষে ৬ অক্ষর দরকার।"
              : "Weak password. At least 6 characters required.";
        } else if (err.message.includes("auth/invalid-email")) {
          message = lang === "bn" ? "অবৈধ ইমেইল।" : "Invalid email address.";
        } else {
          message = err.message;
        }
      }
      setError(message);
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    } catch (err) {
      console.error("Guest login error:", err);
      setError(
        lang === "bn"
          ? "অতিথি হিসাবে প্রবেশ করতে ব্যর্থ।"
          : "Failed to sign in as guest.",
      );
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setError(null);
    try {
      await sendVerificationEmail();
      setResendCooldown(60);
    } catch (err) {
      console.error("Resend error:", err);
      setError(
        lang === "bn"
          ? "ইমেইল পুনরায় পাঠাতে ব্যর্থ।"
          : "Failed to resend verification email.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === "verify") {
    return (
      <div className="bg-mesh min-h-screen flex flex-col">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="mesh-orb mesh-orb-1 -top-32 -left-32" />
          <div className="mesh-orb mesh-orb-2 bottom-0 -right-24" />
          <div className="mesh-orb mesh-orb-4 top-1/3 left-1/2" />
        </div>
        <div className="flex-1 flex items-center justify-center relative z-10 px-4">
          <div className="flex items-center justify-center h-full flex-col">
            <Card className="min-w-[380px] pb-0 border-0 shadow-none bg-transparent">
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={logo}
                      alt="Pro-Vision"
                      width={64}
                      height={64}
                      className="rounded-xl cursor-pointer transition-transform hover:scale-105"
                      onClick={() => navigate("/")}
                    />
                    <div className="absolute -inset-3 rounded-2xl bg-[var(--pv-blue)] opacity-15 blur-lg -z-10" />
                  </div>
                </div>
                <CardTitle className="text-xl mt-2">
                  {lang === "bn" ? "ইমেইল যাচাই করুন" : "Verify Your Email"}
                </CardTitle>
                <CardDescription>
                  {lang === "bn"
                    ? `আমরা ${email || "আপনার ইমেইল"}-এ একটি যাচাইকরণ লিংক পাঠিয়েছি।`
                    : `We sent a verification link to ${email || "your email"}.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {lang === "bn"
                    ? "ইমেইলে লিংকে ক্লিক করুন। যাচাই হলে এখানে স্বয়ংক্রিয়ভাবে পুনঃনির্দেশিত হবে।"
                    : "Click the link in your email. You'll be redirected here automatically once verified."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lang === "bn"
                    ? "ইমেইল পাননি? স্প্যাম ফোল্ডার চেক করুন।"
                    : "Didn't receive it? Check your spam folder."}
                </p>
                <Button
                  variant="outline"
                  className="w-full glass"
                  onClick={handleResendVerification}
                  disabled={isLoading || resendCooldown > 0}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {resendCooldown > 0
                    ? lang === "bn"
                      ? `${resendCooldown}সেকেন্ড অপেক্ষা করুন`
                      : `Resend in ${resendCooldown}s`
                    : lang === "bn"
                      ? "ইমেইল পুনরায় পাঠান"
                      : "Resend Verification Email"}
                </Button>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === "bn" ? "← সাইন ইনে ফিরে যান" : "← Back to Sign In"}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-mesh min-h-screen flex flex-col">
      {/* Floating orbs for background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="mesh-orb mesh-orb-1 -top-32 -left-32" />
        <div className="mesh-orb mesh-orb-2 bottom-0 -right-24" />
        <div className="mesh-orb mesh-orb-4 top-1/3 left-1/2" />
      </div>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4">
        <div className="flex items-center justify-center h-full flex-col">
          <Card className="min-w-[380px] pb-0 border-0 shadow-none bg-transparent">
            <CardHeader className="text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={logo}
                    alt="Pro-Vision"
                    width={64}
                    height={64}
                    className="rounded-xl cursor-pointer transition-transform hover:scale-105"
                    onClick={() => navigate("/")}
                  />
                  <div className="absolute -inset-3 rounded-2xl bg-[var(--pv-blue)] opacity-15 blur-lg -z-10" />
                </div>
              </div>
              <CardTitle className="text-xl mt-2">
                {mode === "signin"
                  ? lang === "bn"
                    ? "সাইন ইন করুন"
                    : "Sign In"
                  : lang === "bn"
                    ? "অ্যাকাউন্ট তৈরি করুন"
                    : "Create Account"}
              </CardTitle>
              <CardDescription>
                {mode === "signin"
                  ? lang === "bn"
                    ? "আপনার অ্যাকাউন্টে প্রবেশ করুন"
                    : "Access your account"
                  : lang === "bn"
                    ? "আজই শুরু করুন"
                    : "Get started today"}
              </CardDescription>
            </CardHeader>

            {/* Mode Tabs */}
            <div className="flex mx-6 mb-4 bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === "signin"
                    ? "bg-[var(--pv-blue)] text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {lang === "bn" ? "সাইন ইন" : "Sign In"}
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === "signup"
                    ? "bg-[var(--pv-blue)] text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {lang === "bn" ? "সাইন আপ" : "Sign Up"}
              </button>
            </div>

            <form onSubmit={handleEmailSubmit}>
              <CardContent>
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="email"
                      placeholder={lang === "bn" ? "ইমেইল" : "Email"}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 glass border-[var(--pv-glass-border)]"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="password"
                      placeholder={lang === "bn" ? "পাসওয়ার্ড" : "Password"}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9 glass border-[var(--pv-glass-border)]"
                      disabled={isLoading}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  className="w-full mt-4 text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
                  }}
                  disabled={isLoading || !email || password.length < 6}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "signin"
                        ? lang === "bn"
                          ? "সাইন ইন"
                          : "Sign In"
                        : lang === "bn"
                          ? "সাইন আপ"
                          : "Sign Up"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/40" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {lang === "bn" ? "অথবা" : "Or"}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 glass"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    {lang === "bn"
                      ? "অতিথি হিসাবে চালিয়ে যান"
                      : "Continue as Guest"}
                  </Button>
                </div>
              </CardContent>
            </form>

            <div className="py-4 px-6 text-xs text-center text-muted-foreground glass-subtle rounded-b-xl mt-2">
              {mode === "signin" ? (
                <>
                  {lang === "bn"
                    ? "অ্যাকাউন্ট নেই? "
                    : "Don't have an account? "}
                  <button
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                    }}
                    className="underline hover:text-[var(--pv-blue)] transition-colors"
                  >
                    {lang === "bn" ? "সাইন আপ করুন" : "Sign Up"}
                  </button>
                </>
              ) : (
                <>
                  {lang === "bn"
                    ? "ইতিমধ্যে অ্যাকাউন্ট আছে? "
                    : "Already have an account? "}
                  <button
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                    }}
                    className="underline hover:text-[var(--pv-blue)] transition-colors"
                  >
                    {lang === "bn" ? "সাইন ইন করুন" : "Sign In"}
                  </button>
                </>
              )}
            </div>

            <div className="py-4 px-6 text-xs text-center text-muted-foreground glass-subtle rounded-b-xl mt-2">
              Secured by{" "}
              <Link
                to="/"
                className="underline hover:text-[var(--pv-blue)] transition-colors"
              >
                Pro-Vision
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
