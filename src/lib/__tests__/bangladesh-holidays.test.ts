import { describe, it, expect, vi, afterEach } from "vitest";
import {
  BANGLADESH_HOLIDAYS,
  getHolidaysForMonth,
  getUpcomingHolidays,
  isHoliday,
  getHolidayGreeting,
  type Holiday,
} from "../bangladesh-holidays";

describe("Bangladesh Holidays", () => {
  describe("BANGLADESH_HOLIDAYS", () => {
    it("should have holidays defined", () => {
      expect(BANGLADESH_HOLIDAYS).toBeDefined();
      expect(Array.isArray(BANGLADESH_HOLIDAYS)).toBe(true);
      expect(BANGLADESH_HOLIDAYS.length).toBeGreaterThan(0);
    });

    it("each holiday should have required fields", () => {
      BANGLADESH_HOLIDAYS.forEach((holiday) => {
        expect(holiday.name).toBeDefined();
        expect(holiday.nameEn).toBeDefined();
        expect(holiday.date).toBeDefined();
        expect(holiday.type).toBeDefined();
        expect(["public", "national", "observance"]).toContain(holiday.type);
      });
    });
  });

  describe("getHolidaysForMonth", () => {
    it("should return holidays for February (Language Martyrs' Day)", () => {
      const holidays = getHolidaysForMonth(2);
      expect(holidays.length).toBeGreaterThanOrEqual(1);
      expect(holidays.some((h) => h.nameEn === "Language Martyrs' Day")).toBe(
        true,
      );
    });

    it("should return holidays for December (Victory Day)", () => {
      const holidays = getHolidaysForMonth(12);
      expect(holidays.length).toBeGreaterThanOrEqual(1);
      expect(holidays.some((h) => h.nameEn === "Victory Day")).toBe(true);
    });

    it("should return empty array for month with no holidays", () => {
      const holidays = getHolidaysForMonth(1);
      expect(holidays).toEqual([]);
    });

    it("should return multiple holidays for months with multiple", () => {
      const holidays = getHolidaysForMonth(3);
      expect(holidays.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("getUpcomingHolidays", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return holidays from today onwards", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-01"));

      const holidays = getUpcomingHolidays();
      expect(holidays.length).toBeGreaterThan(0);

      holidays.forEach((holiday) => {
        expect(holiday.date >= "2025-01-01").toBe(true);
      });
    });

    it("should return holidays sorted by date", () => {
      const holidays = getUpcomingHolidays();
      for (let i = 1; i < holidays.length; i++) {
        expect(holidays[i].date >= holidays[i - 1].date).toBe(true);
      }
    });

    it("should not include past holidays", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-06-01"));

      const holidays = getUpcomingHolidays();
      holidays.forEach((holiday) => {
        expect(holiday.date >= "2026-06-01").toBe(true);
      });
    });
  });

  describe("isHoliday", () => {
    it("should return holiday for known holiday date", () => {
      const date = new Date("2025-02-21");
      const holiday = isHoliday(date);
      expect(holiday).not.toBeNull();
      expect(holiday?.nameEn).toBe("Language Martyrs' Day");
    });

    it("should return null for non-holiday date", () => {
      const date = new Date("2025-01-15");
      const holiday = isHoliday(date);
      expect(holiday).toBeNull();
    });

    it("should return correct holiday for Victory Day", () => {
      const date = new Date("2025-12-16");
      const holiday = isHoliday(date);
      expect(holiday?.nameEn).toBe("Victory Day");
    });
  });

  describe("getHolidayGreeting", () => {
    it("should return Eid Mubarak for Eid ul-Fitr", () => {
      const holiday: Holiday = {
        name: "ঈদ উল-ফিতর",
        nameEn: "Eid ul-Fitr",
        date: "2025-03-31",
        type: "public",
      };
      const greeting = getHolidayGreeting(holiday);
      expect(greeting.bn).toBe("ঈদ মোবারক!");
      expect(greeting.en).toBe("Eid Mubarak!");
    });

    it("should return Happy New Year for Pohela Boishakh", () => {
      const holiday: Holiday = {
        name: "বাংলা নববর্ষ",
        nameEn: "Pohela Boishakh",
        date: "2025-04-14",
        type: "public",
      };
      const greeting = getHolidayGreeting(holiday);
      expect(greeting.bn).toBe("শুভ নববর্ষ!");
      expect(greeting.en).toBe("Happy New Year!");
    });

    it("should return default greeting for unknown holidays", () => {
      const holiday: Holiday = {
        name: "বিশেষ দিবস",
        nameEn: "Special Day",
        date: "2025-06-01",
        type: "observance",
      };
      const greeting = getHolidayGreeting(holiday);
      expect(greeting.bn).toContain("শুভেচ্ছা!");
      expect(greeting.en).toContain("Happy");
    });
  });
});
