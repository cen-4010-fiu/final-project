/**
* Database Schemas
*
* Central location for all Drizzle ORM table definitions.
* Run `bun run db:generate` after modifying to create migrations.
*/

import { integer, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

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
 * Authors table
 *
 * Stores author information including biography and publisher.
 */
export const authors = pgTable('authors', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  biography: text('biography'),
  publisher: text('publisher'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Books table
 *
 * Stores book information. authorId is a foreign key to authors.
 */
export const books = pgTable('books', {
  isbn: text('isbn').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  authorId: text('author_id')
    .notNull()
    .references(() => authors.id),
  genre: text('genre'),
  publisher: text('publisher'),
  yearPublished: integer('year_published'),
  copiesSold: integer('copies_sold').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});