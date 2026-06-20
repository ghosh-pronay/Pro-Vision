import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { Wallet, Plus } from "lucide-react";
import { WalletStats } from "@/components/wallet/WalletStats";
import { WalletList } from "@/components/wallet/WalletList";
import { AddWalletModal } from "@/components/wallet/AddWalletModal";
import { WalletForm } from "@/components/wallet/WalletForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { WALLET_PRESETS } from "@/lib/wallet-presets";
import { toastSuccess } from "@/lib/toast-helpers";
import {
  Banknote,
  PiggyBank,
  Smartphone,
  Rocket,
  Building2,
  CreditCard,
  MoreHorizontal,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Banknote,
  PiggyBank,
  Smartphone,
  Rocket,
  Building2,
  CreditCard,
  MoreHorizontal,
};

export interface Wallet {
  _id: string;
  name: string;
  nameBn?: string;
  type: "cash" | "bank" | "credit" | "savings" | "digital";
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isDefault: boolean;
  presetId?: string;
  createdAt?: number;
}

const INITIAL_WALLETS: Wallet[] = [
  {
    _id: "demo-1",
    name: "Cash (In Hand)",
    nameBn: "নগদ (হাতে)",
    type: "cash",
    balance: 5200,
    currency: "BDT",
    color: "#22c55e",
    icon: "Banknote",
    isDefault: true,
    presetId: "cash-hand",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    _id: "demo-2",
    name: "Bkash",
    nameBn: "বিকাশ",
    type: "digital",
    balance: 12500,
    currency: "BDT",
    color: "#e91e63",
    icon: "Smartphone",
    isDefault: false,
    presetId: "bkash",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    _id: "demo-3",
    name: "Brac Bank",
    nameBn: "ব্র্যাক ব্যাংক",
    type: "bank",
    balance: 85000,
    currency: "BDT",
    color: "#1565c0",
    icon: "Building2",
    isDefault: false,
    presetId: "brac-bank",
    createdAt: Date.now() - 86400000,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Wallets() {
  const { lang } = useLang();
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAddWallet = useCallback(
    (data: Omit<Wallet, "_id" | "createdAt">) => {
      const newWallet: Wallet = {
        ...data,
        _id: Date.now().toString(),
        createdAt: Date.now(),
      };
      if (data.isDefault) {
        setWallets((prev) =>
          prev.map((w) => ({ ...w, isDefault: false })).concat(newWallet),
        );
      } else {
        setWallets((prev) => [...prev, newWallet]);
      }
      setShowAddModal(false);
      toastSuccess(lang === "bn" ? "ওয়ালেট যোগ হয়েছে" : "Wallet added");
    },
    [lang],
  );

  const handleEditWallet = useCallback(
    (data: Omit<Wallet, "_id" | "createdAt">) => {
      if (!editingWallet) return;
      setWallets((prev) =>
        prev.map((w) => {
          if (w._id !== editingWallet._id) return w;
          if (data.isDefault) {
            return { ...w, ...data };
          }
          return { ...w, ...data };
        }),
      );
      if (data.isDefault) {
        setWallets((prev) =>
          prev.map((w) => ({
            ...w,
            isDefault: w._id === editingWallet._id ? true : false,
          })),
        );
      }
      setEditingWallet(null);
      toastSuccess(lang === "bn" ? "ওয়ালেট আপডেট হয়েছে" : "Wallet updated");
    },
    [editingWallet, lang],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setWallets((prev) => prev.filter((w) => w._id !== id));
      setDeleteConfirmId(null);
      toastSuccess(
        lang === "bn" ? "ওয়ালেট মুছে ফেলা হয়েছে" : "Wallet deleted",
      );
    },
    [lang],
  );

  const handleSetDefault = useCallback(
    (id: string) => {
      setWallets((prev) =>
        prev.map((w) => ({ ...w, isDefault: w._id === id })),
      );
      toastSuccess(
        lang === "bn" ? "ডিফল্ট ওয়ালেট সেট হয়েছে" : "Default wallet set",
      );
    },
    [lang],
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            {lang === "bn" ? "ওয়ালেট" : "Wallets"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "bn"
              ? "আপনার সব ওয়ালেট পরিচালনা করুন"
              : "Manage all your wallets in one place"}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "ওয়ালেট যোগ" : "Add Wallet"}
        </button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <WalletStats wallets={wallets} lang={lang} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {lang === "bn" ? "দ্রুত যোগ" : "Quick Add Presets"}
          </h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {WALLET_PRESETS.slice(0, 8).map((preset) => {
            const Icon = ICON_MAP[preset.icon] || Wallet;
            const alreadyAdded = wallets.some((w) => w.presetId === preset.id);
            return (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!alreadyAdded) {
                    handleAddWallet({
                      name: preset.name,
                      nameBn: preset.nameBn,
                      type: preset.type,
                      balance: 0,
                      currency: "BDT",
                      color: preset.color,
                      icon: preset.icon,
                      isDefault: false,
                      presetId: preset.id,
                    });
                  }
                }}
                disabled={alreadyAdded}
                className={`cursor-pointer shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                  alreadyAdded
                    ? "opacity-40 cursor-not-allowed border-border/30"
                    : "border-border/50 hover:border-primary/50"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${preset.color}20` }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: preset.color }}
                  />
                </div>
                <span className="whitespace-nowrap">
                  {lang === "bn" ? preset.nameBn : preset.name}
                </span>
                {alreadyAdded && (
                  <span className="text-[10px] text-green-500">✓</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <WalletList
          wallets={wallets}
          lang={lang}
          onEdit={setEditingWallet}
          onDelete={setDeleteConfirmId}
          onSetDefault={handleSetDefault}
          onAdd={() => setShowAddModal(true)}
        />
      </motion.div>

      {showAddModal && (
        <AddWalletModal
          lang={lang}
          onAdd={handleAddWallet}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <WalletForm
              lang={lang}
              initialData={editingWallet}
              onSubmit={handleEditWallet}
              onClose={() => setEditingWallet(null)}
            />
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId);
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
        title={lang === "bn" ? "ওয়ালেট মুছুন?" : "Delete wallet?"}
        description={
          lang === "bn"
            ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
            : "This action cannot be undone."
        }
      />
    </motion.div>
  );
}
