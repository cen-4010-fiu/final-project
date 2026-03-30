import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import {
  BookListSchema,
  DiscountBooksByPublisherSchema,
  ErrorSchema,
  GenreParam,
  MinimumRatingParam,
  RatedBookListSchema,
  TopSellerListSchema,
} from '@/shared/schemas';
import { bookBrowsingService } from './services';

const app = new OpenAPIHono();

const getBooksByGenreRoute = createRoute({
  method: 'get',
  path: '/books/genre/{genre}',
  tags: ['Book Browsing'],
  summary: 'Get books by genre',
  description: 'Retrieves all books for a specific genre.',
  request: {
    params: GenreParam,
  },
  responses: {
    200: {
      description: 'List of books by genre',
      content: {
        'application/json': {
          schema: BookListSchema,
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
          schema: TopSellerListSchema,
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
    params: MinimumRatingParam,
  },
  responses: {
    200: {
      description: 'List of books filtered by minimum rating',
      content: {
        'application/json': {
          schema: RatedBookListSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

app.openapi(getBooksByMinimumRatingRoute, async (c) => {
  try {
    const { rating } = c.req.valid('param');
    const books = await bookBrowsingService.getBooksByMinimumRating(rating);

    return c.json(books, 200);
  } catch {
    return c.json({ error: 'Failed to fetch books' }, 400);
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
          schema: ErrorSchema,
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
  } catch {
    return c.json({ error: 'Failed to apply discount' }, 400);
  }
});

export default app;