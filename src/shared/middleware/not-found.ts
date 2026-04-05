import type { NotFoundHandler } from 'hono';

export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json(
    {
      error: `Route ${c.req.method} ${c.req.path} not found. See http://localhost:3000/docs for more information.`,
      requestId: c.get('requestId'),
    },
    404
  );
};
