/**
 * Purchases Service
 *
 * Business logic for purchase management.
 * Tracks which users have purchased which books.
 */

import { and, eq } from 'drizzle-orm';
import type { z } from 'zod';
import { books, db, purchases, users } from '@/shared/db';
import type { CreatePurchaseSchema } from '@/shared/schemas';

type CreatePurchaseInput = z.infer<typeof CreatePurchaseSchema>;

export const purchaseService = {
  /**
   * Checks if a book with the given ISBN exists
   * @param isbn - ISBN of the book
   * @returns True if the book exists
   */
  async bookExists(isbn: string): Promise<boolean> {
    const [row] = await db
      .select({ isbn: books.isbn })
      .from(books)
      .where(eq(books.isbn, isbn))
      .limit(1);

    return !!row;
  },

  /**
   * Checks if a user with the given id exists
   * @param userId - UUID of the user
   * @returns True if the user exists
   */
  async userExists(userId: string): Promise<boolean> {
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return !!row;
  },

  /**
   * Creates a new purchase record
   * @param data - Purchase creation data (userId, isbn)
   */
  async create(data: CreatePurchaseInput): Promise<void> {
    await db.insert(purchases).values(data);
  },

  /**
   * Retrieves all purchases for a user
   * @param userId - UUID of the user
   * @returns Array of purchase objects
   */
  async getByUserId(userId: string) {
    return db.select().from(purchases).where(eq(purchases.userId, userId));
  },

  /**
   * Checks if a user has purchased a specific book
   * @param userId - UUID of the user
   * @param isbn - ISBN of the book
   * @returns True if the user has purchased the book
   */
  async hasPurchased(userId: string, isbn: string): Promise<boolean> {
    const [row] = await db
      .select({ id: purchases.id })
      .from(purchases)
      .where(and(eq(purchases.userId, userId), eq(purchases.isbn, isbn)))
      .limit(1);

    return !!row;
  },
};
