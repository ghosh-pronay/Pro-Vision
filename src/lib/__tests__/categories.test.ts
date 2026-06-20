import { describe, it, expect } from "vitest";
import {
  EXPENSE_CATEGORIES,
  BUDGET_CATEGORIES,
  CURRENCY_SYMBOL,
  CURRENCY_CODE,
} from "../categories";

describe("Categories", () => {
  it("should have income categories", () => {
    expect(EXPENSE_CATEGORIES.income).toBeDefined();
    expect(EXPENSE_CATEGORIES.income.length).toBeGreaterThan(0);
  });

  it("should have expense categories", () => {
    expect(EXPENSE_CATEGORIES.expense).toBeDefined();
    expect(EXPENSE_CATEGORIES.expense.length).toBeGreaterThan(0);
  });

  it("each income category should have required fields", () => {
    EXPENSE_CATEGORIES.income.forEach((cat) => {
      expect(cat.name).toBeDefined();
      expect(cat.icon).toBeDefined();
      expect(cat.color).toBeDefined();
      expect(cat.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it("each expense category should have required fields", () => {
    EXPENSE_CATEGORIES.expense.forEach((cat) => {
      expect(cat.name).toBeDefined();
      expect(cat.icon).toBeDefined();
      expect(cat.color).toBeDefined();
      expect(cat.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it("should have budget categories", () => {
    expect(BUDGET_CATEGORIES).toBeDefined();
    expect(BUDGET_CATEGORIES.length).toBeGreaterThan(0);
  });

  it("budget percentages should sum to 100", () => {
    const total = BUDGET_CATEGORIES.reduce(
      (sum, cat) => sum + cat.percentage,
      0,
    );
    expect(total).toBe(100);
  });

  it("should have BDT currency", () => {
    expect(CURRENCY_SYMBOL).toBe("৳");
    expect(CURRENCY_CODE).toBe("BDT");
  });
});
