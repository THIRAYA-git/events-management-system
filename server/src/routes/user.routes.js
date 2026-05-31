// ─────────────────────────────────────────────────────────────
//  server/src/routes/user.routes.js
//  NEW FILE — admin user management
// ─────────────────────────────────────────────────────────────
const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { listUsers, getUser, changeRole, removeUser } = require("../controllers/user.controller");

// All routes require a valid token
router.use(authenticate);

router.get("/",           authorize("user:read"),   listUsers);
router.get("/:id",        authorize("user:read"),   getUser);
router.patch("/:id/role", authorize("user:manage"), changeRole);
router.delete("/:id",     authorize("user:manage"), removeUser);

module.exports = router;
