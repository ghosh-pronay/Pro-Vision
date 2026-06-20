import { getMessaging, getToken, onMessage, type MessagePayload } from "firebase/messaging";
import app from "./firebase";

const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (error) {
    console.error("Error getting notification token:", error);
    return null;
  }
}

export function onMessageReceived(
  callback: (payload: MessagePayload) => void,
): () => void {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}

export function showNotification(
  title: string,
  body: string,
  icon?: string,
  onClick?: () => void,
) {
  if (typeof window === "undefined" || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  const notification = new Notification(title, {
    body,
    icon: icon || "/logo.png",
    badge: "/logo.png",
    tag: "pro-vision-notification",
  });

  notification.onclick = () => {
    notification.close();
    onClick?.();
  };
}

export function scheduleNotification(
  title: string,
  body: string,
  delayMs: number,
  onClick?: () => void,
) {
  const timeoutId = setTimeout(() => {
    showNotification(title, body, undefined, onClick);
  }, delayMs);

  return () => clearTimeout(timeoutId);
}

export function scheduleHabitReminder(
  habitName: string,
  reminderTime: Date,
) {
  const now = Date.now();
  const reminderMs = reminderTime.getTime() - now;

  if (reminderMs <= 0) return undefined;

  return scheduleNotification(
    "Habit Reminder",
    `Time to: ${habitName}`,
    reminderMs,
  );
}

export function scheduleFocusSessionComplete(durationMinutes: number) {
  return scheduleNotification(
    "Focus Session Complete",
    `Great work! You focused for ${durationMinutes} minutes.`,
  );
}
