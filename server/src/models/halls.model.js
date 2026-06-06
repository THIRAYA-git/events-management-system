// ─────────────────────────────────────────────────────────────────────────────
//  src/db/schema/halls.schema.js
//  NEW tables: halls  +  hall_bookings
//  Follows the existing Azath Plaza DB conventions:
//    • snake_case columns
//    • numeric(10,2) for money
//    • timestamp DEFAULT now() for audit fields
//    • booking_status enum reused from public schema
// ─────────────────────────────────────────────────────────────────────────────
const {
  pgTable,
  pgEnum,
  serial,
  integer,
  varchar,
  text,
  numeric,
  boolean,
  date,
  time,
  timestamp,
  check,
} = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');
const { bookings } = require('./bookings.model');   // ✅
const { users }    = require('./users.model');       // ✅

// ── Re-use the existing booking_status enum already in the DB ────────────────
// Drizzle: reference an existing enum without re-creating it
const bookingStatus = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
]);

// ── halls ────────────────────────────────────────────────────────────────────
//  One row per physical hall.
//  floor_number: 1 or 2  (Azath Plaza has 2 floors)
//  capacity:     max guest count for this hall
//  base_price:   per-event base charge (addons billed separately)
const halls = pgTable('halls', {
  hall_id:      serial('hall_id').primaryKey(),
  hall_name:    varchar('hall_name', { length: 100 }).notNull(),       // e.g. "Crystal Hall"
  floor_number: integer('floor_number').notNull(),                     // 1 | 2
  capacity:     integer('capacity').notNull(),                         // max guests
  description:  text('description'),
  base_price:   numeric('base_price', { precision: 10, scale: 2 }).notNull().default('0'),
  is_active:    boolean('is_active').notNull().default(true),
  image_url:    text('image_url'),
  amenities:    text('amenities'),                                     // JSON string — flexible
  created_at:   timestamp('created_at').notNull().default(sql`now()`),
  updated_at:   timestamp('updated_at').notNull().default(sql`now()`),
}, (table) => ({
  floorCheck:   check('halls_floor_check',    sql`${table.floor_number} IN (1, 2)`),
  capacityCheck:check('halls_capacity_check', sql`${table.capacity} > 0`),
  priceCheck:   check('halls_price_check',    sql`${table.base_price} >= 0`),
}));

// ── hall_bookings ─────────────────────────────────────────────────────────────
//  Links a hall to an existing booking (bookings table).
//  One booking → one hall (a customer books exactly one hall per event).
//  Multiple bookings can reference the same hall on different dates/times.
//
//  Conflict rule (enforced in the service layer + DB index):
//    No two hall_bookings with the same hall_id can have overlapping
//    [event_date + event_start_time, event_date + event_end_time] intervals
//    when status NOT IN ('cancelled').
const hallBookings = pgTable('hall_bookings', {
  hall_booking_id: serial('hall_booking_id').primaryKey(),
  hall_id:         integer('hall_id')
                     .notNull()
                     .references(() => halls.hall_id, { onDelete: 'restrict' }),
  booking_id:      integer('booking_id')
                     .notNull()
                     .unique()                                          // 1 hall per booking
                     .references(() => bookings.booking_id, { onDelete: 'cascade' }),
  event_date:      date('event_date').notNull(),
  event_start_time:time('event_start_time').notNull(),
  event_end_time:  time('event_end_time').notNull(),
  status:          bookingStatus('status').notNull().default('pending'),
  assigned_by:     integer('assigned_by')
                     .references(() => users.user_id, { onDelete: 'set null' }),
  notes:           text('notes'),
  created_at:      timestamp('created_at').notNull().default(sql`now()`),
  updated_at:      timestamp('updated_at').notNull().default(sql`now()`),
}, (table) => ({
  timeCheck: check(
    'hall_bookings_time_check',
    sql`${table.event_end_time} > ${table.event_start_time}`
  ),
}));

// ── SQL migration helper (run once via migration script) ──────────────────────
//
//  The overlap conflict is also enforced at the DB level with an EXCLUSION
//  constraint (requires btree_gist extension — available on Neon).
//  Run this manually in your Neon SQL editor or migration script:
//
//  CREATE EXTENSION IF NOT EXISTS btree_gist;
//
//  ALTER TABLE hall_bookings
//    ADD CONSTRAINT hall_bookings_no_overlap
//    EXCLUDE USING gist (
//      hall_id    WITH =,
//      event_date WITH =,
//      (timerange(event_start_time, event_end_time, '[)')) WITH &&
//    )
//    WHERE (status <> 'cancelled');
//
//  This is the gold-standard approach — the service layer check prevents
//  race conditions at the app level, and the EXCLUSION constraint is the
//  last-line DB guarantee.

module.exports = { halls, hallBookings };
