import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { ChevronRight, ChevronLeft, Check, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 6;

const avatarEmojis = [
  "😊",
  "😎",
  "🤓",
  "🧑‍💻",
  "👨‍💻",
  "👩‍💻",
  "🦊",
  "🐱",
  "🐶",
  "🦁",
  "🐼",
  "🦄",
];

const interestOptions = [
  { id: "todo", emoji: "✅", en: "To-Do Lists", bn: "টু-ডু তালিকা" },
  { id: "habits", emoji: "🔥", en: "Habits", bn: "অভ্যাস" },
  { id: "finance", emoji: "💰", en: "Finance", bn: "আর্থিক" },
  { id: "health", emoji: "❤️", en: "Health & Sleep", bn: "স্বাস্থ্য ও ঘুম" },
  { id: "focus", emoji: "⏱️", en: "Focus Timer", bn: "ফোকাস টাইমার" },
  { id: "journal", emoji: "📝", en: "Journal", bn: "ডায়েরি" },
  { id: "goals", emoji: "🎯", en: "Goals", bn: "লক্ষ্য" },
  { id: "wellbeing", emoji: "🧘", en: "Well-being", bn: "সুস্থতা" },
];

const themeOptions = [
  { id: "light", emoji: "☀️", en: "Light", bn: "হালকা" },
  { id: "dark", emoji: "🌙", en: "Dark", bn: "গাঢ়" },
  { id: "system", emoji: "💻", en: "System", bn: "সিস্টেম" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function Onboarding() {
  const { lang, setLang } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("😊");
  const [interests, setInterests] = useState<string[]>([]);
  const [theme, setTheme] = useState("system");

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleFinish = () => {
    localStorage.setItem("pv-onboarding", JSON.stringify({ completed: true }));
    localStorage.setItem(
      "pv-onboarded-profile",
      JSON.stringify({ name, avatar, interests, theme }),
    );
    navigate("/dashboard");
  };

  const l = (en: string, bn: string) => (lang === "bn" ? bn : en);

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="mesh-orb mesh-orb-1" />
      <div className="mesh-orb mesh-orb-2" />
      <div className="mesh-orb mesh-orb-3" />
      <div className="mesh-orb mesh-orb-4" />

      <div className="glass-strong rounded-2xl w-full max-w-lg p-8 relative z-10 overflow-hidden">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10"
            >
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  i <= step ? "bg-primary" : "bg-white/10",
                )}
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[320px] relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full"
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="text-center space-y-6 py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="text-7xl mb-2"
                  >
                    🚀
                  </motion.div>
                  <h2 className="text-3xl font-bold">
                    {l("Welcome to", "স্বাগতম")}{" "}
                    <span className="text-primary">Pro-Vision</span>
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-xs mx-auto">
                    {l(
                      "Your personal productivity companion. Let's set up your experience in a few quick steps.",
                      "আপনার ব্যক্তিগত উত্পাদকতা সঙ্গী। কয়েকটি সহজ ধাপে আপনার অভিজ্ঞতা সেট আপ করুন।",
                    )}
                  </p>
                </div>
              )}

              {/* Step 1: Language */}
              {step === 1 && (
                <div className="space-y-6 py-2">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      {l("Choose Your Language", "আপনার ভাষা বাছাই করুন")}
                    </h2>
                    <p className="text-muted-foreground">
                      {l(
                        "You can switch anytime in Settings",
                        "সেটিংসে যেকোনো সময় পরিবর্তন করতে পারবেন",
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                    {(["en", "bn"] as const).map((lng) => (
                      <button
                        key={lng}
                        onClick={() => setLang(lng)}
                        className={cn(
                          "glass rounded-xl p-6 flex flex-col items-center gap-3 transition-all",
                          lang === lng
                            ? "ring-2 ring-primary bg-primary/10"
                            : "hover:bg-white/10",
                        )}
                      >
                        <span className="text-4xl">
                          {lng === "en" ? "🇬🇧" : "🇧🇩"}
                        </span>
                        <span className="font-medium text-lg">
                          {lng === "en" ? "English" : "বাংলা"}
                        </span>
                        {lang === lng && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Profile */}
              {step === 2 && (
                <div className="space-y-6 py-2">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      {l("Set Up Your Profile", "আপনার প্রোফাইল সেট আপ করুন")}
                    </h2>
                    <p className="text-muted-foreground">
                      {l(
                        "Pick a name and avatar",
                        "একটি নাম এবং অ্যাভাটার বাছাই করুন",
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      {l("Your Name", "আপনার নাম")}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={l("Enter your name", "আপনার নাম লিখুন")}
                      className="w-full rounded-lg bg-white/5 border border-white/10 py-3 px-4 text-lg focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      {l("Choose Avatar", "অ্যাভাটার বাছাই করুন")}
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {avatarEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setAvatar(emoji)}
                          className={cn(
                            "text-2xl p-2 rounded-lg transition-all",
                            avatar === emoji
                              ? "bg-primary/20 ring-2 ring-primary"
                              : "bg-white/5 hover:bg-white/10",
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <span className="text-4xl">{avatar}</span>
                    <span className="text-lg font-medium">
                      {name || l("Your Name", "আপনার নাম")}
                    </span>
                  </div>
                </div>
              )}

              {/* Step 3: Interests */}
              {step === 3 && (
                <div className="space-y-6 py-2">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      {l("What Interests You?", "আপনার কী আগ্রহ?")}
                    </h2>
                    <p className="text-muted-foreground">
                      {l(
                        "Select features to enable",
                        "সক্রিয় করার বৈশিষ্ট্য নির্বাচন করুন",
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {interestOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => toggleInterest(opt.id)}
                        className={cn(
                          "glass rounded-xl p-4 flex items-center gap-3 transition-all text-left",
                          interests.includes(opt.id)
                            ? "ring-2 ring-primary bg-primary/10"
                            : "hover:bg-white/10",
                        )}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="font-medium">
                          {lang === "bn" ? opt.bn : opt.en}
                        </span>
                        {interests.includes(opt.id) && (
                          <Check className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Theme */}
              {step === 4 && (
                <div className="space-y-6 py-2">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      {l("Choose Your Theme", "আপনার থিম বাছাই করুন")}
                    </h2>
                    <p className="text-muted-foreground">
                      {l(
                        "Pick a look that suits you",
                        "আপনার পছন্দের চেহারা বাছাই করুন",
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={cn(
                          "glass rounded-xl p-6 flex flex-col items-center gap-3 transition-all",
                          theme === opt.id
                            ? "ring-2 ring-primary bg-primary/10"
                            : "hover:bg-white/10",
                        )}
                      >
                        <span className="text-4xl">{opt.emoji}</span>
                        <span className="font-medium">
                          {lang === "bn" ? opt.bn : opt.en}
                        </span>
                        {theme === opt.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Completion */}
              {step === 5 && (
                <div className="text-center space-y-6 py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="flex justify-center"
                  >
                    <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                  </motion.div>
                  <h2 className="text-3xl font-bold">
                    {l("You're All Set!", "সব কিছু প্রস্তুত!")}
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-xs mx-auto">
                    {l(
                      "Your personalized Pro-Vision is ready. Let's begin your journey!",
                      "আপনার ব্যক্তিগতকৃত প্রো-ভিশন প্রস্তুত। আসুন শুরু করি!",
                    )}
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <span className="text-3xl">{avatar}</span>
                    <div className="text-left">
                      <p className="font-bold">{name || "User"}</p>
                      <p className="text-sm text-muted-foreground">
                        {interests.length}{" "}
                        {l("features enabled", "টি বৈশিষ্ট্য সক্রিয়")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={goBack}
            disabled={step === 0}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              step === 0
                ? "text-muted-foreground cursor-not-allowed"
                : "text-foreground hover:bg-white/10",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            {l("Back", "পেছনে")}
          </button>
          <button
            onClick={step === TOTAL_STEPS - 1 ? handleFinish : goNext}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {step === TOTAL_STEPS - 1
              ? l("Get Started", "শুরু করুন")
              : l("Next", "পরবর্তী")}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
