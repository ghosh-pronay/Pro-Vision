import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateBangladeshiNID,
} from "../input-sanitizer";

describe("Input Sanitizer", () => {
  describe("sanitizeInput", () => {
    it("should remove angle brackets from script tags", () => {
      const result = sanitizeInput('<script>alert("xss")</script>');
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).toContain("script");
      expect(result).toContain("alert");
    });

    it("should remove angle brackets from HTML tags", () => {
      const result = sanitizeInput("<div>text</div>");
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).toContain("div");
      expect(result).toContain("text");
    });

    it("should remove javascript: protocol", () => {
      const result = sanitizeInput('javascript:alert("xss")');
      expect(result).not.toContain("javascript:");
      expect(result).toContain("alert");
    });

    it("should remove event handlers", () => {
      const result1 = sanitizeInput('onclick="alert(1)"');
      expect(result1).not.toContain("onclick=");

      const result2 = sanitizeInput("onload=alert(1)");
      expect(result2).not.toContain("onload=");
    });

    it("should escape ampersands", () => {
      expect(sanitizeInput("a & b")).toBe("a &amp; b");
    });

    it("should escape quotes", () => {
      expect(sanitizeInput('He said "hello"')).toBe(
        "He said &quot;hello&quot;",
      );
    });

    it("should trim whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("should normalize unicode", () => {
      expect(sanitizeInput("café")).toBe("café");
    });

    it("should handle clean input unchanged", () => {
      expect(sanitizeInput("Hello World")).toBe("Hello World");
    });

    it("should handle Bengali text", () => {
      expect(sanitizeInput("বাংলা টেক্সট")).toBe("বাংলা টেক্সট");
    });

    it("should handle multiple sanitization steps", () => {
      const result = sanitizeInput('  <img src="x" onerror="alert(1)">  ');
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).not.toContain("onerror=");
    });
  });

  describe("validateEmail", () => {
    it("should accept valid email addresses", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("test.email@domain.co")).toBe(true);
      expect(validateEmail("user+tag@example.com")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("@domain.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("user@.com")).toBe(false);
    });
  });

  describe("validatePhone", () => {
    it("should accept valid Bangladeshi phone numbers", () => {
      expect(validatePhone("01712345678")).toBe(true);
      expect(validatePhone("+8801712345678")).toBe(true);
      expect(validatePhone("01812345678")).toBe(true);
      expect(validatePhone("01912345678")).toBe(true);
    });

    it("should accept phone numbers with spaces and dashes", () => {
      expect(validatePhone("017-1234-5678")).toBe(true);
      expect(validatePhone("017 1234 5678")).toBe(true);
      expect(validatePhone("+880 17 1234 5678")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(validatePhone("")).toBe(false);
      expect(validatePhone("1234567890")).toBe(false);
      expect(validatePhone("0171234567")).toBe(false);
      expect(validatePhone("017123456789")).toBe(false);
      expect(validatePhone("02712345678")).toBe(false);
    });

    it("should reject non-Bangladeshi formats", () => {
      expect(validatePhone("+1234567890")).toBe(false);
      expect(validatePhone("123456789012")).toBe(false);
    });
  });

  describe("validateBangladeshiNID", () => {
    it("should accept valid NID numbers", () => {
      expect(validateBangladeshiNID("1234567890")).toBe(true);
      expect(validateBangladeshiNID("12345678901234567")).toBe(true);
    });

    it("should accept NID with spaces and dashes", () => {
      expect(validateBangladeshiNID("123 456 789 0")).toBe(true);
      expect(validateBangladeshiNID("123-456-789-0")).toBe(true);
    });

    it("should reject invalid NID numbers", () => {
      expect(validateBangladeshiNID("")).toBe(false);
      expect(validateBangladeshiNID("123456789")).toBe(false);
      expect(validateBangladeshiNID("123456789012345678")).toBe(false);
      expect(validateBangladeshiNID("abcdefghij")).toBe(false);
    });
  });
});
