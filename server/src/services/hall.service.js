const db = require("../config/db");

const getHallById = async (hallId) => {
  const result = await db.query(
    `SELECT hall_id, hall_name, floor_number, capacity, description, base_price,
            is_active, image_url, amenities, created_at, updated_at
     FROM halls
     WHERE hall_id = $1`,
    [hallId]
  );
  return result.rows[0] || null;
};

const updateHallImage = async (hallId, imageUrl) => {
  const result = await db.query(
    `UPDATE halls
     SET image_url = $1, updated_at = NOW()
     WHERE hall_id = $2
     RETURNING hall_id, hall_name, floor_number, capacity, description, base_price,
               is_active, image_url, amenities, created_at, updated_at`,
    [imageUrl, hallId]
  );
  return result.rows[0] || null;
};

module.exports = { getHallById, updateHallImage };

const getAllActiveHalls = async () => {
  const result = await db.query(
    `SELECT hall_id, hall_name, floor_number, capacity, description,
            base_price, image_url, amenities
     FROM halls
     WHERE is_active = true
     ORDER BY hall_id ASC`
  );
  return result.rows;
};

module.exports = { getHallById, updateHallImage, getAllActiveHalls };