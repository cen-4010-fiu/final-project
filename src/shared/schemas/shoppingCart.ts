import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
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
    price: z.number().optional(),
  })
  .openapi('CreateShoppingCartItem');
type CreateShoppingCartItemType = z.infer<typeof CreateShoppingCartItemSchema>;
export type { CreateShoppingCartItemType };
