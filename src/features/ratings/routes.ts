/**
 * Ratings Routes
 *
 * REST API endpoints for Book Rating (Feature 5).
 *
 * Endpoints:
 * - POST   /api/ratings        Create a rating for a book by a user
 * - GET    /api/ratings/:isbn  Get the computed average rating for a book
 */

import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import {
  AverageRatingSchema,
  CreateRatingSchema,
  ErrorSchema,
  IsbnParam,
} from '@/shared/schemas';
import { ratingService } from './service';

const app = new OpenAPIHono();

// POST /api/ratings
app.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Ratings'],
    summary: 'Create a book rating',
    description:
      'Creates a 1–5 star rating for a book by a user. ' +
      'A user may only submit one rating per book.',
    request: {
      body: { content: { 'application/json': { schema: CreateRatingSchema } } },
    },
    responses: {
      201: { description: 'Rating created successfully' },
      400: {
        description: 'User has already rated this book',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      404: {
        description: 'Book or user not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      500: {
        description: 'Failed to create rating',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    if (!(await ratingService.bookExists(body.isbn))) {
      return c.json({ error: 'Book not found' }, 404);
    }

    if (!(await ratingService.userExists(body.userId))) {
      return c.json({ error: 'User not found' }, 404);
    }

    if (await ratingService.ratingExistsForUser(body.userId, body.isbn)) {
      return c.json({ error: 'User has already rated this book' }, 400);
    }

    await ratingService.create(body);

    return c.body(null, 201);
  }
);

// GET /api/ratings/:isbn
app.openapi(
  createRoute({
    method: 'get',
    path: '/{isbn}',
    tags: ['Ratings'],
    summary: 'Get average rating for a book',
    description:
      'Returns the computed average rating (decimal) for the given book ISBN. ' +
      'averageRating is null when no ratings have been submitted yet.',
    request: {
      params: IsbnParam,
    },
    responses: {
      200: {
        description: 'Average rating computed successfully',
        content: { 'application/json': { schema: AverageRatingSchema } },
      },
      404: {
        description: 'Book not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { isbn } = c.req.valid('param');

    if (!(await ratingService.bookExists(isbn))) {
      return c.json({ error: 'Book not found' }, 404);
    }

    const averageRating = await ratingService.getAverageRating(isbn);

    return c.json({ isbn, averageRating }, 200);
  }
);

export default app;
