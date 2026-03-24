/**
 * Comment Schemas
 *
 * Zod schemas for book comment request/response validation.
 * Integrated with OpenAPI for automatic documentation.
 */

import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { bookComments } from '@/shared/db/schema';

const baseInsertSchema = createInsertSchema(bookComments);

/**
 * Public comment representation
 */
export const CommentSchema =
  createSelectSchema(bookComments).openapi('Comment');

/**
 * List of comments for a book
 */
export const CommentListSchema = z.array(CommentSchema).openapi('CommentList');

/**
 * Comment creation payload
 * @description Required: userId, isbn, comment
 */
export const CreateCommentSchema = baseInsertSchema
  .omit({ id: true, createdAt: true })
  .extend({
    userId: z.uuid(),
    isbn: z.string(),
    comment: z.string().min(1).max(2000),
  })
  .openapi('CreateComment');
