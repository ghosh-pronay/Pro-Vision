import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo, useCallback } from "react";
import {
  Bus,
  Plus,
  Clock,
  DollarSign,
  Leaf,
  Bookmark,
  CalendarDays,
  TrendingUp,
  BarChart3,
  X,
  Check,
  Navigation,
  Timer,
  Route,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Commute {
  id: string;
  mode: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  cost: number;
  distance: number;
  date: string;
  notes?: string;
}

interface SavedRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  mode: string;
  avgCost: number;
}

interface TransportMode {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  avgCost: number;
  avgSpeed: number;
  carbon: number;
}

const TRANSPORT_MODES: TransportMode[] = [
  {
    id: "bus",
    nameEn: "Bus",
    nameBn: "বাস",
    icon: "🚌",
    avgCost: 30,
    avgSpeed: 20,
    carbon: 0.089,
  },
  {
    id: "metro",
    nameEn: "Metro Rail",
    nameBn: "মেট্রো",
    icon: "🚇",
    avgCost: 50,
    avgSpeed: 35,
    carbon: 0.041,
  },
  {
    id: "car",
    nameEn: "Car",
    nameBn: "গাড়ি",
    icon: "🚗",
    avgCost: 200,
    avgSpeed: 25,
    carbon: 0.21,
  },
  {
    id: "rickshaw",
    nameEn: "Rickshaw",
    nameBn: "রিকশা",
    icon: "🛺",
    avgCost: 20,
    avgSpeed: 10,
    carbon: 0,
  },
  {
    id: "bicycle",
    nameEn: "Bicycle",
    nameBn: "সাইকেল",
    icon: "🚲",
    avgCost: 0,
    avgSpeed: 15,
    carbon: 0,
  },
  {
    id: "walking",
    nameEn: "Walking",
    nameBn: "হাঁটা",
    icon: "🚶",
    avgCost: 0,
    avgSpeed: 5,
    carbon: 0,
  },
  {
    id: "motorcycle",
    nameEn: "Motorcycle",
    nameBn: "মোটরসাইকেল",
    icon: "🛵",
    avgCost: 100,
    avgSpeed: 30,
    carbon: 0.103,
  },
  {
    id: "rideshare",
    nameEn: "Ride Share",
    nameBn: "রাইড শেয়ার",
    icon: "🚕",
    avgCost: 150,
    avgSpeed: 25,
    carbon: 0.15,
  },
];

const BUS_ROUTES = [
  {
    route: "BRTC",
    nameEn: "BRTC Express",
    nameBn: "বিআরটিসি এক্সপ্রেস",
    frequency: "15 min",
    fare: 35,
  },
  {
    route: "Private",
    nameEn: "Private Bus",
    nameBn: "বেসরকারি বাস",
    frequency: "10 min",
    fare: 25,
  },
  {
    route: "AC",
    nameEn: "AC Bus",
    nameBn: "এসি বাস",
    frequency: "20 min",
    fare: 60,
  },
];

const METRO_SCHEDULE = [
  {
    station: "Uttara",
    nameEn: "Uttara North",
    nameBn: "উত্তরা উত্তর",
    firstTrain: "6:30 AM",
    lastTrain: "10:30 PM",
    interval: "8 min",
  },
  {
    station: "Pallabi",
    nameEn: "Pallabi",
    nameBn: "পল্লবী",
    firstTrain: "6:35 AM",
    lastTrain: "10:35 PM",
    interval: "8 min",
  },
  {
    station: "Shahjalal",
    nameEn: "Shahjalal University",
    nameBn: "শাহজালাল বিশ্ববিদ্যালয়",
    firstTrain: "6:40 AM",
    lastTrain: "10:40 PM",
    interval: "8 min",
  },
  {
    station: "Dewanbagh",
    nameEn: "Dewanbagh",
    nameBn: "দেওয়ানবাগ",
    firstTrain: "6:45 AM",
    lastTrain: "10:45 PM",
    interval: "8 min",
  },
  {
    station: "Motijheel",
    nameEn: "Motijheel",
    nameBn: "মতিঝিল",
    firstTrain: "7:00 AM",
    lastTrain: "11:00 PM",
    interval: "8 min",
  },
];

