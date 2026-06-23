import { motion } from "framer-motion";
import { fadeUp } from "./types";

interface BudgetTabProps {
  familyBudget: { total: number; spent: number };
  lang: "en" | "bn";
}

export function BudgetTab({ familyBudget, lang }: BudgetTabProps) {
  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <h2 className="text-lg font-semibold">
        {lang === "bn" ? "পারিবারিক বাজেট" : "Family Budget"}
      </h2>

      <div className="glass rounded-2xl p-6">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold">
            ৳{familyBudget.spent.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {lang === "bn" ? "ব্যবহৃত" : "of"} ৳
            {familyBudget.total.toLocaleString()}{" "}
            {lang === "bn" ? "ব্যবহৃত" : "spent"}
          </div>
        </div>

        <div className="w-full h-3 bg-foreground/10 rounded-full overflow-hidden mb-4">
          <motion.div
            className={`h-full rounded-full ${
              familyBudget.spent / familyBudget.total > 0.9
                ? "bg-red-500"
                : familyBudget.spent / familyBudget.total > 0.7
                  ? "bg-amber-500"
                  : "bg-green-500"
            }`}
            initial={{ width: 0 }}
            animate={{
              width: `${(familyBudget.spent / familyBudget.total) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {lang === "bn" ? "বাকি" : "Remaining"}:{" "}
            <span className="font-medium text-foreground">
              ৳{(familyBudget.total - familyBudget.spent).toLocaleString()}
            </span>
          </span>
          <span className="text-muted-foreground">
            {Math.round((familyBudget.spent / familyBudget.total) * 100)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-500">
            ৳{(familyBudget.total * 0.6).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {lang === "bn" ? "খাদ্য ও বাসস্থান" : "Food & Housing"}
          </div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">
            ৳{(familyBudget.total * 0.15).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {lang === "bn" ? "শিক্ষা" : "Education"}
          </div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-500">
            ৳{(familyBudget.total * 0.15).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {lang === "bn" ? "বিনোদন" : "Entertainment"}
          </div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-500">
            ৳{(familyBudget.total * 0.1).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {lang === "bn" ? "সঞ্চয়" : "Savings"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
