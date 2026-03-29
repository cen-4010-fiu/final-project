/**
 * Database Schemas
 *
 * Central location for all Drizzle ORM table definitions.
 * Run `bun run db:generate` after modifying to create migrations.
 */

import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

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

/**
 * Book Ratings table
 *
 * Stores 1–5 star ratings submitted by users for books.
 * A user can only rate a given book once (unique constraint on userId + isbn).
 * Ratings are immutable — no update endpoint exists.
 */
export const bookRatings = pgTable(
  'book_ratings',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isbn: text('isbn')
      .notNull()
      .references(() => books.isbn, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [unique('book_ratings_user_isbn_unique').on(t.userId, t.isbn)]
);

/**
 * Book Comments table
 *
 * Stores free-text comments submitted by users for books.
 * Comments are immutable — no update endpoint exists.
 */
export const bookComments = pgTable('book_comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  isbn: text('isbn')
    .notNull()
    .references(() => books.isbn, { onDelete: 'cascade' }),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Shopping Cart table
 *
 * Stores a users current shopping cart
 */
export const shoppingCart = pgTable('shopping_cart', {
  id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
          .notNull()
          .references(() => users.id, { onDelete: 'cascade' })
})

/**
 * Shopping Cart Items table
 *
 * Stores the actual items in a shopping cart at any given time
 */
export const shoppingCartItems = pgTable('shopping_cart_items', {
  id: text('id').primaryKey().$defaultFn(()=> crypto.randomUUID()),
  shoppingCartId: text('shopping_cart_id').notNull().references(() => shoppingCart.id),
  bookIsbn: text('book_isbn').notNull().references(() => books.isbn)
})