const COMFORT_RATINGS: Record<string, number> = {
  bus: 3,
  metro: 4,
  car: 5,
  rickshaw: 2,
  bicycle: 2,
  walking: 2,
  motorcycle: 3,
  rideshare: 4,
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

function getWeekDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function getMonthDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i).toISOString().split("T")[0]);
  }
  return dates;
}

export default function CommuteTracker() {
  const { lang } = useLang();

  const [commutes, setCommutes] = useState<Commute[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "today" | "week" | "history" | "compare" | "schedule"
  >("today");
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [routeName, setRouteName] = useState("");

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    departure: "",
    arrival: "",
    cost: 0,
    distance: 0,
    notes: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const todayCommutes = useMemo(
    () => commutes.filter((c) => c.date === today),
    [commutes, today],
  );

  const weekDates = useMemo(() => getWeekDates(), []);

  const weekCommutes = useMemo(
    () => commutes.filter((c) => weekDates.includes(c.date)),
    [commutes, weekDates],
  );

  const monthDates = useMemo(() => getMonthDates(), []);

  const monthCommutes = useMemo(
    () => commutes.filter((c) => monthDates.includes(c.date)),
    [commutes, monthDates],
  );

  const weeklyStats = useMemo(() => {
    const totalTrips = weekCommutes.length;
    const totalDistance = weekCommutes.reduce((sum, c) => sum + c.distance, 0);
    const totalCost = weekCommutes.reduce((sum, c) => sum + c.cost, 0);
    const totalCarbon = weekCommutes.reduce((sum, c) => {
      const mode = TRANSPORT_MODES.find((m) => m.id === c.mode);
      return sum + (mode ? mode.carbon * c.distance : 0);
    }, 0);
    const totalTime = weekCommutes.reduce((sum, c) => {
      if (c.departure && c.arrival) {
        const dep = new Date(`2000-01-01T${c.departure}`);
        const arr = new Date(`2000-01-01T${c.arrival}`);
        return sum + (arr.getTime() - dep.getTime()) / 60000;
      }
      return sum;
    }, 0);

    const modeCount: Record<string, number> = {};
    weekCommutes.forEach((c) => {
      modeCount[c.mode] = (modeCount[c.mode] || 0) + 1;
    });
    const mostUsedMode =
      Object.entries(modeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    return {
      totalTrips,
      totalDistance,
      totalCost,
      totalCarbon,
      totalTime,
      mostUsedMode,
    };
  }, [weekCommutes]);

  const monthlyStats = useMemo(() => {
    const totalTrips = monthCommutes.length;
    const totalDistance = monthCommutes.reduce((sum, c) => sum + c.distance, 0);
    const totalCost = monthCommutes.reduce((sum, c) => sum + c.cost, 0);
    const totalCarbon = monthCommutes.reduce((sum, c) => {
      const mode = TRANSPORT_MODES.find((m) => m.id === c.mode);
      return sum + (mode ? mode.carbon * c.distance : 0);
    }, 0);
    return { totalTrips, totalDistance, totalCost, totalCarbon };
  }, [monthCommutes]);

  const comparisonData = useMemo(() => {
    return TRANSPORT_MODES.map((mode) => {
      const modeTrips = commutes.filter((c) => c.mode === mode.id);
      const totalDist = modeTrips.reduce((s, c) => s + c.distance, 0);
      const avgTime =
        modeTrips.length > 0
          ? modeTrips.reduce((s, c) => {
              if (c.departure && c.arrival) {
                const dep = new Date(`2000-01-01T${c.departure}`);
                const arr = new Date(`2000-01-01T${c.arrival}`);
                return s + (arr.getTime() - dep.getTime()) / 60000;
              }
              return s + (totalDist > 0 ? (totalDist / mode.avgSpeed) * 60 : 0);
            }, 0) / modeTrips.length
          : totalDist > 0
            ? (totalDist / mode.avgSpeed) * 60
            : 0;
      const avgCost =
        modeTrips.length > 0
          ? modeTrips.reduce((s, c) => s + c.cost, 0) / modeTrips.length
          : mode.avgCost;
      return {
        ...mode,
        trips: modeTrips.length,
        avgTime: Math.round(avgTime),
        avgCost: Math.round(avgCost),
        comfort: COMFORT_RATINGS[mode.id] || 3,
      };
    });
  }, [commutes]);

  const fastestRoute = useMemo(() => {
    return (
      comparisonData
        .filter((c) => c.trips > 0)
        .sort((a, b) => a.avgTime - b.avgTime)[0] || null
    );
  }, [comparisonData]);

  const cheapestRoute = useMemo(() => {
    return (
      comparisonData
        .filter((c) => c.trips > 0)
        .sort((a, b) => a.avgCost - b.avgCost)[0] || null
    );
  }, [comparisonData]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [calendarMonth, calendarYear]);

  const getCommutesForDate = useCallback(
    (day: number) => {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return commutes.filter((c) => c.date === dateStr);
    },
    [commutes, calendarMonth, calendarYear],
  );

  const getModeById = useCallback(
    (id: string) => TRANSPORT_MODES.find((m) => m.id === id),
    [],
  );

  const handleSaveCommute = () => {
    if (!selectedMode || !formData.from || !formData.to) return;
    const newCommute: Commute = {
      // eslint-disable-next-line react-hooks/purity
      id: Date.now().toString(),
      mode: selectedMode,
      from: formData.from,
      to: formData.to,
      departure: formData.departure,
      arrival: formData.arrival,
      cost: formData.cost,
      distance: formData.distance,
      date: today,
      notes: formData.notes,
    };
    setCommutes((prev) => [newCommute, ...prev]);
    resetForm();
  };

  const resetForm = () => {
    setSelectedMode("");
    setFormData({
      from: "",
      to: "",
      departure: "",
      arrival: "",
      cost: 0,
      distance: 0,
      notes: "",
    });
    setShowForm(false);
  };

  const handleDeleteCommute = (id: string) => {
    setCommutes((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  const handleSaveRoute = () => {
    if (!formData.from || !formData.to || !selectedMode) return;
    const route: SavedRoute = {
      id: Date.now().toString(),
      name: routeName || `${formData.from} → ${formData.to}`,
      from: formData.from,
      to: formData.to,
      mode: selectedMode,
      avgCost: formData.cost || getModeById(selectedMode)?.avgCost || 0,
    };
    setSavedRoutes((prev) => [...prev, route]);
    setRouteName("");
  };

  const handleSelectRoute = (route: SavedRoute) => {
    setSelectedMode(route.mode);
    setFormData((prev) => ({
      ...prev,
      from: route.from,
      to: route.to,
      cost: route.avgCost,
    }));
    setShowForm(true);
  };

  const handleDeleteRoute = (id: string) => {
    setSavedRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  const tabs = [
    { key: "today" as const, labelEn: "Today", labelBn: "আজ", icon: Sparkles },
    {
      key: "week" as const,
      labelEn: "Week",
      labelBn: "সপ্তাহ",
      icon: CalendarDays,
    },
    {
      key: "history" as const,
      labelEn: "History",
      labelBn: "ইতিহাস",
      icon: BarChart3,
    },
    {
      key: "compare" as const,
      labelEn: "Compare",
      labelBn: "তুলনা",
      icon: TrendingUp,
    },
    {
      key: "schedule" as const,
      labelEn: "Schedule",
      labelBn: "সময়সূচী",
      icon: Clock,
    },
  ];

  const monthNamesEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthNamesBn = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];

  return (
    <div className="min-h-screen bg-mesh p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Navigation className="w-7 h-7 text-primary" />
              {lang === "bn" ? "যাতায়াত ট্র্যাকার" : "Commute Tracker"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {lang === "bn"
                ? "আপনার দৈনিক যাতায়াত ট্র্যাক করুন"
                : "Track your daily commutes and optimize your travel"}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {lang === "bn" ? "নতুন যাতায়াত" : "New Commute"}
          </motion.button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "glass-subtle"
                }`}
              >
                <Icon className="w-4 h-4" />
                {lang === "bn" ? tab.labelBn : tab.labelEn}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "today" && (
            <motion.div
              key="today"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  {
                    label: lang === "bn" ? "আজকের যাত্রা" : "Today's Trips",
                    value: todayCommutes.length,
                    icon: Navigation,
                    color: "text-blue-500",
                  },
                  {
                    label: lang === "bn" ? "আজকের খরচ" : "Today's Cost",
                    value: `৳${todayCommutes.reduce((s, c) => s + c.cost, 0)}`,
                    icon: DollarSign,
                    color: "text-green-500",
                  },
                  {
                    label: lang === "bn" ? "দূরত্ব" : "Distance",
                    value: `${todayCommutes.reduce((s, c) => s + c.distance, 0).toFixed(1)} km`,
                    icon: Route,
                    color: "text-orange-500",
                  },
                  {
                    label: lang === "bn" ? "কার্বন" : "Carbon",
                    value: `${todayCommutes
                      .reduce((s, c) => {
                        const m = getModeById(c.mode);
                        return s + (m ? m.carbon * c.distance : 0);
                      }, 0)
                      .toFixed(2)} kg`,
                    icon: Leaf,
                    color: "text-emerald-500",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="glass rounded-xl p-4 hover-lift hover-teal"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="glass rounded-2xl p-4 md:p-6 mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-500" />
                  {lang === "bn" ? "আজকের যাতায়াত" : "Today's Commutes"}
                </h2>
                {todayCommutes.length === 0 ? (
                  <EmptyState
                    icon={Navigation}
                    title={
                      lang === "bn"
                        ? "আজকে এখনো কোনো যাতায়াত নেই"
                        : "No commutes today"
                    }
                    description={
                      lang === "bn"
                        ? "নতুন যাতায়াত যোগ করতে উপরের বোতামে ক্লিক করুন"
                        : "Click the button above to add a new commute"
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {todayCommutes.map((c) => {
                      const mode = getModeById(c.mode);
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="glass-subtle rounded-xl p-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{mode?.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {lang === "bn" ? mode?.nameBn : mode?.nameEn}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {c.departure && c.arrival
                                    ? `${c.departure} → ${c.arrival}`
                                    : ""}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {c.from} → {c.to}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-medium">৳{c.cost}</p>
                              <p className="text-xs text-muted-foreground">
                                {c.distance} km
                              </p>
                            </div>
                            <button
                              onClick={() => setDeleteConfirm(c.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {savedRoutes.length > 0 && (
                <div className="glass rounded-2xl p-4 md:p-6 mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Bookmark className="w-5 h-5 text-yellow-500" />
                    {lang === "bn" ? "সংরক্ষিত রুট" : "Saved Routes"}
                  </h2>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {savedRoutes.map((route) => {
                      const mode = getModeById(route.mode);
                      return (
                        <motion.div
                          key={route.id}
                          whileHover={{ scale: 1.02 }}
                          className="glass-subtle rounded-xl p-3 min-w-[180px] cursor-pointer relative group"
                          onClick={() => handleSelectRoute(route)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{mode?.icon}</span>
                            <span className="text-sm font-medium truncate">
                              {route.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {route.from} → {route.to}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ৳{route.avgCost}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRoute(route.id);
                            }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="glass rounded-2xl p-4 md:p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    {lang === "bn" ? "দ্রুততম রুট" : "Fastest Route"}
                  </h3>
                  {fastestRoute ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{fastestRoute.icon}</span>
                      <div>
                        <p className="font-medium">
                          {lang === "bn"
                            ? fastestRoute.nameBn
                            : fastestRoute.nameEn}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fastestRoute.avgTime}{" "}
                          {lang === "bn" ? "মিনিট গড়" : "min avg"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {lang === "bn" ? "ডেটা নেই" : "No data yet"}
                    </p>
                  )}
                </div>
                <div className="glass rounded-2xl p-4 md:p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    {lang === "bn" ? "সাশ্রয়ী রুট" : "Cheapest Route"}
                  </h3>
                  {cheapestRoute ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cheapestRoute.icon}</span>
                      <div>
                        <p className="font-medium">
                          {lang === "bn"
                            ? cheapestRoute.nameBn
                            : cheapestRoute.nameEn}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ৳{cheapestRoute.avgCost}{" "}
                          {lang === "bn" ? "গড়" : "avg"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {lang === "bn" ? "ডেটা নেই" : "No data yet"}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "week" && (
            <motion.div
              key="week"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  {
                    label: lang === "bn" ? "মোট যাত্রা" : "Total Trips",
                    value: weeklyStats.totalTrips,
                    icon: Navigation,
                    color: "text-blue-500",
                  },
                  {
                    label: lang === "bn" ? "মোট দূরত্ব" : "Total Distance",
                    value: `${weeklyStats.totalDistance.toFixed(1)} km`,
                    icon: Route,
                    color: "text-orange-500",
                  },
                  {
                    label: lang === "bn" ? "মোট খরচ" : "Total Cost",
                    value: `৳${weeklyStats.totalCost}`,
                    icon: DollarSign,
                    color: "text-green-500",
                  },
                  {
                    label: lang === "bn" ? "মোট সময়" : "Total Time",
                    value: `${Math.round(weeklyStats.totalTime)} min`,
                    icon: Timer,
                    color: "text-purple-500",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="glass rounded-xl p-4 hover-lift hover-teal"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="glass rounded-xl p-4 hover-lift hover-teal">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">
                      {lang === "bn" ? "কার্বন ফুটপ্রিন্ট" : "Carbon Footprint"}
                    </span>
                  </div>
                  <p className="text-xl font-bold">
                    {weeklyStats.totalCarbon.toFixed(2)} kg
                  </p>
                </div>
                <div className="glass rounded-xl p-4 hover-lift hover-teal">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs text-muted-foreground">
                      {lang === "bn"
                        ? "সবচেয়ে বেশি ব্যবহৃত"
                        : "Most Used Mode"}
                    </span>
                  </div>
                  <p className="text-xl font-bold">
                    {weeklyStats.mostUsedMode
                      ? `${getModeById(weeklyStats.mostUsedMode)?.icon} ${lang === "bn" ? getModeById(weeklyStats.mostUsedMode)?.nameBn : getModeById(weeklyStats.mostUsedMode)?.nameEn}`
                      : "-"}
                  </p>
                </div>
                <div className="glass rounded-xl p-4 hover-lift hover-teal">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      {lang === "bn" ? "গড় খরচ/যাত্রা" : "Avg Cost/Trip"}
                    </span>
                  </div>
                  <p className="text-xl font-bold">
                    ৳
                    {weeklyStats.totalTrips > 0
                      ? Math.round(
                          weeklyStats.totalCost / weeklyStats.totalTrips,
                        )
                      : 0}
                  </p>
                </div>
                <div className="glass rounded-xl p-4 hover-lift hover-teal">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-muted-foreground">
                      {lang === "bn" ? "গড় সময়/যাত্রা" : "Avg Time/Trip"}
                    </span>
                  </div>
                  <p className="text-xl font-bold">
                    {weeklyStats.totalTrips > 0
                      ? Math.round(
                          weeklyStats.totalTime / weeklyStats.totalTrips,
                        )
                      : 0}{" "}
                    min
                  </p>
                </div>
              </div>

              <div className="glass rounded-2xl p-4 md:p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <CalendarDays className="w-5 h-5 text-blue-500" />
                  {lang === "bn" ? "সাপ্তাহিক যাতায়াত" : "Weekly Commutes"}
                </h2>
                <div className="space-y-2">
                  {weekCommutes.length === 0 ? (
                    <EmptyState
                      icon={CalendarDays}
                      title={
                        lang === "bn"
                          ? "এই সপ্তাহে কোনো যাতায়াত নেই"
                          : "No commutes this week"
                      }
                      description={
                        lang === "bn"
                          ? "নতুন যাতায়াত যোগ করুন"
                          : "Start logging your commutes"
                      }
                    />
                  ) : (
                    weekCommutes.map((c) => {
                      const mode = getModeById(c.mode);
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="glass-subtle rounded-xl p-3 flex items-center gap-3 hover-row"
                        >
                          <span className="text-xl">{mode?.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {c.from} → {c.to}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {c.date} ·{" "}
                              {c.departure && c.arrival
                                ? `${c.departure} → ${c.arrival}`
                                : ""}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium">৳{c.cost}</p>
                            <p className="text-xs text-muted-foreground">
                              {c.distance} km
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="glass rounded-2xl p-4 md:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-blue-500" />
                    {lang === "bn"
                      ? "যাতায়াত ক্যালেন্ডার"
                      : "Commute Calendar"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (calendarMonth === 0) {
                          setCalendarMonth(11);
                          setCalendarYear((y) => y - 1);
                        } else {
                          setCalendarMonth((m) => m - 1);
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium min-w-[120px] text-center">
                      {lang === "bn"
                        ? monthNamesBn[calendarMonth]
                        : monthNamesEn[calendarMonth]}{" "}
                      {calendarYear}
                    </span>
                    <button
                      onClick={() => {
                        if (calendarMonth === 11) {
                          setCalendarMonth(0);
                          setCalendarYear((y) => y + 1);
                        } else {
                          setCalendarMonth((m) => m + 1);
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {(lang === "bn"
                    ? ["সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি", "রবি"]
                    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                  ).map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} />;
                    const dayCommutes = getCommutesForDate(day);
                    const isToday =
                      calendarYear === new Date().getFullYear() &&
                      calendarMonth === new Date().getMonth() &&
                      day === new Date().getDate();
                    return (
                      <motion.div
                        key={day}
                        whileHover={{ scale: 1.05 }}
                        className={`relative rounded-lg p-1.5 min-h-[48px] flex flex-col items-center cursor-pointer transition-colors ${
                          isToday
                            ? "bg-primary/20 ring-1 ring-primary"
                            : dayCommutes.length > 0
                              ? "bg-muted/80"
                              : "hover:bg-muted/50"
                        }`}
                      >
                        <span
                          className={`text-xs font-medium ${isToday ? "text-primary" : ""}`}
                        >
                          {day}
                        </span>
                        {dayCommutes.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                            {dayCommutes.slice(0, 3).map((c) => {
                              const mode = getModeById(c.mode);
                              return (
                                <span key={c.id} className="text-[8px]">
                                  {mode?.icon}
                                </span>
                              );
                            })}
                            {dayCommutes.length > 3 && (
                              <span className="text-[8px] text-muted-foreground">
                                +{dayCommutes.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  {
                    label: lang === "bn" ? "এই মাসের যাত্রা" : "Monthly Trips",
                    value: monthlyStats.totalTrips,
                    icon: Navigation,
                    color: "text-blue-500",
                  },
                  {
                    label: lang === "bn" ? "মোট দূরত্ব" : "Total Distance",
                    value: `${monthlyStats.totalDistance.toFixed(1)} km`,
                    icon: Route,
                    color: "text-orange-500",
                  },
                  {
                    label: lang === "bn" ? "মোট খরচ" : "Total Cost",
                    value: `৳${monthlyStats.totalCost}`,
                    icon: DollarSign,
                    color: "text-green-500",
                  },
                  {
                    label: lang === "bn" ? "কার্বন" : "Carbon",
                    value: `${monthlyStats.totalCarbon.toFixed(2)} kg`,
                    icon: Leaf,
                    color: "text-emerald-500",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="glass rounded-xl p-4 hover-lift hover-teal"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="glass rounded-2xl p-4 md:p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  {lang === "bn" ? "সমস্ত যাতায়াত" : "All Commutes"}
                </h2>
                {commutes.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title={
                      lang === "bn"
                        ? "এখনো কোনো যাতায়াত নেই"
                        : "No commutes yet"
                    }
                    description={
                      lang === "bn"
                        ? "আপনার প্রথম যাতায়াত যোগ করুন"
                        : "Add your first commute to get started"
                    }
                  />
                ) : (
                  <div className="space-y-2">
                    {commutes.map((c) => {
                      const mode = getModeById(c.mode);
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="glass-subtle rounded-xl p-3 flex items-center gap-3 hover-row"
                        >
                          <span className="text-xl">{mode?.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {c.from} → {c.to}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {c.date} ·{" "}
                              {lang === "bn" ? mode?.nameBn : mode?.nameEn}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium">৳{c.cost}</p>
                            <p className="text-xs text-muted-foreground">
                              {c.distance} km
                            </p>
                          </div>
                          <button
                            onClick={() => setDeleteConfirm(c.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "compare" && (
            <motion.div
              key="compare"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="glass rounded-2xl p-4 md:p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  {lang === "bn" ? "যাতায়াত তুলনা" : "Commute Comparison"}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left text-xs font-medium text-muted-foreground p-3">
                          {lang === "bn" ? "মোড" : "Mode"}
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground p-3">
                          {lang === "bn" ? "গড় সময়" : "Avg Time"}
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground p-3">
                          {lang === "bn" ? "গড় খরচ" : "Avg Cost"}
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground p-3">
                          {lang === "bn" ? "কার্বন" : "Carbon"}
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground p-3">
                          {lang === "bn" ? "আরাম" : "Comfort"}
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground p-3">
                          {lang === "bn" ? "যাত্রা" : "Trips"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((mode) => (
                        <tr
                          key={mode.id}
                          className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{mode.icon}</span>
                              <span className="text-sm font-medium">
                                {lang === "bn" ? mode.nameBn : mode.nameEn}
                              </span>
                            </div>
                          </td>
                          <td className="text-center p-3 text-sm">
                            {mode.avgTime > 0 ? `${mode.avgTime} min` : "-"}
                          </td>
                          <td className="text-center p-3 text-sm">
                            ৳{mode.avgCost}
                          </td>
                          <td className="text-center p-3 text-sm">
                            {mode.carbon > 0 ? (
                              `${mode.carbon} kg/km`
                            ) : (
                              <span className="text-green-500">0</span>
                            )}
                          </td>
                          <td className="text-center p-3">
                            <div className="flex items-center justify-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${star <= mode.comfort ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="text-center p-3 text-sm font-medium">
                            {mode.trips}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="glass rounded-2xl p-4 md:p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Timer className="w-5 h-5 text-blue-500" />
                    {lang === "bn" ? "সময় অনুযায়ী সাজানো" : "Sorted by Time"}
                  </h3>
                  <div className="space-y-2">
                    {comparisonData
                      .filter((m) => m.trips > 0)
                      .sort((a, b) => a.avgTime - b.avgTime)
                      .map((mode, i) => (
                        <div
                          key={mode.id}
                          className="flex items-center gap-3 glass-subtle rounded-lg p-2 hover-row"
                        >
                          <span className="text-sm font-bold text-muted-foreground w-5">
                            {i + 1}
                          </span>
                          <span className="text-lg">{mode.icon}</span>
                          <span className="text-sm flex-1">
                            {lang === "bn" ? mode.nameBn : mode.nameEn}
                          </span>
                          <span className="text-sm font-medium">
                            {mode.avgTime} min
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-4 md:p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    {lang === "bn" ? "খরচ অনুযায়ী সাজানো" : "Sorted by Cost"}
                  </h3>
                  <div className="space-y-2">
                    {comparisonData
                      .filter((m) => m.trips > 0)
                      .sort((a, b) => a.avgCost - b.avgCost)
                      .map((mode, i) => (
                        <div
                          key={mode.id}
                          className="flex items-center gap-3 glass-subtle rounded-lg p-2 hover-row"
                        >
                          <span className="text-sm font-bold text-muted-foreground w-5">
                            {i + 1}
                          </span>
                          <span className="text-lg">{mode.icon}</span>
                          <span className="text-sm flex-1">
                            {lang === "bn" ? mode.nameBn : mode.nameEn}
                          </span>
                          <span className="text-sm font-medium">
                            ৳{mode.avgCost}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="glass rounded-2xl p-4 md:p-6 mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Bus className="w-5 h-5 text-blue-500" />
                  {lang === "bn"
                    ? "বাস রুট ও সময়সূচী"
                    : "Bus Routes & Schedule"}
                </h2>
                <div className="space-y-3">
                  {BUS_ROUTES.map((route) => (
                    <motion.div
                      key={route.route}
                      whileHover={{ scale: 1.01 }}
                      className="glass-subtle rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {lang === "bn" ? route.nameBn : route.nameEn}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {lang === "bn" ? "ফ্রিকোয়েন্সি" : "Frequency"}:{" "}
                            {route.frequency}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">৳{route.fare}</p>
                          <p className="text-xs text-muted-foreground">
                            {lang === "bn" ? "ভাড়া" : "Fare"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-4 md:p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-primary" />
                  {lang === "bn"
                    ? "মেট্রো রেল সময়সূচী"
                    : "Metro Rail Schedule"}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left text-xs font-medium text-muted-foreground p-3">
                          {lang === "bn" ? "স্টেশন" : "Station"}
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground p-3">
                          {lang === "bn" ? "প্রথম" : "First"}
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground p-3">
                          {lang === "bn" ? "শেষ" : "Last"}
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground p-3">
                          {lang === "bn" ? "ইন্টারভাল" : "Interval"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {METRO_SCHEDULE.map((stop) => (
                        <tr
                          key={stop.station}
                          className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-3 text-sm font-medium">
                            {lang === "bn" ? stop.nameBn : stop.nameEn}
                          </td>
                          <td className="text-center p-3 text-sm">
                            {stop.firstTrain}
                          </td>
                          <td className="text-center p-3 text-sm">
                            {stop.lastTrain}
                          </td>
                          <td className="text-center p-3 text-sm">
                            {stop.interval}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={fadeIn.hidden}
            animate={fadeIn.visible}
            exit={fadeIn.hidden}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={scaleIn.hidden}
              animate={scaleIn.visible}
              exit={scaleIn.hidden}
              className="glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    {lang === "bn"
                      ? "নতুন যাতায়াত যোগ করুন"
                      : "Add New Commute"}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {lang === "bn" ? "যাতায়াতের মাধ্যম" : "Transport Mode"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TRANSPORT_MODES.map((mode) => (
                      <motion.button
                        key={mode.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`p-2 rounded-xl text-center transition-colors ${
                          selectedMode === mode.id
                            ? "bg-primary text-primary-foreground"
                            : "glass-subtle"
                        }`}
                      >
                        <span className="text-xl block">{mode.icon}</span>
                        <span className="text-[10px] block mt-1">
                          {lang === "bn" ? mode.nameBn : mode.nameEn}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "থেকে" : "From"}
                    </label>
                    <input
                      type="text"
                      value={formData.from}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, from: e.target.value }))
                      }
                      placeholder={
                        lang === "bn"
                          ? "যাতায়াত শুরুর স্থান"
                          : "Starting location"
                      }
                      className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "পৌঁছাতে" : "To"}
                    </label>
                    <input
                      type="text"
                      value={formData.to}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, to: e.target.value }))
                      }
                      placeholder={lang === "bn" ? "গন্তব্য" : "Destination"}
                      className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "যাতায়াত শুরু" : "Departure"}
                    </label>
                    <input
                      type="time"
                      value={formData.departure}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          departure: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "পৌঁছানো" : "Arrival"}
                    </label>
                    <input
                      type="time"
                      value={formData.arrival}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, arrival: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "খরচ (৳)" : "Cost (৳)"}
                    </label>
                    <input
                      type="number"
                      value={formData.cost || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          cost: Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "দূরত্ব (কিমি)" : "Distance (km)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.distance || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          distance: Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {lang === "bn" ? "নোট" : "Notes"}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, notes: e.target.value }))
                    }
                    placeholder={
                      lang === "bn" ? "অতিরিক্ত নোট..." : "Additional notes..."
                    }
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder={
                      lang === "bn"
                        ? "এই রুট সংরক্ষণ করুন..."
                        : "Save this route as..."
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveRoute}
                    className="px-3 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 text-sm font-medium flex items-center gap-1"
                  >
                    <Bookmark className="w-4 h-4" />
                    {lang === "bn" ? "সংরক্ষণ" : "Save"}
                  </motion.button>
                </div>
              </div>

              <div className="p-4 border-t border-border/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveCommute}
                  disabled={!selectedMode || !formData.from || !formData.to}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {lang === "bn" ? "যাতায়াত সংরক্ষণ করুন" : "Save Commute"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deleteConfirm !== null}
        onConfirm={() => deleteConfirm && handleDeleteCommute(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        title={lang === "bn" ? "যাতায়াত মুছুন?" : "Delete commute?"}
        description={
          lang === "bn"
            ? "এই যাতায়াত স্থায়ীভাবে মুছে ফেলা হবে।"
            : "This commute will be permanently deleted."
        }
        variant="danger"
      />
    </div>
  );
}
