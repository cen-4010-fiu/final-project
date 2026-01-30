import type { ErrorHandler } from 'hono';
import { ApiError } from '@/shared/lib/api-error';

// NOTE: Could definitely be expanded upon
export const errorHandler: ErrorHandler = (err, c) => {
  console.error(err);

  if (err instanceof ApiError) {
    return c.json({ error: err.message }, err.statusCode as 400);
  }

  return c.json({ error: 'Internal Server Error' }, 500);
};
