import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../crypto";

describe("Crypto Utility", () => {
  const password = "test-password-123";

  it("should encrypt and decrypt text successfully", async () => {
    const plaintext = "Hello, World! This is a secret message.";

    const encrypted = await encrypt(plaintext, password);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted).toContain(":");
    expect(encrypted.split(":").length).toBe(4);

    const decrypted = await decrypt(encrypted, password);
    expect(decrypted).toBe(plaintext);
  });

  it("should produce different ciphertext for same plaintext", async () => {
    const plaintext = "Same message encrypted twice";

    const encrypted1 = await encrypt(plaintext, password);
    const encrypted2 = await encrypt(plaintext, password);

    expect(encrypted1).not.toBe(encrypted2);
  });

  it("should fail to decrypt with wrong password", async () => {
    const plaintext = "Secret data";
    const encrypted = await encrypt(plaintext, password);

    await expect(decrypt(encrypted, "wrong-password")).rejects.toThrow();
  });

  it("should handle empty string", async () => {
    const encrypted = await encrypt("", password);
    const decrypted = await decrypt(encrypted, password);
    expect(decrypted).toBe("");
  });

  it("should handle unicode characters", async () => {
    const plaintext = "বাংলা টেক্সট 🎉";

    const encrypted = await encrypt(plaintext, password);
    const decrypted = await decrypt(encrypted, password);
    expect(decrypted).toBe(plaintext);
  });

  it("should handle long text", async () => {
    const plaintext = "A".repeat(10000);

    const encrypted = await encrypt(plaintext, password);
    const decrypted = await decrypt(encrypted, password);
    expect(decrypted).toBe(plaintext);
  });
});
