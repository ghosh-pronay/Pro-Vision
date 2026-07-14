import { motion, AnimatePresence } from "framer-motion"
import { X, Copy, Check, Zap, MessageCircle, Smartphone } from "lucide-react"

interface InviteModalProps {
  open: boolean
  onClose: () => void
  inviteCode: string
  copiedCode: boolean
  lang: "en" | "bn"
  onCopy: (text: string) => void
  onGenerate: () => void
  onShareWhatsApp: () => void
  onShareSMS: () => void
}

export function InviteModal({
  open,
  onClose,
  inviteCode,
  copiedCode,
  lang,
  onCopy,
  onGenerate,
  onShareWhatsApp,
  onShareSMS,
}: InviteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {lang === "bn" ? "সদস্য আমন্ত্রণ" : "Invite Member"}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  {lang === "bn" ? "আমন্ত্রণ কোড" : "Invite Code"}
                </div>
                <div className="text-3xl font-mono font-bold tracking-wider text-[var(--pv-blue)]">
                  {inviteCode}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onCopy(inviteCode)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl glass hover:bg-foreground/10 transition-colors"
                >
                  {copiedCode ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copiedCode
                    ? lang === "bn"
                      ? "কপি হয়েছে!"
                      : "Copied!"
                    : lang === "bn"
                      ? "কোড কপি"
                      : "Copy Code"}
                </button>
                <button
                  onClick={onGenerate}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-foreground/10 transition-colors"
                >
                  <Zap className="size-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onShareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white hover:brightness-110 transition-all"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </button>
                <button
                  onClick={onShareSMS}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white hover:brightness-110 transition-all"
                >
                  <Smartphone className="size-4" />
                  SMS
                </button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                {lang === "bn"
                  ? "আমন্ত্রণ কোড শেয়ার করুন এবং পরিবারে যোগ দিতে দিন"
                  : "Share the invite code and let them join your family"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
