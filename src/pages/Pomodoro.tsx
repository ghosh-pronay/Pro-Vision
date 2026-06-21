import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  TreePine,
  CloudRain,
  Music,
  Volume2,
  VolumeX,
  SkipForward,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Settings,
} from "lucide-react";

interface AmbientSound {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
  emoji: string;
}

const SOUNDS: AmbientSound[] = [
  {
    id: "rain",
    name: "Rain",
    icon: CloudRain,
    color: "text-blue-500",
    emoji: "🌧️",
  },
  {
    id: "forest",
    name: "Forest",
    icon: TreePine,
    color: "text-green-500",
    emoji: "🌲",
  },
  {
    id: "cafe",
    name: "Café",
    icon: Coffee,
    color: "text-amber-500",
    emoji: "☕",
  },
  {
    id: "lofi",
    name: "Lo-Fi",
    icon: Music,
    color: "text-purple-500",
    emoji: "🎵",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Pomodoro() {
  const { lang } = useLang();
  const [mode, setMode] = useState<"focus" | "shortBreak" | "longBreak">(
    "focus",
  );
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const modes = {
    focus: { duration: 25 * 60, label: lang === "bn" ? "ফোকাস" : "Focus" },
    shortBreak: {
      duration: 5 * 60,
      label: lang === "bn" ? "ছোট বিরতি" : "Short Break",
    },
    longBreak: {
      duration: 15 * 60,
      label: lang === "bn" ? "দীর্ঘ বিরতি" : "Long Break",
    },
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(modes[mode].duration);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // eslint-disable-next-line react-hooks/purity
            // eslint-disable-next-line react-hooks/immutability
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (mode === "focus") {
      setSessions((prev) => prev + 1);
      setTotalFocusTime((prev) => prev + 25);
      if (sessions % 4 === 3) {
        setMode("longBreak");
      } else {
        setMode("shortBreak");
      }
    } else {
      setMode("focus");
    }
  }, [mode, sessions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modes[mode].duration);
  };

  const progress =
    ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Play className="h-6 w-6 text-red-500" />
          {lang === "bn" ? "পোমোডোরো টাইমার" : "Pomodoro Timer"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "ফোকাস করুন, বিরতি নিন, আরও বেশি কাজ করুন"
            : "Focus, take breaks, get more done"}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="flex justify-center gap-2">
        {(["focus", "shortBreak", "longBreak"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === m
                ? "bg-primary text-primary-foreground"
                : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
            }`}
          >
            {modes[m].label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="flex justify-center">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-foreground/10"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={754}
              strokeDashoffset={754 - (754 * progress) / 100}
              className="text-primary transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-muted-foreground mt-2">
              {modes[mode].label}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex justify-center gap-4">
        <button
          onClick={resetTimer}
          className="cursor-pointer p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={toggleTimer}
          className={`cursor-pointer p-4 rounded-xl transition-colors ${
            isRunning
              ? "bg-yellow-500 text-white"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isRunning ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </button>
        <button
          onClick={() => setMode(mode === "focus" ? "shortBreak" : "focus")}
          className="cursor-pointer p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-3 gap-3 max-w-md mx-auto"
      >
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{sessions}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "সেশন" : "Sessions"}
          </p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{totalFocusTime}m</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "মোট সময়" : "Focus Time"}
          </p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">
            {Math.floor(totalFocusTime / 25)}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "পোমোডোরো" : "Pomodoros"}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            {lang === "bn" ? "পরিবেশ শব্দ" : "Ambient Sounds"}
          </h3>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {SOUNDS.map((sound) => (
            <button
              key={sound.id}
              onClick={() =>
                setSelectedSound(selectedSound === sound.id ? null : sound.id)
              }
              className={`cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                selectedSound === sound.id
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              <span className="text-2xl">{sound.emoji}</span>
              <span className="text-xs">{sound.name}</span>
            </button>
          ))}
        </div>

        {selectedSound && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {lang === "bn" ? "ভলিউম" : "Volume"}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
