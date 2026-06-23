export interface CarbonLog {
  id: string;
  category: "transport" | "food" | "energy" | "shopping";
  subCategory: string;
  amount: number;
  unit: string;
  carbonKg: number;
  date: number;
  note?: string;
}

export const CARBON_FACTORS = {
  transport: {
    car: 0.21,
    bus: 0.089,
    train: 0.041,
    rickshaw: 0,
    motorcycle: 0.103,
  },
  food: {
    meat: 27,
    fish: 6.1,
    vegetables: 2,
    rice: 4,
    dairy: 3.2,
  },
  energy: {
    electricity: 0.5,
    gas: 2.5,
  },
  shopping: {
    clothing: 10,
    electronics: 50,
  },
};

export const TRANSPORT_MODES = [
  { key: "car", icon: "🚗", unit: "km", factor: CARBON_FACTORS.transport.car },
  { key: "bus", icon: "🚌", unit: "km", factor: CARBON_FACTORS.transport.bus },
  {
    key: "train",
    icon: "🚆",
    unit: "km",
    factor: CARBON_FACTORS.transport.train,
  },
  {
    key: "rickshaw",
    icon: "🛺",
    unit: "km",
    factor: CARBON_FACTORS.transport.rickshaw,
  },
  {
    key: "motorcycle",
    icon: "🏍️",
    unit: "km",
    factor: CARBON_FACTORS.transport.motorcycle,
  },
];

export const FOOD_ITEMS = [
  { key: "meat", icon: "🥩", unit: "kg", factor: CARBON_FACTORS.food.meat },
  { key: "fish", icon: "🐟", unit: "kg", factor: CARBON_FACTORS.food.fish },
  {
    key: "vegetables",
    icon: "🥬",
    unit: "kg",
    factor: CARBON_FACTORS.food.vegetables,
  },
  { key: "rice", icon: "🍚", unit: "kg", factor: CARBON_FACTORS.food.rice },
  { key: "dairy", icon: "🥛", unit: "kg", factor: CARBON_FACTORS.food.dairy },
];

export const ENERGY_ITEMS = [
  {
    key: "electricity",
    icon: "⚡",
    unit: "kWh",
    factor: CARBON_FACTORS.energy.electricity,
  },
  { key: "gas", icon: "🔥", unit: "m³", factor: CARBON_FACTORS.energy.gas },
];

export const SHOPPING_ITEMS = [
  {
    key: "clothing",
    icon: "👕",
    unit: "item",
    factor: CARBON_FACTORS.shopping.clothing,
  },
  {
    key: "electronics",
    icon: "💻",
    unit: "item",
    factor: CARBON_FACTORS.shopping.electronics,
  },
];

export const TREES_PER_KG_PER_YEAR = 21;
export const AVG_BANGLADESHI_ANNUAL_TONS = 1.5;

export const ECO_TIPS_EN = [
  "Use public transport instead of private car to reduce 60% of transport emissions.",
  "Eat more vegetables and less meat – beef produces 13x more CO2 than vegetables.",
  "Switch to LED bulbs – they use 75% less energy than incandescent bulbs.",
  "Walk or cycle for trips under 3 km to save both carbon and health.",
  "Air dry clothes instead of using a dryer to save up to 2.5 kg CO2 per load.",
  "Unplug electronics when not in use – phantom loads add up to 10% of energy bills.",
  "Buy local and seasonal produce to reduce transport emissions.",
  "Reduce food waste – rotting food in landfills produces methane, a potent greenhouse gas.",
  "Use a reusable water bottle instead of plastic ones to reduce waste.",
  "Plant trees in your community – one tree absorbs 21 kg of CO2 per year.",
];

