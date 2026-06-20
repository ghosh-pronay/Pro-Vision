import { useState } from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  label?: string;
  className?: string;
}

export function SkipLink({
  href = "#main-content",
  label = "Skip to main content",
  className,
}: SkipLinkProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <a
      href={href}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "fixed top-0 left-0 z-[9999] px-4 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-br-xl",
        "transform -translate-y-full transition-transform duration-200",
        "focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isFocused && "translate-y-0",
        className,
      )}
    >
      {label}
    </a>
  );
}
