import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHzCxlnrx_-fX68FkigYsqt9MxXci-v28",
  authDomain: "pro-visions.firebaseapp.com",
  projectId: "pro-visions",
  storageBucket: "pro-visions.firebasestorage.app",
  messagingSenderId: "570621295453",
  appId: "1:570621295453:web:3e2c03807274d8d4e286b4",
  measurementId: "G-C6FC4FJXWX",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

let messaging: unknown = null;

async function loadMessaging() {
  return import("firebase/messaging");
}

export async function getMessagingInstance() {
  if (typeof window === "undefined") return null;

  try {
    const fm = await loadMessaging();
    const supported = await fm.isSupported();
    if (!supported) return null;

    if (!messaging) {
      messaging = fm.getMessaging(app);
    }
    return messaging;
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch {
    return false;
  }
}

export async function getFirebaseToken(): Promise<string | null> {
  try {
    const m = await getMessagingInstance();
    if (!m) return null;

    const fm = await loadMessaging();
    const currentToken = await fm.getToken(
      m as Parameters<typeof fm.getToken>[0],
      {
        vapidKey: "BNxR...your-vapid-key...",
      },
    );

    if (currentToken) {
      localStorage.setItem("pv-fcm-token", currentToken);
      return currentToken;
    }
    return null;
  } catch {
    return null;
  }
}

export function onMessageListener(
  callback: (payload: {
    notification?: { title?: string; body?: string };
    data?: Record<string, string>;
  }) => void,
) {
  getMessagingInstance().then(async (m) => {
    if (m) {
      const fm = await loadMessaging();
      fm.onMessage(m as Parameters<typeof fm.onMessage>[0], callback);
    }
  });
}

export function getSavedToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pv-fcm-token");
}

export default app;
