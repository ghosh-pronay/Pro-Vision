import type { Lang } from "@/i18n/translations";

export const HABIT_COLORS = [
  "var(--pv-blue)",
  "var(--pv-green)",
  "var(--pv-teal)",
  "var(--pv-lavender)",
  "var(--pv-orange)",
  "var(--pv-blue)",
];

export const FREQUENCY_OPTIONS = [
  { value: "daily" as const, label: "Daily" },
  { value: "weekly" as const, label: "Weekly" },
];

export const CATEGORIES = [
  { id: "health", label: { en: "Health", bn: "স্বাস্থ্য" }, icon: "💪" },
  {
    id: "productivity",
    label: { en: "Productivity", bn: "উৎপাদনশীলতা" },
    icon: "🎯",
  },
  {
    id: "mindfulness",
    label: { en: "Mindfulness", bn: "সচেতনতা" },
    icon: "🧘",
  },
  { id: "fitness", label: { en: "Fitness", bn: "ফিটনেস" }, icon: "🏃" },
  { id: "learning", label: { en: "Learning", bn: "শেখা" }, icon: "📚" },
  { id: "social", label: { en: "Social", bn: "সামাজিক" }, icon: "👥" },
  { id: "finance", label: { en: "Finance", bn: "আর্থিক" }, icon: "💰" },
  { id: "other", label: { en: "Other", bn: "অন্যান্য" }, icon: "📌" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: { en: "Newest", bn: "নতুন" } },
  { value: "streak", label: { en: "Best Streak", bn: "সেরা স্ট্রিক" } },
  {
    value: "completion",
    label: { en: "Completion Rate", bn: "সম্পন্ন হার" },
  },
  { value: "name", label: { en: "Name", bn: "নাম" } },
];

