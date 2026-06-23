import { motion } from "framer-motion";
import { X } from "lucide-react";
import { MarketItem } from "./types";
import { useState } from "react";

interface CalculatorModalProps {
  item: MarketItem;
  lang: string;
  onClose: () => void;
  onAddToList: (itemId: string) => void;
}

export function CalculatorModal({
  item,
  lang,
  onClose,
  onAddToList,
}: CalculatorModalProps) {
  const [quantity, setQuantity] = useState("1");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 w-full max-w-sm mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {lang === "bn" ? "মূল্য হিসাব" : "Price Calculator"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {lang === "bn" ? item.nameBn : item.nameEn}
            </p>
            <p className="text-lg font-bold">
              ৳{item.currentPrice}/{item.unit}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {lang === "bn" ? "পরিমাণ" : "Quantity"} ({item.unit})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0.1"
              step="0.1"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="glass rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {lang === "bn" ? "মোট খরচ" : "Total Cost"}
            </p>
            <p className="text-2xl font-bold">
              ৳{(item.currentPrice * parseFloat(quantity || "0")).toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => {
              onAddToList(item.id);
              onClose();
            }}
            className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {lang === "bn" ? "তালিকায় যোগ করুন" : "Add to List"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
