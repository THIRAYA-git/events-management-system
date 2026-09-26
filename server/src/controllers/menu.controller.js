const menuService = require("../services/menu.service");

const listMenuItemsHandler = async (req, res) => {
  try {
    const wantsAll = req.query.all === "true" && ["admin", "restaurant"].includes(req.user.role);
    const menuItems = await menuService.listMenuItems({ availableOnly: !wantsAll });
    res.status(200).json({ menuItems });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch menu items" });
  }
};

const getMenuItemHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    const menuItem = await menuService.getMenuItemById(itemId);
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });
    res.status(200).json({ menuItem });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch menu item" });
  }
};

const createMenuItemHandler = async (req, res) => {
  try {
    const menuItem = await menuService.createMenuItem(req.body, req.user);
    res.status(201).json({ message: "Menu item created", menuItem });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to create menu item" });
  }
};

const updateMenuItemHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    const menuItem = await menuService.updateMenuItem(itemId, req.body, req.user);
    res.status(200).json({ message: "Menu item updated", menuItem });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to update menu item" });
  }
};

const deleteMenuItemHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    await menuService.deleteMenuItem(itemId);
    res.status(200).json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to delete menu item" });
  }
};

const uploadMenuItemImageHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!req.file) return res.status(400).json({ message: "No image file provided" });
    const menuItem = await menuService.uploadMenuItemImage(itemId, req.file.buffer, req.user);
    res.status(200).json({ message: "Menu item image updated", menuItem });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to upload menu item image" });
  }
};

module.exports = {
  listMenuItemsHandler,
  getMenuItemHandler,
  createMenuItemHandler,
  updateMenuItemHandler,
  uploadMenuItemImageHandler,
  deleteMenuItemHandler,
};