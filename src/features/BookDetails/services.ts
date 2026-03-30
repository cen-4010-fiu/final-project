/**
 * Book Details Service
 *
 * Business logic for creating books, retrieving book details,
 * creating authors, and retrieving books by author.
 */

import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { authors, books, db } from '@/shared/db';
import type { CreateAuthorSchema, CreateBookSchema } from '@/shared/schemas';

type CreateBookType = z.infer<typeof CreateBookSchema>;
type CreateAuthorType = z.infer<typeof CreateAuthorSchema>;

export const bookDetailsService = {
  /**
   * Creates a new book.
   *
   * @param data - Book data
   * @returns Created book object
   */
  async createBook(data: CreateBookType) {
    const [book] = await db
      .insert(books)
      .values({
        isbn: data.isbn,
        name: data.name,
        description: data.description,
        price: data.price,
        authorId: data.authorId,
        genre: data.genre,
        publisher: data.publisher,
        yearPublished: data.yearPublished,
        copiesSold: data.copiesSold,
      })
      .returning();

    return book;
  },

  /**
   * Retrieves a book by ISBN.
   *
   * @param isbn - Book ISBN
   * @returns Book object or null
   */
  async getBookByIsbn(isbn: string) {
    const [book] = await db
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
      .where(eq(books.isbn, isbn))
      .limit(1);

    return book || null;
  },

  /**
   * Creates a new author.
   *
   * @param data - Author data
   * @returns Created author object
   */
  async createAuthor(data: CreateAuthorType) {
    const [author] = await db
      .insert(authors)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        biography: data.biography,
        publisher: data.publisher,
      })
      .returning();

    return author;
  },

  /**
   * Retrieves all books associated with an author.
   *
   * @param authorId - Author ID
   * @returns Array of books
   */
  async getBooksByAuthorId(authorId: string) {
    const authorBooks = await db
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
      .where(eq(books.authorId, authorId));

    return authorBooks;
  },
};