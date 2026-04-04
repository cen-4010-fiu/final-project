/**
 * Purchase Schemas
 *
 * Zod schemas for purchase request/response validation.
 * Integrated with OpenAPI for automatic documentation.
 */

import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { purchases } from '@/shared/db/schema';

/**
 * Public purchase representation
 */
export const PurchaseSchema = createSelectSchema(purchases).openapi('Purchase');

/**
 * List of purchases for a user
 */
export const PurchaseListSchema = z
  .array(PurchaseSchema)
  .openapi('PurchaseList');

/**
 * Purchase creation payload
 * @description Required: userId, isbn
 */
export const CreatePurchaseSchema = createInsertSchema(purchases)
  .omit({ id: true, purchasedAt: true })
  .extend({
    userId: z.uuid(),
    isbn: z.string(),
  })
  .openapi('CreatePurchase');

/** Path parameter for userId-based lookups */
export const UserIdParam = z
  .object({
    userId: z.string(),
  })
  .openapi('UserIdParam');
