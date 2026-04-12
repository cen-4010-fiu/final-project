/**
 * Shopping Cart Routes
 *
 * REST API endpoints for managing the shopping cart, including adding items to the cart, removing items from the cart, retrieving the list of items in the cart, and calculating the subtotal of the items in the cart.
 * The routes are implemented using the Hono framework and are designed to handle various scenarios, including successful operations, invalid input handling, and error handling for server issues.
 * The routes are defined with OpenAPI specifications to provide clear documentation and facilitate integration with frontend applications or other services that need to interact with the shopping cart functionality.
 * The routes are structured to ensure that the shopping cart feature remains robust and reliable as changes are made to the codebase, and they should be tested thoroughly to catch any issues early in the development process.
 */
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { ShoppingCartService } from './service';

const ErrorSchema = z.object({
  error: z.string(),
});

const app = new OpenAPIHono();
const shoppingCartService = new ShoppingCartService();

const CartItemSchema = z.object({
  id: z.string(),
  shoppingCartId: z.string(),
  bookId: z.string(),
  price: z.number().optional(),
});

const AddItemSchema = z.object({
  userId: z.string(),
  bookId: z.string(),
});

app.openapi(
  createRoute({
    method: 'post',
    path: '/cart/items',
    tags: ['Shopping Cart'],
    summary: 'Add a book to the shopping cart',
    description: "Adds a book to the user's shopping cart.",
    request: {
      body: {
        content: {
          'application/json': {
            schema: AddItemSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The updated list of items in the shopping cart',
        content: {
          'application/json': {
            schema: z.array(CartItemSchema),
          },
        },
      },
      400: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const { userId, bookId } = c.req.valid('json');
      if (!userId || !bookId) {
        return c.json({ error: 'Invalid request data' }, 400);
      }
      const updatedCartItems = await shoppingCartService.addItemToCart(
        userId,
        bookId
      );
      return c.json(updatedCartItems as any, 200);
    } catch (_error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

app.openapi(
  createRoute({
    method: 'get',
    path: '/cart/items',
    tags: ['Shopping Cart'],
    summary: 'Get books in the shopping cart',
    description:
      "Retrieves the list of books currently in the user's shopping cart.",
    parameters: [
      {
        name: 'userId',
        in: 'query',
        required: true,
        schema: { type: 'string' },
        description: 'The user ID',
      },
    ],
    responses: {
      200: {
        description: 'The list of books in the shopping cart',
        content: {
          'application/json': {
            schema: z.array(CartItemSchema),
          },
        },
      },
      400: {
        description: 'Invalid user ID',
        content: {
          'application/json': {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const { userId } = c.req.query();
      if (!userId) {
        return c.json({ error: 'Invalid user ID' }, 400);
      }
      const cartItems = await shoppingCartService.getCartItems(userId);
      return c.json(cartItems as any, 200);
    } catch (_error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

app.openapi(
  createRoute({
    method: 'delete',
    path: '/cart/items',
    tags: ['Shopping Cart'],
    summary: 'Remove a book from the shopping cart',
    description: "Removes a book from the user's shopping cart.",
    parameters: [
      {
        name: 'userId',
        in: 'query',
        required: true,
        schema: { type: 'string' },
        description: 'The user ID',
      },
      {
        name: 'bookId',
        in: 'query',
        required: true,
        schema: { type: 'string' },
        description: 'The book ID (ISBN)',
      },
    ],
    responses: {
      200: {
        description: 'The updated list of items in the shopping cart',
        content: {
          'application/json': {
            schema: z.array(CartItemSchema),
          },
        },
      },
      400: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const { userId, bookId } = c.req.query();
      if (!userId || !bookId) {
        return c.json({ error: 'Invalid request data' }, 400);
      }
      const updatedCartItems = await shoppingCartService.removeItemFromCart(
        userId,
        bookId
      );
      return c.json(updatedCartItems as any, 200);
    } catch (_error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

app.openapi(
  createRoute({
    method: 'get',
    path: '/cart/subtotal',
    tags: ['Shopping Cart'],
    summary: 'Get subtotal of items in the shopping cart',
    description:
      "Calculates and retrieves the subtotal price of all items in the user's shopping cart.",
    parameters: [
      {
        name: 'userId',
        in: 'query',
        required: true,
        schema: { type: 'string' },
        description: 'The user ID',
      },
    ],
    responses: {
      200: {
        description: 'The subtotal price of items in the shopping cart',
        content: {
          'application/json': {
            schema: z.object({
              subtotal: z.number(),
            }),
          },
        },
      },
      400: {
        description: 'Invalid user ID',
        content: {
          'application/json': {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const { userId } = c.req.query();
      if (!userId) {
        return c.json({ error: 'Invalid user ID' }, 400);
      }
      const subtotal = await shoppingCartService.getCartSubtotal(userId);
      return c.json({ subtotal }, 200);
    } catch (_error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

export default app;
