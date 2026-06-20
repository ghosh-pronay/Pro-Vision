import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { WalletCard } from "./WalletCard";
import type { Wallet } from "@/pages/Wallets";
import { EmptyState } from "@/components/ui/EmptyState";
import { Wallet as WalletIcon } from "lucide-react";
import { WALLET_CATEGORIES } from "@/lib/wallet-presets";

interface WalletListProps {
  wallets: Wallet[];
  lang: "en" | "bn";
  onEdit: (wallet: Wallet) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onAdd: () => void;
}

type SortOption = "name" | "balance" | "date";

export function WalletList({
  wallets,
  lang,
  onEdit,
  onDelete,
  onSetDefault,
  onAdd,
}: WalletListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("date");

  const filtered = useMemo(() => {
    let result = wallets;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          (w.nameBn && w.nameBn.includes(q)),
      );
    }

    if (category !== "all") {
      result = result.filter((w) => {
        if (category === "cash") return w.type === "cash";
        if (category === "mfs") return w.type === "digital";
        if (category === "bank") return w.type === "bank";
        if (category === "credit") return w.type === "credit";
        return w.type === "other";
      });
    }

    result = [...result].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "balance") return b.balance - a.balance;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return result;
  }, [wallets, search, category, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              lang === "bn" ? "ওয়ালেট খুঁজুন..." : "Search wallets..."
            }
            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="all">{lang === "bn" ? "সব" : "All"}</option>
            {WALLET_CATEGORIES.filter((c) => c.id !== "custom").map((cat) => (
              <option key={cat.id} value={cat.id}>
                {lang === "bn" ? cat.nameBn : cat.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="date">{lang === "bn" ? "তারিখ" : "Date"}</option>
            <option value="name">{lang === "bn" ? "নাম" : "Name"}</option>
            <option value="balance">
              {lang === "bn" ? "ব্যালেন্স" : "Balance"}
            </option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          title={lang === "bn" ? "কোনো ওয়ালেট নেই" : "No wallets found"}
          description={
            search || category !== "all"
              ? lang === "bn"
                ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন"
                : "Try changing your filters"
              : lang === "bn"
                ? "আপনার প্রথম ওয়ালেট যোগ করুন"
                : "Add your first wallet to get started"
          }
          action={
            !search && category === "all"
              ? {
                  label: lang === "bn" ? "ওয়ালেট যোগ করুন" : "Add Wallet",
                  onClick: onAdd,
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((wallet) => (
            <WalletCard
              key={wallet._id}
              wallet={wallet}
              lang={lang}
              onEdit={onEdit}
              onDelete={onDelete}
              onSetDefault={onSetDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
}
