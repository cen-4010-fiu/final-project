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

/**
 * Credit Card Schemas
 *
 * NOTE:
 * Regarding regex usage, I am normally against it, but in this case its quite simple.
 * In general, ^ is start, $ is end, and () creates groupings. If you want to learn more check out this [https://regexr.com/](explainer) or this [https://regex-vis.com/?r=%5E%280%5B1-9%5D%7C1%5B0-2%5D%29%5C%2F%5Cd%7B2%7D%24][visualizer] to learn more.
 *
 * For MM/YY:
 * - the regex /^(0[1-9]|1[0]-2)  essentially means: two digits, 01-09, or 10-12 (MM)
 * - then, \/ is an escaped '/'
 * - and finally, \d{2} means any two digits (not very robust but this is an academic exercise)
 */

export const CreateCreditCardSchema = z
  .object({
    cardNumber: z
      .string()
      .regex(/^\d{16}$/, 'Card number must be exactly 16 digits'),
    expiryDate: z
      .string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
    cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
    cardholderName: z.string().min(1).max(100),
  })
  .refine(
    (data) => {
      const [monthStr, yearStr] = data.expiryDate.split('/');
      const month = parseInt(monthStr as string, 10);
      const year = parseInt(yearStr as string, 10);

      // Create date representing end of expiry month
      const expiry = new Date(2000 + year, month - 1);
      expiry.setMonth(expiry.getMonth() + 1, 0);
      expiry.setHours(23, 59, 59, 999);

      const now = new Date();
      return expiry > now;
    },
    {
      message: 'Card has expired',
      path: ['expiryDate'],
    }
  )
  .openapi('CreateCreditCard');

/**
 * Safe credit card representation for API responses
 * Excludes: cardNumberHash, cvvHash, userId
 * Dates remain as Date objects (serialized to ISO strings by JSON)
 */
export const CreditCardSchema = z
  .object({
    id: z.string(),
    cardholderName: z.string(),
    lastFour: z.string().length(4),
    expiryDate: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi('CreditCard');