export const SUGGESTED_HABITS = [
  {
    icon: "💧",
    name: { en: "Drink 8 glasses of water", bn: "৮ গ্লাস পানি পান করুন" },
    description: {
      en: "Stay hydrated throughout the day",
      bn: "দিনভর হাইড্রেটেড থাকুন",
    },
    category: "health",
  },
  {
    icon: "🏃",
    name: { en: "Exercise 30 minutes", bn: "৩০ মিনিট ব্যায়াম করুন" },
    description: { en: "Move your body daily", bn: "প্রতিদিন শরীর সচল রাখুন" },
    category: "fitness",
  },
  {
    icon: "📚",
    name: { en: "Read 20 pages", bn: "২০ পৃষ্ঠা পড়ুন" },
    description: {
      en: "Build your reading habit",
      bn: "পড়ার অভ্যাস গড়ে তুলুন",
    },
    category: "learning",
  },
  {
    icon: "🧘",
    name: { en: "Meditate 10 minutes", bn: "১০ মিনিট ধ্যান করুন" },
    description: {
      en: "Find your inner peace",
      bn: "আপনার ভেতরের শান্তি খুঁজুন",
    },
    category: "mindfulness",
  },
  {
    icon: "😴",
    name: { en: "Sleep 8 hours", bn: "৮ ঘণ্টা ঘুমান" },
    description: { en: "Get quality rest", bn: "মানসম্মত বিশ্রাম নিন" },
    category: "health",
  },
  {
    icon: "📝",
    name: { en: "Write journal", bn: "জার্নাল লিখুন" },
    description: {
      en: "Reflect on your day",
      bn: "আপনার দিন সম্পর্কে চিন্তা করুন",
    },
    category: "mindfulness",
  },
  {
    icon: "🚫",
    name: { en: "No sugar today", bn: "আজ চিনি খাবেন না" },
    description: { en: "Reduce sugar intake", bn: "চিনির খাদ্য কমান" },
    category: "health",
  },
  {
    icon: "🚶",
    name: { en: "Walk 10,000 steps", bn: "১০,০০০ পা হাঁটুন" },
    description: { en: "Stay active", bn: "সচল থাকুন" },
    category: "fitness",
  },
  {
    icon: "🎯",
    name: { en: "Complete top 3 tasks", bn: "শীর্ষ ৩টি কাজ সম্পন্ন করুন" },
    description: { en: "Focus on priorities", bn: "অগ্রাধিকারে মনোযোগ দিন" },
    category: "productivity",
  },
  {
    icon: "🥗",
    name: { en: "Eat a healthy meal", bn: "একটি সুস্থ খাবার খান" },
    description: { en: "Nourish your body", bn: "আপনার শরীরকে পুষ্টি দিন" },
    category: "health",
  },
  {
    icon: "💰",
    name: { en: "Save 100 taka", bn: "১০০ টাকা সঞ্চয় করুন" },
    description: { en: "Build your savings", bn: "আপনার সঞ্চয় বাড়ান" },
    category: "finance",
  },
  {
    icon: "🙏",
    name: { en: "Practice gratitude", bn: "কৃতজ্ঞতা অনুশীলন করুন" },
    description: {
      en: "Write 3 things you're grateful for",
      bn: "৩টি কৃতজ্ঞতার বিষয় লিখুন",
    },
    category: "mindfulness",
  },
  {
    icon: "🧹",
    name: { en: "Clean workspace", bn: "কাজের জায়গা পরিষ্কার করুন" },
    description: { en: "Organize your desk", bn: "আপনার টেবিল সাজান" },
    category: "productivity",
  },
  {
    icon: "💻",
    name: { en: "Learn something new", bn: "নতুন কিছু শিখুন" },
    description: {
      en: "Spend 20 min learning",
      bn: "২০ মিনিট শেখায় ব্যয় করুন",
    },
    category: "learning",
  },
  {
    icon: "🍎",
    name: { en: "Eat 5 fruits & veggies", bn: "৫টি ফল ও সবজি খান" },
    description: {
      en: "Get your daily nutrition",
      bn: "আপনার দৈনিক পুষ্টি নিন",
    },
    category: "health",
  },
  {
    icon: "💪",
    name: { en: "Do 50 push-ups", bn: "৫০টি পুশ-আপ করুন" },
    description: {
      en: "Build upper body strength",
      bn: "উপরের শরীরের শক্তি বাড়ান",
    },
    category: "fitness",
  },
  {
    icon: "🧠",
    name: { en: "Practice mindfulness", bn: "সচেতনতা অনুশীলন করুন" },
    description: {
      en: "5 min deep breathing",
      bn: "৫ মিনিট গভীর শ্বাসপ্রশ্বাস",
    },
    category: "mindfulness",
  },
  {
    icon: "📱",
    name: { en: "No phone for 1 hour", bn: "১ ঘণ্টা ফোন ব্যবহার করবেন না" },
    description: { en: "Digital detox time", bn: "ডিজিটাল ডিটক্স সময়" },
    category: "mindfulness",
  },
  {
    icon: "🌿",
    name: { en: "Go outside for 15 min", bn: "১৫ মিনিট বাইরে যান" },
    description: {
      en: "Get fresh air and sunlight",
      bn: "তাজা বাতাস ও সূর্যালোক নিন",
    },
    category: "health",
  },
  {
    icon: "📞",
    name: { en: "Call a friend or family", bn: "বন্ধু বা পরিবারকে ফোন করুন" },
    description: {
      en: "Stay connected with loved ones",
      bn: "প্রিয়জনদের সাথে সম্পর্ক রাখুন",
    },
    category: "social",
  },
  {
    icon: "🎵",
    name: { en: "Listen to uplifting music", bn: "উত্সাহদায়ক সংগীত শুনুন" },
    description: {
      en: "Boost your mood with music",
      bn: "সংগীতে আপনার মেজাজ ভালো করুন",
    },
    category: "mindfulness",
  },
  {
    icon: "✍️",
    name: { en: "Write for 15 minutes", bn: "১৫ মিনিট লিখুন" },
    description: { en: "Creative writing or blog", bn: "সৃজনশীল লেখা বা ব্লগ" },
    category: "learning",
  },
  {
    icon: "🥗",
    name: {
      en: "Meal prep for tomorrow",
      bn: "আগামীকালের খাবার প্রস্তুত করুন",
    },
    description: {
      en: "Plan healthy meals ahead",
      bn: "স্বাস্থ্যকর খাবার পরিকল্পনা করুন",
    },
    category: "health",
  },
];

export const MOTIVATIONAL_MESSAGES = [
  {
    min: 3,
    max: 6,
    messages: {
      en: "You're building momentum! 🔥",
      bn: "আপনি গতি তৈরি করছেন! 🔥",
    },
  },
  {
    min: 7,
    max: 13,
    messages: {
      en: "One week strong! Keep going! ⚡",
      bn: "এক সপ্তাহ শক্তিশালী! চালিয়ে যান! ⚡",
    },
  },
  {
    min: 14,
    max: 29,
    messages: {
      en: "Two weeks! You're on fire! 🌟",
      bn: "দুই সপ্তাহ! আপনি আগুনে আছেন! 🌟",
    },
  },
  {
    min: 30,
    max: 99,
    messages: {
      en: "Monthly champion! Incredible! 💎",
      bn: "মাসিক চ্যাম্পিয়ন! অবিশ্বাস্য! 💎",
    },
  },
  {
    min: 100,
    max: 999,
    messages: {
      en: "Century club legend! 🏆",
      bn: "শতাব্দী ক্লাবের কিংবদন্তি! 🏆",
    },
  },
];

export type SortKey = "newest" | "streak" | "completion" | "name";

export function getMotivationalMessage(
  streak: number,
  lang: Lang,
): string | null {
  for (const msg of MOTIVATIONAL_MESSAGES) {
    if (streak >= msg.min && streak <= msg.max) {
      return msg.messages[lang];
    }
  }
  return null;
}
