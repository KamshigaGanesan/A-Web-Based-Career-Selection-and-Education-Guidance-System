import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename(_req, file, cb) {
    const unique = crypto.randomBytes(8).toString("hex");
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = /\.(jpe?g|png|webp)$/i;
  if (allowed.test(path.extname(file.originalname))) cb(null, true);
  else cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
