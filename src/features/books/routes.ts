/**
 * Book Routes
 *
 * REST API endpoints for Book Details feature (Feature 4).
 *
 * Endpoints:
 * - POST   /api/books                          Create a book
 * - POST   /api/books/authors                  Create an author
 * - GET    /api/books/authors/:authorId/books  Get books by author
 * - GET    /api/books/:isbn                    Get a book by ISBN
 */
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { Hono } from 'hono';
import {
  AuthorSchema,
  BookSchema,
  CreateAuthorSchema,
  CreateBookSchema,
  ErrorSchema,
} from '@/shared/schemas';
import { bookService } from './service';

const app = new OpenAPIHono();

// POST /api/books/authors
app.openapi(
  createRoute({
    method: 'post',
    path: '/authors',
    tags: ['Books'],
    summary: 'Create a new author',
    description:
      'Registers a new author with first name, last name, and optional biography and publisher.',
    request: {
      body: { content: { 'application/json': { schema: CreateAuthorSchema } } },
    },
    responses: {
      201: {
        description: 'Author created successfully',
        content: { 'application/json': { schema: AuthorSchema } },
      },
      500: {
        description: 'Failed to create author',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json');
    const author = await bookService.createAuthor(body);
    if (!author) {
      return c.json({ error: 'Failed to create author' }, 500);
    }
    return c.json(author, 201);
  }
);

// POST /api/books
app.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Books'],
    summary: 'Create a new book',
    description:
      'An administrator creates a book with ISBN, name, description, price, author, ' +
      'genre, publisher, year published, and copies sold.',
    request: {
      body: { content: { 'application/json': { schema: CreateBookSchema } } },
    },
    responses: {
      201: {
        description: 'Book created successfully',
        content: { 'application/json': { schema: BookSchema } },
      },
      400: {
        description: 'ISBN already exists or author not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      500: {
        description: 'Failed to create book',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json');
    if (await bookService.isbnExists(body.isbn)) {
      return c.json({ error: 'A book with that ISBN already exists' }, 400);
    }
    const authorExists = await bookService.getAuthorById(body.authorId);
    if (!authorExists) {
      return c.json({ error: 'Author not found' }, 400);
    }
    const book = await bookService.createBook(body);
    if (!book) {
      return c.json({ error: 'Failed to create book' }, 500);
    }
    return c.json(book, 201);
  }
);

// Use plain Hono for GET routes to avoid OpenAPIHono composition issues
const getRoutes = new Hono();

// GET /api/books/authors/:authorId/books — must be before /:isbn
getRoutes.get('/authors/:authorId/books', async (c) => {
  const authorId = c.req.param('authorId');
  const author = await bookService.getAuthorById(authorId);
  if (!author) {
    return c.json({ error: 'Author not found' }, 404);
  }
  const books = await bookService.getBooksByAuthorId(authorId);
  return c.json(books, 200);
});

// GET /api/books/:isbn — must be after all specific routes
getRoutes.get('/:isbn', async (c) => {
  const isbn = c.req.param('isbn');
  const book = await bookService.getBookByIsbn(isbn);
  if (!book) {
    return c.json({ error: 'Book not found' }, 404);
  }
  return c.json(book, 200);
});

app.route('/', getRoutes);

export default app;
