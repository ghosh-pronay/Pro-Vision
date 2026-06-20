import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, X, Clock, Volume2 } from "lucide-react";

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: "sleep" | "stress" | "focus" | "morning" | "anxiety";
  icon: string;
  color: string;
}

const MEDITATION_SESSIONS: MeditationSession[] = [
  {
    id: "sleep-1",
    title: "Deep Sleep",
    description: "Drift into restful sleep with calming sounds",
    duration: 15,
    category: "sleep",
    icon: "🌙",
    color: "#6366f1",
  },
  {
    id: "sleep-2",
    title: "Sleep Story",
    description: "A gentle story to lull you to sleep",
    duration: 20,
    category: "sleep",
    icon: "📖",
    color: "#8b5cf6",
  },
  {
    id: "stress-1",
    title: "Stress Relief",
    description: "Release tension and find calm",
    duration: 10,
    category: "stress",
    icon: "🧘",
    color: "#22c55e",
  },
  {
    id: "stress-2",
    title: "Body Scan",
    description: "Progressive relaxation for your body",
    duration: 12,
    category: "stress",
    icon: "💆",
    color: "#10b981",
  },
  {
    id: "focus-1",
    title: "Laser Focus",
    description: "Sharpen your concentration",
    duration: 10,
    category: "focus",
    icon: "🎯",
    color: "#f97316",
  },
  {
    id: "focus-2",
    title: "Creative Flow",
    description: "Unlock your creative potential",
    duration: 15,
    category: "focus",
    icon: "🎨",
    color: "#ec4899",
  },
  {
    id: "morning-1",
    title: "Morning Energy",
    description: "Start your day with vitality",
    duration: 8,
    category: "morning",
    icon: "☀️",
    color: "#eab308",
  },
  {
    id: "morning-2",
    title: "Gratitude Morning",
    description: "Cultivate gratitude to begin your day",
    duration: 10,
    category: "morning",
    icon: "🙏",
    color: "#f59e0b",
  },
  {
    id: "anxiety-1",
    title: "Calm Anxiety",
    description: "Find peace during anxious moments",
    duration: 8,
    category: "anxiety",
    icon: "💙",
    color: "#06b6d4",
  },
  {
    id: "anxiety-2",
    title: "Grounding",
    description: "Root yourself in the present moment",
    duration: 10,
    category: "anxiety",
    icon: "🌳",
    color: "#14b8a6",
  },
];

interface GuidedMeditationProps {
  onClose: () => void;
}

export default function GuidedMeditation({ onClose }: GuidedMeditationProps) {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phase, setPhase] = useState<"intro" | "meditation" | "outro">("intro");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive || !selectedSession) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setPhase("outro");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, selectedSession]);

  const startSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setTimeRemaining(session.duration * 60);
    setPhase("intro");
    setIsActive(false);
  };

  const togglePlay = () => {
    if (phase === "intro") {
      setPhase("meditation");
    }
    setIsActive(!isActive);
  };

  const resetSession = () => {
    setIsActive(false);
    setPhase("intro");
    if (selectedSession) {
      setTimeRemaining(selectedSession.duration * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const categories = ["sleep", "stress", "focus", "morning", "anxiety"] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 safe-area-pb safe-area-pt"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Guided Meditation</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!selectedSession ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {categories.map((category) => {
                const sessions = MEDITATION_SESSIONS.filter(
                  (s) => s.category === category,
                );
                return (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => startSession(session)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary transition-colors text-left"
                        >
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-xl"
                            style={{ backgroundColor: session.color + "30" }}
                          >
                            {session.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{session.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {session.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {session.duration}m
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div
                className="text-6xl mb-4"
                style={{ filter: isActive ? "none" : "grayscale(0.5)" }}
              >
                {selectedSession.icon}
              </div>
              <h3 className="text-lg font-semibold mb-1">{selectedSession.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {selectedSession.description}
              </p>

              <div className="relative mb-8">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white/10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={selectedSession.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 45 * (1 - timeRemaining / (selectedSession.duration * 60))
                    }`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{formatTime(timeRemaining)}</span>
                  <span className="text-xs text-muted-foreground capitalize">{phase}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetSession}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-4 rounded-full text-white transition-all"
                  style={{ backgroundColor: selectedSession.color }}
                >
                  {isActive ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedSession(null);
                    setIsActive(false);
                    setPhase("intro");
                  }}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {phase === "outro" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <p className="text-lg font-medium text-primary">Session Complete!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Great job taking time for yourself.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
