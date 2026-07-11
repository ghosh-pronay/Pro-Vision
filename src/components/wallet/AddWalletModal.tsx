import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Zap } from "lucide-react"
import { WalletForm } from "./WalletForm"
import { WALLET_PRESETS } from "@/lib/wallet-presets"
import type { Wallet } from "@/types/wallet"
import {
  Banknote,
  PiggyBank,
  Smartphone,
  Rocket,
  Building2,
  CreditCard,
  MoreHorizontal,
  Landmark,
} from "lucide-react"

const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Banknote,
  PiggyBank,
  Smartphone,
  Rocket,
  Building2,
  CreditCard,
  MoreHorizontal,
  Landmark,
}

interface AddWalletModalProps {
  lang: "en" | "bn"
  onAdd: (data: Omit<Wallet, "_id" | "createdAt">) => void
  onClose: () => void
}

export function AddWalletModal({ lang, onAdd, onClose }: AddWalletModalProps) {
  const [mode, setMode] = useState<"quick" | "custom">("quick")

  const handleQuickAdd = (preset: (typeof WALLET_PRESETS)[0]) => {
    onAdd({
      name: preset.name,
      nameBn: preset.nameBn,
      type: preset.type,
      balance: 0,
      currency: "BDT",
      color: preset.color,
      icon: preset.icon,
      isDefault: false,
      presetId: preset.id,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="glass rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {lang === "bn" ? "ওয়ালেট যোগ করুন" : "Add Wallet"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-1 rounded-lg hover:bg-foreground/5"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode("quick")}
            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === "quick"
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-foreground/5"
            }`}
          >
            <Zap className="h-4 w-4" />
            {lang === "bn" ? "দ্রুত যোগ" : "Quick Add"}
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === "custom"
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-foreground/5"
            }`}
          >
            <Plus className="h-4 w-4" />
            {lang === "bn" ? "কাস্টম" : "Custom"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "quick" ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2"
            >
              <p className="text-sm text-muted-foreground mb-3">
                {lang === "bn"
                  ? "একটিপ যোগ করতে ক্লিক করুন"
                  : "Tap to add with one tap"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WALLET_PRESETS.map((preset) => {
                  const Icon = ICON_MAP[preset.icon] || MoreHorizontal
                  return (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickAdd(preset)}
                      className="cursor-pointer p-3 rounded-xl border border-border/50 hover:border-primary/50 transition-all text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                        style={{ backgroundColor: `${preset.color}20` }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: preset.color }}
                        />
                      </div>
                      <p className="text-xs font-medium truncate">
                        {lang === "bn" ? preset.nameBn : preset.name}
                      </p>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <WalletForm lang={lang} onSubmit={onAdd} onClose={onClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
