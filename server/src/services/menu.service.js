const db = require("../config/db");
const { uploadImageBuffer, deleteImage, publicIdFromUrl } = require("./upload.service");

const listMenuItems = async ({ availableOnly = true } = {}) => {
  const query = availableOnly
    ? `SELECT item_id, item_name, category, description, price, unit,
              image_url, is_vegetarian, is_available, restaurant_id, created_at
       FROM menu_items
       WHERE is_available = true
       ORDER BY category, item_name`
    : `SELECT item_id, item_name, category, description, price, unit,
              image_url, is_vegetarian, is_available, restaurant_id, created_at
       FROM menu_items
       ORDER BY category, item_name`;

  const result = await db.query(query);
  return result.rows;
};


// Restaurant partners shown in the booking wizard's catering step.
// A restaurant is "available" when it has at least one available menu item.
const listRestaurants = async () => {
  const result = await db.query(
    `SELECT u.user_id AS restaurant_id,
            u.full_name AS name,
            COUNT(mi.item_id) FILTER (WHERE mi.is_available = true)::int AS available_items
     FROM users u
     LEFT JOIN menu_items mi ON mi.restaurant_id = u.user_id
     WHERE u.role::text = 'restaurant' AND u.is_active = true
     GROUP BY u.user_id, u.full_name
     ORDER BY (COUNT(mi.item_id) FILTER (WHERE mi.is_available = true)) DESC, u.full_name`
  );
  return result.rows;
};

const getMenuItemById = async (itemId) => {
  const result = await db.query(
    `SELECT item_id, item_name, category, description, price, unit,
            image_url, is_vegetarian, is_available, restaurant_id, created_at
     FROM menu_items
     WHERE item_id = $1`,
    [itemId]
  );
  return result.rows[0] || null;
};

// Restaurant-role users always create against their own restaurant_id (req.user.id).
// Admins may create on behalf of a partner by passing restaurant_id explicitly.
const createMenuItem = async (data, requestingUser) => {
  const restaurantId =
    requestingUser.role === "admin" && data.restaurant_id
      ? data.restaurant_id
      : requestingUser.id;

  const {
    item_name,
    category,
    description = null,
    price,
    unit = null,
    image_url = null,
    is_vegetarian = false,
    is_available = true,
  } = data;

  const result = await db.query(
    `INSERT INTO menu_items
       (item_name, category, description, price, unit, image_url,
        is_vegetarian, is_available, restaurant_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING item_id, item_name, category, description, price, unit,
               image_url, is_vegetarian, is_available, restaurant_id, created_at`,
    [item_name, category, description, price, unit, image_url, is_vegetarian, is_available, restaurantId]
  );

  return result.rows[0];
};

const assertOwnsMenuItem = async (itemId, requestingUser) => {
  const item = await getMenuItemById(itemId);
  if (!item) {
    const err = new Error("Menu item not found");
    err.statusCode = 404;
    throw err;
  }
  if (requestingUser.role !== "admin" && item.restaurant_id !== requestingUser.id) {
    const err = new Error("You do not have permission to modify this menu item");
    err.statusCode = 403;
    throw err;
  }
  return item;
};

const updateMenuItem = async (itemId, data, requestingUser) => {
  await assertOwnsMenuItem(itemId, requestingUser);

  const fields = ["item_name", "category", "description", "price", "unit", "image_url", "is_vegetarian", "is_available"];
  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const field of fields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = $${idx}`);
      values.push(data[field]);
      idx += 1;
    }
  }

  if (setClauses.length === 0) {
    const err = new Error("No fields provided to update");
    err.statusCode = 400;
    throw err;
  }

  values.push(itemId);

  const result = await db.query(
    `UPDATE menu_items
     SET ${setClauses.join(", ")}
     WHERE item_id = $${idx}
     RETURNING item_id, item_name, category, description, price, unit,
               image_url, is_vegetarian, is_available, restaurant_id, created_at`,
    values
  );

  return result.rows[0];
};

// Delete is admin-only per RBAC (menu:delete -> ["admin"]), enforced at the
// route level, so no ownership check is needed here.
const deleteMenuItem = async (itemId) => {
  const result = await db.query(
    `DELETE FROM menu_items WHERE item_id = $1 RETURNING item_id`,
    [itemId]
  );

  if (result.rows.length === 0) {
    const err = new Error("Menu item not found");
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

// ... listMenuItems, getMenuItemById, createMenuItem, assertOwnsMenuItem, updateMenuItem unchanged ...

const uploadMenuItemImage = async (itemId, fileBuffer, requestingUser) => {
  const item = await assertOwnsMenuItem(itemId, requestingUser);
  const oldUrl = item.image_url;

  const image = await uploadImageBuffer(fileBuffer, "menu");

  let updated;
  try {
    const result = await db.query(
      `UPDATE menu_items
       SET image_url = $1
       WHERE item_id = $2
       RETURNING item_id, item_name, category, description, price, unit,
                 image_url, is_vegetarian, is_available, restaurant_id, created_at`,
      [image.url, itemId]
    );
    updated = result.rows[0];
  } catch (dbErr) {
    await deleteImage(image.public_id).catch(() => {}); // don't orphan the new upload
    throw dbErr;
  }

  const oldId = publicIdFromUrl(oldUrl);
  if (oldId) {
    deleteImage(oldId).catch((e) =>
      console.error("Old menu item image cleanup failed:", e.message)
    );
  }

  return updated;
};

module.exports = {
  listRestaurants,
  listMenuItems,
  getMenuItemById,
  createMenuItem,
  assertOwnsMenuItem,
  updateMenuItem,
  uploadMenuItemImage,
  deleteMenuItem,
};