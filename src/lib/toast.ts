import { toast } from "sonner";

export function showToastError(message: string) {
  toast.error(message);
}

export function showToastSuccess(message: string) {
  toast.success(message);
}

export function showToastInfo(message: string) {
  toast.info(message);
}

export function handleMutationError(error: unknown, fallback = "An error occurred") {
  const message = error instanceof Error ? error.message : fallback;
  toast.error(message);
}

export function handleMutationSuccess(message: string) {
  toast.success(message);
}
