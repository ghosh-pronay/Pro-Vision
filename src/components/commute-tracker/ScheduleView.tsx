import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { Bus, Info } from "lucide-react";
import { fadeUp, BUS_ROUTES, METRO_SCHEDULE } from "./types";

export function ScheduleView() {
  const { lang } = useLang();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="glass rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Bus className="w-5 h-5 text-blue-500" />
          {lang === "bn" ? "বাস রুট ও সময়সূচী" : "Bus Routes & Schedule"}
        </h2>
        <div className="space-y-3">
          {BUS_ROUTES.map((route) => (
            <motion.div
              key={route.route}
              whileHover={{ scale: 1.01 }}
              className="glass-subtle rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {lang === "bn" ? route.nameBn : route.nameEn}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === "bn" ? "ফ্রিকোয়েন্সি" : "Frequency"}:{" "}
                    {route.frequency}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">৳{route.fare}</p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "bn" ? "ভাড়া" : "Fare"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 md:p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-primary" />
          {lang === "bn" ? "মেট্রো রেল সময়সূচী" : "Metro Rail Schedule"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground p-3">
                  {lang === "bn" ? "স্টেশন" : "Station"}
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3">
                  {lang === "bn" ? "প্রথম" : "First"}
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3">
                  {lang === "bn" ? "শেষ" : "Last"}
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3">
                  {lang === "bn" ? "ইন্টারভাল" : "Interval"}
                </th>
              </tr>
            </thead>
            <tbody>
              {METRO_SCHEDULE.map((stop) => (
                <tr
                  key={stop.station}
                  className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3 text-sm font-medium">
                    {lang === "bn" ? stop.nameBn : stop.nameEn}
                  </td>
                  <td className="text-center p-3 text-sm">{stop.firstTrain}</td>
                  <td className="text-center p-3 text-sm">{stop.lastTrain}</td>
                  <td className="text-center p-3 text-sm">{stop.interval}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
