import { useState, useEffect, useCallback, useRef, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, X } from "lucide-react"

interface SpeechRecognitionLike {
  start(): void
  stop(): void
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: Array<{ isFinal: boolean; [index: number]: { transcript: string } }>
}

interface VoiceCommand {
  command: string
  action: string
  params?: Record<string, string>
}

interface VoiceCommandsProps {
  onCommand: (command: VoiceCommand) => void
  onClose: () => void
}

const COMMAND_PATTERNS: Array<{
  patterns: RegExp[]
  action: string
  extractParams?: (match: RegExpMatchArray) => Record<string, string>
}> = [
  {
    patterns: [/add task (.+)/i, /create task (.+)/i, /new task (.+)/i],
    action: "addTask",
    extractParams: (match) => ({ title: match[1] }),
  },
  {
    patterns: [/complete task (.+)/i, /done task (.+)/i, /finish task (.+)/i],
    action: "completeTask",
    extractParams: (match) => ({ title: match[1] }),
  },
  {
    patterns: [/add expense (.+) (\d+)/i, /spent (\d+) on (.+)/i],
    action: "addExpense",
    extractParams: (match) => ({
      description: match[1],
      amount: match[2],
    }),
  },
  {
    patterns: [/add income (.+) (\d+)/i, /earned (\d+) from (.+)/i],
    action: "addIncome",
    extractParams: (match) => ({
      description: match[1],
      amount: match[2],
    }),
  },
  {
    patterns: [/start focus/i, /begin focus/i, /start timer/i],
    action: "startFocus",
  },
  {
    patterns: [/stop focus/i, /end focus/i, /stop timer/i],
    action: "stopFocus",
  },
  {
    patterns: [/log mood (.+)/i, /feeling (.+)/i, /mood (.+)/i],
    action: "logMood",
    extractParams: (match) => ({ mood: match[1] }),
  },
  {
    patterns: [/check in (.+)/i, /complete habit (.+)/i],
    action: "checkHabit",
    extractParams: (match) => ({ habit: match[1] }),
  },
  {
    patterns: [/show dashboard/i, /go to dashboard/i, /open dashboard/i],
    action: "navigate",
    extractParams: () => ({ page: "dashboard" }),
  },
  {
    patterns: [/show tasks/i, /go to tasks/i, /open tasks/i],
    action: "navigate",
    extractParams: () => ({ page: "todo" }),
  },
  {
    patterns: [/show habits/i, /go to habits/i, /open habits/i],
    action: "navigate",
    extractParams: () => ({ page: "habits" }),
  },
  {
    patterns: [/show expenses/i, /go to expenses/i, /open expenses/i],
    action: "navigate",
    extractParams: () => ({ page: "expense" }),
  },
  {
    patterns: [/help/i, /what can you do/i, /commands/i],
    action: "showHelp",
  },
]

const VoiceCommands = memo(function VoiceCommands({
  onCommand,
  onClose,
}: VoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearFeedbackTimeout = () => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = null
    }
  }

  const processTranscript = useCallback(
    (text: string) => {
      const normalizedText = text.toLowerCase().trim()

      for (const { patterns, action, extractParams } of COMMAND_PATTERNS) {
        for (const pattern of patterns) {
          const match = normalizedText.match(pattern)
          if (match) {
            const command: VoiceCommand = {
              command: text,
              action,
              params: extractParams?.(match),
            }
            onCommand(command)
            clearFeedbackTimeout()
            setFeedback(`Executing: ${action}`)
            feedbackTimeoutRef.current = setTimeout(
              () => setFeedback(null),
              2000,
            )
            return
          }
        }
      }

      clearFeedbackTimeout()
      setFeedback("Command not recognized. Try 'help' for available commands.")
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 3000)
    },
    [onCommand],
  )

  const startListening = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setFeedback("Speech recognition not supported in this browser.")
      return
    }

    const Win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike
      webkitSpeechRecognition?: new () => SpeechRecognitionLike
    }
    const SpeechRecognition =
      Win.SpeechRecognition || Win.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex
      const result = event.results[current]
      const text = result[0].transcript
      setTranscript(text)

      if (result.isFinal) {
        processTranscript(text)
        setIsListening(false)
      }
    }

    recognition.onerror = (event: { error: string }) => {
      if (event.error === "not-allowed") {
        setFeedback("Microphone access denied. Please enable it in settings.")
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [processTranscript])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  useEffect(() => {
    return () => {
      clearFeedbackTimeout()
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

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
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Voice Commands</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <motion.button
            animate={{
              scale: isListening ? [1, 1.1, 1] : 1,
              boxShadow: isListening
                ? "0 0 0 8px rgba(99, 102, 241, 0.2)"
                : "none",
            }}
            transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}
            onClick={isListening ? stopListening : startListening}
            className={`h-24 w-24 rounded-full flex items-center justify-center transition-colors ${
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isListening ? (
              <MicOff className="h-10 w-10 text-white" />
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
          </motion.button>

          <p className="text-sm text-muted-foreground mt-4">
            {isListening ? "Listening..." : "Tap to speak"}
          </p>

          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 w-full"
            >
              <p className="text-sm text-center">"{transcript}"</p>
            </motion.div>
          )}

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 rounded-xl bg-primary/20 border border-primary/30 w-full"
              >
                <p className="text-sm text-center text-primary">{feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Try saying:
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>"Add task Buy groceries"</p>
            <p>"Add expense Lunch 250"</p>
            <p>"Start focus"</p>
            <p>"Log mood great"</p>
            <p>"Show tasks"</p>
            <p>"Help"</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

export default VoiceCommands
export type { VoiceCommand }
