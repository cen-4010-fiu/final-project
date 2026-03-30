/**
 * Rating Schemas
 *
 * Zod schemas for book rating request/response validation.
 * Integrated with OpenAPI for automatic documentation.
 */

import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { bookRatings } from '@/shared/db/schema';

const baseInsertSchema = createInsertSchema(bookRatings);

/**
 * Public rating representation
 */
export const RatingSchema = createSelectSchema(bookRatings).openapi('Rating');

/**
 * Rating creation payload
 * @description Required: userId, isbn, rating (1–5)
 */
export const CreateRatingSchema = baseInsertSchema
  .omit({ id: true, createdAt: true })
  .extend({
    userId: z.uuid(),
    isbn: z.string(),
    rating: z.number().int().min(1).max(5),
  })
  .openapi('CreateRating');

/**
 * Average rating response
 * @description averageRating is null when no ratings exist for the book
 */
export const AverageRatingSchema = z
  .object({
    isbn: z.string(),
    averageRating: z.number().nullable(),
  })
  .openapi('AverageRating');
