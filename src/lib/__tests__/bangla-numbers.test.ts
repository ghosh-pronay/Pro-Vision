import { describe, it, expect } from "vitest";
import {
  toBanglaNumber,
  formatBanglaCurrency,
  formatBanglaDate,
  parseBanglaNumber,
} from "../bangla-numbers";

describe("Bangla Numbers", () => {
  describe("toBanglaNumber", () => {
    it("should convert single digits", () => {
      expect(toBanglaNumber(0)).toBe("০");
      expect(toBanglaNumber(5)).toBe("৫");
      expect(toBanglaNumber(9)).toBe("৯");
    });

    it("should convert multi-digit numbers", () => {
      expect(toBanglaNumber(123)).toBe("১২৩");
      expect(toBanglaNumber(4567)).toBe("৪৫৬৭");
      expect(toBanglaNumber(10000)).toBe("১০০০০");
    });

    it("should handle large numbers", () => {
      expect(toBanglaNumber(1000000)).toBe("১০০০০০০");
    });

    it("should handle negative numbers", () => {
      expect(toBanglaNumber(-5)).toBe("-৫");
      expect(toBanglaNumber(-123)).toBe("-১২৩");
    });

    it("should handle decimal numbers", () => {
      expect(toBanglaNumber(3.14)).toBe("৩.১৪");
    });
  });

  describe("formatBanglaCurrency", () => {
    it("should format zero amount", () => {
      expect(formatBanglaCurrency(0)).toBe("০.০০ টাকা");
    });

    it("should format whole number amounts", () => {
      expect(formatBanglaCurrency(100)).toBe("১০০.০০ টাকা");
    });

    it("should format decimal amounts", () => {
      expect(formatBanglaCurrency(99.99)).toBe("৯৯.৯৯ টাকা");
    });

    it("should handle negative amounts", () => {
      expect(formatBanglaCurrency(-500)).toBe("-৫০০.০০ টাকা");
    });
  });

  describe("formatBanglaDate", () => {
    it("should format dates with Bangla month names", () => {
      const date = new Date(2024, 0, 1); // January 1, 2024
      expect(formatBanglaDate(date)).toBe("১ জানুয়ারি, ২০২৪");
    });

    it("should format dates in different months", () => {
      const date = new Date(2024, 11, 25); // December 25, 2024
      expect(formatBanglaDate(date)).toBe("২৫ ডিসেম্বর, ২০২৪");
    });

    it("should format mid-month dates", () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      expect(formatBanglaDate(date)).toBe("১৫ মার্চ, ২০২৪");
    });
  });

  describe("parseBanglaNumber", () => {
    it("should parse Bangla digits to number", () => {
      expect(parseBanglaNumber("১২৩")).toBe(123);
      expect(parseBanglaNumber("৪৫৬৭")).toBe(4567);
    });

    it("should parse zero", () => {
      expect(parseBanglaNumber("০")).toBe(0);
    });

    it("should handle mixed Bangla and English characters", () => {
      expect(parseBanglaNumber("১২৩")).toBe(123);
    });

    it("should handle empty string", () => {
      expect(parseBanglaNumber("")).toBe(0);
    });
  });
});
