import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pro-visions.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pro-visions",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "pro-visions.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "570621295453",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:570621295453:web:3e2c03807274d8d4e286b4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-C6FC4FJXWX",
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(app);

let dbInstance: Firestore | null = null;

export async function getDb(): Promise<Firestore> {
  if (!dbInstance) {
    const { getFirestore } = await import("firebase/firestore");
    dbInstance = getFirestore(app);
  }
  return dbInstance;
}

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
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined,
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
  getMessagingInstance()
    .then(async (m) => {
      if (m) {
        const fm = await loadMessaging();
        fm.onMessage(m as Parameters<typeof fm.onMessage>[0], callback);
      }
    })
    .catch(() => {});
}

export function getSavedToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pv-fcm-token");
}

export default app;
