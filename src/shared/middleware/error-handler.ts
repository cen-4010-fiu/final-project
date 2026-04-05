import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get('requestId');

  // Log structured error
  console.error(
    JSON.stringify({
      level: 'error',
      requestId,
      method: c.req.method,
      path: c.req.path,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  );

  // HTTPException from Hono
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        requestId,
      },
      err.status
    );
  }

  // Zod validation
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.') || 'body';
      errors[path] ??= [];
      errors[path].push(issue.message);
    }
    return c.json(
      {
        error: 'Validation failed',
        errors,
        requestId,
      },
      422
    );
  }

  // Default
  return c.json(
    {
      error: 'Internal Server Error',
      requestId,
    },
    500
  );
};
