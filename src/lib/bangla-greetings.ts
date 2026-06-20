export function getTimeBasedGreeting(hour: number): { bn: string; en: string } {
  if (hour >= 4 && hour < 6)
    return { bn: "সকালের শুভেচ্ছা", en: "Early Morning" };
  if (hour >= 6 && hour < 12) return { bn: "সুপ্রভাত", en: "Good Morning" };
  if (hour >= 12 && hour < 17)
    return { bn: "শুভ অপরাহ্ন", en: "Good Afternoon" };
  if (hour >= 17 && hour < 20) return { bn: "শুভ সন্ধ্যা", en: "Good Evening" };
  return { bn: "শুভ রাত্রি", en: "Good Night" };
}

// Builds "Mr. Arafat" / "Mrs. Selina" (or the Bengali equivalent) from a
// profile's display name + gender, for use after a time-based greeting.
// Returns an empty string if no name is set yet, so callers can omit it.
export function getNameWithTitle(
  displayName: string | null | undefined,
  gender: "male" | "female" | "other" | null | undefined,
  lang: "en" | "bn",
): string {
  const name = displayName?.trim();
  if (!name) return "";

  // Only use the first name/word as the honorific target, matching the
  // "Good Morning Mr. Arafat" style rather than a full legal name.
  const firstName = name.split(/\s+/)[0];

  if (lang === "bn") {
    if (gender === "male") return `জনাব ${firstName}`;
    if (gender === "female") return `বেগম ${firstName}`;
    return firstName;
  }

  if (gender === "male") return `Mr. ${firstName}`;
  if (gender === "female") return `Mrs. ${firstName}`;
  return firstName;
}

const MOTIVATIONAL_QUOTES: { bn: string; en: string }[] = [
  {
    bn: "সফলতা হলো ক্রমাগত প্রচেষ্টার ফল।",
    en: "Success is the result of continuous effort.",
  },
  {
    bn: "আজকের কষ্ট আগামীকালের সুখ।",
    en: "Today's pain is tomorrow's happiness.",
  },
  {
    bn: "নিজেকে বিশ্বাস করো, সবকিছু সম্ভব।",
    en: "Believe in yourself, everything is possible.",
  },
  {
    bn: "ছোট ছোট পদক্ষেপই বড় পরিবর্তন আনে।",
    en: "Small steps bring big changes.",
  },
  {
    bn: "শিক্ষিত মানুষ সবসময় এগিয়ে থাকে।",
    en: "Knowledgeable people always stay ahead.",
  },
  { bn: "পরিশ্রমই সফলতার চাবিকাঠি।", en: "Hard work is the key to success." },
  {
    bn: "আমাদের স্বপ্নই আমাদের গন্তব্য নির্ধারণ করে।",
    en: "Our dreams determine our destination.",
  },
  {
    bn: "সময় কেউ থামাতে পারে না, তাই সময়ের মূল্য বুঝো।",
    en: "No one can stop time, so value it.",
  },
  { bn: "দুঃখের পরেই সুখ আসে।", en: "Happiness comes after sorrow." },
  {
    bn: "নতুন দিন নতুন সুযোগ নিয়ে আসে।",
    en: "A new day brings new opportunities.",
  },
];

export function getDailyMotivation(): { bn: string; en: string } {
  const today = new Date();
  const index =
    (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) %
    MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}

export function getPrayerGreeting(): { bn: string; en: string } {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 6)
    return {
      bn: "ফজরের সময়, আল্লাহর কাছে প্রার্থনা করুন।",
      en: "Time for Fajr prayer, pray to Allah.",
    };
  if (hour >= 12 && hour < 13)
    return {
      bn: "যোহরের সময়, আল্লাহর কাছে প্রার্থনা করুন।",
      en: "Time for Dhuhr prayer, pray to Allah.",
    };
  if (hour >= 15 && hour < 17)
    return {
      bn: "আসরের সময়, আল্লাহর কাছে প্রার্থনা করুন।",
      en: "Time for Asr prayer, pray to Allah.",
    };
  if (hour >= 18 && hour < 19)
    return {
      bn: "মাগরিবের সময়, আল্লাহর কাছে প্রার্থনা করুন।",
      en: "Time for Maghrib prayer, pray to Allah.",
    };
  if (hour >= 20 && hour < 22)
    return {
      bn: "ইশার সময়, আল্লাহর কাছে প্রার্থনা করুন।",
      en: "Time for Isha prayer, pray to Allah.",
    };
  return {
    bn: "আল্লাহর স্মরণে মন শান্ত রাখুন।",
    en: "Keep your heart calm in remembrance of Allah.",
  };
}
