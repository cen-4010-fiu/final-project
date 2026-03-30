/**
 * Ratings Service
 *
 * Business logic for book rating management.
 * Handles database operations for Feature 5 (Book Rating and Commenting).
 */

import { and, avg, eq } from 'drizzle-orm';
import type { z } from 'zod';
import { bookRatings, books, db, users } from '@/shared/db';
import type { CreateRatingSchema } from '@/shared/schemas';

type CreateRatingInput = z.infer<typeof CreateRatingSchema>;

export const ratingService = {
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
   * Checks if a user has already rated a specific book
   * @param userId - UUID of the user
   * @param isbn - ISBN of the book
   * @returns True if a rating already exists for this user/book pair
   */
  async ratingExistsForUser(userId: string, isbn: string): Promise<boolean> {
    const [row] = await db
      .select({ id: bookRatings.id })
      .from(bookRatings)
      .where(and(eq(bookRatings.userId, userId), eq(bookRatings.isbn, isbn)))
      .limit(1);

    return !!row;
  },

  /**
   * Creates a new rating for a book
   * @param data - Rating creation data (userId, isbn, rating)
   */
  async create(data: CreateRatingInput): Promise<void> {
    await db.insert(bookRatings).values(data);
  },

  /**
   * Computes the average rating for a book
   * @param isbn - ISBN of the book
   * @returns Average rating as a decimal, or null if no ratings exist
   */
  async getAverageRating(isbn: string): Promise<number | null> {
    const [result] = await db
      .select({ avgRating: avg(bookRatings.rating) })
      .from(bookRatings)
      .where(eq(bookRatings.isbn, isbn));

    const raw = result?.avgRating ?? null;

    return raw !== null ? Number(raw) : null;
  },
};
