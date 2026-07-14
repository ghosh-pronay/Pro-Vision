import { motion } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { t, type TranslationKey } from "@/i18n/translations"
import { useState, useEffect, useCallback } from "react"
import { Pause, Play, RotateCcw, X } from "lucide-react"

interface BreathingPhase {
  label: string
  labelBn: string
  seconds: number
  scale: number
}

interface BreathingExerciseProps {
  title?: TranslationKey
  titleBn?: string
  icon?: string
  color?: string
  phases?: BreathingPhase[]
  totalDurationMinutes?: number
  onClose?: () => void
}

export default function BreathingExercise({
  title,
  titleBn,
  icon,
  color = "var(--pv-teal)",
  phases,
  totalDurationMinutes = 5,
  onClose,
}: BreathingExerciseProps) {
  const { lang } = useLang()
  const [isActive, setIsActive] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)

  const exercisePhases: BreathingPhase[] = phases ?? [
    { label: "Inhale", labelBn: "শ্বাস নিন", seconds: 4, scale: 1.5 },
    { label: "Hold", labelBn: "ধরুন", seconds: 4, scale: 1.5 },
    { label: "Exhale", labelBn: "ছেড়ে দিন", seconds: 4, scale: 1 },
    { label: "Hold", labelBn: "ধরুন", seconds: 4, scale: 1 },
  ]

  const currentPhase = exercisePhases[phaseIdx]
  const totalSeconds = totalDurationMinutes * 60

  useEffect(() => {
    if (!isActive || done) return
    const timer = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= totalSeconds) {
          setDone(true)
          setIsActive(false)
          return totalSeconds
        }
        return prev + 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isActive, done, totalSeconds])

  useEffect(() => {
    if (!isActive || done) return
    const timer = setTimeout(() => {
      setPhaseIdx((prev) => (prev + 1) % exercisePhases.length)
    }, currentPhase.seconds * 1000)
    return () => clearTimeout(timer)
  }, [isActive, phaseIdx, currentPhase.seconds, exercisePhases.length, done])

  const reset = useCallback(() => {
    setIsActive(false)
    setPhaseIdx(0)
    setElapsed(0)
    setDone(false)
  }, [])

  const progress = (elapsed / totalSeconds) * 100
  const remaining = totalSeconds - elapsed
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  const phaseLabel = lang === "bn" ? currentPhase.labelBn : currentPhase.label

  return (
    <div className="glass-strong rounded-2xl p-6 text-center">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <h3 className="font-semibold text-sm text-foreground">
            {titleBn ?? (title ? t(title, lang) : "Breathing Exercise")}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-foreground/5 transition-colors"
            aria-label="Close"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="relative w-44 h-44 mx-auto mb-6">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground/5"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <motion.div
          className="absolute inset-4 rounded-full flex items-center justify-center"
          style={{ background: `${color}15` }}
          animate={isActive ? { scale: currentPhase.scale } : { scale: 1 }}
          transition={{ duration: currentPhase.seconds, ease: "easeInOut" }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {done ? "✓" : `${mins}:${secs.toString().padStart(2, "0")}`}
            </div>
            <div className="text-xs font-medium mt-1" style={{ color }}>
              {done ? (lang === "bn" ? "সম্পন্ন" : "Done") : phaseLabel}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={() => {
            if (done) reset()
            else setIsActive(!isActive)
          }}
          className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          }}
        >
          {done ? (
            <>
              <RotateCcw className="size-3.5" />{" "}
              {lang === "bn" ? "আবার" : "Restart"}
            </>
          ) : isActive ? (
            <>
              <Pause className="size-3.5" /> {lang === "bn" ? "বিরতি" : "Pause"}
            </>
          ) : (
            <>
              <Play className="size-3.5" /> {lang === "bn" ? "শুরু" : "Start"}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
