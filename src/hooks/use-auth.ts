import { useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signIn = useCallback(async (method: string, credential?: any) => {
    if (method === "email-otp" && credential instanceof FormData) {
      const email = credential.get("email") as string;
      if (!email) throw new Error("Email is required");
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      return;
    }

    if (method === "email-otp-link") {
      if (window.localStorage.getItem("emailForSignIn")) {
        await signInWithEmailLink(
          auth,
          window.localStorage.getItem("emailForSignIn")!,
          window.location.href,
        );
        window.localStorage.removeItem("emailForSignIn");
      }
      return;
    }

    if (method === "anonymous") {
      return signInAnonymously(auth);
    }

    if (method === "password" && credential) {
      return signInWithEmailAndPassword(
        auth,
        credential.email,
        credential.password,
      );
    }

    throw new Error(`Unsupported sign-in method: ${method}`);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    return firebaseSignOut(auth);
  }, []);

  return {
    isLoading,
    isAuthenticated: !!user,
    user,
    signIn,
    signUp,
    signOut,
  };
}