export const ECO_TIPS_BN = [
  "বেসরকারি গাড়ির বদলে পাবলিক ট্রান্সপোর্ট ব্যবহার করুন – ট্রান্সপোর্টের কার্বন ৬০% কমান।",
  "বেশি সবজি এবং কম মাংস খান – গরুর মাংস সবজির তুলনায় ১৩ গুণ বেশি CO₂ তৈরি করে।",
  "LED বাল্ব ব্যবহার করুন – এগুলো ইনকান্ডেসেন্ট বাল্বের তুলনায় ৭৫% কম বিদ্যুৎ খরচ করে।",
  "৩ কিমির কম দূরত্বে হাঁটুন বা সাইকেল চালান – স্বাস্থ্য ও পরিবেশ উভয়ের জন্য ভালো।",
  "কাপড় শুকাতে ড্রায়ারের বদলে হাওয়ায় শুকান – প্রতি লোডে ২.৫ কেজি CO₂ বাঁচান।",
  "ব্যবহার না হলে ইলেকট্রনিক্স আনপ্লাগ করুন – ফ্যান্টম লোড বিদ্যুৎ বিলের ১০% পর্যন্ত হতে পারে।",
  "স্থানীয় ও মৌসুমি খাবার কিনুন – ট্রান্সপোর্টের কার্বন কমাতে সাহায্য করে।",
  "খাবারের অপচয় কমান – ল্যান্ডফিলে পচনশীল খাবার মিথেন তৈরি করে।",
  "প্লাস্টিক বোতলের বদলে রিইউজেবল পানির বোতল ব্যবহার করুন।",
  "আপনার এলাকায় গাছ লাগান – একটি গাছ বছরে ২১ কেজি CO₂ শোষণ করে।",
];

export const ACHIEVEMENTS = [
  {
    id: "first-log",
    threshold: 1,
    type: "count",
    icon: "🌱",
    title: "First Step",
    titleBn: "প্রথম পদক্ষেপ",
    desc: "Log your first carbon activity",
    descBn: "আপনার প্রথম কার্বন কার্যকলাপ লগ করুন",
  },
  {
    id: "10-logs",
    threshold: 10,
    type: "count",
    icon: "🌿",
    title: "Eco Explorer",
    titleBn: "ইকো অনুসন্ধানকারী",
    desc: "Log 10 carbon activities",
    descBn: "১০টি কার্বন কার্যকলাপ লগ করুন",
  },
  {
    id: "50-logs",
    threshold: 50,
    type: "count",
    icon: "🌳",
    title: "Green Warrior",
    titleBn: "সবুজ যোদ্ধা",
    desc: "Log 50 carbon activities",
    descBn: "৫০টি কার্বন কার্যকলাপ লগ করুন",
  },
  {
    id: "100-logs",
    threshold: 100,
    type: "count",
    icon: "🏆",
    title: "Carbon Champion",
    titleBn: "কার্বন চ্যাম্পিয়ন",
    desc: "Log 100 carbon activities",
    descBn: "১০০টি কার্বন কার্যকলাপ লগ করুন",
  },
  {
    id: "below-avg",
    threshold: 1,
    type: "days-below-avg",
    icon: "⭐",
    title: "Below Average",
    titleBn: "গড়ের নিচে",
    desc: "Stay below Bangladesh daily average",
    descBn: "বাংলাদেশের দৈনিক গড়ের নিচে থাকুন",
  },
  {
    id: "zero-day",
    threshold: 1,
    type: "zero-days",
    icon: "🎯",
    title: "Zero Carbon Day",
    titleBn: "শূন্য কার্বন দিন",
    desc: "Complete a zero-carbon day",
    descBn: "একটি শূন্য-কার্বন দিন সম্পন্ন করুন",
  },
  {
    id: "weekly-goal",
    threshold: 1,
    type: "weekly-goals",
    icon: "🔥",
    title: "Goal Crusher",
    titleBn: "লক্ষ্য ভেঙে",
    desc: "Meet your weekly goal 4 times",
    descBn: "আপনার সাপ্তাহিক লক্ষ্য ৪ বার পূরণ করুন",
  },
  {
    id: "plant-tree",
    threshold: 1,
    type: "trees-earned",
    icon: "🌲",
    title: "Tree Planter",
    titleBn: "গাছ লাগানোকারী",
    desc: "Offset enough carbon to plant 1 tree",
    descBn: "১টি গাছ লাগানোর সমপরিমাণ কার্বন অফসেট করুন",
  },
];

export function getDayStart(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function formatDay(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getItemsForCategory(cat: string) {
  switch (cat) {
    case "transport":
      return TRANSPORT_MODES;
    case "food":
      return FOOD_ITEMS;
    case "energy":
      return ENERGY_ITEMS;
    case "shopping":
      return SHOPPING_ITEMS;
    default:
      return [];
  }
}

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
