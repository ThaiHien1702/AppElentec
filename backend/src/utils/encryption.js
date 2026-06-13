import crypto from "crypto";

// Encryption settings
// AES-256-GCM is authenticated encryption: it both encrypts and detects
// tampering (via the auth tag), unlike CBC which has no integrity check.
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // bytes

// The key is resolved lazily (on first use) instead of at module load.
// server.js calls dotenv.config() inside its body, which runs AFTER the
// ES-module imports are evaluated, so reading process.env at the top level
// here would always see `undefined`. Resolving on first encrypt/decrypt call
// guarantees the env is loaded. The derived key is cached after the first call.
let cachedKey = null;

const getKey = () => {
  if (cachedKey) return cachedKey;

  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "[Security] ENCRYPTION_KEY is not set. Add a strong ENCRYPTION_KEY to backend/.env before encrypting/decrypting data.",
    );
  }

  // Derive a fixed 32-byte key regardless of the secret's length.
  cachedKey = crypto.createHash("sha256").update(String(secret)).digest();
  return cachedKey;
};

/**
 * Encrypt text (Product Keys, License Keys)
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:authTag:encryptedData (hex)
 * @throws if encryption fails (never returns plaintext on error)
 */
export const encrypt = (text) => {
  if (!text) return "";

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(String(text), "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

/**
 * Decrypt text (Product Keys, License Keys)
 * @param {string} text - Encrypted text in format: iv:authTag:encryptedData
 * @returns {string} - Decrypted plain text
 * @throws if the value is malformed, tampered with, or the key is wrong
 *         (never returns the raw ciphertext on error)
 */
export const decrypt = (text) => {
  if (!text) return "";

  const parts = String(text).split(":");
  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted value format (expected iv:authTag:data).",
    );
  }

  const [ivHex, authTagHex, encryptedText] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

/**
 * Mask product key for display (show only last 5 characters)
 * @param {string} key - Product key
 * @returns {string} - Masked key (XXXXX-XXXXX-XXXXX-XXXXX-12345)
 */
export const maskKey = (key) => {
  if (!key || key.length < 5) return key;

  const visiblePart = key.slice(-5);
  const maskedLength = key.length - 5;
  const masked = "*".repeat(maskedLength);

  return masked + visiblePart;
};

/**
 * Encrypt product keys in computer data before saving to database
 * @param {Object} computerData - Computer data object
 * @returns {Object} - Computer data with encrypted keys
 */
export const encryptComputerKeys = (computerData) => {
  const data = { ...computerData };

  // Encrypt OS key
  if (data.osKey) {
    data.osKey = encrypt(data.osKey);
  }

  // Encrypt Office key
  if (data.officeKey) {
    data.officeKey = encrypt(data.officeKey);
  }

  // Encrypt software keys
  if (data.installedSoftware && Array.isArray(data.installedSoftware)) {
    data.installedSoftware = data.installedSoftware.map((sw) => ({
      ...sw,
      key: sw.key ? encrypt(sw.key) : "",
    }));
  }

  return data;
};

/**
 * Safely decrypt a single field. A single corrupt/tampered record must not
 * take down a whole list endpoint, so failures degrade to a clear marker
 * instead of throwing (and never leak the raw ciphertext to the client).
 */
const safeDecryptField = (value, maskKeys) => {
  try {
    const decrypted = decrypt(value);
    return maskKeys ? maskKey(decrypted) : decrypted;
  } catch (error) {
    console.error("[Security] Failed to decrypt field:", error.message);
    return "[decrypt error]";
  }
};

/**
 * Decrypt product keys in computer data after retrieving from database
 * @param {Object} computerData - Computer data object with encrypted keys
 * @param {boolean} maskKeys - Whether to mask keys (for listing views)
 * @returns {Object} - Computer data with decrypted keys
 */
export const decryptComputerKeys = (computerData, maskKeys = false) => {
  const data = { ...computerData };

  // Decrypt OS key
  if (data.osKey) {
    data.osKey = safeDecryptField(data.osKey, maskKeys);
  }

  // Decrypt Office key
  if (data.officeKey) {
    data.officeKey = safeDecryptField(data.officeKey, maskKeys);
  }

  // Decrypt software keys
  if (data.installedSoftware && Array.isArray(data.installedSoftware)) {
    data.installedSoftware = data.installedSoftware.map((sw) => {
      if (sw.key) {
        return {
          ...sw,
          key: safeDecryptField(sw.key, maskKeys),
        };
      }
      return sw;
    });
  }

  return data;
};
