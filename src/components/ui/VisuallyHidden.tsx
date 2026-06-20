import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VisuallyHiddenProps {
  children: ReactNode;
  className?: string;
  as?: "span" | "div" | "p" | "label";
}

export function VisuallyHidden({
  children,
  className,
  as: Tag = "span",
}: VisuallyHiddenProps) {
  return (
    <Tag
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden",
        "whitespace-nowrap border-0",
        "[clip:rect(0,0,0,0)]",
        "[clip-path:inset(50%)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
