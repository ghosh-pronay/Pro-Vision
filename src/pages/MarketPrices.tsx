import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo, useCallback } from "react";
import {
  ShoppingCart,
  Plus,
  TrendingUp,
  TrendingDown,
  Heart,
  Bell,
  BellOff,
  X,
  Share2,
  Calculator,
  BarChart3,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Filter,
  Trash2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Check,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

import { toastSuccess } from "@/lib/toast-helpers";

interface MarketItem {
  id: string;
  nameEn: string;
  nameBn: string;
  category: "vegetables" | "fish" | "meat" | "grains" | "dairy" | "fruits";
  unit: string;
  currentPrice: number;
  prevPrice: number;
  history7d: number[];
  history30d: number[];
}

interface PriceAlert {
  id: string;
  itemId: string;
  targetPrice: number;
  direction: "above" | "below";
}

interface ShoppingItem {
  id: string;
  itemId: string;
  quantity: number;
}

const CATEGORIES = [
  { id: "all", en: "All", bn: "সব" },
  { id: "vegetables", en: "Vegetables", bn: "শাকসবজি" },
  { id: "fish", en: "Fish", bn: "মাছ" },
  { id: "meat", en: "Meat", bn: "মাংস" },
  { id: "grains", en: "Grains", bn: "শস্য" },
  { id: "dairy", en: "Dairy", bn: "দুগ্ধ" },
  { id: "fruits", en: "Fruits", bn: "ফল" },
] as const;

const MARKET_ITEMS: MarketItem[] = [
  {
    id: "onion",
    nameEn: "Onion",
    nameBn: "পেঁয়াজ",
    category: "vegetables",
    unit: "kg",
    currentPrice: 60,
    prevPrice: 55,
    history7d: [55, 57, 58, 56, 59, 58, 60],
    history30d: [
      50, 52, 54, 55, 57, 58, 56, 55, 57, 58, 56, 59, 58, 60, 62, 58, 56, 55,
      57, 58, 56, 59, 58, 60, 62, 58, 56, 55, 57, 60,
    ],
  },
  {
    id: "potato",
    nameEn: "Potato",
    nameBn: "আলু",
    category: "vegetables",
    unit: "kg",
    currentPrice: 40,
    prevPrice: 42,
    history7d: [42, 41, 40, 41, 40, 39, 40],
    history30d: [
      45, 44, 43, 42, 41, 40, 42, 43, 44, 43, 42, 41, 40, 39, 38, 40, 41, 42,
      43, 42, 41, 40, 39, 40, 41, 42, 41, 40, 39, 40,
    ],
  },
  {
    id: "tomato",
    nameEn: "Tomato",
    nameBn: "টমেটো",
    category: "vegetables",
    unit: "kg",
    currentPrice: 80,
    prevPrice: 75,
    history7d: [75, 76, 77, 78, 79, 78, 80],
    history30d: [
      70, 72, 74, 75, 76, 77, 78, 76, 75, 77, 78, 76, 79, 78, 80, 82, 78, 76,
      75, 77, 78, 76, 79, 78, 80, 82, 78, 76, 75, 80,
    ],
  },
  {
    id: "spinach",
    nameEn: "Spinach",
    nameBn: "শাক",
    category: "vegetables",
    unit: "kg",
    currentPrice: 30,
    prevPrice: 28,
    history7d: [28, 29, 30, 29, 30, 29, 30],
    history30d: [
      25, 26, 27, 28, 29, 30, 28, 27, 28, 29, 30, 28, 29, 30, 32, 28, 27, 28,
      29, 30, 28, 29, 30, 31, 32, 28, 27, 28, 29, 30,
    ],
  },
  {
    id: "rui",
    nameEn: "Rui Fish",
    nameBn: "রুই",
    category: "fish",
    unit: "kg",
    currentPrice: 350,
    prevPrice: 340,
    history7d: [340, 345, 348, 345, 348, 350, 350],
    history30d: [
      320, 325, 330, 335, 340, 345, 340, 335, 330, 335, 340, 345, 348, 350, 355,
      340, 335, 330, 335, 340, 345, 348, 350, 355, 360, 350, 345, 340, 345, 350,
    ],
  },
  {
    id: "katla",
    nameEn: "Katla Fish",
    nameBn: "কাতলা",
    category: "fish",
    unit: "kg",
    currentPrice: 400,
    prevPrice: 390,
    history7d: [390, 395, 398, 395, 398, 400, 400],
    history30d: [
      370, 375, 380, 385, 390, 395, 390, 385, 380, 385, 390, 395, 398, 400, 405,
      390, 385, 380, 385, 390, 395, 398, 400, 405, 410, 400, 395, 390, 395, 400,
    ],
  },
  {
    id: "pangas",
    nameEn: "Pangas",
    nameBn: "পাঙ্গাস",
    category: "fish",
    unit: "kg",
    currentPrice: 200,
    prevPrice: 210,
    history7d: [210, 208, 205, 203, 202, 200, 200],
    history30d: [
      230, 225, 220, 215, 210, 208, 205, 203, 202, 200, 198, 195, 198, 200, 205,
      210, 208, 205, 203, 200, 198, 195, 198, 200, 205, 210, 208, 205, 203, 200,
    ],
  },
  {
    id: "hilsa",
    nameEn: "Hilsa",
    nameBn: "হিলশা",
    category: "fish",
    unit: "kg",
    currentPrice: 1200,
    prevPrice: 1150,
    history7d: [1150, 1160, 1180, 1170, 1190, 1200, 1200],
    history30d: [
      1100, 1120, 1130, 1140, 1150, 1160, 1150, 1140, 1130, 1140, 1150, 1160,
      1170, 1180, 1190, 1150, 1140, 1130, 1140, 1150, 1160, 1170, 1180, 1190,
      1200, 1180, 1160, 1150, 1160, 1200,
    ],
  },
  {
    id: "chicken",
    nameEn: "Chicken",
    nameBn: "মুরগি",
    category: "meat",
    unit: "kg",
    currentPrice: 280,
    prevPrice: 270,
    history7d: [270, 272, 275, 273, 276, 278, 280],
    history30d: [
      250, 255, 260, 265, 270, 272, 275, 273, 270, 272, 275, 273, 276, 278, 280,
      275, 272, 270, 272, 275, 273, 276, 278, 280, 285, 280, 275, 272, 275, 280,
    ],
  },
  {
    id: "beef",
    nameEn: "Beef",
    nameBn: "খসির",
    category: "meat",
    unit: "kg",
    currentPrice: 700,
    prevPrice: 680,
    history7d: [680, 685, 690, 688, 692, 698, 700],
    history30d: [
      650, 655, 660, 665, 670, 675, 680, 678, 675, 678, 682, 685, 688, 692, 695,
      680, 675, 670, 675, 680, 685, 688, 692, 695, 700, 695, 690, 685, 690, 700,
    ],
  },
  {
    id: "pork",
    nameEn: "Pork",
    nameBn: "খাসির",
    category: "meat",
    unit: "kg",
    currentPrice: 550,
    prevPrice: 540,
    history7d: [540, 542, 545, 543, 546, 548, 550],
    history30d: [
      520, 525, 530, 535, 540, 542, 545, 543, 540, 542, 545, 543, 546, 548, 550,
      545, 542, 540, 542, 545, 543, 546, 548, 550, 555, 550, 545, 542, 545, 550,
    ],
  },
  {
    id: "rice",
    nameEn: "Rice",
    nameBn: "চাল",
    category: "grains",
    unit: "kg",
    currentPrice: 65,
    prevPrice: 63,
    history7d: [63, 63.5, 64, 63.5, 64.5, 65, 65],
    history30d: [
      60, 61, 62, 63, 63.5, 64, 63.5, 63, 63.5, 64, 63.5, 64.5, 65, 64, 63,
      63.5, 64, 63.5, 64.5, 65, 64, 63.5, 64, 65, 66, 65, 64, 63.5, 64, 65,
    ],
  },
  {
    id: "lentils",
    nameEn: "Lentils",
    nameBn: "ডাল",
    category: "grains",
    unit: "kg",
    currentPrice: 120,
    prevPrice: 115,
    history7d: [115, 116, 118, 117, 119, 120, 120],
    history30d: [
      110, 112, 113, 115, 116, 118, 117, 115, 116, 118, 117, 119, 120, 118, 115,
      116, 118, 117, 119, 120, 118, 116, 118, 120, 122, 120, 118, 116, 118, 120,
    ],
  },
  {
    id: "sugar",
    nameEn: "Sugar",
    nameBn: "চিনি",
    category: "grains",
    unit: "kg",
    currentPrice: 110,
    prevPrice: 108,
    history7d: [108, 108.5, 109, 108.5, 109.5, 110, 110],
    history30d: [
      105, 106, 107, 108, 108.5, 109, 108.5, 108, 108.5, 109, 108.5, 109.5, 110,
      109, 108, 108.5, 109, 108.5, 109.5, 110, 109, 108.5, 109, 110, 111, 110,
      109, 108.5, 109, 110,
    ],
  },
  {
    id: "milk",
    nameEn: "Milk",
    nameBn: "দুধ",
    category: "dairy",
    unit: "L",
    currentPrice: 85,
    prevPrice: 82,
    history7d: [82, 83, 84, 83, 84, 85, 85],
    history30d: [
      78, 79, 80, 81, 82, 83, 82, 81, 82, 83, 82, 84, 85, 83, 81, 82, 83, 82,
      84, 85, 83, 82, 83, 85, 86, 85, 83, 82, 83, 85,
    ],
  },
  {
    id: "egg",
    nameEn: "Egg",
    nameBn: "ডিম",
    category: "dairy",
    unit: "piece",
    currentPrice: 12,
    prevPrice: 11,
    history7d: [11, 11.2, 11.5, 11.3, 11.6, 11.8, 12],
    history30d: [
      10, 10.2, 10.5, 11, 11.2, 11.5, 11.3, 11, 11.2, 11.5, 11.3, 11.6, 11.8,
      12, 11.5, 11, 11.2, 11.5, 11.3, 11.6, 11.8, 12, 11.8, 11.5, 11.3, 12,
      11.8, 11.5, 11.3, 12,
    ],
  },
  {
    id: "ghee",
    nameEn: "Ghee",
    nameBn: "ঘি",
    category: "dairy",
    unit: "L",
    currentPrice: 650,
    prevPrice: 630,
    history7d: [630, 635, 640, 638, 642, 648, 650],
    history30d: [
      600, 610, 615, 620, 630, 635, 640, 638, 630, 635, 640, 638, 642, 648, 650,
      640, 635, 630, 635, 640, 638, 642, 648, 650, 655, 650, 645, 640, 645, 650,
    ],
  },
  {
    id: "banana",
    nameEn: "Banana",
    nameBn: "কলা",
    category: "fruits",
    unit: "kg",
    currentPrice: 60,
    prevPrice: 55,
    history7d: [55, 56, 57, 56, 58, 59, 60],
    history30d: [
      50, 52, 53, 55, 56, 57, 56, 55, 56, 57, 56, 58, 59, 60, 58, 55, 53, 52,
      53, 55, 56, 57, 56, 58, 59, 60, 58, 55, 56, 60,
    ],
  },
  {
    id: "mango",
    nameEn: "Mango",
    nameBn: "আম",
    category: "fruits",
    unit: "kg",
    currentPrice: 150,
    prevPrice: 140,
    history7d: [140, 142, 145, 143, 146, 148, 150],
    history30d: [
      130, 132, 135, 138, 140, 142, 145, 143, 140, 142, 145, 143, 146, 148, 150,
      145, 142, 140, 142, 145, 143, 146, 148, 150, 155, 150, 148, 145, 148, 150,
    ],
  },
  {
    id: "papaya",
    nameEn: "Papaya",
    nameBn: "পেপয়া",
    category: "fruits",
    unit: "kg",
    currentPrice: 45,
    prevPrice: 42,
    history7d: [42, 43, 44, 43, 44, 44, 45],
    history30d: [
      38, 39, 40, 41, 42, 43, 44, 43, 42, 43, 44, 43, 44, 44, 45, 43, 42, 41,
      42, 43, 44, 43, 44, 44, 45, 43, 42, 41, 42, 45,
    ],
  },
  {
    id: "gourd",
    nameEn: "Gourd",
    nameBn: "লাউ",
    category: "fruits",
    unit: "kg",
    currentPrice: 35,
    prevPrice: 33,
    history7d: [33, 33.5, 34, 33.5, 34.5, 34, 35],
    history30d: [
      30, 31, 32, 33, 33.5, 34, 33.5, 33, 33.5, 34, 33.5, 34.5, 34, 35, 34, 33,
      32, 31, 32, 33, 34, 33.5, 34, 34.5, 35, 34, 33, 32, 33, 35,
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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
  const [calcQuantity, setCalcQuantity] = useState("1");

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

  const shoppingTotal = useMemo(() => {
    return shoppingList.reduce((sum, item) => {
      const product = getItemById(item.itemId);
      return sum + (product?.currentPrice || 0) * item.quantity;
    }, 0);
  }, [shoppingList]);

  const handleShare = useCallback(
    (itemId: string) => {
      const item = MARKET_ITEMS.find((i) => i.id === itemId);
      if (!item) return;
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
    },
    [lang],
  );

  const getPriceChange = (current: number, prev: number) => {
    const change = ((current - prev) / prev) * 100;
    return { value: change, isUp: change > 0 };
  };

  const renderMiniChart = (data: number[], color: string) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const step = width / (data.length - 1);

    const points = data
      .map((val, i) => {
        const x = i * step;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderFullChart = (data: number[], color: string) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 300;
    const height = 150;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const step = chartWidth / (data.length - 1);

    const points = data
      .map((val, i) => {
        const x = padding + i * step;
        const y = padding + chartHeight - ((val - min) / range) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((val, i) => {
          const x = padding + i * step;
          const y = padding + chartHeight - ((val - min) / range) * chartHeight;
          return i % 5 === 0 ? (
            <circle key={i} cx={x} cy={y} r="3" fill={color} />
          ) : null;
        })}
      </svg>
    );
  };

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
          <ArrowUpDown className="h-4 w-4" />
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
          {filteredItems.map((item) => {
            const change = getPriceChange(item.currentPrice, item.prevPrice);
            const hasAlert = priceAlerts.some((a) => a.itemId === item.id);

            return (
              <motion.div
                key={item.id}
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
                      onClick={() => toggleFavorite(item.id)}
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
                      onClick={() => setShowAddAlert(item.id)}
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
                    <p className="text-xs text-muted-foreground">
                      /{item.unit}
                    </p>
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
                  {renderMiniChart(
                    item.history7d,
                    change.isUp ? "#ef4444" : "#22c55e",
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowHistory(item.id)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg glass text-xs font-medium hover:bg-foreground/5"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    {lang === "bn" ? "ইতিহাস" : "History"}
                  </button>
                  <button
                    onClick={() => setShowCalculator(item.id)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg glass text-xs font-medium hover:bg-foreground/5"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    {lang === "bn" ? "হিসাব" : "Calc"}
                  </button>
                  <button
                    onClick={() => addToShoppingList(item.id)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg glass text-xs font-medium hover:bg-foreground/5"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {lang === "bn" ? "তালিকা" : "List"}
                  </button>
                  <button
                    onClick={() => handleShare(item.id)}
                    className="cursor-pointer flex items-center justify-center px-2 py-1.5 rounded-lg glass text-xs font-medium hover:bg-foreground/5"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {shoppingList.length > 0 && (
        <motion.div variants={fadeUp} className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-500" />
              {lang === "bn" ? "শপিং তালিকা" : "Shopping List"}
            </h3>
            <span className="text-sm font-medium">
              {lang === "bn" ? "মোট" : "Total"}: ৳{shoppingTotal}
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
                      onClick={() =>
                        updateShoppingQuantity(item.id, item.quantity - 1)
                      }
                      className="cursor-pointer w-6 h-6 rounded bg-foreground/10 flex items-center justify-center text-xs hover:bg-foreground/20 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateShoppingQuantity(item.id, item.quantity + 1)
                      }
                      className="cursor-pointer w-6 h-6 rounded bg-foreground/10 flex items-center justify-center text-xs hover:bg-foreground/20 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    ৳{product.currentPrice * item.quantity}
                  </span>
                  <button
                    onClick={() => removeFromShoppingList(item.id)}
                    className="cursor-pointer p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {showHistory && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {lang === "bn" ? selectedItem.nameBn : selectedItem.nameEn} -{" "}
                {lang === "bn" ? "মূল্য ইতিহাস" : "Price History"}
              </h3>
              <button
                onClick={() => setShowHistory(null)}
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
                {renderFullChart(selectedItem.history30d, "#3b82f6")}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {lang === "bn" ? "সর্বোচ্চ" : "Max"}
                </p>
                <p className="text-lg font-bold text-red-500">
                  ৳{Math.max(...selectedItem.history30d)}
                </p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {lang === "bn" ? "সর্বনিম্ন" : "Min"}
                </p>
                <p className="text-lg font-bold text-green-500">
                  ৳{Math.min(...selectedItem.history30d)}
                </p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {lang === "bn" ? "গড়" : "Avg"}
                </p>
                <p className="text-lg font-bold">
                  ৳
                  {(
                    selectedItem.history30d.reduce((a, b) => a + b, 0) /
                    selectedItem.history30d.length
                  ).toFixed(0)}
                </p>
              </div>
            </div>

            {priceAlerts
              .filter((a) => a.itemId === showHistory)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-foreground/5 mb-2"
                >
                  <span className="text-sm">
                    {lang === "bn" ? "সতর্কতা" : "Alert"}:{" "}
                    {alert.direction === "above" ? "≥" : "≤"} ৳
                    {alert.targetPrice}
                  </span>
                  <button
                    onClick={() => removePriceAlert(alert.id)}
                    className="cursor-pointer p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}
          </motion.div>
        </div>
      )}

      {showCalculator && calcItem && (
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
                onClick={() => {
                  setShowCalculator(null);
                  setCalcQuantity("1");
                }}
                className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {lang === "bn" ? calcItem.nameBn : calcItem.nameEn}
                </p>
                <p className="text-lg font-bold">
                  ৳{calcItem.currentPrice}/{calcItem.unit}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "bn" ? "পরিমাণ" : "Quantity"} ({calcItem.unit})
                </label>
                <input
                  type="number"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(e.target.value)}
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
                  ৳
                  {(
                    calcItem.currentPrice * parseFloat(calcQuantity || "0")
                  ).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => {
                  addToShoppingList(calcItem.id);
                  setShowCalculator(null);
                  setCalcQuantity("1");
                }}
                className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {lang === "bn" ? "তালিকায় যোগ করুন" : "Add to List"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddAlert && alertItem && (
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
                onClick={() => setShowAddAlert(null)}
                className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {lang === "bn" ? alertItem.nameBn : alertItem.nameEn}
                </p>
                <p className="text-lg font-bold">
                  {lang === "bn" ? "বর্তমান মূল্য" : "Current"}: ৳
                  {alertItem.currentPrice}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "bn" ? "টার্গেট মূল্য" : "Target Price"}
                </label>
                <input
                  type="number"
                  defaultValue={alertItem.currentPrice}
                  id="alertPrice"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "bn" ? "সতর্কতা ধরন" : "Alert When"}
                </label>
                <div className="flex gap-2">
                  <button
                    id="alertAbove"
                    onClick={() => {
                      document
                        .getElementById("alertAbove")
                        ?.classList.add(
                          "bg-primary",
                          "text-primary-foreground",
                        );
                      document
                        .getElementById("alertBelow")
                        ?.classList.remove(
                          "bg-primary",
                          "text-primary-foreground",
                        );
                    }}
                    className="cursor-pointer flex-1 px-3 py-2 rounded-lg glass text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {lang === "bn" ? "বেশি হলে" : "Above"}
                  </button>
                  <button
                    id="alertBelow"
                    onClick={() => {
                      document
                        .getElementById("alertBelow")
                        ?.classList.add(
                          "bg-primary",
                          "text-primary-foreground",
                        );
                      document
                        .getElementById("alertAbove")
                        ?.classList.remove(
                          "bg-primary",
                          "text-primary-foreground",
                        );
                    }}
                    className="cursor-pointer flex-1 px-3 py-2 rounded-lg glass text-sm font-medium hover:bg-foreground/10 transition-colors"
                  >
                    {lang === "bn" ? "কম হলে" : "Below"}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  const price = parseFloat(
                    (document.getElementById("alertPrice") as HTMLInputElement)
                      ?.value || "0",
                  );
                  const direction = document
                    .getElementById("alertAbove")
                    ?.classList.contains("bg-primary")
                    ? "above"
                    : "below";
                  addPriceAlert(showAddAlert, price, direction);
                }}
                className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {lang === "bn" ? "সতর্কতা সেট করুন" : "Set Alert"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddPrice && (
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
                onClick={() => setShowAddPrice(false)}
                className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
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
                  );
                  setShowAddPrice(false);
                }}
                className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {lang === "bn" ? "আপডেট করুন" : "Update"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
