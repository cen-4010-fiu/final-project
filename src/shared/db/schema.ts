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
