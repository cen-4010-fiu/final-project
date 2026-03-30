
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { CreateAuthorSchema, CreateBookSchema } from '@/shared/schemas';
import { bookDetailsService } from './service';

const app = new OpenAPIHono();

const errorSchema = z.object({
  message: z.string(),
});

const bookResponseSchema = z.object({
  id: z.string(),
  isbn: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  authorId: z.string(),
  genre: z.string(),
  publisher: z.string(),
  yearPublished: z.number(),
  copiesSold: z.number(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

const createBookRoute = createRoute({
  method: 'post',
  path: '/books',
  tags: ['Book Details'],
  summary: 'Create a book',
  description: 'Allows an administrator to create a new book.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateBookSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Book created successfully',
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
});

app.openapi(createBookRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    await bookDetailsService.createBook(data);
    return c.body(null, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create book';
    return c.json({ message }, 400);
  }
});

const getBookByIsbnRoute = createRoute({
  method: 'get',
  path: '/books/{isbn}',
  tags: ['Book Details'],
  summary: 'Get book details by ISBN',
  description: 'Retrieves a book by its ISBN.',
  request: {
    params: z.object({
      isbn: z.string().openapi({
        example: '9780134685991',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Book details',
      content: {
        'application/json': {
          schema: bookResponseSchema,
        },
      },
    },
    404: {
      description: 'Book not found',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
});

app.openapi(getBookByIsbnRoute, async (c) => {
  const { isbn } = c.req.valid('param');
  const book = await bookDetailsService.getBookByIsbn(isbn);

  if (!book) {
    return c.json({ message: 'Book not found' }, 404);
  }

  return c.json(book, 200);
});

const createAuthorRoute = createRoute({
  method: 'post',
  path: '/authors',
  tags: ['Book Details'],
  summary: 'Create an author',
  description: 'Allows an administrator to create a new author.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateAuthorSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Author created successfully',
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
});

app.openapi(createAuthorRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    await bookDetailsService.createAuthor(data);
    return c.body(null, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create author';
    return c.json({ message }, 400);
  }
});

const getBooksByAuthorRoute = createRoute({
  method: 'get',
  path: '/authors/{authorId}/books',
  tags: ['Book Details'],
  summary: 'Get books by author',
  description: 'Retrieves all books associated with an author.',
  request: {
    params: z.object({
      authorId: z.string().openapi({
        example: 'author_123',
      }),
    }),
  },
  responses: {
    200: {
      description: 'List of books by author',
      content: {
        'application/json': {
          schema: z.array(bookResponseSchema),
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
});

app.openapi(getBooksByAuthorRoute, async (c) => {
  try {
    const { authorId } = c.req.valid('param');
    const authorBooks = await bookDetailsService.getBooksByAuthorId(authorId);
    return c.json(authorBooks, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch books';
    return c.json({ message }, 400);
  }
});

export default app;