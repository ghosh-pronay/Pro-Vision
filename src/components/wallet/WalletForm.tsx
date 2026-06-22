import { useState } from "react";
import { X } from "lucide-react";
import type { Wallet } from "@/types/wallet";

const TYPE_OPTIONS = [
  { value: "cash", label: "Cash", labelBn: "নগদ" },
  { value: "bank", label: "Bank", labelBn: "ব্যাংক" },
  { value: "credit", label: "Credit Card", labelBn: "ক্রেডিট কার্ড" },
  { value: "digital", label: "Digital", labelBn: "ডিজিটাল" },
  { value: "other", label: "Other", labelBn: "অন্যান্য" },
];

const COLOR_OPTIONS = [
  "#22c55e",
  "#10b981",
  "#e91e63",
  "#ff5722",
  "#d32f2f",
  "#4caf50",
  "#1565c0",
  "#0d47a1",
  "#7b1fa2",
  "#c2185b",
  "#ad1457",
  "#607d8b",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const ICON_OPTIONS = [
  "Banknote",
  "PiggyBank",
  "Smartphone",
  "Rocket",
  "Building2",
  "CreditCard",
  "Landmark",
  "MoreHorizontal",
];

interface WalletFormProps {
  lang: "en" | "bn";
  initialData?: Partial<Wallet>;
  onSubmit: (data: Omit<Wallet, "_id" | "createdAt">) => void;
  onClose: () => void;
}

export function WalletForm({
  lang,
  initialData,
  onSubmit,
  onClose,
}: WalletFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [nameBn, setNameBn] = useState(initialData?.nameBn || "");
  const [type, setType] = useState<Wallet["type"]>(initialData?.type || "cash");
  const [balance, setBalance] = useState(
    initialData?.balance?.toString() || "0",
  );
  const [currency, setCurrency] = useState(initialData?.currency || "BDT");
  const [color, setColor] = useState(initialData?.color || "#22c55e");
  const [icon, setIcon] = useState(initialData?.icon || "Banknote");
  const [isDefault, setIsDefault] = useState(initialData?.isDefault || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      nameBn: nameBn.trim() || name.trim(),
      type,
      balance: parseFloat(balance) || 0,
      currency,
      color,
      icon,
      isDefault,
      presetId: initialData?.presetId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {initialData?._id
            ? lang === "bn"
              ? "ওয়ালেট সম্পাদনা"
              : "Edit Wallet"
            : lang === "bn"
              ? "নতুন ওয়ালেট"
              : "New Wallet"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer p-1 rounded-lg hover:bg-foreground/5"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">
            {lang === "bn" ? "নাম (ইংরেজি)" : "Name (English)"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={lang === "bn" ? "ওয়ালেটের নাম" : "Wallet name"}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">
            {lang === "bn" ? "নাম (বাংলা)" : "Name (Bengali)"}
          </label>
          <input
            type="text"
            value={nameBn}
            onChange={(e) => setNameBn(e.target.value)}
            placeholder={
              lang === "bn" ? "ওয়ালেটের বাংলা নাম" : "Wallet name in Bengali"
            }
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            {lang === "bn" ? "ধরন" : "Type"}
          </label>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value as Wallet["type"])}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  type === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-foreground/5"
                }`}
              >
                {lang === "bn" ? opt.labelBn : opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">
              {lang === "bn" ? "ব্যালেন্স (৳)" : "Balance (৳)"}
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              {lang === "bn" ? "মুদ্রা" : "Currency"}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            {lang === "bn" ? "রঙ" : "Color"}
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`cursor-pointer w-7 h-7 rounded-full transition-transform ${
                  color === c ? "scale-110 ring-2 ring-offset-2" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            {lang === "bn" ? "আইকন" : "Icon"}
          </label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`cursor-pointer w-9 h-9 rounded-lg border flex items-center justify-center text-xs transition-all ${
                  icon === ic
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-foreground/5"
                }`}
              >
                {ic.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-sm">
            {lang === "bn"
              ? "ডিফল্ট ওয়ালেট হিসেবে সেট করুন"
              : "Set as default wallet"}
          </span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
        >
          {lang === "bn" ? "বাতিল" : "Cancel"}
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="cursor-pointer flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {initialData?._id
            ? lang === "bn"
              ? "আপডেট"
              : "Update"
            : lang === "bn"
              ? "যোগ করুন"
              : "Add"}
        </button>
      </div>
    </form>
  );
}
