/**
 * Comments Service
 *
 * Business logic for book comment management.
 * Handles database operations for Feature 5 (Book Rating and Commenting).
 */

import { asc, eq } from 'drizzle-orm';
import type { z } from 'zod';
import { bookComments, books, db, users } from '@/shared/db';
import type { CreateCommentSchema } from '@/shared/schemas';

type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const commentService = {
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
   * Creates a new comment for a book
   * @param data - Comment creation data (userId, isbn, comment)
   */
  async create(data: CreateCommentInput): Promise<void> {
    await db.insert(bookComments).values(data);
  },

  /**
   * Retrieves all comments for a book ordered by creation time ascending
   * @param isbn - ISBN of the book
   * @returns Array of comment objects (empty array if none exist)
   */
  async getByIsbn(isbn: string) {
    return db
      .select()
      .from(bookComments)
      .where(eq(bookComments.isbn, isbn))
      .orderBy(asc(bookComments.createdAt));
  },
};
