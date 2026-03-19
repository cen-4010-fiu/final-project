/**
* Book Service
*
* Business logic for book and author management.
* Handles database operations for Feature 4 (Book Details).
*/

import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { db, authors, books } from '@/shared/db';
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
    const [author] = await db
      .insert(authors)
      .values(data)
      .returning();

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
    const [book] = await db
      .insert(books)
      .values(data)
      .returning();

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
};