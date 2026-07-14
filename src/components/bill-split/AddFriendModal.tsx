import { motion } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { useState } from "react"
import { X } from "lucide-react"

interface AddFriendModalProps {
  t: (key: string) => string
  onAdd: (name: string, phone: string) => void
  onClose: () => void
}

export function AddFriendModal({ t, onAdd, onClose }: AddFriendModalProps) {
  const { lang } = useLang()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  const handleAdd = () => {
    if (!name) return
    onAdd(name, phone)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass rounded-2xl p-6 w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("billSplit.addFriend")}</h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">
              {t("billSplit.name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === "bn" ? "বন্ধুর নাম" : "Friend's name"}
              className="w-full rounded-xl glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              {t("billSplit.phone")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880..."
              className="w-full rounded-xl glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 py-2.5 rounded-xl glass font-medium hover:bg-foreground/5"
          >
            {t("billSplit.cancel")}
          </button>
          <button
            onClick={handleAdd}
            className="cursor-pointer flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            {t("billSplit.save")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
