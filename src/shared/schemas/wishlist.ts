import { z } from 'zod';

export const WishlistSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
});

export const CreateWishlistSchema = z.object({
  userId: z.string(),
  name: z.string(),
});

export const WishlistItemSchema = z.object({
  id: z.string(),
  wishListId: z.string(),
  bookIsbn: z.string(),
});

export const AddWishlistItemSchema = z.object({
  bookIsbn: z.string(),
});