export interface MarketItem {
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

export interface PriceAlert {
  id: string;
  itemId: string;
  targetPrice: number;
  direction: "above" | "below";
}

export interface ShoppingItem {
  id: string;
  itemId: string;
  quantity: number;
}

export const CATEGORIES = [
  { id: "all", en: "All", bn: "সব" },
  { id: "vegetables", en: "Vegetables", bn: "শাকসবজি" },
  { id: "fish", en: "Fish", bn: "মাছ" },
  { id: "meat", en: "Meat", bn: "মাংস" },
  { id: "grains", en: "Grains", bn: "শস্য" },
  { id: "dairy", en: "Dairy", bn: "দুগ্ধ" },
  { id: "fruits", en: "Fruits", bn: "ফল" },
] as const;

export const MARKET_ITEMS: MarketItem[] = [
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

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const getPriceChange = (current: number, prev: number) => {
  const change = ((current - prev) / prev) * 100;
  return { value: change, isUp: change > 0 };
};
