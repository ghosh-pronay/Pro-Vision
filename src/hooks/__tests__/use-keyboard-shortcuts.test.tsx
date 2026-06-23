import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { useKeyboardShortcuts } from "../use-keyboard-shortcuts";

function renderWithRouter(hook: () => void) {
  return renderHook(hook, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

function fireKeyOn(target: EventTarget, key: string, opts?: KeyboardEventInit) {
  target.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, ...opts }),
  );
}

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates on g + t sequence", () => {
    renderWithRouter(() => useKeyboardShortcuts());

    fireKeyOn(document.body, "g");
    fireKeyOn(document.body, "t");

    expect(mockNavigate).toHaveBeenCalledWith("/todo");
  });

  it("navigates to correct routes for different shortcut keys", () => {
    renderWithRouter(() => useKeyboardShortcuts());

    fireKeyOn(document.body, "g");
    fireKeyOn(document.body, "h");
    expect(mockNavigate).toHaveBeenCalledWith("/habits");

    fireKeyOn(document.body, "g");
    fireKeyOn(document.body, "e");
    expect(mockNavigate).toHaveBeenCalledWith("/expense");

    fireKeyOn(document.body, "g");
    fireKeyOn(document.body, "s");
    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });

  it("ignores keystrokes dispatched from input elements", () => {
    renderWithRouter(() => useKeyboardShortcuts());

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    fireKeyOn(input, "g");
    fireKeyOn(input, "t");

    expect(mockNavigate).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("ignores Ctrl+key combinations", () => {
    renderWithRouter(() => useKeyboardShortcuts());

    fireKeyOn(document.body, "g", { ctrlKey: true });
    fireKeyOn(document.body, "t");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows help dialog when ? is pressed", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderWithRouter(() => useKeyboardShortcuts());

    fireKeyOn(document.body, "?");
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining("Keyboard Shortcuts"),
    );
    alertSpy.mockRestore();
  });

  it("resets pending g state on Escape", () => {
    renderWithRouter(() => useKeyboardShortcuts());

    fireKeyOn(document.body, "g");
    fireKeyOn(document.body, "Escape");
    fireKeyOn(document.body, "t");

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("resets pending g state on timeout", () => {
    vi.useFakeTimers();
    renderWithRouter(() => useKeyboardShortcuts());

    fireKeyOn(document.body, "g");
    vi.advanceTimersByTime(1100);
    fireKeyOn(document.body, "t");

    expect(mockNavigate).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
