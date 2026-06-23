import { Coffee, Sun, Moon, Cookie } from "lucide-react";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type Difficulty = "easy" | "medium" | "hard";
export type RecipeCategory = "rice" | "curry" | "snacks" | "sweets";

export interface Recipe {
  id: string;
  nameEn: string;
  nameBn: string;
  category: RecipeCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  ingredients: string[];
  cost: number;
}

export interface MealPlan {
  [day: string]: {
    [meal in MealType]?: string;
  };
}

export interface GroceryItem {
  name: string;
  quantity: number;
  checked: boolean;
}

export const RECIPES: Recipe[] = [
  {
    id: "biryani",
    nameEn: "Biryani",
    nameBn: "বিরিয়ানি",
    category: "rice",
    calories: 520,
    protein: 28,
    carbs: 55,
    fat: 18,
    prepTime: 30,
    cookTime: 60,
    difficulty: "medium",
    ingredients: ["Rice", "Chicken", "Onion", "Spices", "Yogurt", "Ghee"],
    cost: 250,
  },
  {
    id: "hansi_curry",
    nameEn: "Hansi Curry",
    nameBn: "হান্সি কারি",
    category: "curry",
    calories: 450,
    protein: 35,
    carbs: 20,
    fat: 25,
    prepTime: 20,
    cookTime: 90,
    difficulty: "hard",
    ingredients: ["Chicken", "Onion", "Garlic", "Ginger", "Spices", "Oil"],
    cost: 300,
  },
  {
    id: "fish_curry",
    nameEn: "Fish Curry",
    nameBn: "মাছের ঝোল",
    category: "curry",
    calories: 380,
    protein: 32,
    carbs: 15,
    fat: 20,
    prepTime: 15,
    cookTime: 30,
    difficulty: "easy",
    ingredients: ["Fish", "Turmeric", "Chili", "Onion", "Garlic", "Oil"],
    cost: 200,
  },
  {
    id: "panir_pitha",
    nameEn: "Panir Pitha",
    nameBn: "পানির পিঠা",
    category: "snacks",
    calories: 220,
    protein: 8,
    carbs: 35,
    fat: 6,
    prepTime: 25,
    cookTime: 20,
    difficulty: "medium",
    ingredients: ["Rice Flour", "Coconut", "Jaggery", "Cardamom"],
    cost: 80,
  },
  {
    id: "khichuri",
    nameEn: "Khichuri",
    nameBn: "খিচুড়ি",
    category: "rice",
    calories: 350,
    protein: 18,
    carbs: 50,
    fat: 10,
    prepTime: 10,
    cookTime: 30,
    difficulty: "easy",
    ingredients: ["Rice", "Lentils", "Turmeric", "Ginger", "Ghee"],
    cost: 120,
  },
  {
    id: "rice",
    nameEn: "Plain Rice",
    nameBn: "ভাত",
    category: "rice",
    calories: 200,
    protein: 4,
    carbs: 45,
    fat: 0.5,
    prepTime: 5,
    cookTime: 20,
    difficulty: "easy",
    ingredients: ["Rice", "Water", "Salt"],
    cost: 30,
  },
  {
    id: "dal",
    nameEn: "Lentils",
    nameBn: "ডাল",
    category: "curry",
    calories: 250,
    protein: 20,
    carbs: 35,
    fat: 5,
    prepTime: 10,
    cookTime: 25,
    difficulty: "easy",
    ingredients: ["Lentils", "Onion", "Garlic", "Turmeric", "Cumin", "Oil"],
    cost: 60,
  },
  {
    id: "shak",
    nameEn: "Spinach",
    nameBn: "শাক",
    category: "curry",
    calories: 150,
    protein: 8,
    carbs: 12,
    fat: 8,
    prepTime: 10,
    cookTime: 15,
    difficulty: "easy",
    ingredients: ["Spinach", "Onion", "Garlic", "Chili", "Oil"],
    cost: 40,
  },
  {
    id: "claypot_meat",
    nameEn: "Clay Pot Meat",
    nameBn: "মাটির হাঁড়ির মাংস",
    category: "curry",
    calories: 480,
    protein: 38,
    carbs: 10,
    fat: 30,
    prepTime: 25,
    cookTime: 120,
    difficulty: "hard",
    ingredients: ["Meat", "Onion", "Garlic", "Ginger", "Spices", "Clay Pot"],
    cost: 350,
  },
  {
    id: "fried_pitha",
    nameEn: "Fried Pitha",
    nameBn: "তেলে ভাজা পিঠা",
    category: "snacks",
    calories: 280,
    protein: 6,
    carbs: 40,
    fat: 12,
    prepTime: 20,
    cookTime: 15,
    difficulty: "medium",
    ingredients: ["Rice Flour", "Coconut", "Jaggery", "Oil"],
    cost: 90,
  },
  {
    id: "mishti_pitha",
    nameEn: "Sweet Pitha",
    nameBn: "মিষ্টি পিঠা",
    category: "sweets",
    calories: 300,
    protein: 5,
    carbs: 50,
    fat: 10,
    prepTime: 20,
    cookTime: 25,
    difficulty: "medium",
    ingredients: ["Rice Flour", "Coconut", "Jaggery", "Cardamom", "Milk"],
    cost: 100,
  },
  {
    id: "firni",
    nameEn: "Firni",
    nameBn: "ফিরনি",
    category: "sweets",
    calories: 320,
    protein: 10,
    carbs: 45,
    fat: 12,
    prepTime: 15,
    cookTime: 30,
    difficulty: "easy",
    ingredients: ["Rice Flour", "Milk", "Sugar", "Cardamom", "Nuts"],
    cost: 110,
  },
];

export const DAYS: { key: DayOfWeek; en: string; bn: string }[] = [
  { key: "mon", en: "Mon", bn: "সোম" },
  { key: "tue", en: "Tue", bn: "মঙ্গল" },
  { key: "wed", en: "Wed", bn: "বুধ" },
  { key: "thu", en: "Thu", bn: "বৃহ" },
  { key: "fri", en: "Fri", bn: "শুক্র" },
  { key: "sat", en: "Sat", bn: "শনি" },
  { key: "sun", en: "Sun", bn: "রবি" },
];

export const MEAL_TYPES: {
  key: MealType;
  en: string;
  bn: string;
  icon: typeof Coffee;
}[] = [
  { key: "breakfast", en: "Breakfast", bn: "নাস্তা", icon: Coffee },
  { key: "lunch", en: "Lunch", bn: "দুপুরের খাবার", icon: Sun },
  { key: "dinner", en: "Dinner", bn: "রাতের খাবার", icon: Moon },
  { key: "snacks", en: "Snacks", bn: "স্ন্যাকস", icon: Cookie },
];

export const CATEGORIES: { key: RecipeCategory; en: string; bn: string }[] = [
  { key: "rice", en: "Rice", bn: "ভাত" },
  { key: "curry", en: "Curry", bn: "তরকারি" },
  { key: "snacks", en: "Snacks", bn: "স্ন্যাকস" },
  { key: "sweets", en: "Sweets", bn: "মিষ্টান্ন" },
];

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
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

export function getDefaultPlan(): MealPlan {
  const plan: MealPlan = {};
  DAYS.forEach((d) => {
    plan[d.key] = {};
  });
  return plan;
}
