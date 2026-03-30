/**
 * Book Browsing and Sorting Service
 *
 * Business logic for browsing books by genre, top sellers,
 * books by minimum rating, and discounting books by publisher.
 */

import { avg, desc, eq, gte, sql } from 'drizzle-orm';
import type { z } from 'zod';
import { bookRatings, books, db } from '@/shared/db';
import type { DiscountBooksByPublisherSchema } from '@/shared/schemas';

type DiscountBooksByPublisherType = z.infer<
  typeof DiscountBooksByPublisherSchema
>;

export const bookBrowsingService = {
  /**
   * Retrieves all books for a given genre.
   *
   * @param genre - Genre name
   * @returns Array of books
   */
  async getBooksByGenre(genre: string) {
    const result = await db
      .select({
        id: books.id,
        isbn: books.isbn,
        name: books.name,
        description: books.description,
        price: books.price,
        authorId: books.authorId,
        genre: books.genre,
        publisher: books.publisher,
        yearPublished: books.yearPublished,
        copiesSold: books.copiesSold,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
      })
      .from(books)
      .where(eq(books.genre, genre));

    return result;
  },

  /**
   * Retrieves the top 10 best-selling books.
   *
   * @returns Array of top-selling books
   */
  async getTopSellers() {
    const result = await db
      .select({
        id: books.id,
        isbn: books.isbn,
        name: books.name,
        description: books.description,
        price: books.price,
        authorId: books.authorId,
        genre: books.genre,
        publisher: books.publisher,
        yearPublished: books.yearPublished,
        copiesSold: books.copiesSold,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
      })
      .from(books)
      .orderBy(desc(books.copiesSold))
      .limit(10);

    return result;
  },

  /**
   * Retrieves books whose average rating is greater than or equal
   * to the given rating.
   *
   * @param minRating - Minimum average rating
   * @returns Array of books with matching average rating
   */
  async getBooksByMinimumRating(minRating: number) {
    const averageRatingExpr = avg(bookRatings.rating);

    const result = await db
      .select({
        id: books.id,
        isbn: books.isbn,
        name: books.name,
        description: books.description,
        price: books.price,
        authorId: books.authorId,
        genre: books.genre,
        publisher: books.publisher,
        yearPublished: books.yearPublished,
        copiesSold: books.copiesSold,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        averageRating: averageRatingExpr,
      })
      .from(books)
      .leftJoin(bookRatings, eq(bookRatings.bookId, books.id))
      .groupBy(
        books.id,
        books.isbn,
        books.name,
        books.description,
        books.price,
        books.authorId,
        books.genre,
        books.publisher,
        books.yearPublished,
        books.copiesSold,
        books.createdAt,
        books.updatedAt
      )
      .having(gte(averageRatingExpr, minRating));

    return result.map((book) => ({
      ...book,
      averageRating: book.averageRating ? Number(book.averageRating) : 0,
    }));
  },

  /**
   * Applies a discount to all books from a given publisher.
   *
   * @param data - Discount percent and publisher
   * @returns Updated books
   */
  async discountBooksByPublisher(data: DiscountBooksByPublisherType) {
    if (data.discountPercent < 0 || data.discountPercent > 100) {
      throw new Error('Discount percent must be between 0 and 100.');
    }

    const multiplier = (100 - data.discountPercent) / 100;

    const updatedBooks = await db
      .update(books)
      .set({
        price: sql`ROUND(${books.price} * ${multiplier}, 2)`,
      })
      .where(eq(books.publisher, data.publisher))
      .returning({
        id: books.id,
        isbn: books.isbn,
        name: books.name,
        price: books.price,
        publisher: books.publisher,
      });

    return updatedBooks;
  },
};