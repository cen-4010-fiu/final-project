/**
 * Wishlist Routes
 *
 * REST API endpoints for Wish List Management feature (Feature 6).
 *
 * Endpoints:
 * - POST   /api/wishlists                        Create a wishlist
 * - POST   /api/wishlists/:wishlistId/books       Add a book to a wishlist
 * - DELETE /api/wishlists/:wishlistId/books/:isbn Remove a book from a wishlist
 * - GET    /api/wishlists/:wishlistId/books       Get all books in a wishlist
 */
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import {
  AddWishlistItemSchema,
  CreateWishlistSchema,
  ErrorSchema,
  WishlistItemSchema,
  WishlistSchema,
} from '@/shared/schemas';
import { wishlistService } from './service';

const app = new OpenAPIHono();

// POST /api/wishlists
app.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Wishlists'],
    summary: 'Create a wishlist',
    description: 'Creates a new wishlist with a unique name for a user.',
    request: {
      body: {
        content: { 'application/json': { schema: CreateWishlistSchema } },
      },
    },
    responses: {
      201: {
        description: 'Wishlist created successfully',
        content: { 'application/json': { schema: WishlistSchema } },
      },
      400: {
        description: 'Wishlist name already exists',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      500: {
        description: 'Failed to create wishlist',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json');
    if (await wishlistService.nameExists(body.name)) {
      return c.json({ error: 'A wishlist with that name already exists' }, 400);
    }
    const wishlist = await wishlistService.createWishlist(body);
    if (!wishlist) {
      return c.json({ error: 'Failed to create wishlist' }, 500);
    }
    return c.json(wishlist, 201);
  }
);

// POST /api/wishlists/:wishlistId/books
app.openapi(
  createRoute({
    method: 'post',
    path: '/{wishlistId}/books',
    tags: ['Wishlists'],
    summary: 'Add a book to a wishlist',
    description: 'Adds a book by ISBN to the specified wishlist.',
    request: {
      body: {
        content: { 'application/json': { schema: AddWishlistItemSchema } },
      },
    },
    responses: {
      201: {
        description: 'Book added to wishlist',
        content: { 'application/json': { schema: WishlistItemSchema } },
      },
      404: {
        description: 'Wishlist not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      500: {
        description: 'Failed to add book',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const wishlistId = c.req.param('wishlistId');
    const body = c.req.valid('json');
    const wishlist = await wishlistService.getWishlistById(wishlistId);
    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }
    const item = await wishlistService.addBookToWishlist(wishlistId, body);
    if (!item) {
      return c.json({ error: 'Failed to add book to wishlist' }, 500);
    }
    return c.json(item, 201);
  }
);

// DELETE /api/wishlists/:wishlistId/books/:isbn
app.openapi(
  createRoute({
    method: 'delete',
    path: '/{wishlistId}/books/{isbn}',
    tags: ['Wishlists'],
    summary: 'Remove a book from a wishlist',
    description: 'Removes a book by ISBN from the specified wishlist.',
    responses: {
      200: {
        description: 'Book removed from wishlist',
        content: { 'application/json': { schema: WishlistItemSchema } },
      },
      404: {
        description: 'Wishlist not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      500: {
        description: 'Failed to remove book',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const wishlistId = c.req.param('wishlistId');
    const isbn = c.req.param('isbn');
    const wishlist = await wishlistService.getWishlistById(wishlistId);
    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }
    const deleted = await wishlistService.removeBookFromWishlist(
      wishlistId,
      isbn
    );
    if (!deleted) {
      return c.json({ error: 'Failed to remove book from wishlist' }, 500);
    }
    return c.json(deleted, 200);
  }
);

// GET /api/wishlists/:wishlistId/books
app.openapi(
  createRoute({
    method: 'get',
    path: '/{wishlistId}/books',
    tags: ['Wishlists'],
    summary: 'Get books in a wishlist',
    description: 'Returns all books in the specified wishlist.',
    responses: {
      200: {
        description: 'List of books',
        content: { 'application/json': { schema: z.array(z.any()) } },
      },
      404: {
        description: 'Wishlist not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const wishlistId = c.req.param('wishlistId');
    const wishlist = await wishlistService.getWishlistById(wishlistId);
    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }
    const booksList = await wishlistService.getWishlistBooks(wishlistId);
    return c.json(booksList, 200);
  }
);

export default app;
