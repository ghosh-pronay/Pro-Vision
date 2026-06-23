export interface Commute {
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

export interface SavedRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  mode: string;
  avgCost: number;
}

export interface TransportMode {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  avgCost: number;
  avgSpeed: number;
  carbon: number;
}

export const TRANSPORT_MODES: TransportMode[] = [
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

export const BUS_ROUTES = [
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

export const METRO_SCHEDULE = [
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

export const COMFORT_RATINGS: Record<string, number> = {
  bus: 3,
  metro: 4,
  car: 5,
  rickshaw: 2,
  bicycle: 2,
  walking: 2,
  motorcycle: 3,
  rideshare: 4,
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

export function getWeekDates(): string[] {
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

export function getMonthDates(): string[] {
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

export function getModeById(id: string) {
  return TRANSPORT_MODES.find((m) => m.id === id);
}

export const monthNamesEn = [
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

export const monthNamesBn = [
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
