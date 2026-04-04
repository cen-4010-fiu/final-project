/**
 * Test Setup
 *
 * Global setup that runs before each test file.
 * Deletion order respects foreign key constraints (children first).
 */

import { beforeEach } from 'bun:test';
import { db } from '@/shared/db/client';
import {
  authors,
  bookComments,
  bookRatings,
  books,
  creditCards,
  purchases,
  users,
} from '@/shared/db/schema';

/**
 * Reset all tables before each test (FK-safe order)
 */
beforeEach(async () => {
  await db.delete(bookRatings);
  await db.delete(bookComments);
  await db.delete(purchases);
  await db.delete(creditCards);
  await db.delete(books);
  await db.delete(authors);
  await db.delete(users);
});
