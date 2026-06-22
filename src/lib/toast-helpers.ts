import { toast } from "sonner";

export function toastSuccess(message: string) {
  toast.success(message, {
    style: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      border: "none",
    },
  });
}

export function toastError(message: string) {
  toast.error(message, {
    style: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "white",
      border: "none",
    },
  });
}

export function toastInfo(message: string) {
  toast.info(message, {
    style: {
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "white",
      border: "none",
    },
  });
}

export function handleMutationError(
  error: unknown,
  fallback = "An error occurred",
) {
  const message = error instanceof Error ? error.message : fallback;
  toastError(message);
}

export function handleMutationSuccess(message: string) {
  toastSuccess(message);
}
