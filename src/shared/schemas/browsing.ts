import { z } from '@hono/zod-openapi';
import { BookListSchema, BookSchema } from './book';

export const GenreParam = z
  .object({
    genre: z.string().min(1),
  })
  .openapi('GenreParam');

export const MinimumRatingParam = z
  .object({
    rating: z.coerce.number().min(0).max(5),
  })
  .openapi('MinimumRatingParam');

export const DiscountBooksByPublisherSchema = z
  .object({
    publisher: z.string().min(1),
    discountPercent: z.number().min(0).max(100),
  })
  .openapi('DiscountBooksByPublisher');

export const RatedBookSchema = BookSchema.extend({
  averageRating: z.number(),
}).openapi('RatedBook');

export const RatedBookListSchema = z
  .array(RatedBookSchema)
  .openapi('RatedBookList');

export const TopSellerListSchema = BookListSchema.openapi('TopSellerList');
