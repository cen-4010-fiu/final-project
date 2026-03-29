/**
 * Book Service
 *
 * Business logic for book and author management.
 * Handles database operations for Feature 4 (Book Details).
 */

import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { authors, books, db } from '@/shared/db';
import type { CreateAuthorSchema, CreateBookSchema } from '@/shared/schemas';

type CreateAuthorInput = z.infer<typeof CreateAuthorSchema>;
type CreateBookInput = z.infer<typeof CreateBookSchema>;

export const bookService = {
  /**
   * Creates a new author
   * @param data - Author creation data
   * @returns Created author object
   */
  async createAuthor(data: CreateAuthorInput) {
    const [author] = await db.insert(authors).values(data).returning();

    return author;
  },

  /**
   * Retrieves an author by their id
   * @param authorId - UUID of the author
   * @returns Author object or undefined if not found
   */
  async getAuthorById(authorId: string) {
    const [author] = await db
      .select()
      .from(authors)
      .where(eq(authors.id, authorId))
      .limit(1);

    return author;
  },

  /**
   * Creates a new book
   * @param data - Book creation data
   * @returns Created book object
   */
  async createBook(data: CreateBookInput) {
    const [book] = await db.insert(books).values(data).returning();

    return book;
  },

  /**
   * Checks if a book with the given ISBN already exists
   * @param isbn - ISBN to check
   * @returns True if ISBN exists
   */
  async isbnExists(isbn: string) {
    const [row] = await db
      .select({ isbn: books.isbn })
      .from(books)
      .where(eq(books.isbn, isbn))
      .limit(1);

    return !!row;
  },

  /**
   * Retrieves a book by its ISBN
   * @param isbn - ISBN of the book
   * @returns Book object or undefined if not found
   */
  async getBookByIsbn(isbn: string) {
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.isbn, isbn))
      .limit(1);

    return book;
  },

  /**
   * Retrieves all books written by a given author
   * @param authorId - UUID of the author
   * @returns Array of book objects (may be empty)
   */
  async getBooksByAuthorId(authorId: string) {
    return db.select().from(books).where(eq(books.authorId, authorId));
  },
};
