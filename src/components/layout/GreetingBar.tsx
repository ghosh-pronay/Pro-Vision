import { useLang } from "@/i18n/LanguageContext";
import { getTimeBasedGreeting } from "@/lib/bangla-greetings";

export default function GreetingBar() {
  const { lang } = useLang();
  const greeting = getTimeBasedGreeting(new Date().getHours());

  return (
    <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
      <p className="text-sm font-medium">
        {lang === "bn" ? greeting.bn : greeting.en}
      </p>
    </div>
  );
}
