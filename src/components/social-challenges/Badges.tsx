import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

interface Badge {
  id: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

interface Props {
  badges: Badge[];
}

export default function Badges({ badges }: Props) {
  const { lang } = useLang();
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-4">
      <motion.div variants={fadeUp} className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {lang === "bn" ? "ব্যাজ সংগ্রহ" : "Badge Collection"}
          </span>
          <span className="text-sm font-medium">
            {unlockedCount}/{badges.length}
          </span>
        </div>
        <div className="mt-2 h-2 bg-foreground/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / badges.length) * 100}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            variants={fadeUp}
            className={`glass rounded-2xl p-4 text-center hover-lift hover-lavender ${!badge.unlocked ? "opacity-50" : ""}`}
          >
            <div className="text-3xl mb-2">{badge.icon}</div>
            <h4 className="text-xs font-medium mb-1">
              {lang === "bn" ? badge.nameBn : badge.nameEn}
            </h4>
            <p className="text-[10px] text-muted-foreground mb-2">
              {lang === "bn" ? badge.descriptionBn : badge.descriptionEn}
            </p>
            {badge.unlocked ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                {lang === "bn" ? "অনলক" : "Unlocked"}
              </span>
            ) : badge.progress !== undefined &&
              badge.maxProgress !== undefined ? (
              <div>
                <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-primary/50 rounded-full"
                    style={{
                      width: `${(badge.progress / badge.maxProgress) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {badge.progress}/{badge.maxProgress}
                </span>
              </div>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/10 text-muted-foreground">
                {lang === "bn" ? "লক" : "Locked"}
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
