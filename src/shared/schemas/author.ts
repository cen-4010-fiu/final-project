/**
 * Author Schemas
 *
 * Zod schemas for author-related request/response validation.
 * Integrated with OpenAPI for automatic documentation.
 */

import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { authors } from '@/shared/db/schema';

const baseSchema = createSelectSchema(authors);
const baseInsertSchema = createInsertSchema(authors);

/**
 * Public author representation
 */
export const AuthorSchema = baseSchema.openapi('Author');

/**
 * Author creation payload
 * @description Required: firstName, lastName
 * @description Optional: biography, publisher
 */
export const CreateAuthorSchema = baseInsertSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    biography: z.string().optional(),
    publisher: z.string().optional(),
  })
  .openapi('CreateAuthor');

/** Path parameter for author id lookups */
export const AuthorIdParam = z
  .object({
    authorId: z.uuid(),
  })
  .openapi('AuthorIdParam');
