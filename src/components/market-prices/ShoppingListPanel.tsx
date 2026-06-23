import { motion } from "framer-motion";
import { ShoppingCart, Trash2 } from "lucide-react";
import { ShoppingItem, MarketItem, fadeUp } from "./types";

interface ShoppingListPanelProps {
  shoppingList: ShoppingItem[];
  items: MarketItem[];
  lang: string;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export function ShoppingListPanel({
  shoppingList,
  items,
  lang,
  onRemove,
  onUpdateQuantity,
}: ShoppingListPanelProps) {
  const getItemById = (id: string) => items.find((i) => i.id === id);

  const total = shoppingList.reduce((sum, item) => {
    const product = getItemById(item.itemId);
    return sum + (product?.currentPrice || 0) * item.quantity;
  }, 0);

  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-emerald-500" />
          {lang === "bn" ? "শপিং তালিকা" : "Shopping List"}
        </h3>
        <span className="text-sm font-medium">
          {lang === "bn" ? "মোট" : "Total"}: ৳{total}
        </span>
      </div>
      <div className="space-y-2">
        {shoppingList.map((item) => {
          const product = getItemById(item.itemId);
          if (!product) return null;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-foreground/5"
            >
              <span className="flex-1 text-sm">
                {lang === "bn" ? product.nameBn : product.nameEn}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="cursor-pointer w-6 h-6 rounded bg-foreground/10 flex items-center justify-center text-xs hover:bg-foreground/20 transition-colors"
                >
                  -
                </button>
                <span className="text-sm w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="cursor-pointer w-6 h-6 rounded bg-foreground/10 flex items-center justify-center text-xs hover:bg-foreground/20 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-sm font-medium w-16 text-right">
                ৳{product.currentPrice * item.quantity}
              </span>
              <button
                onClick={() => onRemove(item.id)}
                className="cursor-pointer p-1 hover:bg-destructive/10 rounded"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
