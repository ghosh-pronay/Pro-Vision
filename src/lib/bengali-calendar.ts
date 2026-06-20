// Bangla calendar (Bangla Sambat) conversion utilities.
// This is the same approximate Gregorian→Bengali conversion already used by
// the Bengali Calendar page, extracted here so it can be shared.

export const BENGALI_MONTHS = [
  { bn: "বৈশাখ", en: "Baishakh", days: 30 },
  { bn: "জ্যৈষ্ঠ", en: "Jyoishtho", days: 31 },
  { bn: "আষাঢ়", en: "Asharh", days: 31 },
  { bn: "শ্রাবণ", en: "Shrabon", days: 31 },
  { bn: "ভাদ্র", en: "Bhadro", days: 31 },
  { bn: "আশ্বিন", en: "Ashwin", days: 30 },
  { bn: "কার্তিক", en: "Kartik", days: 30 },
  { bn: "অগ্রহায়ণ", en: "Ogrohayon", days: 30 },
  { bn: "পৌষ", en: "Poush", days: 30 },
  { bn: "মাঘ", en: "Magh", days: 30 },
  { bn: "ফাল্গুন", en: "Falgun", days: 30 },
  { bn: "চৈত্র", en: "Choitro", days: 30 },
];

export const BENGALI_DAYS = [
  { bn: "রবিবার", en: "Sun", short: "S" },
  { bn: "সোমবার", en: "Mon", short: "M" },
  { bn: "মঙ্গলবার", en: "Tue", short: "T" },
  { bn: "বুধবার", en: "Wed", short: "W" },
  { bn: "বৃহস্পতিবার", en: "Thu", short: "T" },
  { bn: "শুক্রবার", en: "Fri", short: "F" },
  { bn: "শনিবার", en: "Sat", short: "S" },
];

export interface BengaliDate {
  year: number;
  month: number; // 0-indexed into BENGALI_MONTHS
  day: number;
}

export function gregorianToBengali(date: Date): BengaliDate {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  let bengaliYear: number;
  if (m > 3 || (m === 3 && d >= 14)) {
    bengaliYear = y - 593;
  } else {
    bengaliYear = y - 594;
  }

  const april1 = new Date(y, 3, 14);
  const diff = Math.floor((date.getTime() - april1.getTime()) / 86400000);

  let accumulated = 0;
  let bengaliMonth = 0;
  let bengaliDay = 1;
  for (let i = 0; i < 12; i++) {
    const monthDays = BENGALI_MONTHS[i].days;
    if (diff < accumulated + monthDays) {
      bengaliMonth = i;
      bengaliDay = diff - accumulated + 1;
      break;
    }
    accumulated += monthDays;
    if (i === 11) {
      bengaliMonth = 11;
      bengaliDay = diff - accumulated + 1;
    }
  }

  if (bengaliDay < 1) bengaliDay = 1;

  return { year: bengaliYear, month: bengaliMonth, day: bengaliDay };
}
