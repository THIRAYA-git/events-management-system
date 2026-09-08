const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  listMenuItemsHandler,
  getMenuItemHandler,
  createMenuItemHandler,
  updateMenuItemHandler,
  deleteMenuItemHandler,
} = require("../controllers/menu.controller");

router.use(authenticate);

// GET /api/menu-items                    -> browse menu (available items only, unless ?all=true for owner/admin)
router.get("/", authorize("menu:read"), listMenuItemsHandler);

// GET /api/menu-items/:itemId             -> single menu item
router.get("/:itemId", authorize("menu:read"), getMenuItemHandler);

// POST /api/menu-items                    -> restaurant partner (or admin) adds a menu item
router.post("/", authorize("menu:create"), createMenuItemHandler);

// PATCH /api/menu-items/:itemId           -> restaurant partner (own items) or admin updates a menu item
router.patch("/:itemId", authorize("menu:update"), updateMenuItemHandler);

// DELETE /api/menu-items/:itemId          -> admin-only removal
router.delete("/:itemId", authorize("menu:delete"), deleteMenuItemHandler);

module.exports = router;