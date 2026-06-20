import { useState, useEffect, useCallback } from "react";
import {
  requestNotificationPermission,
  onMessageReceived,
  showNotification,
} from "@/lib/notifications";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!onMessageReceived) return;

    const unsubscribe = onMessageReceived((payload) => {
      if (payload.notification) {
        showNotification(
          payload.notification.title || "Pro Vision",
          payload.notification.body || "",
        );
      }
    });

    return unsubscribe;
  }, []);

  const requestPermission = useCallback(async () => {
    const newToken = await requestNotificationPermission();
    if (newToken) {
      setToken(newToken);
      setPermission("granted");
      return newToken;
    }
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
    return null;
  }, []);

  const notify = useCallback(
    (title: string, body: string) => {
      showNotification(title, body);
    },
    [],
  );

  return {
    permission,
    token,
    requestPermission,
    notify,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
}
