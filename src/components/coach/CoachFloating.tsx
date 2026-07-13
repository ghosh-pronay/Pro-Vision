import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Send,
  Bot,
  AlertCircle,
  Paperclip,
  Mic,
  MicOff,
  Image,
  FileText,
  Sparkles,
  ChevronDown,
} from "lucide-react"
import { useAppStore } from "@/store"
import { useI18n } from "@/hooks/use-i18n"
import { cn } from "@/lib/utils"
import { useCoachRateLimit } from "@/hooks/use-coach-rate-limit"
import {
  generateGeminiResponse,
  isAIConfigured,
  type GeminiMessage,
} from "@/lib/ai"

interface Attachment {
  id: string
  name: string
  type: "image" | "document" | "file"
  data: string
  preview?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachments?: Attachment[]
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: (event: {
    resultIndex: number
    results: Array<{ isFinal: boolean; 0: { transcript: string } }>
  }) => void
  onerror: () => void
  onend: () => void
  start: () => void
  stop: () => void
}

const ACCEPTED_FILE_TYPES =
  "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx,.json"

const COACH_GRADIENT =
  "linear-gradient(135deg, #0f172a 0%, #1e3a5f 25%, #1a6fb5 50%, #2abfbf 75%, #9b8ec4 100%)"

function fileToAttachment(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const isImage = file.type.startsWith("image/")
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        type: isImage ? "image" : "document",
        data: dataUrl,
        preview: isImage ? dataUrl : undefined,
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const CoachFloating = memo(function CoachFloating() {
  const { t } = useI18n()
  const { coachOpen, setCoachOpen } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isPremium = false
  const { remaining, isLimitReached, incrementUsage } =
    useCoachRateLimit(isPremium)

  useEffect(() => {
    const timeout = typingTimeoutRef.current
    return () => {
      if (timeout) clearTimeout(timeout)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // Recognition may not be running
        }
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (coachOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [coachOpen])

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const newAttachments: Attachment[] = []
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 10 * 1024 * 1024) continue
      try {
        newAttachments.push(await fileToAttachment(files[i]))
      } catch (e) {
        console.error("[CoachFloating] Failed to read file:", e)
      }
    }
    setAttachments((prev) => [...prev, ...newAttachments])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
    },
    [addFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const toggleVoiceRecording = useCallback(() => {
    const SpeechRecognitionConstructor =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition

    if (!SpeechRecognitionConstructor) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Voice input is not supported in this browser. Please try Chrome or Edge.",
          timestamp: new Date(),
        },
      ])
      return
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      return
    }

    const recognition = new (SpeechRecognitionConstructor as {
      new (): SpeechRecognitionLike
    })()
    recognition.lang = "bn-BD"
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = (event: {
      resultIndex: number
      results: Array<{ isFinal: boolean; 0: { transcript: string } }>
    }) => {
      let finalTranscript = ""
      let interimTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setInput((prev) => prev + finalTranscript)
      } else if (interimTranscript) {
        setInput((prev) => prev.replace(/\|?$/, "") + interimTranscript)
      }
    }

    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [isRecording])

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if ((!trimmed && attachments.length === 0) || isLimitReached) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setAttachments([])

    if (!incrementUsage()) return

    setIsTyping(true)

    const attachmentContext =
      userMsg.attachments && userMsg.attachments.length > 0
        ? `\n[User attached ${userMsg.attachments.length} file(s): ${userMsg.attachments.map((a) => a.name).join(", ")}]`
        : ""

    const userText = trimmed + attachmentContext

    const geminiMessages: GeminiMessage[] = [
      ...messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        parts: m.content,
      })),
      { role: "user" as const, parts: userText },
    ]

    const systemPrompt = `You are Pro-Vision AI Coach, a friendly and motivational productivity assistant. You speak naturally in a mix of English and Bengali when the user prefers it. You help with:
- Task management and productivity
- Habit building and consistency
- Financial planning (BDT, savings, budgeting)
- Mental health and wellbeing
- Study tracking and learning
- Goal setting and achievement

Be concise, warm, and encouraging. Use simple language. If the user writes in Bengali, respond in Bengali. If they write in English, respond in English. Keep responses under 200 words unless more detail is needed.`

    try {
      const response = await generateGeminiResponse(
        geminiMessages,
        systemPrompt,
      )
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, reply])
    } catch (error) {
      console.error("[CoachFloating]", error)
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I couldn't process your request right now. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, reply])
    } finally {
      setIsTyping(false)
    }
  }, [input, attachments, isLimitReached, incrementUsage, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const coachStarters = (
    t.coach as unknown as { starters: Record<string, string> }
  ).starters

  const starters = useMemo(
    () => [
      coachStarters.plan,
      coachStarters.finance,
      coachStarters.habit,
      coachStarters.stress,
    ],
    [
      coachStarters.plan,
      coachStarters.finance,
      coachStarters.habit,
      coachStarters.stress,
    ],
  )

  return (
    <>
      <motion.button
        onClick={() => setCoachOpen(!coachOpen)}
        className={cn(
          "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg cursor-pointer transition-all",
          "bottom-6 right-6 md:bottom-6",
          "max-md:bottom-[calc(env(safe-area-inset-bottom,0px)+80px)]",
          coachOpen
            ? "bg-white/10 backdrop-blur-md border border-white/20"
            : "text-white shadow-[0_0_24px_rgba(42,191,191,0.5)]",
        )}
        style={
          !coachOpen
            ? {
                background:
                  "linear-gradient(135deg, #1a6fb5, #2abfbf, #9b8ec4)",
              }
            : undefined
        }
        whileHover={{ scale: 1.08, boxShadow: "0 0 32px rgba(42,191,191,0.7)" }}
        whileTap={{ scale: 0.92 }}
        aria-label="Toggle Coach"
      >
        <AnimatePresence mode="wait">
          {coachOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {coachOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed z-50 flex w-[400px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-white/20 shadow-2xl overflow-hidden
              bottom-24 right-6
              max-md:bottom-[calc(env(safe-area-inset-bottom,0px)+140px)]
              max-md:right-4 max-md:left-4 max-md:w-auto"
            style={{ height: "min(600px, calc(100vh - 200px))" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {/* Header */}
            <div
              className="relative flex items-center gap-2.5 p-4 text-white z-10"
              style={{ background: COACH_GRADIENT }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-tight">
                  {(t.coach as Record<string, string>).title}
                </span>
                <span className="text-[11px] text-white/70">
                  AI-Powered Life Coach
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px]",
                    isAIConfigured()
                      ? "bg-emerald-400/20 text-emerald-200"
                      : "bg-white/10 text-white/60",
                  )}
                >
                  {isAIConfigured() ? "AI Active" : "Demo Mode"}
                </span>
                {isLimitReached ? (
                  <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-0.5 text-[11px] text-red-200">
                    <AlertCircle className="h-3 w-3" />
                    Limit
                  </span>
                ) : (
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] text-white/80">
                    {remaining} left
                  </span>
                )}
              </div>
              {/* Decorative orbs */}
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[var(--pv-teal)]/20 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-[var(--pv-blue)]/20 blur-2xl" />
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 relative"
              style={{
                background:
                  "linear-gradient(180deg, rgba(15,23,42,0.03) 0%, rgba(42,191,191,0.06) 50%, rgba(155,142,196,0.04) 100%)",
              }}
            >
              {/* Drop overlay */}
              <AnimatePresence>
                {dragOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--pv-teal)] bg-white/80 backdrop-blur-sm"
                  >
                    <div className="text-center">
                      <Paperclip className="mx-auto h-8 w-8 text-[var(--pv-teal)]" />
                      <p className="mt-2 text-sm font-medium text-[var(--pv-blue)]">
                        Drop files here
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-2"
                >
                  {/* Welcome card */}
                  <div
                    className="rounded-xl p-4 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(26,111,181,0.08), rgba(42,191,191,0.08), rgba(155,142,196,0.08))",
                    }}
                  >
                    <div
                      className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #1a6fb5, #2abfbf)",
                      }}
                    >
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      How can I help you today?
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ask anything or attach a file for analysis
                    </p>
                  </div>

                  {starters.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * (i + 1) }}
                      onClick={() => {
                        setInput(s)
                        inputRef.current?.focus()
                      }}
                      className="w-full rounded-xl border border-[var(--pv-teal)]/20 bg-white/50 px-3 py-2.5 text-left text-sm text-foreground backdrop-blur-sm transition-all hover:border-[var(--pv-teal)]/40 hover:bg-[var(--pv-teal)]/5 cursor-pointer"
                    >
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                    msg.role === "user"
                      ? "ml-auto text-white rounded-br-md"
                      : "text-foreground rounded-bl-md",
                  )}
                  style={
                    msg.role === "user"
                      ? {
                          background:
                            "linear-gradient(135deg, #1a6fb5, #2abfbf)",
                        }
                      : {
                          background: "rgba(255,255,255,0.7)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(255,255,255,0.4)",
                        }
                  }
                >
                  {/* Render attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="relative overflow-hidden rounded-lg border border-white/20"
                        >
                          {att.preview ? (
                            <img
                              src={att.preview}
                              alt={att.name}
                              className="h-16 w-16 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center bg-white/10">
                              <FileText className="h-6 w-6 text-white/70" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.content}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white/60 px-3.5 py-2.5 text-sm text-muted-foreground backdrop-blur-sm border border-white/30"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--pv-teal)] animate-bounce"
                    style={{ animationDelay: "0s" }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--pv-blue)] animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--pv-lavender)] animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Attachment preview */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/10"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                >
                  <div className="flex gap-2 p-2 overflow-x-auto">
                    {attachments.map((att) => (
                      <div key={att.id} className="relative flex-shrink-0">
                        {att.preview ? (
                          <img
                            src={att.preview}
                            alt={att.name}
                            className="h-14 w-14 rounded-lg object-cover border border-white/30"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/60 border border-white/30">
                            <FileText className="h-5 w-5 text-[var(--pv-blue)]" />
                          </div>
                        )}
                        <button
                          onClick={() => removeAttachment(att.id)}
                          className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                        <p className="mt-0.5 max-w-[56px] truncate text-[9px] text-muted-foreground text-center">
                          {att.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area */}
            <div
              className="relative border-t border-white/10 p-3"
              style={{ background: "rgba(255,255,255,0.5)" }}
            >
              {/* Attachment menu */}
              <AnimatePresence>
                {showAttachmentMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-white/20 bg-white/90 p-2 shadow-lg backdrop-blur-md"
                  >
                    <button
                      onClick={() => {
                        imageInputRef.current?.click()
                        setShowAttachmentMenu(false)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-[var(--pv-teal)]/10 cursor-pointer transition-colors"
                    >
                      <Image className="h-4 w-4 text-[var(--pv-blue)]" />
                      Upload Image
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click()
                        setShowAttachmentMenu(false)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-[var(--pv-teal)]/10 cursor-pointer transition-colors"
                    >
                      <FileText className="h-4 w-4 text-[var(--pv-lavender)]" />
                      Upload Document
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-1.5">
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className={cn(
                    "flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer",
                    showAttachmentMenu
                      ? "bg-[var(--pv-teal)]/15 text-[var(--pv-teal)]"
                      : "text-muted-foreground hover:bg-[var(--pv-teal)]/10 hover:text-[var(--pv-teal)]",
                  )}
                  aria-label="Attach file"
                >
                  {showAttachmentMenu ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={(t.coach as Record<string, string>).placeholder}
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-white/30 bg-white/60 px-3 py-2 text-sm outline-none backdrop-blur-sm placeholder:text-muted-foreground focus:border-[var(--pv-teal)] focus:ring-1 focus:ring-[var(--pv-teal)]/30 min-h-[36px] max-h-[100px]"
                  style={{ lineHeight: "1.4" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = "auto"
                    target.style.height =
                      Math.min(target.scrollHeight, 100) + "px"
                  }}
                />

                <button
                  onClick={toggleVoiceRecording}
                  className={cn(
                    "flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer",
                    isRecording
                      ? "bg-red-500/15 text-red-500 animate-pulse"
                      : "text-muted-foreground hover:bg-[var(--pv-blue)]/10 hover:text-[var(--pv-blue)]",
                  )}
                  aria-label={
                    isRecording ? "Stop recording" : "Start voice input"
                  }
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={sendMessage}
                  disabled={
                    (!input.trim() && attachments.length === 0) || isTyping
                  }
                  className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background:
                      input.trim() || attachments.length > 0
                        ? "linear-gradient(135deg, #1a6fb5, #2abfbf)"
                        : undefined,
                  }}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files)
                  e.target.value = ""
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files)
                  e.target.value = ""
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})

export default CoachFloating
