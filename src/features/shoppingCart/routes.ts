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
import { CreateShoppingCartItemSchema } from '@/shared/schemas/shoppingCart';
import { ShoppingCartService } from './service';

const ErrorSchema = z.object({
  error: z.string(),
});

const app = new OpenAPIHono();
const shoppingCartService = new ShoppingCartService();

app.openapi(
  createRoute({
    method: 'post',
    path: '/cart/items',
    tags: ['Shopping Cart'],
    summary: 'Add an item to the shopping cart',
    description: "Adds a new item to the user's shopping cart.",
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateShoppingCartItemSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The updated list of items in the shopping cart',
        content: {
          'application/json': {
            schema: z.array(CreateShoppingCartItemSchema),
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
      const { cartId, isbn, quantity } = c.req.valid('json');
      if (!cartId || !isbn || quantity < 1) {
        return c.json({ error: 'Invalid request data' }, 400);
      }
      const updatedCartItems = await shoppingCartService.addItemToCart({
        cartId,
        isbn,
        quantity,
        shoppingCartId: '',
        bookIsbn: '',
      });
      return c.json(updatedCartItems, 200);
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
    summary: 'Get items in the shopping cart',
    description:
      "Retrieves the list of items currently in the user's shopping cart.",
    responses: {
      200: {
        description: 'The list of items in the shopping cart',
        content: {
          'application/json': {
            schema: z.array(CreateShoppingCartItemSchema),
          },
        },
      },
      400: {
        description: 'Invalid cart ID',
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
      const { cartId } = c.req.query();
      if (!cartId) {
        return c.json({ error: 'Invalid cart ID' }, 400);
      }
      const cartItems = await shoppingCartService.getCartItems(cartId);
      return c.json(cartItems, 200);
    } catch (_error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

app.openapi(
  createRoute({
    method: 'delete',
    path: '/cart/items/:itemId',
    tags: ['Shopping Cart'],
    summary: 'Remove an item from the shopping cart',
    description: "Removes an item from the user's shopping cart by its ID.",
    parameters: [
      {
        name: 'itemId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
        description: 'The ID of the item to remove from the shopping cart',
      },
    ],
    responses: {
      200: {
        description: 'The updated list of items in the shopping cart',
        content: {
          'application/json': {
            schema: z.array(CreateShoppingCartItemSchema),
          },
        },
      },
      400: {
        description: 'Invalid item ID',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const { itemId } = c.req.param();
      const { cartId } = c.req.query();
      if (!itemId || !cartId) {
        return c.json({ error: 'Invalid item ID or cart ID' }, 400);
      }
      // Here you would typically remove the item from the shopping cart in your database
      // For demonstration purposes, we'll just return the updated cart
      const updatedCartItems = await shoppingCartService.removeItemFromCart(
        cartId,
        itemId
      );
      return c.json(updatedCartItems, 200);
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
      "Calculates and retrieves the subtotal price of all items currently in the user's shopping cart.",
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
        description: 'Invalid cart ID',
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
      const { cartId } = c.req.query();
      if (!cartId) {
        return c.json({ error: 'Invalid cart ID' }, 400);
      }
      const subtotal = await shoppingCartService.calculateCartSubtotal(cartId);
      return c.json({ subtotal }, 200);
    } catch (_error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

export default app;
