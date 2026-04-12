/**
 * Shopping Cart Service
 *
 * Business logic for managing the shopping cart, including adding items to the cart, removing items from the cart, retrieving the list of items in the cart, and calculating the subtotal of the items in the cart.
 * Handles database operations for the shopping cart, including creating, updating, and deleting cart items, as well as retrieving the current state of the shopping cart for a user.
 */

import { and, eq } from 'drizzle-orm';
import type { z } from 'zod';
import { db } from '@/shared/db/client';
import { books, shoppingCart, shoppingCartItems } from '@/shared/db/schema';
import type {
  CreateShoppingCartItemSchema,
  CreateShoppingCartItemType,
} from '@/shared/schemas/shoppingCart';

type ShoppingCartItemType = z.infer<typeof CreateShoppingCartItemSchema>;

export class ShoppingCartService {
  async getCartByUserId(userId: string) {
    const cart = await db
      .select()
      .from(shoppingCart)
      .where(eq(shoppingCart.userId, userId))
      .limit(1);
    return cart[0];
  }

  async getCartSubtotal(userId: string) {
    const cart = await this.getCartByUserId(userId);
    if (!cart) {
      return 0;
    }
    return this.calculateCartSubtotal(cart.id);
  }

  async addItemToCart(
    userId: string,
    bookId: string
  ): Promise<ShoppingCartItemType[]> {
    let cart = await this.getCartByUserId(userId);
    if (!cart) {
      const [newCart] = await db
        .insert(shoppingCart)
        .values({ userId })
        .returning();
      cart = newCart;
    }
    const [newItem] = await db
      .insert(shoppingCartItems)
      .values({
        shoppingCartId: cart!.id,
        bookId: bookId,
      })
      .returning();
    if (!newItem) {
      throw new Error('Failed to add item to cart');
    }
    return this.getCartItems(userId);
  }

  async getCartItems(userId: string): Promise<ShoppingCartItemType[]> {
    const cart = await this.getCartByUserId(userId);
    if (!cart) {
      return [];
    }
    const items = await db
      .select()
      .from(shoppingCartItems)
      .where(eq(shoppingCartItems.shoppingCartId, cart.id));

    const itemsWithBooks = await Promise.all(
      items.map(async (item) => {
        const book = await db
          .select()
          .from(books)
          .where(eq(books.id, item.bookId))
          .limit(1);
        return {
          id: item.id,
          shoppingCartId: item.shoppingCartId,
          bookId: item.bookId,
          price: book[0] ? parseFloat(book[0].price) : 0,
        };
      })
    );
    return itemsWithBooks as unknown as ShoppingCartItemType[];
  }

  async removeItemFromCart(
    userId: string,
    bookId: string
  ): Promise<ShoppingCartItemType[]> {
    const cart = await this.getCartByUserId(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    await db
      .delete(shoppingCartItems)
      .where(
        and(
          eq(shoppingCartItems.shoppingCartId, cart.id),
          eq(shoppingCartItems.bookId, bookId)
        )
      );
    return this.getCartItems(userId);
  }

  async calculateCartSubtotal(cartId: string): Promise<number> {
    const items = await db
      .select()
      .from(shoppingCartItems)
      .where(eq(shoppingCartItems.shoppingCartId, cartId));

    let subtotal = 0;
    for (const item of items) {
      const book = await db
        .select()
        .from(books)
        .where(eq(books.id, item.bookId))
        .limit(1);
      if (book[0]) {
        subtotal += parseFloat(book[0].price);
      }
    }
    return subtotal;
  }
}
