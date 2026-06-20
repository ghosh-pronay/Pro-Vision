const BANGLA_DIGITS: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

const ENGLISH_DIGITS: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

export function toBanglaNumber(num: number): string {
  return num.toString().replace(/[0-9]/g, (d) => BANGLA_DIGITS[d]);
}

export function formatBanglaCurrency(amount: number): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const bangla = toBanglaNumber(Number(formatted.replace(/,/g, "")));
  const parts = bangla.split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${intPart}.${parts[1] || "০০"} টাকা`;
}

export function formatBanglaDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const banglaMonths = [
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

  return `${toBanglaNumber(day)} ${banglaMonths[month - 1]}, ${toBanglaNumber(year)}`;
}

export function parseBanglaNumber(str: string): number {
  const english = str.replace(/[০-৯]/g, (d) => ENGLISH_DIGITS[d] || d);
  return Number(english);
}
