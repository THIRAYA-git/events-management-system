// ─────────────────────────────────────────────────────────────────────────────
//  src/controllers/customer.controller.js
//  Rewritten for raw Neon SQL — uses { query } from config/db.js
//  Your DB uses the 'users' table for customers (role = 'customer')
// ─────────────────────────────────────────────────────────────────────────────
const { query } = require('../config/db');

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/customers
//  List all users with role='customer', paginated + searchable
// ─────────────────────────────────────────────────────────────────────────────
const listCustomers = async (req, res, next) => {
  try {
    const {
      page      = 1,
      limit     = 20,
      search,
      isActive,
      sortBy    = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    const offset = (page - 1) * limit;

    // Whitelist sortBy to prevent SQL injection
    const allowedSort = ['full_name', 'email', 'created_at'];
    const safeSortBy  = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder   = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Build dynamic WHERE
    const conditions = [`role = 'customer'`];
    const params     = [];

    if (search) {
      params.push(`%${search}%`);
      const p = params.length;
      conditions.push(`(full_name ILIKE $${p} OR email ILIKE $${p} OR phone ILIKE $${p})`);
    }

    if (isActive !== undefined) {
      params.push(isActive === 'true' || isActive === true);
      conditions.push(`is_active = $${params.length}`);
    }

    const where = conditions.join(' AND ');

    // Count + data in parallel
    const countParams = [...params];
    const dataParams  = [...params, limit, offset];

    const [countResult, dataResult] = await Promise.all([
      query(`SELECT COUNT(*) FROM users WHERE ${where}`, countParams),
      query(
        `SELECT user_id, full_name, email, phone, role, is_active, created_at, updated_at
           FROM users
          WHERE ${where}
          ORDER BY ${safeSortBy} ${safeOrder}
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        dataParams
      ),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return res.status(200).json({
      success: true,
      data:    dataResult.rows,
      pagination: {
        total,
        page:        Number(page),
        limit:       Number(limit),
        totalPages:  Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/customers/:id
//  Get one customer + their last 5 bookings
// ─────────────────────────────────────────────────────────────────────────────
const getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customerResult = await query(
      `SELECT user_id, full_name, email, phone, role, is_active, created_at, updated_at
         FROM users
        WHERE user_id = $1 AND role = 'customer'`,
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${id} not found.`,
      });
    }

    const customer = customerResult.rows[0];

    // Last 5 bookings preview
    const bookingsResult = await query(
      `SELECT booking_id, booking_ref, event_date, event_start_time,
              event_end_time, event_type, guest_count, status,
              total_amount, created_at
         FROM bookings
        WHERE user_id = $1
        ORDER BY event_date DESC
        LIMIT 5`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...customer,
        recentBookings: bookingsResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/customers/:id
//  Update customer profile (full_name, email, phone)
// ─────────────────────────────────────────────────────────────────────────────
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Confirm customer exists
    const existing = await query(
      `SELECT user_id, is_active FROM users WHERE user_id = $1 AND role = 'customer'`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${id} not found.`,
      });
    }

    if (!existing.rows[0].is_active) {
      return res.status(409).json({
        success: false,
        message: 'Cannot update a deactivated customer account.',
      });
    }

    // Whitelist updatable fields
    const { full_name, email, phone } = req.body;

    const fields = [];
    const params = [];

    if (full_name !== undefined) {
      params.push(full_name);
      fields.push(`full_name = $${params.length}`);
    }
    if (email !== undefined) {
      // Check email uniqueness
      const emailCheck = await query(
        `SELECT user_id FROM users WHERE email = $1 AND user_id <> $2`,
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email address is already in use by another account.',
        });
      }
      params.push(email);
      fields.push(`email = $${params.length}`);
    }
    if (phone !== undefined) {
      params.push(phone);
      fields.push(`phone = $${params.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    params.push(id);
    const updated = await query(
      `UPDATE users
          SET ${fields.join(', ')}, updated_at = NOW()
        WHERE user_id = $${params.length}
        RETURNING user_id, full_name, email, phone, role, is_active, updated_at`,
      params
    );

    return res.status(200).json({
      success: true,
      message: 'Customer profile updated successfully.',
      data:    updated.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/customers/:id  →  soft-deactivate
//  Sets is_active = false. Cancels pending/confirmed bookings.
//  Roles: admin only
// ─────────────────────────────────────────────────────────────────────────────
const deactivateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query(
      `SELECT user_id, full_name, is_active FROM users WHERE user_id = $1 AND role = 'customer'`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${id} not found.`,
      });
    }

    if (!existing.rows[0].is_active) {
      return res.status(409).json({
        success: false,
        message: 'Customer account is already deactivated.',
      });
    }

    // Cancel pending/confirmed bookings
    const cancelled = await query(
      `UPDATE bookings
          SET status = 'cancelled', updated_at = NOW()
        WHERE user_id = $1 AND status IN ('pending', 'confirmed')
        RETURNING booking_id`,
      [id]
    );

    // Soft-delete the user
    await query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE user_id = $1`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: `Customer "${existing.rows[0].full_name}" has been deactivated.`,
      data: {
        customerId:        id,
        deactivatedAt:     new Date().toISOString(),
        bookingsCancelled: cancelled.rows.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/customers/:id/bookings
//  Paginated booking history for a customer
// ─────────────────────────────────────────────────────────────────────────────
const getCustomerBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page     = 1,
      limit    = 10,
      status,
      fromDate,
      toDate,
    } = req.query;

    // Confirm customer exists
    const customerResult = await query(
      `SELECT user_id, full_name, is_active FROM users WHERE user_id = $1 AND role = 'customer'`,
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${id} not found.`,
      });
    }

    const customer = customerResult.rows[0];
    const offset   = (page - 1) * limit;

    // Build dynamic WHERE
    const conditions = ['b.user_id = $1'];
    const params     = [id];

    if (status) {
      params.push(status);
      conditions.push(`b.status = $${params.length}`);
    }
    if (fromDate) {
      params.push(fromDate);
      conditions.push(`b.event_date >= $${params.length}`);
    }
    if (toDate) {
      params.push(toDate);
      conditions.push(`b.event_date <= $${params.length}`);
    }

    const where = conditions.join(' AND ');

    const [countResult, bookingsResult] = await Promise.all([
      query(`SELECT COUNT(*) FROM bookings b WHERE ${where}`, params),
      query(
        `SELECT b.booking_id, b.booking_ref, b.event_date,
                b.event_start_time, b.event_end_time,
                b.event_type, b.guest_count, b.status,
                b.base_amount, b.total_amount, b.discount_amount,
                b.special_requests, b.created_at,
                p.package_name
           FROM bookings b
           LEFT JOIN packages p ON p.package_id = b.package_id
          WHERE ${where}
          ORDER BY b.event_date DESC
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
    ]);

    const total    = parseInt(countResult.rows[0].count, 10);
    const bookings = bookingsResult.rows;

    // Summary stats
    const stats = {
      total,
      totalSpend: bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
      byStatus:   bookings.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] ?? 0) + 1;
        return acc;
      }, {}),
    };

    return res.status(200).json({
      success: true,
      customer: {
        id:       customer.user_id,
        name:     customer.full_name,
        isActive: customer.is_active,
      },
      data: bookings,
      stats,
      pagination: {
        total,
        page:        Number(page),
        limit:       Number(limit),
        totalPages:  Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCustomers,
  getCustomer,
  updateCustomer,
  deactivateCustomer,
  getCustomerBookings,
};