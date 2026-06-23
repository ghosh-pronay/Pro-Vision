import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const mockOnAuthStateChanged = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignInAnonymously = vi.fn();
const mockSendSignInLinkToEmail = vi.fn();
const mockSignInWithEmailLink = vi.fn();
const mockSendEmailVerification = vi.fn();
const mockFirebaseSignOut = vi.fn();
const mockGetDb = vi.fn();

const mockDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: (...args: unknown[]) =>
    mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) =>
    mockCreateUserWithEmailAndPassword(...args),
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
  sendSignInLinkToEmail: (...args: unknown[]) =>
    mockSendSignInLinkToEmail(...args),
  signInWithEmailLink: (...args: unknown[]) => mockSignInWithEmailLink(...args),
  sendEmailVerification: (...args: unknown[]) =>
    mockSendEmailVerification(...args),
  signOut: (...args: unknown[]) => mockFirebaseSignOut(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

vi.mock("firebase/firestore", () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
}));

vi.mock("@/lib/firebase", () => ({
  auth: { currentUser: null },
  getDb: (...args: unknown[]) => mockGetDb(...args),
}));

import { useAuth } from "../use-auth";

describe("useAuth", () => {
  let authStateCallback: ((user: unknown) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      authStateCallback = cb;
      return vi.fn();
    });

    mockGetDb.mockResolvedValue({ type: "firestore" });
    mockDoc.mockReturnValue({ type: "doc-ref" });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ emailVerified: true }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns loading state initially", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("provides user when authenticated", async () => {
    const mockUser = {
      uid: "user-123",
      email: "test@example.com",
      emailVerified: true,
    };

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      authStateCallback?.(mockUser);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isEmailVerified).toBe(true);
  });

  it("sets isAuthenticated to false when no user", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      authStateCallback?.(null);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("provides signIn function", () => {
    const { result } = renderHook(() => useAuth());

    expect(typeof result.current.signIn).toBe("function");
  });

  it("provides signUp function", () => {
    const { result } = renderHook(() => useAuth());

    expect(typeof result.current.signUp).toBe("function");
  });

  it("provides signOut function", () => {
    const { result } = renderHook(() => useAuth());

    expect(typeof result.current.signOut).toBe("function");
  });

  it("signIn with password calls firebase signInWithEmailAndPassword", async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: {} });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("password", {
        email: "test@example.com",
        password: "pass123",
      });
    });

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "test@example.com",
      "pass123",
    );
  });

  it("signIn with anonymous calls signInAnonymously", async () => {
    mockSignInAnonymously.mockResolvedValue({ user: {} });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("anonymous");
    });

    expect(mockSignInAnonymously).toHaveBeenCalled();
  });

  it("signIn throws on unsupported method", async () => {
    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.signIn("unsupported");
      }),
    ).rejects.toThrow("Unsupported sign-in method: unsupported");
  });

  it("signUp calls createUserWithEmailAndPassword", async () => {
    const mockCredential = { user: { uid: "new-user" } };
    mockCreateUserWithEmailAndPassword.mockResolvedValue(mockCredential);
    mockSendEmailVerification.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("new@example.com", "pass123");
    });

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "new@example.com",
      "pass123",
    );
  });

  it("signOut calls firebase signOut", async () => {
    mockFirebaseSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockFirebaseSignOut).toHaveBeenCalled();
  });
});
