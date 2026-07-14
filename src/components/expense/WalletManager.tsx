import { motion } from "framer-motion"
import { Wallet, Plus, Edit3, Star, Trash2 } from "lucide-react"
import { t, type Lang } from "@/i18n/translations"
import type { Wallet as WalletType } from "@/types/wallet"
import { fadeUp } from "./constants"

interface WalletManagerProps {
  lang: Lang
  visibleWallets: WalletType[]
  onAdd: () => void
  onEdit: (wallet: WalletType) => void
  onDelete: (id: string) => void
  onSetDefault: (wallet: WalletType) => void
}

export function WalletManager({
  lang,
  visibleWallets,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
}: WalletManagerProps) {
  return (
    <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {t("expense.walletBalance", lang)}
        </h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-[var(--pv-blue)] hover:underline cursor-pointer"
        >
          <Plus className="size-3" />
          {lang === "bn" ? "ওয়ালেট যোগ" : "Add Wallet"}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {visibleWallets.map((w: WalletType) => (
          <div
            key={w._id}
            className="glass rounded-xl p-3 hover:bg-foreground/5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: w.color }}
                >
                  <Wallet className="size-3 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground truncate">
                  {lang === "bn" && w.nameBn ? w.nameBn : w.name}
                </span>
                {w.isDefault && (
                  <Star className="size-3 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onSetDefault(w)}
                  className="cursor-pointer p-1 rounded hover:bg-yellow-500/10"
                  title={lang === "bn" ? "ডিফল্ট" : "Default"}
                >
                  <Star className="size-3 text-muted-foreground hover:text-yellow-500" />
                </button>
                <button
                  onClick={() => onEdit(w)}
                  className="cursor-pointer p-1 rounded hover:bg-foreground/5"
                  aria-label="Edit wallet"
                >
                  <Edit3 className="size-3 text-muted-foreground" />
                </button>
                <button
                  onClick={() => onDelete(w._id)}
                  className="cursor-pointer p-1 rounded hover:bg-destructive/10"
                  aria-label="Delete wallet"
                >
                  <Trash2 className="size-3 text-destructive" />
                </button>
              </div>
            </div>
            <div className="text-sm font-bold text-foreground">
              ৳{w.balance.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
