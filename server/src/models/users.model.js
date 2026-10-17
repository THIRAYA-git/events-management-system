const { pgTable, pgEnum, serial, varchar,
        boolean, timestamp } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

const userRole = pgEnum('user_role', [
  'customer', 'front_desk', 'admin',
  'organizer', 'sponsor', 'restaurant'
]);

const users = pgTable('users', {
  user_id:       serial('user_id').primaryKey(),
  full_name:     varchar('full_name', { length: 100 }).notNull(),
  email:         varchar('email', { length: 150 }).notNull().unique(),
  phone:         varchar('phone', { length: 20 }),
  role:          userRole('role').notNull().default('customer'),
  is_active:     boolean('is_active').notNull().default(true),
  created_at:    timestamp('created_at').notNull().default(sql`now()`),
  updated_at:    timestamp('updated_at').notNull().default(sql`now()`),
});

module.exports = { users, userRole };