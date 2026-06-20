import { motion } from "framer-motion";
import {
  Banknote,
  PiggyBank,
  Smartphone,
  Rocket,
  Building2,
  CreditCard,
  MoreHorizontal,
  Star,
  Edit3,
  Trash2,
  Landmark,
} from "lucide-react";
import type { Wallet } from "@/pages/Wallets";
import { formatBanglaCurrency } from "@/lib/bangla-numbers";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Banknote,
  PiggyBank,
  Smartphone,
  Rocket,
  Building2,
  CreditCard,
  MoreHorizontal,
  Landmark,
};

interface WalletCardProps {
  wallet: Wallet;
  lang: "en" | "bn";
  onEdit: (wallet: Wallet) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function WalletCard({
  wallet,
  lang,
  onEdit,
  onDelete,
  onSetDefault,
}: WalletCardProps) {
  const Icon = ICON_MAP[wallet.icon] || Wallet;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="glass rounded-2xl p-4 relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: wallet.color }}
      />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl p-3"
            style={{ backgroundColor: `${wallet.color}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: wallet.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">
                {lang === "bn" ? wallet.nameBn || wallet.name : wallet.name}
              </h3>
              {wallet.isDefault && (
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mt-0.5"
              style={{
                backgroundColor: `${wallet.color}20`,
                color: wallet.color,
              }}
            >
              {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex gap-0.5">
          {!wallet.isDefault && (
            <button
              onClick={() => onSetDefault(wallet._id)}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors"
              title={lang === "bn" ? "ডিফল্ট সেট করুন" : "Set as default"}
            >
              <Star className="h-3.5 w-3.5 text-muted-foreground hover:text-yellow-500" />
            </button>
          )}
          <button
            onClick={() => onEdit(wallet)}
            className="cursor-pointer p-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete(wallet._id)}
            className="cursor-pointer p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border/30">
        <p className="text-xl font-bold tracking-tight">
          {formatBanglaCurrency(wallet.balance)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {wallet.currency || "BDT"}
        </p>
      </div>
    </motion.div>
  );
}
