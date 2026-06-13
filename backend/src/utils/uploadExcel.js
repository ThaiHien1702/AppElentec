import multer from "multer";
import path from "path";

// Shared multer config for Excel imports (computers, leave, overtime, ...).
// Limits file size and restricts to Excel files so an attacker can't exhaust
// server memory with a huge or arbitrary upload.
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];

const excelFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file Excel (.xlsx, .xls)"));
  }
};

export const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: excelFileFilter,
});

export default uploadExcel;
