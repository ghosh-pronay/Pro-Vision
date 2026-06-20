import { useMemo } from "react";
import { Wallet, TrendingUp, Star } from "lucide-react";
import type { Wallet as WalletType } from "@/pages/Wallets";
import { formatBanglaCurrency } from "@/lib/bangla-numbers";

interface WalletStatsProps {
  wallets: WalletType[];
  lang: "en" | "bn";
}

export function WalletStats({ wallets, lang }: WalletStatsProps) {
  const stats = useMemo(() => {
    const total = wallets.reduce((sum, w) => sum + w.balance, 0);
    const byType = {
      cash: wallets
        .filter((w) => w.type === "cash")
        .reduce((s, w) => s + w.balance, 0),
      bank: wallets
        .filter((w) => w.type === "bank")
        .reduce((s, w) => s + w.balance, 0),
      credit: wallets
        .filter((w) => w.type === "credit")
        .reduce((s, w) => s + w.balance, 0),
      digital: wallets
        .filter((w) => w.type === "digital")
        .reduce((s, w) => s + w.balance, 0),
      other: wallets
        .filter((w) => w.type === "other")
        .reduce((s, w) => s + w.balance, 0),
    };
    const defaultWallet = wallets.find((w) => w.isDefault);
    return { total, byType, defaultWallet };
  }, [wallets]);

  const segments = [
    {
      key: "cash",
      value: stats.byType.cash,
      color: "#22c55e",
      label: lang === "bn" ? "নগদ" : "Cash",
    },
    {
      key: "bank",
      value: stats.byType.bank,
      color: "#1565c0",
      label: lang === "bn" ? "ব্যাংক" : "Bank",
    },
    {
      key: "credit",
      value: stats.byType.credit,
      color: "#7b1fa2",
      label: lang === "bn" ? "ক্রেডিট" : "Credit",
    },
    {
      key: "digital",
      value: stats.byType.digital,
      color: "#e91e63",
      label: lang === "bn" ? "ডিজিটাল" : "Digital",
    },
    {
      key: "other",
      value: stats.byType.other,
      color: "#607d8b",
      label: lang === "bn" ? "অন্যান্য" : "Other",
    },
  ].filter((s) => s.value > 0);

  const totalForBar = stats.total || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="glass rounded-2xl p-4 md:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {lang === "bn" ? "মোট ব্যালেন্স" : "Total Balance"}
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight mb-3">
          {formatBanglaCurrency(stats.total)}
        </p>
        {segments.length > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden bg-foreground/10">
            {segments.map((seg) => (
              <div
                key={seg.key}
                style={{
                  width: `${(seg.value / totalForBar) * 100}%`,
                  backgroundColor: seg.color,
                }}
              />
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-3 mt-2">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-muted-foreground">
                {seg.label}: {formatBanglaCurrency(seg.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              {lang === "bn" ? "মোট ওয়ালেট" : "Total Wallets"}
            </span>
          </div>
          <p className="text-2xl font-bold">{wallets.length}</p>
        </div>

        {stats.defaultWallet && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {lang === "bn" ? "ডিফল্ট" : "Default"}
              </span>
            </div>
            <p className="text-sm font-semibold">
              {lang === "bn"
                ? stats.defaultWallet.nameBn || stats.defaultWallet.name
                : stats.defaultWallet.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBanglaCurrency(stats.defaultWallet.balance)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
