import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";

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
export const storage = getStorage(app);

let messaging: ReturnType<typeof getMessaging> | null = null;

export async function getMessagingInstance() {
  if (typeof window === "undefined") return null;

  try {
    const supported = await isSupported();
    if (!supported) return null;

    if (!messaging) {
      messaging = getMessaging(app);
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
    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) return null;

    const currentToken = await getToken(messagingInstance, {
      vapidKey: "BNxR...your-vapid-key...", // Replace with actual VAPID key
    });

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
  getMessagingInstance().then((messagingInstance) => {
    if (messagingInstance) {
      onMessage(messagingInstance, callback);
    }
  });
}

export function getSavedToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pv-fcm-token");
}

export default app;
