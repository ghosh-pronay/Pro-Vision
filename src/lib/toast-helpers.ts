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

export function toastWarning(message: string) {
  toast.warning(message, {
    style: {
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      color: "white",
      border: "none",
    },
  });
}

export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  },
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: (data) =>
      typeof messages.success === "function"
        ? messages.success(data)
        : messages.success,
    error: (err) =>
      typeof messages.error === "function"
        ? messages.error(err)
        : messages.error,
    style: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
      color: "white",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
  });
}
