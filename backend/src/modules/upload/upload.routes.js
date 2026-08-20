import fs from 'fs';
import os from 'os';
import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';

// Determine safe upload directory (serverless environments like Vercel have read-only filesystems except /tmp)
function getUploadDir() {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), 'uploads');
    try {
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    } catch {}
    return tmpDir;
  }

  const localDir = path.resolve(process.cwd(), 'uploads');
  try {
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    return localDir;
  } catch {
    const fallbackDir = path.join(os.tmpdir(), 'uploads');
    try {
      if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    } catch {}
    return fallbackDir;
  }
}

const uploadDir = getUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const targetDir = getUploadDir();
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeName = 'space-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, safeName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'INVALID_FILE_TYPE', 'Only JPG, PNG, WEBP, and GIF images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadRouter = Router();

uploadRouter.post('/', authenticate, authorize('admin'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('File size exceeds the 10MB limit.'));
      }
      return next(err);
    }

    if (!req.file) {
      return next(ApiError.badRequest('No image file was provided.'));
    }

    const relativeUrl = '/uploads/' + req.file.filename;
    res.status(201).json({
      url: relativeUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});