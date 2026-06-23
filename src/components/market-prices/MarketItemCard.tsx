import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Heart,
  Bell,
  BellOff,
  Share2,
  ShoppingCart,
  Calculator,
  BarChart3,
} from "lucide-react";
import { MarketItem, PriceAlert, getPriceChange } from "./types";
import { renderMiniChart } from "./chartUtils";
import { toastSuccess } from "@/lib/toast-helpers";

interface MarketItemCardProps {
  item: MarketItem;
  lang: string;
  favorites: string[];
  priceAlerts: PriceAlert[];
  onToggleFavorite: (id: string) => void;
  onShowHistory: (id: string) => void;
  onShowCalculator: (id: string) => void;
  onAddToShoppingList: (id: string) => void;
  onShowAddAlert: (id: string) => void;
}

export function MarketItemCard({
  item,
  lang,
  favorites,
  priceAlerts,
  onToggleFavorite,
  onShowHistory,
  onShowCalculator,
  onAddToShoppingList,
  onShowAddAlert,
}: MarketItemCardProps) {
  const change = getPriceChange(item.currentPrice, item.prevPrice);
  const hasAlert = priceAlerts.some((a) => a.itemId === item.id);

  const handleShare = () => {
    const text =
      lang === "bn"
        ? `${item.nameBn}: ৳${item.currentPrice}/${item.unit}\n`
        : `${item.nameEn}: ৳${item.currentPrice}/${item.unit}\n`;

    if (navigator.share) {
      navigator.share({
        title: lang === "bn" ? "বাজার মূল্য" : "Market Price",
        text,
      });
    } else {
      navigator.clipboard.writeText(text);
      toastSuccess(lang === "bn" ? "কপি হয়েছে" : "Copied to clipboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">
            {lang === "bn" ? item.nameBn : item.nameEn}
          </h3>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? item.nameEn : item.nameBn}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className="cursor-pointer p-1.5 rounded-lg hover:bg-foreground/5"
          >
            <Heart
              className={`h-4 w-4 ${
                favorites.includes(item.id)
                  ? "fill-pink-500 text-pink-500"
                  : "text-muted-foreground"
              }`}
            />
          </button>
          <button
            onClick={() => onShowAddAlert(item.id)}
            className="cursor-pointer p-1.5 rounded-lg hover:bg-foreground/5"
          >
            {hasAlert ? (
              <Bell className="h-4 w-4 text-amber-500" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-2xl font-bold">৳{item.currentPrice}</p>
          <p className="text-xs text-muted-foreground">/{item.unit}</p>
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            change.isUp ? "text-red-500" : "text-green-500"
          }`}
        >
          {change.isUp ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {change.isUp ? "+" : ""}
          {change.value.toFixed(1)}%
        </div>
      </div>

      <div className="mb-3">
        {renderMiniChart(item.history7d, change.isUp ? "#ef4444" : "#22c55e")}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onShowHistory(item.id)}
          className="cursor-pointer flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg glass text-xs font-medium hover:bg-foreground/5"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          {lang === "bn" ? "ইতিহাস" : "History"}
        </button>
        <button
          onClick={() => onShowCalculator(item.id)}
          className="cursor-pointer flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg glass text-xs font-medium hover:bg-foreground/5"
        >
          <Calculator className="h-3.5 w-3.5" />
          {lang === "bn" ? "হিসাব" : "Calc"}
        </button>
        <button
          onClick={() => onAddToShoppingList(item.id)}
          className="cursor-pointer flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg glass text-xs font-medium hover:bg-foreground/5"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {lang === "bn" ? "তালিকা" : "List"}
        </button>
        <button
          onClick={handleShare}
          className="cursor-pointer flex items-center justify-center px-2 py-1.5 rounded-lg glass text-xs font-medium hover:bg-foreground/5"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
