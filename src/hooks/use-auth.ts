import { useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.emailVerified && firebaseUser.email) {
        try {
          await firebaseUser.reload();
          setUser({ ...firebaseUser });
        } catch {
          setUser(firebaseUser);
        }
      } else {
        setUser(firebaseUser);
      }
      if (firebaseUser?.emailVerified && firebaseUser.email) {
        try {
          const { doc, getDoc, setDoc } = await import("firebase/firestore");
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists() || !snap.data().emailVerified) {
            await setDoc(
              userRef,
              {
                email: firebaseUser.email,
                emailVerified: true,
                updatedAt: Date.now(),
              },
              { merge: true },
            );
          }
        } catch (err) {
          console.error(
            "[auth] Failed to write emailVerified to Firestore:",
            err,
          );
        }
      }
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
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    try {
      await sendEmailVerification(credential.user, {
        url: window.location.origin,
        handleCodeInApp: true,
      });
    } catch (emailErr) {
      console.error("[auth] sendEmailVerification failed:", emailErr);
    }
    return credential;
  }, []);

  const sendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) throw new Error("No user logged in");
    try {
      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin,
        handleCodeInApp: true,
      });
    } catch (emailErr) {
      console.error("[auth] sendVerificationEmail failed:", emailErr);
      throw emailErr;
    }
  }, []);

  const reloadUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setUser({ ...auth.currentUser });
  }, []);

  const signOut = useCallback(async () => {
    return firebaseSignOut(auth);
  }, []);

  const isEmailVerified = user?.emailVerified ?? false;

  return {
    isLoading,
    isAuthenticated: !!user,
    isEmailVerified,
    user,
    signIn,
    signUp,
    signOut,
    sendVerificationEmail,
    reloadUser,
  };
}
