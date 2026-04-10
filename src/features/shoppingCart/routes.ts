/**
 * Shopping Cart Routes
 * 
 * REST API endpoints for managing the shopping cart, including adding items to the cart, removing items from the cart, retrieving the list of items in the cart, and calculating the subtotal of the items in the cart.
 * The routes are implemented using the Hono framework and are designed to handle various scenarios, including successful operations, invalid input handling, and error handling for server issues.
 * The routes are defined with OpenAPI specifications to provide clear documentation and facilitate integration with frontend applications or other services that need to interact with the shopping cart functionality.
 * The routes are structured to ensure that the shopping cart feature remains robust and reliable as changes are made to the codebase, and they should be tested thoroughly to catch any issues early in the development process.
 */
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { CreateShoppingCartItemSchema } from '@/shared/schemas/shoppingCart';
import { ShoppingCartItemListSchema } from '@/shared/schemas/shoppingCart';

const app = new OpenAPIHono();

app.openapi(
    createRoute({
        method: 'post',
        path: '/cart/items',
        tags: ['Shopping Cart'],
        summary: 'Add an item to the shopping cart',
        description: 'Adds a new item to the user\'s shopping cart.',
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
                        schema: ShoppingCartItemListSchema,
                    },
                },
            },
            400: {
                description: 'Invalid request data',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                error: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {   
                            type: 'object',
                            properties: {
                                error: {
                                    type: 'string',
                                },
                            },
                        },
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
            // Here you would typically add the item to the shopping cart in your database
            // For demonstration purposes, we'll just return a success response
            return c.json({ message: 'Item added to shopping cart successfully' });
        } catch (error) {
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
        description: 'Retrieves the list of items currently in the user\'s shopping cart.',
        responses: {
            200: {
                description: 'The list of items in the shopping cart',
                content: {
                    'application/json': {
                        schema: ShoppingCartItemListSchema,
                    },
                },
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                error: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
    }),    
    async (c) => {
        try {
            // Here you would typically retrieve the items from the shopping cart in your database
            // For demonstration purposes, we'll just return an empty list 
            return c.json([]);
        } catch (error) {
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
        description: 'Removes an item from the user\'s shopping cart by its ID.',
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
                        schema: ShoppingCartItemListSchema,
                    },
                },
            },
            400: {
                description: 'Invalid item ID',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                error: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                error: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    async (c) => {
        try {            
            const { itemId } = c.req.param();
            if (!itemId) {
                return c.json({ error: 'Invalid item ID' }, 400);
            }
            // Here you would typically remove the item from the shopping cart in your database
            // For demonstration purposes, we'll just return a success response
            return c.json({ message: 'Item removed from shopping cart successfully' });
        } catch (error) {
            return c.json({ error: 'Internal server error' }, 500);
        }
    }    
);

app.openapi(
    createRoute({
        method: 'get',
        path: '/cart/items',
        tags: ['Shopping Cart'],
        summary: 'Get subtotal of items in the shopping cart',
        description: 'Calculates and retrieves the subtotal price of all items currently in the user\'s shopping cart.',
        responses: {
            200: {
                description: 'The subtotal price of items in the shopping cart',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                subtotal: {
                                    type: 'number',
                                    format: 'float',
                                    description: 'The subtotal price of all items in the shopping cart',
                                },
                            },
                        },
                    },
                },
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                error: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    async (c) => {
        try {
            // Here you would typically calculate the subtotal from the shopping cart items in your database
            // For demonstration purposes, we'll just return a fixed subtotal value
            return c.json({ subtotal: 0.00 });
        } catch (error) {
            return c.json({ error: 'Internal server error' }, 500);
        }
    }    
);

export default app;