import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, X, Check } from "lucide-react"
import { type GroceryItem, fadeIn, scaleIn } from "./types"
import { EmptyState } from "@/components/ui/EmptyState"

interface GroceryListModalProps {
  lang: string
  show: boolean
  onClose: () => void
  groceryList: GroceryItem[]
  onToggleItem: (index: number) => void
}

export function GroceryListModal({
  lang,
  show,
  onClose,
  groceryList,
  onToggleItem,
}: GroceryListModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={fadeIn.hidden}
          animate={fadeIn.visible}
          exit={fadeIn.hidden}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={scaleIn.hidden}
            animate={scaleIn.visible}
            exit={scaleIn.hidden}
            className="glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-500" />
                {lang === "bn" ? "বাজার তালিকা" : "Grocery List"}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {groceryList.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title={lang === "bn" ? "তালিকা খালি" : "No items"}
                  description={
                    lang === "bn"
                      ? "আগে খাবার যোগ করুন"
                      : "Add meals to generate a grocery list"
                  }
                />
              ) : (
                <div className="space-y-2">
                  {groceryList.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        item.checked ? "bg-green-500/10" : "glass-subtle"
                      }`}
                      onClick={() => onToggleItem(i)}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.checked
                            ? "bg-green-500 border-green-500"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {item.checked && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}
                      >
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ×{item.quantity}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                {groceryList.filter((i) => i.checked).length}/
                {groceryList.length}{" "}
                {lang === "bn" ? "টি আইটেম সম্পন্ন" : "items checked"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
