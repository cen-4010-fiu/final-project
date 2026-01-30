import { z } from '@hono/zod-openapi';

// NOTE: Common schemas unrelated to a particular feature

export const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi('Error');

export const IdParam = z
  .object({
    id: z.uuid(),
  })
  .openapi('IdParam');
