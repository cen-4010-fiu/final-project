/**
 * User Routes
 *
 * REST API endpoints for Profile Management feature.
 *
 * Endpoints:
 * - POST   /api/users            Create account
 * - GET    /api/users/:username  Get user profile
 * - PATCH  /api/users/:username  Update user profile
 */

import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import {
  CreateCreditCardSchema,
  CreateUserSchema,
  CreditCardSchema,
  ErrorSchema,
  UpdateUserSchema,
  UsernameParam,
  UserSchema,
} from '@/shared/schemas';
import { creditCardService, userService } from './service';

const app = new OpenAPIHono();

/** User object safe for API responses (no password) */
type SafeUser = z.infer<typeof UserSchema>;

/** Strips password from user object */
function sanitizeUser(user: {
  password: string;
  [key: string]: unknown;
}): SafeUser {
  const { password: _, ...safeUser } = user;
  return safeUser as SafeUser;
}

// POST /api/users
app.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Users'],
    summary: 'Create a new user account',
    description:
      'Registers a new user with username/password. ' +
      'Optional fields: name, email, home address.',
    request: {
      body: { content: { 'application/json': { schema: CreateUserSchema } } },
    },
    responses: {
      201: {
        description: 'User created successfully',
        content: { 'application/json': { schema: UserSchema } },
      },
      400: {
        description: 'Invalid input or username taken',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      500: {
        description: 'Failed to create user',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    if (await userService.usernameExists(body.username)) {
      return c.json({ error: 'Username already taken' }, 400);
    }

    const user = await userService.create(body);

    if (!user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    return c.json(sanitizeUser(user), 201);
  }
);

// GET /api/users/:username
app.openapi(
  createRoute({
    method: 'get',
    path: '/{username}',
    tags: ['Users'],
    summary: 'Get user by username',
    description: 'Retrieves public profile information for a user.',
    request: { params: UsernameParam },
    responses: {
      200: {
        description: 'User found',
        content: { 'application/json': { schema: UserSchema } },
      },
      404: {
        description: 'User not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),

  async (c) => {
    const { username } = c.req.valid('param');
    const user = await userService.getByUsername(username);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(sanitizeUser(user), 200);
  }
);

// PATCH /api/users/:username
app.openapi(
  createRoute({
    method: 'patch',
    path: '/{username}',
    tags: ['Users'],
    summary: 'Update user profile',
    description:
      'Updates user profile fields. Email cannot be modified. ' +
      'Password will be re-hashed if provided.',
    request: {
      params: UsernameParam,
      body: { content: { 'application/json': { schema: UpdateUserSchema } } },
    },
    responses: {
      200: {
        description: 'User updated successfully',
        content: { 'application/json': { schema: UserSchema } },
      },
      404: {
        description: 'User not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),

  async (c) => {
    const { username } = c.req.valid('param');
    const body = c.req.valid('json');
    const user = await userService.update(username, body);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(sanitizeUser(user), 200);
  }
);

// POST /api/users/:username/cards
app.openapi(
  createRoute({
    method: 'post',
    path: '/{username}/cards',
    tags: ['Users', 'Credit Cards'],
    summary: 'Add credit card to user profile',
    description:
      'Saves a credit card for the user. Stores only last 4 digits ' +
      'readable; full number and CVV are hashed using bcrypt.',
    request: {
      params: UsernameParam,
      body: {
        content: {
          'application/json': { schema: CreateCreditCardSchema },
        },
      },
    },
    responses: {
      201: {
        description: 'Credit card added successfully',
        content: { 'application/json': { schema: CreditCardSchema } },
      },
      400: {
        description: 'Invalid card data or expired card',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      404: {
        description: 'User not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { username } = c.req.valid('param');
    const body = c.req.valid('json');

    const card = await creditCardService.create(username, body);

    if (!card) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(card, 201);
  }
);

// GET /api/users/:username/cards
app.openapi(
  createRoute({
    method: 'get',
    path: '/{username}/cards',
    tags: ['Users', 'Credit Cards'],
    summary: 'List user credit cards',
    description:
      'Retrieves all saved credit cards for the user. ' +
      'Only last 4 digits of card number are returned',
    request: {
      params: UsernameParam,
    },
    responses: {
      200: {
        description: 'List of credit cards',
        content: {
          'application/json': {
            schema: z.array(CreditCardSchema),
          },
        },
      },
      404: {
        description: 'User not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { username } = c.req.valid('param');
    const cards = await creditCardService.getByUsername(username);

    if (cards === null) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(cards, 200);
  }
);

export default app;
