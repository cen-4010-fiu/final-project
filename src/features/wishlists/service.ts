/**
 * Wishlist Service
 *
 * Business logic for wishlist management.
 * Handles database operations for Feature 6 (Wish List Management).
 */

import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { db, wishList, wishListItems, books } from '@/shared/db';
import type { CreateWishlistSchema, AddWishlistItemSchema } from '@/shared/schemas';

type CreateWishlistInput = z.infer<typeof CreateWishlistSchema>;
type AddWishlistItemInput = z.infer<typeof AddWishlistItemSchema>;

export const wishlistService = {
  async createWishlist(data: CreateWishlistInput) {
    const [wishlist] = await db.insert(wishList).values(data).returning();
    return wishlist;
  },

  async getWishlistById(wishlistId: string) {
    const [wishlist] = await db
      .select()
      .from(wishList)
      .where(eq(wishList.id, wishlistId))
      .limit(1);
    return wishlist;
  },

  async addBookToWishlist(wishlistId: string, data: AddWishlistItemInput) {
    const [item] = await db
      .insert(wishListItems)
      .values({ wishListId: wishlistId, bookIsbn: data.bookIsbn })
      .returning();
    return item;
  },

  async removeBookFromWishlist(wishlistId: string, bookIsbn: string) {
    const [deleted] = await db
      .delete(wishListItems)
      .where(eq(wishListItems.wishListId, wishlistId))
      .returning();
    return deleted;
  },

  async getWishlistBooks(wishlistId: string) {
    return db
      .select({
        isbn: books.isbn,
        name: books.name,
        description: books.description,
        price: books.price,
        genre: books.genre,
        publisher: books.publisher,
        yearPublished: books.yearPublished,
        copiesSold: books.copiesSold,
      })
      .from(wishListItems)
      .innerJoin(books, eq(wishListItems.bookIsbn, books.isbn))
      .where(eq(wishListItems.wishListId, wishlistId));
  },

  async nameExists(name: string) {
    const [row] = await db
      .select({ id: wishList.id })
      .from(wishList)
      .where(eq(wishList.name, name))
      .limit(1);
    return !!row;
  },
};