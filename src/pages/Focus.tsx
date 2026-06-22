import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import AmbientSounds from "@/components/AmbientSounds";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type Mode = "pomodoro" | "short" | "long" | "deep";

const MODES: Record<
  Mode,
  {
    work: number;
    break: number;
    labelKey: TranslationKey;
    type: "pomodoro" | "shortBreak" | "longBreak" | "custom";
  }
> = {
  pomodoro: {
    work: 25,
    break: 5,
    labelKey: "focus.modes.pomodoro",
    type: "pomodoro",
  },
  short: {
    work: 5,
    break: 1,
    labelKey: "focus.modes.short",
    type: "shortBreak",
  },
  long: {
    work: 15,
    break: 10,
    labelKey: "focus.modes.long",
    type: "longBreak",
  },
  deep: { work: 50, break: 15, labelKey: "focus.modes.deep", type: "custom" },
};

export default function Focus() {
  const { lang } = useLang();
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [isWork, setIsWork] = useState(true);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MODES.pomodoro.work * 60);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sessions = useQuery(api.focusSessions.list);
  const stats = useQuery(api.focusSessions.stats);
  const createSession = useMutation(api.focusSessions.create);

  const current = MODES[mode];

  const playSession = useCallback(async () => {
    if (!sessionStartTime) return;
    const duration = Math.round((Date.now() - sessionStartTime) / 60000);
    if (duration <= 0) return;
    try {
      await createSession({
        duration,
        type: MODES[mode].type,
      });
    } catch (err) {
      console.error("Failed to save focus session:", err);
    }
    setSessionStartTime(null);
  }, [sessionStartTime, mode, createSession]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          if (isWork) {
            playSession();
            setIsWork(false);
            return current.break * 60;
          } else {
            setIsWork(true);
            return current.work * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, isWork, current, mode, playSession]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setRunning(false);
    setIsWork(true);
    setSecondsLeft(MODES[m].work * 60);
    setSessionStartTime(null);
  };

  const reset = () => {
    setRunning(false);
    setIsWork(true);
    setSecondsLeft(current.work * 60);
    setSessionStartTime(null);
  };

  const skip = () => {
    setRunning(false);
    if (isWork) playSession();
    setIsWork((prev) => !prev);
    setSecondsLeft(isWork ? current.break * 60 : current.work * 60);
    setSessionStartTime(null);
  };

  const toggleTimer = () => {
    if (!running) {
      setSessionStartTime(Date.now());
    } else {
      playSession();
      setSessionStartTime(null);
    }
    setRunning(!running);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const totalSeconds = (isWork ? current.work : current.break) * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const totalSessions = stats?.sessions ?? 0;
  const totalHours = stats?.totalHours ?? 0;
  const todayMinutes = stats?.todayMinutes ?? 0;

  const recentSessions = sessions?.slice(0, 10) ?? [];

  const formatTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return lang === "bn" ? "এইমাত্র" : "just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          {t("nav.focus", lang)}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("focus.subtitle", lang)}
        </p>
      </motion.div>

      {/* Mode selector */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex gap-2"
      >
        {(["pomodoro", "short", "long", "deep"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 glass rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${mode === m ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]" : "text-muted-foreground hover:text-foreground hover-tab"}`}
          >
            {t(MODES[m].labelKey, lang)}
          </button>
        ))}
      </motion.div>

      {/* Timer ring */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex justify-center"
      >
        <div className="glass-strong rounded-3xl p-8 glow-blue glass-accent-top text-center">
          <div className="relative inline-flex items-center justify-center mb-4">
            <svg className="w-48 h-48 sm:w-60 sm:h-60" viewBox="0 0 240 240">
              <circle
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-foreground/5"
              />
              <motion.circle
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke={isWork ? "var(--pv-blue)" : "var(--pv-green)"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 120 120)"
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-foreground tabular-nums">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isWork ? t("focus.working", lang) : t("focus.breakTime", lang)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="glass rounded-xl p-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="size-5" />
            </button>
            <button
              onClick={toggleTimer}
              className="rounded-2xl px-8 py-3 text-white font-bold transition-all hover:brightness-110 active:scale-[0.97]"
              style={{
                background: running
                  ? "var(--pv-orange)"
                  : "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
              }}
            >
              {running ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5" />
              )}
            </button>
            <button
              onClick={skip}
              className="glass rounded-xl p-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="size-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Ambient sounds */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <AmbientSounds />
      </motion.div>

      {/* Stats */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-4"
      >
        {[
          {
            icon: Target,
            value: totalSessions,
            labelKey: "focus.sessions" as TranslationKey,
            color: "var(--pv-blue)",
          },
          {
            icon: Clock,
            value: `${todayMinutes}`,
            labelKey: "focus.totalMinutes" as TranslationKey,
            color: "var(--pv-teal)",
          },
          {
            icon: Zap,
            value: `${totalHours}h`,
            labelKey: "focus.totalHours" as TranslationKey,
            color: "var(--pv-green)",
          },
        ].map(({ icon: Icon, value, labelKey, color }) => (
          <div
            key={labelKey}
            className="glass rounded-xl p-4 text-center hover-lift hover-blue"
          >
            <Icon className="size-5 mx-auto mb-1" style={{ color }} />
            <div className="text-xl font-extrabold text-foreground">
              {value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t(labelKey, lang)}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Session history */}
      {recentSessions.length > 0 && (
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">
              {lang === "bn" ? "সাম্প্রতিক সেশন" : "Recent Sessions"}
            </h3>
            <div className="space-y-2">
              {recentSessions.map(
                (s: {
                  _id: string;
                  type: string;
                  duration: number;
                  completedAt: number;
                }) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between text-xs py-2 border-b border-foreground/5 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--pv-blue)" }}
                      />
                      <span className="text-muted-foreground capitalize">
                        {s.type === "shortBreak"
                          ? lang === "bn"
                            ? "ছোট বিরতি"
                            : "Short Break"
                          : s.type === "longBreak"
                            ? lang === "bn"
                              ? "বড় বিরতি"
                              : "Long Break"
                            : s.type === "custom"
                              ? lang === "bn"
                                ? "ডিপ ওয়ার্ক"
                                : "Deep Work"
                              : "Pomodoro"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{s.duration}m</span>
                      <span>{formatTimeAgo(s.completedAt)}</span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
