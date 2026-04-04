/**
 * Purchases Routes
 *
 * REST API endpoints for purchase tracking.
 *
 * Endpoints:
 * - POST   /api/purchases           Record a book purchase
 * - GET    /api/purchases/:userId   List purchases for a user
 */

import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import {
  CreatePurchaseSchema,
  ErrorSchema,
  PurchaseListSchema,
  UserIdParam,
} from '@/shared/schemas';
import { purchaseService } from './service';

const app = new OpenAPIHono();

// POST /api/purchases
app.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Purchases'],
    summary: 'Record a book purchase',
    description: 'Records that a user has purchased a book.',
    request: {
      body: {
        content: { 'application/json': { schema: CreatePurchaseSchema } },
      },
    },
    responses: {
      201: { description: 'Purchase recorded successfully' },
      404: {
        description: 'Book or user not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      500: {
        description: 'Failed to record purchase',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    if (!(await purchaseService.bookExists(body.isbn))) {
      return c.json({ error: 'Book not found' }, 404);
    }

    if (!(await purchaseService.userExists(body.userId))) {
      return c.json({ error: 'User not found' }, 404);
    }

    await purchaseService.create(body);

    return c.body(null, 201);
  }
);

// GET /api/purchases/:userId
app.openapi(
  createRoute({
    method: 'get',
    path: '/{userId}',
    tags: ['Purchases'],
    summary: 'List purchases for a user',
    description: 'Retrieves all purchase records for a given user.',
    request: {
      params: UserIdParam,
    },
    responses: {
      200: {
        description: 'List of purchases for the user',
        content: { 'application/json': { schema: PurchaseListSchema } },
      },
      404: {
        description: 'User not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { userId } = c.req.valid('param');

    if (!(await purchaseService.userExists(userId))) {
      return c.json({ error: 'User not found' }, 404);
    }

    const purchaseList = await purchaseService.getByUserId(userId);

    return c.json(purchaseList, 200);
  }
);

export default app;
