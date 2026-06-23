import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo, useCallback } from "react";
import {
  ShoppingCart,
  Plus,
  TrendingUp,
  Heart,
  ArrowDown,
  Search,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { toastSuccess } from "@/lib/toast-helpers";
import {
  MarketItemCard,
  ShoppingListPanel,
  PriceHistoryModal,
  CalculatorModal,
  PriceAlertModal,
  AddPriceModal,
  CATEGORIES,
  MARKET_ITEMS,
  fadeUp,
} from "@/components/market-prices";
import type { PriceAlert, ShoppingItem } from "@/components/market-prices";

export default function MarketPrices() {
  const { lang } = useLang();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState<string | null>(null);
  const [showAddAlert, setShowAddAlert] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "change">("name");

  const filteredItems = useMemo(() => {
    let items = MARKET_ITEMS.filter(
      (item) =>
        (selectedCategory === "all" || item.category === selectedCategory) &&
        (item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.nameBn.includes(searchQuery)),
    );

    if (sortBy === "price") {
      items = [...items].sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (sortBy === "change") {
      items = [...items].sort(
        (a, b) =>
          Math.abs(b.currentPrice - b.prevPrice) -
          Math.abs(a.currentPrice - a.prevPrice),
      );
    }

    return items;
  }, [selectedCategory, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const totalItems = MARKET_ITEMS.length;
    const avgChange =
      MARKET_ITEMS.reduce(
        (sum, item) =>
          sum + ((item.currentPrice - item.prevPrice) / item.prevPrice) * 100,
        0,
      ) / MARKET_ITEMS.length;
    return { totalItems, avgChange: avgChange.toFixed(1) };
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  }, []);

  const addToShoppingList = useCallback(
    (itemId: string) => {
      if (shoppingList.some((s) => s.itemId === itemId)) return;
      setShoppingList((prev) => [
        ...prev,
        { id: Date.now().toString(), itemId, quantity: 1 },
      ]);
      toastSuccess(
        lang === "bn" ? "শপিং লিস্টে যোগ হয়েছে" : "Added to shopping list",
      );
    },
    [shoppingList, lang],
  );

  const removeFromShoppingList = useCallback((id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateShoppingQuantity = useCallback((id: string, quantity: number) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  }, []);

  const addPriceAlert = useCallback(
    (itemId: string, targetPrice: number, direction: "above" | "below") => {
      setPriceAlerts((prev) => [
        ...prev.filter((a) => a.itemId !== itemId),
        { id: Date.now().toString(), itemId, targetPrice, direction },
      ]);
      setShowAddAlert(null);
      toastSuccess(
        lang === "bn" ? "মূল্য সতর্কতা সেট হয়েছে" : "Price alert set",
      );
    },
    [lang],
  );

  const removePriceAlert = useCallback((id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getItemById = (id: string) => MARKET_ITEMS.find((i) => i.id === id);

  const selectedItem = showHistory ? getItemById(showHistory) : null;
  const calcItem = showCalculator ? getItemById(showCalculator) : null;
  const alertItem = showAddAlert ? getItemById(showAddAlert) : null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-emerald-500" />
          {lang === "bn" ? "স্থানীয় বাজার মূল্য" : "Local Market Prices"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
      >
        <div className="glass rounded-xl p-4 text-center">
          <ShoppingCart className="h-5 w-5 mx-auto text-emerald-500 mb-2" />
          <p className="text-2xl font-bold">{stats.totalItems}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "আইটেম ট্র্যাকিং" : "Items Tracked"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">{stats.avgChange}%</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "গড় মূল্য পরিবর্তন" : "Avg Price Change"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Heart className="h-5 w-5 mx-auto text-pink-500 mb-2" />
          <p className="text-2xl font-bold">{favorites.length}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "পছন্দের" : "Favorites"}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "glass hover:bg-foreground/5"
            }`}
          >
            {lang === "bn" ? cat.bn : cat.en}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "bn" ? "আইটেম খুঁজুন..." : "Search items..."}
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={() =>
            setSortBy(
              sortBy === "name"
                ? "price"
                : sortBy === "price"
                  ? "change"
                  : "name",
            )
          }
          className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-lg glass text-sm hover:bg-foreground/5 transition-colors"
        >
          <ArrowDown className="h-4 w-4" />
          {sortBy === "name"
            ? lang === "bn"
              ? "নাম"
              : "Name"
            : sortBy === "price"
              ? lang === "bn"
                ? "মূল্য"
                : "Price"
              : lang === "bn"
                ? "পরিবর্তন"
                : "Change"}
        </button>
        <button
          onClick={() => setShowAddPrice(true)}
          className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "মূল্য যোগ" : "Add Price"}
        </button>
      </motion.div>

      {filteredItems.length === 0 ? (
        <motion.div variants={fadeUp}>
          <EmptyState
            icon={ShoppingCart}
            title={
              lang === "bn" ? "কোনো আইটেম পাওয়া যায়নি" : "No items found"
            }
            description={
              lang === "bn"
                ? "অন্য ক্যাটাগরি বা অনুসন্ধান চেষ্টা করুন"
                : "Try a different category or search term"
            }
          />
        </motion.div>
      ) : (
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredItems.map((item) => (
            <MarketItemCard
              key={item.id}
              item={item}
              lang={lang}
              favorites={favorites}
              priceAlerts={priceAlerts}
              onToggleFavorite={toggleFavorite}
              onShowHistory={setShowHistory}
              onShowCalculator={setShowCalculator}
              onAddToShoppingList={addToShoppingList}
              onShowAddAlert={setShowAddAlert}
            />
          ))}
        </motion.div>
      )}

      {shoppingList.length > 0 && (
        <ShoppingListPanel
          shoppingList={shoppingList}
          items={MARKET_ITEMS}
          lang={lang}
          onRemove={removeFromShoppingList}
          onUpdateQuantity={updateShoppingQuantity}
        />
      )}

      {showHistory && selectedItem && (
        <PriceHistoryModal
          item={selectedItem}
          lang={lang}
          priceAlerts={priceAlerts}
          onClose={() => setShowHistory(null)}
          onRemoveAlert={removePriceAlert}
        />
      )}

      {showCalculator && calcItem && (
        <CalculatorModal
          item={calcItem}
          lang={lang}
          onClose={() => setShowCalculator(null)}
          onAddToList={(id) => {
            addToShoppingList(id);
            setShowCalculator(null);
          }}
        />
      )}

      {showAddAlert && alertItem && (
        <PriceAlertModal
          item={alertItem}
          lang={lang}
          onClose={() => setShowAddAlert(null)}
          onAddAlert={addPriceAlert}
        />
      )}

      {showAddPrice && (
        <AddPriceModal lang={lang} onClose={() => setShowAddPrice(false)} />
      )}
    </motion.div>
  );
}
