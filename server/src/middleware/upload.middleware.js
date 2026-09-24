const multer = require("multer");

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      const err = new Error("Only JPG, PNG or WEBP images are allowed");
      err.statusCode = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

// Wraps multer so its errors return the same {message} shape as the controllers
const singleImage = (field = "image") => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (!err) return next();
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : err.message;
    res.status(err.statusCode || 400).json({ message });
  });
};

module.exports = { singleImage };