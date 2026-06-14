import { describe, it, expect, beforeAll } from "vitest";

// Key must be set before the module resolves it lazily on first use.
beforeAll(() => {
  process.env.ENCRYPTION_KEY = "test-encryption-key-32-bytes-min!!";
});

const importModule = () => import("../src/utils/encryption.js");

describe("encryption (AES-256-GCM)", () => {
  it("round-trips a value", async () => {
    const { encrypt, decrypt } = await importModule();
    const plain = "ABCDE-FGHIJ-KLMNO-PQRST-12345";
    const enc = encrypt(plain);
    expect(enc).not.toBe(plain);
    expect(enc.split(":")).toHaveLength(3); // iv:authTag:data
    expect(decrypt(enc)).toBe(plain);
  });

  it("returns empty string for falsy input", async () => {
    const { encrypt, decrypt } = await importModule();
    expect(encrypt("")).toBe("");
    expect(decrypt("")).toBe("");
  });

  it("detects tampering (auth tag mismatch)", async () => {
    const { encrypt, decrypt } = await importModule();
    const enc = encrypt("secret-value");
    const tampered = enc.slice(0, -2) + (enc.endsWith("00") ? "11" : "00");
    expect(() => decrypt(tampered)).toThrow();
  });

  it("throws on malformed input instead of returning it", async () => {
    const { decrypt } = await importModule();
    expect(() => decrypt("not-an-encrypted-value")).toThrow();
  });

  it("masks all but the last 5 characters", async () => {
    const { maskKey } = await importModule();
    expect(maskKey("ABCDE-12345")).toBe("******12345");
    expect(maskKey("123")).toBe("123"); // shorter than 5 -> unchanged
  });

  it("encrypts and decrypts computer keys, masking in list view", async () => {
    const { encryptComputerKeys, decryptComputerKeys } = await importModule();
    const enc = encryptComputerKeys({
      osKey: "OS-KEY-123",
      officeKey: "OFF-KEY-456",
      installedSoftware: [{ name: "X", key: "SW-1" }],
    });
    expect(enc.osKey).not.toBe("OS-KEY-123");

    const dec = decryptComputerKeys(enc, false);
    expect(dec.osKey).toBe("OS-KEY-123");
    expect(dec.officeKey).toBe("OFF-KEY-456");
    expect(dec.installedSoftware[0].key).toBe("SW-1");

    const masked = decryptComputerKeys(enc, true);
    expect(masked.osKey.endsWith("Y-123")).toBe(true);
    expect(masked.osKey.startsWith("*")).toBe(true);
  });

  it("degrades a corrupt field instead of throwing in the aggregate helper", async () => {
    const { decryptComputerKeys } = await importModule();
    const out = decryptComputerKeys({ osKey: "garbage-no-colons" }, false);
    expect(out.osKey).toBe("[decrypt error]");
  });
});
