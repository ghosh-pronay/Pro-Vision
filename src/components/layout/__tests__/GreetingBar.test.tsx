import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import GreetingBar from "../GreetingBar";

vi.stubGlobal(
  "matchMedia",
  vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);

describe("GreetingBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders morning greeting for 8 AM", () => {
    vi.setSystemTime(new Date(2024, 0, 1, 8, 0, 0));
    renderWithProviders(<GreetingBar />);
    expect(screen.getByText("Good Morning")).toBeInTheDocument();
  });

  it("renders afternoon greeting for 14:00", () => {
    vi.setSystemTime(new Date(2024, 0, 1, 14, 0, 0));
    renderWithProviders(<GreetingBar />);
    expect(screen.getByText("Good Afternoon")).toBeInTheDocument();
  });

  it("renders evening greeting for 18:00", () => {
    vi.setSystemTime(new Date(2024, 0, 1, 18, 0, 0));
    renderWithProviders(<GreetingBar />);
    expect(screen.getByText("Good Evening")).toBeInTheDocument();
  });

  it("renders night greeting for 22:00", () => {
    vi.setSystemTime(new Date(2024, 0, 1, 22, 0, 0));
    renderWithProviders(<GreetingBar />);
    expect(screen.getByText("Good Night")).toBeInTheDocument();
  });

  it("renders early morning greeting for 5:00", () => {
    vi.setSystemTime(new Date(2024, 0, 1, 5, 0, 0));
    renderWithProviders(<GreetingBar />);
    expect(screen.getByText("Early Morning")).toBeInTheDocument();
  });
});
