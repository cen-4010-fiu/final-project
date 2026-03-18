/**
 * Database Schemas
 *
 * Central location for all Drizzle ORM table definitions.
 * Run `bun run db:generate` after modifying to create migrations.
 */

import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Users table
 *
 * Stores user account information. Passwords are hashed via bcrypt
 * before storage (handled in service layer).
 */
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  email: text('email'),
  homeAddress: text('home_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Credit Cards table
 *
 * Stores payment methods for users. Security note:
 * - Only last 4 digits stored in plaintext for display
 * - Full number and CVV are hashed, but this is insufficient IRL
 * - In production, just use Stripe or another payment processor
 */
export const creditCards = pgTable('credit_cards', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  cardholderName: text('cardholder_name').notNull(),
  lastFour: text('last_four').notNull(),
  cardNumberHash: text('card_number_hash').notNull(),
  expiryDate: text('expiry_date').notNull(),
  cvvHash: text('cvv_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * User Orders table
 *
 * Stores transaction history for users.
 *  - Card data will be fetched and not stored with/in orders>
 *  - Item details could be additioned to order details later on.
 */
export const userOrders = pgTable('user_orders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  cardUsed: text('card_used')
    .notNull()
    .references(() => creditCards.id, { onDelete: 'cascade' }),
  transactionDate: timestamp('transaction_date').defaultNow().notNull(),
  transactionAmount: text('transactionAmount').notNull(),
});
