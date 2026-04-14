import crypto from "crypto";

// Encryption settings
const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your-32-character-secret-key!!"; // Must be 32 characters
const IV_LENGTH = 16; // For AES, this is always 16

if (!process.env.ENCRYPTION_KEY) {
  console.warn(
    "[Security] WARNING: ENCRYPTION_KEY not set in environment. Using default fallback key. Set ENCRYPTION_KEY in backend/.env for production!",
  );
}

/**
 * Encrypt text (Product Keys, License Keys)
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData
 */
export const encrypt = (text) => {
  if (!text) return "";

  try {
    // Create initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Ensure encryption key is 32 bytes
    const key = crypto
      .createHash("sha256")
      .update(String(ENCRYPTION_KEY))
      .digest();

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Return iv + encrypted data (separated by :)
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Return original if encryption fails
  }
};

/**
 * Decrypt text (Product Keys, License Keys)
 * @param {string} text - Encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted plain text
 */
export const decrypt = (text) => {
  if (!text) return "";

  try {
    // Split iv and encrypted data
    const parts = text.split(":");
    if (parts.length !== 2) {
      // Not encrypted format, return as is
      return text;
    }

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];

    // Ensure encryption key is 32 bytes
    const key = crypto
      .createHash("sha256")
      .update(String(ENCRYPTION_KEY))
      .digest();

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // Decrypt
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return text; // Return original if decryption fails
  }
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
 * Decrypt product keys in computer data after retrieving from database
 * @param {Object} computerData - Computer data object with encrypted keys
 * @param {boolean} maskKeys - Whether to mask keys (for listing views)
 * @returns {Object} - Computer data with decrypted keys
 */
export const decryptComputerKeys = (computerData, maskKeys = false) => {
  const data = { ...computerData };

  // Decrypt OS key
  if (data.osKey) {
    const decrypted = decrypt(data.osKey);
    data.osKey = maskKeys ? maskKey(decrypted) : decrypted;
  }

  // Decrypt Office key
  if (data.officeKey) {
    const decrypted = decrypt(data.officeKey);
    data.officeKey = maskKeys ? maskKey(decrypted) : decrypted;
  }

  // Decrypt software keys
  if (data.installedSoftware && Array.isArray(data.installedSoftware)) {
    data.installedSoftware = data.installedSoftware.map((sw) => {
      if (sw.key) {
        const decrypted = decrypt(sw.key);
        return {
          ...sw,
          key: maskKeys ? maskKey(decrypted) : decrypted,
        };
      }
      return sw;
    });
  }

  return data;
};
