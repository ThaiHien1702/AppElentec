// Test encryption utility
import {
  encrypt,
  decrypt,
  maskKey,
  encryptComputerKeys,
  decryptComputerKeys,
} from "./src/utils/encryption.js";

console.log("=== Testing Encryption Utility ===\n");

// Test 1: Basic encrypt/decrypt
const testKey = "XXXXX-XXXXX-XXXXX-XXXXX-12345";
console.log("1. Basic Encryption Test");
console.log("Original Key:", testKey);

const encrypted = encrypt(testKey);
console.log("Encrypted:", encrypted);

const decrypted = decrypt(encrypted);
console.log("Decrypted:", decrypted);
console.log("Match:", testKey === decrypted ? "✅ PASS" : "❌ FAIL");
console.log();

// Test 2: Mask key
console.log("2. Mask Key Test");
const masked = maskKey(testKey);
console.log("Masked Key:", masked);
console.log(
  "Should hide first part:",
  masked.includes("*") ? "✅ PASS" : "❌ FAIL",
);
console.log();

// Test 3: Encrypt computer data
console.log("3. Encrypt Computer Keys Test");
const computerData = {
  employeeNo: "EMP001",
  userName: "Test User",
  osKey: "WIN11-XXXXX-XXXXX-XXXXX-XXXXX",
  officeKey: "OFF21-XXXXX-XXXXX-XXXXX-XXXXX",
  installedSoftware: [
    {
      name: "AutoCAD",
      version: "2024",
      key: "ACAD24-XXXXX-XXXXX-XXXXX",
      license: "Commercial",
    },
    {
      name: "Symantec",
      version: "14",
      key: "SYM14-XXXXX-XXXXX-XXXXX",
      license: "Enterprise",
    },
  ],
};

console.log("Original Computer Data:");
console.log("- OS Key:", computerData.osKey);
console.log("- Office Key:", computerData.officeKey);
console.log(
  "- Software Keys:",
  computerData.installedSoftware.map((s) => s.key),
);
console.log();

const encryptedData = encryptComputerKeys(computerData);
console.log("Encrypted Computer Data:");
console.log("- OS Key:", encryptedData.osKey);
console.log("- Office Key:", encryptedData.officeKey);
console.log(
  "- Software Keys:",
  encryptedData.installedSoftware.map((s) => s.key),
);
console.log();

// Test 4: Decrypt computer data (full keys)
console.log("4. Decrypt Computer Keys Test (Full)");
const decryptedDataFull = decryptComputerKeys(encryptedData, false);
console.log("Decrypted (Full):");
console.log("- OS Key:", decryptedDataFull.osKey);
console.log("- Office Key:", decryptedDataFull.officeKey);
console.log(
  "- Software Keys:",
  decryptedDataFull.installedSoftware.map((s) => s.key),
);
console.log(
  "Match:",
  decryptedDataFull.osKey === computerData.osKey &&
    decryptedDataFull.officeKey === computerData.officeKey
    ? "✅ PASS"
    : "❌ FAIL",
);
console.log();

// Test 5: Decrypt computer data (masked keys)
console.log("5. Decrypt Computer Keys Test (Masked)");
const decryptedDataMasked = decryptComputerKeys(encryptedData, true);
console.log("Decrypted (Masked):");
console.log("- OS Key:", decryptedDataMasked.osKey);
console.log("- Office Key:", decryptedDataMasked.officeKey);
console.log(
  "- Software Keys:",
  decryptedDataMasked.installedSoftware.map((s) => s.key),
);
console.log(
  "Should be masked:",
  decryptedDataMasked.osKey.includes("*") &&
    decryptedDataMasked.officeKey.includes("*")
    ? "✅ PASS"
    : "❌ FAIL",
);
console.log();

console.log("=== All Tests Complete ===");
