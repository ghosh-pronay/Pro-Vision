import { motion } from "framer-motion";
import { Lightbulb, UserCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router";

interface SectionSuggestionProps {
  type: "profile" | "tip" | "empty";
  text: string;
  linkTo?: string;
  linkText?: string;
}

const variantStyles = {
  profile: {
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    icon: UserCircle,
    iconColor: "text-amber-500",
  },
  tip: {
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
    icon: Lightbulb,
    iconColor: "text-blue-500",
  },
  empty: {
    bg: "bg-muted/50",
    border: "border-border",
    icon: AlertCircle,
    iconColor: "text-muted-foreground",
  },
};

export default function SectionSuggestion({
  type,
  text,
  linkTo = "/settings",
  linkText,
}: SectionSuggestionProps) {
  const style = variantStyles[type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`mt-3 pt-3 border-t ${style.border}`}
    >
      <div
        className={`flex items-center gap-2 text-xs ${style.bg} rounded-lg p-2.5`}
      >
        <Icon className={`h-3.5 w-3.5 shrink-0 ${style.iconColor}`} />
        <p className="text-muted-foreground flex-1">{text}</p>
        {linkTo && (
          <Link
            to={linkTo}
            className={`shrink-0 flex items-center gap-0.5 font-medium ${style.iconColor} hover:underline`}
          >
            {linkText || "Settings"}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
