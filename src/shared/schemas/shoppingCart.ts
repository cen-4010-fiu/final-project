import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { shoppingCartItems } from '@/shared/db/schema';

const baseInsertSchema = createInsertSchema(shoppingCartItems);
export const ShoppingCartItemSchema =
  createSelectSchema(shoppingCartItems).openapi('ShoppingCartItem');
export const ShoppingCartItemListSchema = z
  .array(ShoppingCartItemSchema)
  .openapi('ShoppingCartItemList');
export const CreateShoppingCartItemSchema = baseInsertSchema
  .omit({ id: true })
  .extend({
    cartId: z.string(),
    isbn: z.string(),
    quantity: z.number().min(1),
  })
  .openapi('CreateShoppingCartItem');
type CreateShoppingCartItemType = z.infer<typeof CreateShoppingCartItemSchema>;
export type { CreateShoppingCartItemType };
