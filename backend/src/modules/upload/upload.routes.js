import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';

// Use memoryStorage so images work seamlessly on serverless environments (e.g. Vercel)
// without relying on ephemeral read-only disk paths.
const storage = multer.memoryStorage();

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadRouter = Router();

uploadRouter.post('/', authenticate, authorize('admin'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('File size exceeds the 5MB limit.'));
      }
      return next(err);
    }

    if (!req.file) {
      return next(ApiError.badRequest('No image file was provided.'));
    }

    // Convert uploaded buffer into a self-contained Data URI
    const base64Data = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    res.status(201).json({
      url: dataUrl,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});