const { pgTable, pgEnum, serial, integer, varchar,
        text, numeric, date, time, timestamp } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

const bookingStatus = pgEnum('booking_status', [
  'pending', 'confirmed', 'cancelled', 'completed'
]);

const bookings = pgTable('bookings', {
  booking_id:       serial('booking_id').primaryKey(),
  user_id:          integer('user_id').notNull(),
  package_id:       integer('package_id'),
  booking_ref:      varchar('booking_ref', { length: 20 }).notNull().unique(),
  event_date:       date('event_date').notNull(),
  event_start_time: time('event_start_time').notNull().default('08:00:00'),
  event_end_time:   time('event_end_time').notNull().default('22:00:00'),
  event_type:       varchar('event_type', { length: 80 }).notNull(),
  guest_count:      integer('guest_count').notNull(),
  status:           bookingStatus('status').notNull().default('pending'),
  base_amount:      numeric('base_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  addon_amount:     numeric('addon_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  discount_amount:  numeric('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  tax_amount:       numeric('tax_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  total_amount:     numeric('total_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  special_requests: text('special_requests'),
  internal_notes:   text('internal_notes'),
  confirmed_by:     integer('confirmed_by'),
  confirmed_at:     timestamp('confirmed_at'),
  cancelled_at:     timestamp('cancelled_at'),
  cancel_reason:    text('cancel_reason'),
  created_at:       timestamp('created_at').notNull().default(sql`now()`),
  updated_at:       timestamp('updated_at').notNull().default(sql`now()`),
});

module.exports = { bookings, bookingStatus };