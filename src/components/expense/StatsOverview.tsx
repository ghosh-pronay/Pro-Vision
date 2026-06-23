import { Wallet, ArrowDown, ArrowUp } from "lucide-react";
import { t, type TranslationKey, type Lang } from "@/i18n/translations";
import { toBanglaNumber } from "./types";

interface Props {
  lang: Lang;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  statsLoading: boolean;
}

export function StatsOverview({
  lang,
  totalIncome,
  totalExpense,
  netBalance,
  statsLoading,
}: Props) {
  const t_ = (key: string) => t(key as TranslationKey, lang);

  if (statsLoading) {
    return (
      <div className="glass-strong rounded-2xl p-6 glass-accent-top">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl p-3 animate-pulse">
              <div className="h-3 bg-foreground/10 rounded w-16 mx-auto mb-2" />
              <div className="h-5 bg-foreground/10 rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6 glass-accent-top">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="glass rounded-xl p-3">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <ArrowDown className="size-4 text-[var(--pv-green)]" />
            <span className="text-xs text-muted-foreground">
              {t_("expense.totalIncome")}
            </span>
          </div>
          <div className="text-lg font-bold text-[var(--pv-green)]">
            ৳
            {lang === "bn"
              ? toBanglaNumber(totalIncome)
              : totalIncome.toLocaleString()}
          </div>
        </div>
        <div className="glass rounded-xl p-3">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <ArrowUp className="size-4 text-[var(--pv-red)]" />
            <span className="text-xs text-muted-foreground">
              {t_("expense.totalExpense")}
            </span>
          </div>
          <div className="text-lg font-bold text-[var(--pv-red)]">
            ৳
            {lang === "bn"
              ? toBanglaNumber(totalExpense)
              : totalExpense.toLocaleString()}
          </div>
        </div>
        <div className="glass rounded-xl p-3">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Wallet className="size-4 text-[var(--pv-blue)]" />
            <span className="text-xs text-muted-foreground">
              {t_("expense.netBalance")}
            </span>
          </div>
          <div className="text-lg font-bold text-[var(--pv-blue)]">
            ৳
            {lang === "bn"
              ? toBanglaNumber(netBalance)
              : netBalance.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
