import { motion } from "framer-motion"
import { X } from "lucide-react"
import { MARKET_ITEMS } from "./types"
import { toastSuccess } from "@/lib/toast-helpers"

interface AddPriceModalProps {
  lang: string
  onClose: () => void
}

export function AddPriceModal({ lang, onClose }: AddPriceModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {lang === "bn" ? "নতুন মূল্য যোগ করুন" : "Add New Price"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {lang === "bn" ? "আইটেম" : "Item"}
            </label>
            <select
              id="newPriceItem"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {MARKET_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {lang === "bn" ? item.nameBn : item.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {lang === "bn" ? "নতুন মূল্য (৳)" : "New Price (৳)"}
            </label>
            <input
              type="number"
              id="newPriceValue"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={() => {
              toastSuccess(
                lang === "bn" ? "মূল্য আপডেট হয়েছে" : "Price updated",
              )
              onClose()
            }}
            className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {lang === "bn" ? "আপডেট করুন" : "Update"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
