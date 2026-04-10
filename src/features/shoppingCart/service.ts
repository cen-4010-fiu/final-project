/**
 * Shopping Cart Service
 *
 * Business logic for managing the shopping cart, including adding items to the cart, removing items from the cart, retrieving the list of items in the cart, and calculating the subtotal of the items in the cart.
 * Handles database operations for the shopping cart, including creating, updating, and deleting cart items, as well as retrieving the current state of the shopping cart for a user.
 */

import { and, eq } from 'drizzle-orm';

import { db } from '@/shared/db/client';
import { shoppingCartItems } from '@/shared/db/schema';
import type {
  CreateShoppingCartItemSchema,
  CreateShoppingCartItemType,
} from '@/shared/schemas/shoppingCart';
import type { z } from 'zod';

type ShoppingCartItemType = z.infer<typeof CreateShoppingCartItemSchema>;

// ...existing code...

// ...existing code...
export class ShoppingCartService {
  getCartSubtotal(_arg0: string) {
    throw new Error('Method not implemented.');
  }
  async addItemToCart(
    item: CreateShoppingCartItemType
  ): Promise<ShoppingCartItemType[]> {
    const [newItem] = await db
      .insert(shoppingCartItems)
      .values(item)
      .returning();
    return this.getCartItems(newItem!.shoppingCartId);
  }

  async getCartItems(cartId: string): Promise<ShoppingCartItemType[]> {
    const items = await db
      .select()
      .from(shoppingCartItems)
      .where(eq(shoppingCartItems.shoppingCartId, cartId));
    return items.map((item) => ({
      id: item.id,
      shoppingCartId: item.shoppingCartId,
      isbn: item.bookIsbn,
      quantity: item.quantity,
    })) as unknown as ShoppingCartItemType[];
  }

  async removeItemFromCart(
    cartId: string,
    itemId: string
  ): Promise<ShoppingCartItemType[]> {
    await db
      .delete(shoppingCartItems)
      .where(
        and(
          eq(shoppingCartItems.shoppingCartId, cartId),
          eq(shoppingCartItems.id, itemId)
        )
      );
    return this.getCartItems(cartId);
  }

  async calculateCartSubtotal(cartId: string): Promise<number> {
    const items = await this.getCartItems(cartId);
    return items.reduce((subtotal, item) => {
      // Assuming we have a way to get the price of the book by its ISBN
      const price = this.getBookPrice(item.isbn);
      return subtotal + price * item.quantity;
    }, 0);
  }

  private getBookPrice(_isbn: string): number {
    return 10; // Assume each book costs $10 for demonstration purposes
  }
}
