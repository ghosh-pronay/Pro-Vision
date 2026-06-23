import { motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { MarketItem, PriceAlert } from "./types";
import { renderFullChart } from "./chartUtils";

interface PriceHistoryModalProps {
  item: MarketItem;
  lang: string;
  priceAlerts: PriceAlert[];
  onClose: () => void;
  onRemoveAlert: (id: string) => void;
}

export function PriceHistoryModal({
  item,
  lang,
  priceAlerts,
  onClose,
  onRemoveAlert,
}: PriceHistoryModalProps) {
  const itemAlerts = priceAlerts.filter((a) => a.itemId === item.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {lang === "bn" ? item.nameBn : item.nameEn} -{" "}
            {lang === "bn" ? "মূল্য ইতিহাস" : "Price History"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">
            {lang === "bn" ? "৩০ দিনের চার্ট" : "30-Day Chart"}
          </h4>
          <div className="glass rounded-xl p-4">
            {renderFullChart(item.history30d, "#3b82f6")}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {lang === "bn" ? "সর্বোচ্চ" : "Max"}
            </p>
            <p className="text-lg font-bold text-red-500">
              ৳{Math.max(...item.history30d)}
            </p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {lang === "bn" ? "সর্বনিম্ন" : "Min"}
            </p>
            <p className="text-lg font-bold text-green-500">
              ৳{Math.min(...item.history30d)}
            </p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {lang === "bn" ? "গড়" : "Avg"}
            </p>
            <p className="text-lg font-bold">
              ৳
              {(
                item.history30d.reduce((a, b) => a + b, 0) /
                item.history30d.length
              ).toFixed(0)}
            </p>
          </div>
        </div>

        {itemAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-2 rounded-lg bg-foreground/5 mb-2"
          >
            <span className="text-sm">
              {lang === "bn" ? "সতর্কতা" : "Alert"}:{" "}
              {alert.direction === "above" ? "≥" : "≤"} ৳{alert.targetPrice}
            </span>
            <button
              onClick={() => onRemoveAlert(alert.id)}
              className="cursor-pointer p-1 hover:bg-destructive/10 rounded"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
