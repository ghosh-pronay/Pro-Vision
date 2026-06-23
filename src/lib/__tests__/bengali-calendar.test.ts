import { describe, it, expect } from "vitest";
import {
  gregorianToBengali,
  BENGALI_MONTHS,
  BENGALI_DAYS,
} from "../bengali-calendar";

describe("Bengali Calendar", () => {
  describe("gregorianToBengali", () => {
    it("converts April 14, 2024 to first day of Baishakh", () => {
      const result = gregorianToBengali(new Date(2024, 3, 14));
      expect(result.month).toBe(0);
      expect(result.day).toBe(1);
    });

    it("converts April 14, 2023 correctly", () => {
      const result = gregorianToBengali(new Date(2023, 3, 14));
      expect(result.month).toBe(0);
      expect(result.day).toBe(1);
    });

    it("converts a date in late May 2024", () => {
      const result = gregorianToBengali(new Date(2024, 4, 15));
      expect(result.month).toBe(1);
      expect(result.day).toBeGreaterThan(0);
    });

    it("converts a date in June 2024 (still Jyoishtho)", () => {
      const result = gregorianToBengali(new Date(2024, 5, 10));
      expect(result.month).toBe(1);
      expect(result.day).toBeGreaterThan(0);
    });

    it("converts a date in December 2024", () => {
      const result = gregorianToBengali(new Date(2024, 11, 25));
      expect(result.month).toBeGreaterThanOrEqual(8);
      expect(result.day).toBeGreaterThan(0);
    });

    it("converts a date in March 2024 (before Bengali new year)", () => {
      const result = gregorianToBengali(new Date(2024, 2, 1));
      expect(result.year).toBe(1430);
      expect(result.month).toBe(0);
      expect(result.day).toBeGreaterThanOrEqual(1);
    });

    it("returns valid bengali year for recent dates", () => {
      const result = gregorianToBengali(new Date(2024, 5, 1));
      expect(result.year).toBeGreaterThanOrEqual(1430);
      expect(result.year).toBeLessThanOrEqual(1432);
    });

    it("ensures day is at least 1 for edge cases", () => {
      const result = gregorianToBengali(new Date(2024, 3, 14));
      expect(result.day).toBeGreaterThanOrEqual(1);
    });
  });

  describe("BENGALI_MONTHS", () => {
    it("has 12 months", () => {
      expect(BENGALI_MONTHS).toHaveLength(12);
    });

    it("each month has both bn and en names", () => {
      for (const month of BENGALI_MONTHS) {
        expect(month.bn).toBeTruthy();
        expect(month.en).toBeTruthy();
      }
    });

    it("each month has a valid day count", () => {
      for (const month of BENGALI_MONTHS) {
        expect(month.days).toBeGreaterThanOrEqual(29);
        expect(month.days).toBeLessThanOrEqual(31);
      }
    });

    it("first month is Baishakh", () => {
      expect(BENGALI_MONTHS[0].en).toBe("Baishakh");
    });

    it("last month is Choitro", () => {
      expect(BENGALI_MONTHS[11].en).toBe("Choitro");
    });
  });

  describe("BENGALI_DAYS", () => {
    it("has 7 days", () => {
      expect(BENGALI_DAYS).toHaveLength(7);
    });

    it("each day has bn and en names", () => {
      for (const day of BENGALI_DAYS) {
        expect(day.bn).toBeTruthy();
        expect(day.en).toBeTruthy();
      }
    });

    it("first day is Sunday", () => {
      expect(BENGALI_DAYS[0].en).toBe("Sun");
    });
  });
});
