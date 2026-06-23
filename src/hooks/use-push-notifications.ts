import { useState, useEffect, useCallback, useMemo } from "react";
import {
  requestNotificationPermission,
  getFirebaseToken,
  getSavedToken,
  onMessageListener,
} from "@/lib/firebase";

const NOTIFICATION_DECLINED_KEY = "pv-notification-declined";

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  token: string | null;
  isSubscribed: boolean;
  lastMessage: { title?: string; body?: string } | null;
}

function getInitialState(): PushNotificationState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return {
      isSupported: false,
      permission: "default",
      token: null,
      isSubscribed: false,
      lastMessage: null,
    };
  }

  const savedToken = getSavedToken();
  return {
    isSupported: true,
    permission: Notification.permission,
    token: savedToken,
    isSubscribed: !!savedToken,
    lastMessage: null,
  };
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>(getInitialState);

  useEffect(() => {
    const cleanup = () => {};

    onMessageListener((payload) => {
      if (payload.notification) {
        setState((prev) => ({
          ...prev,
          lastMessage: {
            title: payload.notification?.title,
            body: payload.notification?.body,
          },
        }));

        if (payload.notification?.title && payload.notification?.body) {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/logo.png",
          });
        }
      }
    });

    return cleanup;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();

    if (granted) {
      const token = await getFirebaseToken();
      setState((prev) => ({
        ...prev,
        permission: "granted",
        token,
        isSubscribed: !!token,
      }));
      localStorage.removeItem(NOTIFICATION_DECLINED_KEY);
      return true;
    } else {
      setState((prev) => ({
        ...prev,
        permission: "denied",
      }));
      return false;
    }
  }, []);

  const decline = useCallback(() => {
    localStorage.setItem(NOTIFICATION_DECLINED_KEY, "true");
    setState((prev) => ({
      ...prev,
      permission: "denied",
    }));
  }, []);

  const isDeclined = useCallback(() => {
    return localStorage.getItem(NOTIFICATION_DECLINED_KEY) === "true";
  }, []);

  const clearLastMessage = useCallback(() => {
    setState((prev) => ({ ...prev, lastMessage: null }));
  }, []);

  return useMemo(
    () => ({
      ...state,
      requestPermission,
      decline,
      isDeclined,
      clearLastMessage,
    }),
    [state, requestPermission, decline, isDeclined, clearLastMessage],
  );
}
