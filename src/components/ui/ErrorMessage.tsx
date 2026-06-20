import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "./VisuallyHidden";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  role?: "alert" | "status";
  className?: string;
}

export function ErrorMessage({
  title = "Error",
  message,
  onRetry,
  retryLabel = "Try again",
  role = "alert",
  className,
}: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      className={cn(
        "glass rounded-2xl p-6 border border-red-500/20",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-4 glass"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              {retryLabel}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface InlineErrorProps {
  message: string;
  id?: string;
  className?: string;
}

export function InlineError({ message, id, className }: InlineErrorProps) {
  return (
    <p
      role="alert"
      id={id}
      className={cn("text-sm text-red-500 mt-1", className)}
    >
      {message}
    </p>
  );
}

interface FormErrorMessageProps {
  message: string;
  fieldId: string;
  className?: string;
}

export function FormErrorMessage({
  message,
  fieldId,
  className,
}: FormErrorMessageProps) {
  const errorId = `${fieldId}-error`;
  return (
    <>
      <VisuallyHidden>
        <span id={errorId}>{message}</span>
      </VisuallyHidden>
      <p
        role="alert"
        aria-describedby={fieldId}
        id={errorId}
        className={cn("text-sm text-red-500 mt-1", className)}
      >
        {message}
      </p>
    </>
  );
}
