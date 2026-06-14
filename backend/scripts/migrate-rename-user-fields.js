/**
 * Migration: rename misspelled User fields
 *   idCompanny -> idCompany
 *   avatrUrl   -> avatarUrl
 *
 * Order matters: the old unique index `idCompanny_1` MUST be dropped BEFORE
 * renaming the field away, otherwise the documents that lose `idCompanny`
 * collapse to a null value and violate the (non-sparse) unique index.
 *
 * Safe to run multiple times (idempotent): $rename only touches docs that
 * still have the old field, and index operations are guarded.
 *
 * Usage:  node scripts/migrate-rename-user-fields.js
 */
import "dotenv/config";
import mongoose from "mongoose";

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("[Migration] Missing MONGO_URI in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const col = mongoose.connection.collection("users");

  const docsBefore = await col.countDocuments();
  const idxBefore = await col.indexes();
  console.log(`[Migration] Users: ${docsBefore}`);
  console.log(
    "[Migration] Indexes before:",
    idxBefore.map((i) => i.name).join(", "),
  );

  // 1) Drop the old unique index on idCompanny (if it still exists).
  const hasOldIndex = idxBefore.some((i) => i.name === "idCompanny_1");
  if (hasOldIndex) {
    await col.dropIndex("idCompanny_1");
    console.log("[Migration] Dropped old index idCompanny_1");
  } else {
    console.log("[Migration] Old index idCompanny_1 not present (skip)");
  }

  // 2) Rename the fields on every document that still has them.
  const r1 = await col.updateMany(
    { idCompanny: { $exists: true } },
    { $rename: { idCompanny: "idCompany" } },
  );
  const r2 = await col.updateMany(
    { avatrUrl: { $exists: true } },
    { $rename: { avatrUrl: "avatarUrl" } },
  );
  console.log(
    `[Migration] Renamed idCompanny on ${r1.modifiedCount} doc(s), avatrUrl on ${r2.modifiedCount} doc(s)`,
  );

  // 3) Recreate the unique index under the new field name.
  await col.createIndex({ idCompany: 1 }, { unique: true, name: "idCompany_1" });
  console.log("[Migration] Ensured unique index idCompany_1");

  const idxAfter = await col.indexes();
  console.log(
    "[Migration] Indexes after:",
    idxAfter.map((i) => i.name).join(", "),
  );

  // Sanity check: no doc should still carry the old field names.
  const leftover = await col.countDocuments({
    $or: [{ idCompanny: { $exists: true } }, { avatrUrl: { $exists: true } }],
  });
  console.log(`[Migration] Docs still holding old fields: ${leftover}`);

  await mongoose.disconnect();
  console.log("[Migration] Done.");
};

run().catch(async (err) => {
  console.error("[Migration] Failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
