import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { DiscountBooksByPublisherSchema } from '@/shared/schemas';
import { bookBrowsingService } from './service';

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

const ratedBookResponseSchema = bookResponseSchema.extend({
  averageRating: z.number(),
});

const getBooksByGenreRoute = createRoute({
  method: 'get',
  path: '/books/genre/{genre}',
  tags: ['Book Browsing'],
  summary: 'Get books by genre',
  description: 'Retrieves all books for a specific genre.',
  request: {
    params: z.object({
      genre: z.string().openapi({
        example: 'Fantasy',
      }),
    }),
  },
  responses: {
    200: {
      description: 'List of books by genre',
      content: {
        'application/json': {
          schema: z.array(bookResponseSchema),
        },
      },
    },
  },
});

app.openapi(getBooksByGenreRoute, async (c) => {
  const { genre } = c.req.valid('param');
  const books = await bookBrowsingService.getBooksByGenre(genre);

  return c.json(books, 200);
});

const getTopSellersRoute = createRoute({
  method: 'get',
  path: '/books/top-sellers',
  tags: ['Book Browsing'],
  summary: 'Get top sellers',
  description: 'Retrieves the top 10 books with the most copies sold.',
  responses: {
    200: {
      description: 'Top-selling books',
      content: {
        'application/json': {
          schema: z.array(bookResponseSchema),
        },
      },
    },
  },
});

app.openapi(getTopSellersRoute, async (c) => {
  const books = await bookBrowsingService.getTopSellers();

  return c.json(books, 200);
});

const getBooksByMinimumRatingRoute = createRoute({
  method: 'get',
  path: '/books/min-rating/{rating}',
  tags: ['Book Browsing'],
  summary: 'Get books by minimum rating',
  description:
    'Retrieves books whose average rating is greater than or equal to the given value.',
  request: {
    params: z.object({
      rating: z.coerce.number().openapi({
        example: 4,
      }),
    }),
  },
  responses: {
    200: {
      description: 'List of books filtered by minimum rating',
      content: {
        'application/json': {
          schema: z.array(ratedBookResponseSchema),
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

app.openapi(getBooksByMinimumRatingRoute, async (c) => {
  try {
    const { rating } = c.req.valid('param');

    if (rating < 0 || rating > 5) {
      return c.json({ message: 'Rating must be between 0 and 5.' }, 400);
    }

    const books = await bookBrowsingService.getBooksByMinimumRating(rating);

    return c.json(books, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch books';

    return c.json({ message }, 400);
  }
});

const discountBooksByPublisherRoute = createRoute({
  method: 'patch',
  path: '/books/discount',
  tags: ['Book Browsing'],
  summary: 'Discount books by publisher',
  description:
    'Updates the price of all books for a given publisher by a discount percent.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: DiscountBooksByPublisherSchema,
        },
      },
    },
  },
  responses: {
    204: {
      description: 'Discount applied successfully',
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

app.openapi(discountBooksByPublisherRoute, async (c) => {
  try {
    const data = c.req.valid('json');

    await bookBrowsingService.discountBooksByPublisher(data);

    return c.body(null, 204);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to apply discount';

    return c.json({ message }, 400);
  }
});

export default app;