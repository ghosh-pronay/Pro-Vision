import { useEffect, useState } from "react";
import { gregorianToBengali, BENGALI_MONTHS, BENGALI_DAYS } from "@/lib/bengali-calendar";
import { toBanglaNumber } from "@/lib/bangla-numbers";

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EN_WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function formatEnglishDate(now: Date): string {
  const day = String(now.getDate()).padStart(2, "0");
  const month = EN_MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const weekday = EN_WEEKDAYS[now.getDay()];
  return `${day}-${month}-${year} (${weekday})`;
}

function formatBengaliDate(now: Date): string {
  const bengali = gregorianToBengali(now);
  const day = toBanglaNumber(bengali.day);
  const month = BENGALI_MONTHS[bengali.month].bn;
  const year = toBanglaNumber(bengali.year);
  const weekday = BENGALI_DAYS[now.getDay()].bn;
  return `${day}-${month}-${year} (${weekday})`;
}

function formatClock(now: Date): string {
  let hours = now.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const h = String(hours).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s} ${ampm}`;
}

export default function DashboardDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center sm:items-end gap-1 text-center sm:text-right shrink-0">
      <p className="text-xs sm:text-sm font-medium text-foreground/80">
        <span className="text-muted-foreground">English Date: </span>
        {formatEnglishDate(now)}
      </p>
      <p className="text-xs sm:text-sm font-medium text-foreground/80">
        <span className="text-muted-foreground">Bengali Date: </span>
        {formatBengaliDate(now)}
      </p>
      <p className="text-base sm:text-lg font-bold tabular-nums tracking-wide text-primary">
        {formatClock(now)}
      </p>
    </div>
  );
}
