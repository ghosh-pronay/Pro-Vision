import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/data-store";

describe("localDB.finance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("receivables", () => {
    it("creates and lists receivables", () => {
      const item = localDB.receivables.create({
        from: "John",
        amount: 5000,
        date: Date.now(),
        status: "pending",
      });
      expect(item._id).toBeDefined();
      expect(item.from).toBe("John");

      const list = localDB.receivables.list();
      expect(list.length).toBe(1);
      expect(list[0].from).toBe("John");
    });

    it("removes receivables", () => {
      const item = localDB.receivables.create({
        from: "Jane",
        amount: 1000,
        date: Date.now(),
      });
      localDB.receivables.remove(item._id);
      expect(localDB.receivables.list().length).toBe(0);
    });
  });

  describe("payables", () => {
    it("creates and lists payables", () => {
      const item = localDB.payables.create({
        to: "Vendor",
        amount: 3000,
        date: Date.now(),
        status: "pending",
      });
      expect(item._id).toBeDefined();

      const list = localDB.payables.list();
      expect(list.length).toBe(1);
    });

    it("updates payables", () => {
      const item = localDB.payables.create({
        to: "Vendor",
        amount: 3000,
        date: Date.now(),
      });
      localDB.payables.update(item._id, { status: "paid" });
      const list = localDB.payables.list();
      expect(list[0].status).toBe("paid");
    });
  });

  describe("loans", () => {
    it("creates and lists loans", () => {
      const item = localDB.loans.create({
        name: "Personal Loan",
        amount: 50000,
        paidAmount: 0,
        date: Date.now(),
        status: "active",
      });
      expect(item._id).toBeDefined();

      const list = localDB.loans.list();
      expect(list.length).toBe(1);
      expect(list[0].name).toBe("Personal Loan");
    });
  });

  describe("investments", () => {
    it("creates and lists investments", () => {
      const item = localDB.investments.create({
        name: "Stock Fund",
        amount: 10000,
        date: Date.now(),
        type: "stock",
      });
      expect(item._id).toBeDefined();

      const list = localDB.investments.list();
      expect(list.length).toBe(1);
    });
  });

  describe("savingsGoals", () => {
    it("creates and lists savings goals", () => {
      const item = localDB.savingsGoals.create({
        name: "Emergency Fund",
        targetAmount: 100000,
        currentAmount: 25000,
        date: Date.now(),
      });
      expect(item._id).toBeDefined();

      const list = localDB.savingsGoals.list();
      expect(list.length).toBe(1);
    });
  });

  describe("recurringTransactions", () => {
    it("creates and lists recurring transactions", () => {
      const item = localDB.recurringTransactions.create({
        description: "Netflix",
        amount: 500,
        frequency: "monthly",
        date: Date.now(),
      });
      expect(item._id).toBeDefined();

      const list = localDB.recurringTransactions.list();
      expect(list.length).toBe(1);
    });
  });
});
