import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { EMERGENCY_NUMBERS, fadeUp } from "./types";

interface QuickDialProps {
  lang: string;
  onDial: (number: string) => void;
}

export function QuickDial({ lang, onDial }: QuickDialProps) {
  return (
    <motion.div variants={fadeUp}>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Phone className="h-5 w-5 text-primary" />
        {lang === "bn" ? "জরুরি নম্বর" : "Emergency Quick Dial"}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {EMERGENCY_NUMBERS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onDial(item.number)}
              className="glass rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer 
                hover:bg-foreground/5 transition-colors"
            >
              <div className={`p-2.5 rounded-xl ${item.bg}`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {item.label}
              </span>
              <span className="text-sm font-bold">{item.number}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
