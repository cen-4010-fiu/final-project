/**
 * Comments Routes
 *
 * REST API endpoints for Book Commenting (Feature 5).
 *
 * Endpoints:
 * - POST   /api/comments        Create a comment for a book by a user
 * - GET    /api/comments/:isbn  Get all comments for a book
 */

import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import {
  CommentListSchema,
  CreateCommentSchema,
  ErrorSchema,
  IsbnParam,
} from '@/shared/schemas';
import { commentService } from './service';

const app = new OpenAPIHono();

// POST /api/comments
app.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Comments'],
    summary: 'Create a book comment',
    description: 'Creates a text comment for a book by a user.',
    request: {
      body: {
        content: { 'application/json': { schema: CreateCommentSchema } },
      },
    },
    responses: {
      201: { description: 'Comment created successfully' },
      403: {
        description: 'User has not purchased this book',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      404: {
        description: 'Book or user not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      500: {
        description: 'Failed to create comment',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    if (!(await commentService.bookExists(body.isbn))) {
      return c.json({ error: 'Book not found' }, 404);
    }

    if (!(await commentService.userExists(body.userId))) {
      return c.json({ error: 'User not found' }, 404);
    }

    if (!(await commentService.hasPurchased(body.userId, body.isbn))) {
      return c.json({ error: 'User has not purchased this book' }, 403);
    }

    await commentService.create(body);

    return c.body(null, 201);
  }
);

// GET /api/comments/:isbn
app.openapi(
  createRoute({
    method: 'get',
    path: '/{isbn}',
    tags: ['Comments'],
    summary: 'Get all comments for a book',
    description:
      'Retrieves all comments for a book identified by ISBN, ' +
      'ordered by creation time ascending. Returns an empty array if no comments exist.',
    request: {
      params: IsbnParam,
    },
    responses: {
      200: {
        description: 'List of comments for the book',
        content: { 'application/json': { schema: CommentListSchema } },
      },
      404: {
        description: 'Book not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { isbn } = c.req.valid('param');

    if (!(await commentService.bookExists(isbn))) {
      return c.json({ error: 'Book not found' }, 404);
    }

    const comments = await commentService.getByIsbn(isbn);

    return c.json(comments, 200);
  }
);

export default app;
