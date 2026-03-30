/**
 * Book Schemas
 *
 * Zod schemas for book-related request/response validation.
 * Integrated with OpenAPI for automatic documentation.
 */

import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { books } from '@/shared/db/schema';

const baseSchema = createSelectSchema(books);
const baseInsertSchema = createInsertSchema(books);

/**
 * Public book representation
 */
export const BookSchema = baseSchema.openapi('Book');

/** List of books (used for author → books lookup) */
export const BookListSchema = z.array(BookSchema).openapi('BookList');

/**
 * Book creation payload
 * @description Required: isbn, name, price, authorId
 * @description Optional: description, genre, publisher, yearPublished, copiesSold
 */
export const CreateBookSchema = baseInsertSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    isbn: z.string().min(10).max(13),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    price: z
      .string()
      .regex(
        /^\d+(\.\d{1,2})?$/,
        'Price must be a valid decimal (e.g. "12.99")'
      ),
    authorId: z.uuid(),
    genre: z.string().optional(),
    publisher: z.string().optional(),
    yearPublished: z.number().int().min(1000).max(9999).optional(),
    copiesSold: z.number().int().min(0).optional(),
  })
  .openapi('CreateBook');

/** Path parameter for ISBN-based lookups */
export const IsbnParam = z
  .object({
    isbn: z.string(),
  })
  .openapi('IsbnParam');
