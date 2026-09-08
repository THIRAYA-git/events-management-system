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

module.exports = {
  listMenuItemsHandler,
  getMenuItemHandler,
  createMenuItemHandler,
  updateMenuItemHandler,
  deleteMenuItemHandler,
};