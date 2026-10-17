const express = require("express");
const router = express.Router();
const { authenticate, restrictTo } = require("../middleware/auth.middleware");
const { singleImage } = require("../middleware/upload.middleware");
const db = require("../config/db");
const { uploadImageBuffer, deleteImage, publicIdFromUrl } = require("../services/upload.service");

const rowsOf = (r) => (Array.isArray(r) ? r : r.rows);

// POST /api/uploads/image?folder=halls  (multipart field: "image")
router.post(
  "/image",
  authenticate,
  restrictTo("admin", "front_desk"),
  singleImage("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file provided" });
      const image = await uploadImageBuffer(req.file.buffer, req.query.folder);
      res.status(201).json({ message: "Image uploaded", image });
    } catch (err) {
      res.status(err.statusCode || 500).json({ message: err.message });
    }
  }
);

// POST /api/uploads/avatar  (multipart field: "image") - any logged-in user, own profile only
router.post("/avatar", authenticate, singleImage("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file provided" });
    const userId = req.user.id;

    const before = rowsOf(await db.query("SELECT profile_image FROM users WHERE user_id = $1", [userId]));
    const oldUrl = before[0] ? before[0].profile_image : null;

    const image = await uploadImageBuffer(req.file.buffer, "users", { avatar: true });
    try {
      await db.query("UPDATE users SET profile_image = $1 WHERE user_id = $2", [image.url, userId]);
    } catch (dbErr) {
      await deleteImage(image.public_id).catch(() => {}); // don't orphan the new upload
      throw dbErr;
    }

    // best-effort cleanup of the previous avatar
    const oldId = publicIdFromUrl(oldUrl);
    if (oldId) deleteImage(oldId).catch((e) => console.error("Old avatar cleanup failed:", e.message));

    res.json({ message: "Profile picture updated", profile_image: image.url });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

// DELETE /api/uploads/image  body: { public_id }
router.delete("/image", authenticate, restrictTo("admin"), async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ message: "public_id is required" });
    const deleted = await deleteImage(public_id);
    res.json({ message: deleted ? "Image deleted" : "Image not found" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

module.exports = router;