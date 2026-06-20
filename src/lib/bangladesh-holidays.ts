export interface Holiday {
  name: string;
  nameEn: string;
  date: string;
  type: "public" | "national" | "observance";
}

export const BANGLADESH_HOLIDAYS: Holiday[] = [
  {
    name: "ভাষা শহিদ দিবস",
    nameEn: "Language Martyrs' Day",
    date: "2024-02-21",
    type: "national",
  },
  {
    name: "জাতীয় দিবস",
    nameEn: "Independence Day",
    date: "2024-03-26",
    type: "national",
  },
  {
    name: "বাংলা নববর্ষ",
    nameEn: "Pohela Boishakh",
    date: "2024-04-14",
    type: "public",
  },
  {
    name: "ঈদ উল-ফিতর",
    nameEn: "Eid ul-Fitr",
    date: "2024-04-11",
    type: "public",
  },
  {
    name: "ঈদ উল-আজহা",
    nameEn: "Eid ul-Adha",
    date: "2024-06-18",
    type: "public",
  },
  {
    name: "জাতির পিতার জন্মদিন",
    nameEn: "Birth Anniversary of Sheikh Mujibur Rahman",
    date: "2024-03-17",
    type: "national",
  },
  {
    name: "জাতীয় শোক দিবস",
    nameEn: "National Mourning Day",
    date: "2024-08-15",
    type: "national",
  },
  {
    name: "বিজয় দিবস",
    nameEn: "Victory Day",
    date: "2024-12-16",
    type: "national",
  },

  {
    name: "ভাষা শহিদ দিবস",
    nameEn: "Language Martyrs' Day",
    date: "2025-02-21",
    type: "national",
  },
  {
    name: "জাতীয় দিবস",
    nameEn: "Independence Day",
    date: "2025-03-26",
    type: "national",
  },
  {
    name: "জাতির পিতার জন্মদিন",
    nameEn: "Birth Anniversary of Sheikh Mujibur Rahman",
    date: "2025-03-17",
    type: "national",
  },
  {
    name: "বাংলা নববর্ষ",
    nameEn: "Pohela Boishakh",
    date: "2025-04-14",
    type: "public",
  },
  {
    name: "ঈদ উল-ফিতর",
    nameEn: "Eid ul-Fitr",
    date: "2025-03-31",
    type: "public",
  },
  {
    name: "ঈদ উল-আজহা",
    nameEn: "Eid ul-Adha",
    date: "2025-06-07",
    type: "public",
  },
  {
    name: "জাতীয় শোক দিবস",
    nameEn: "National Mourning Day",
    date: "2025-08-15",
    type: "national",
  },
  {
    name: "বিজয় দিবস",
    nameEn: "Victory Day",
    date: "2025-12-16",
    type: "national",
  },

  {
    name: "ভাষা শহিদ দিবস",
    nameEn: "Language Martyrs' Day",
    date: "2026-02-21",
    type: "national",
  },
  {
    name: "জাতীয় দিবস",
    nameEn: "Independence Day",
    date: "2026-03-26",
    type: "national",
  },
  {
    name: "জাতির পিতার জন্মদিন",
    nameEn: "Birth Anniversary of Sheikh Mujibur Rahman",
    date: "2026-03-17",
    type: "national",
  },
  {
    name: "বাংলা নববর্ষ",
    nameEn: "Pohela Boishakh",
    date: "2026-04-14",
    type: "public",
  },
  {
    name: "ঈদ উল-ফিতর",
    nameEn: "Eid ul-Fitr",
    date: "2026-03-20",
    type: "public",
  },
  {
    name: "ঈদ উল-আজহা",
    nameEn: "Eid ul-Adha",
    date: "2026-05-27",
    type: "public",
  },
  {
    name: "জাতীয় শোক দিবস",
    nameEn: "National Mourning Day",
    date: "2026-08-15",
    type: "national",
  },
  {
    name: "বিজয় দিবস",
    nameEn: "Victory Day",
    date: "2026-12-16",
    type: "national",
  },
];

export function getHolidaysForMonth(month: number): Holiday[] {
  return BANGLADESH_HOLIDAYS.filter((h) => {
    const m = new Date(h.date).getMonth() + 1;
    return m === month;
  });
}

function getLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getUpcomingHolidays(): Holiday[] {
  const today = getLocalDateStr(new Date());
  return BANGLADESH_HOLIDAYS.filter((h) => h.date >= today).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function isHoliday(date: Date): Holiday | null {
  const dateStr = getLocalDateStr(date);
  return BANGLADESH_HOLIDAYS.find((h) => h.date === dateStr) ?? null;
}

export function getHolidayGreeting(holiday: Holiday): {
  bn: string;
  en: string;
} {
  const greetings: Record<string, { bn: string; en: string }> = {
    "ঈদ উল-ফিতর": { bn: "ঈদ মোবারক!", en: "Eid Mubarak!" },
    "ঈদ উল-আজহা": { bn: "ঈদ মোবারক!", en: "Eid Mubarak!" },
    "বাংলা নববর্ষ": { bn: "শুভ নববর্ষ!", en: "Happy New Year!" },
    "বিজয় দিবস": { bn: "বিজয় দিবসের শুভেচ্ছা!", en: "Happy Victory Day!" },
    "স্বাধীনতা দিবস": {
      bn: "স্বাধীনতা দিবসের শুভেচ্ছা!",
      en: "Happy Independence Day!",
    },
  };

  const defaultGreeting: Record<string, { bn: string; en: string }> = {
    public: { bn: `${holiday.name} শুভেচ্ছা!`, en: `Happy ${holiday.nameEn}!` },
    national: {
      bn: `${holiday.name} শুভেচ্ছা!`,
      en: `Happy ${holiday.nameEn}!`,
    },
    observance: {
      bn: `${holiday.name} শুভেচ্ছা!`,
      en: `Happy ${holiday.nameEn}!`,
    },
  };

  return greetings[holiday.name] ?? defaultGreeting[holiday.type];
}
