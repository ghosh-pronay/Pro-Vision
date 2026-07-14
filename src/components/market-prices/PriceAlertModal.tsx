import { motion } from "framer-motion"
import { X } from "lucide-react"
import { MarketItem } from "./types"
import { useState } from "react"

interface PriceAlertModalProps {
  item: MarketItem
  lang: string
  onClose: () => void
  onAddAlert: (
    itemId: string,
    targetPrice: number,
    direction: "above" | "below",
  ) => void
}

export function PriceAlertModal({
  item,
  lang,
  onClose,
  onAddAlert,
}: PriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState(item.currentPrice.toString())
  const [direction, setDirection] = useState<"above" | "below">("above")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 w-full max-w-sm mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {lang === "bn" ? "মূল্য সতর্কতা" : "Price Alert"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
            aria-label="Close"
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
              {lang === "bn" ? "বর্তমান মূল্য" : "Current"}: ৳
              {item.currentPrice}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {lang === "bn" ? "টার্গেট মূল্য" : "Target Price"}
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {lang === "bn" ? "সতর্কতা ধরন" : "Alert When"}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection("above")}
                className={`cursor-pointer flex-1 px-3 py-2 rounded-lg glass text-sm font-medium transition-colors ${
                  direction === "above"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-foreground/10"
                }`}
              >
                {lang === "bn" ? "বেশি হলে" : "Above"}
              </button>
              <button
                onClick={() => setDirection("below")}
                className={`cursor-pointer flex-1 px-3 py-2 rounded-lg glass text-sm font-medium transition-colors ${
                  direction === "below"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-foreground/10"
                }`}
              >
                {lang === "bn" ? "কম হলে" : "Below"}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              const price = parseFloat(targetPrice || "0")
              onAddAlert(item.id, price, direction)
            }}
            className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {lang === "bn" ? "সতর্কতা সেট করুন" : "Set Alert"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
