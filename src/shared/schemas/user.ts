/**
 * User Schemas
 *
 * Zod schemas for user-related request/response validation.
 * Integrated with OpenAPI for automatic documentation.
 */

import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '@/shared/db/schema';

const baseSchema = createSelectSchema(users);
const baseInsertSchema = createInsertSchema(users);

/**
 * Public user representation
 * @description Omits password
 */
export const UserSchema = baseSchema.omit({ password: true }).openapi('User');

/**
 * User creation payload
 * @description Required: username (3-50 chars), password (min 8 chars)
 * @description Optional: name, email (validated format), homeAddress
 */
export const CreateUserSchema = baseInsertSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    username: z.string().min(3).max(50),
    password: z.string().min(8),
    email: z.email().optional(),
  })
  .openapi('CreateUser');

/**
 * User update payload
 * @description All fields optional. Email excluded per project spec.
 */
export const UpdateUserSchema = baseInsertSchema
  .omit({
    id: true,
    username: true,
    email: true, // Cannot update email per spec
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .openapi('UpdateUser');

/** Path parameter for username-based lookups */
export const UsernameParam = z
  .object({
    username: z.string(),
  })
  .openapi('UsernameParam');
