import { db } from './client';
import {
  authors,
  books,
  creditCards,
  shoppingCart,
  shoppingCartItems,
  users,
  wishList,
  wishListItems,
} from './schema';

export async function clearAllTables() {
  await db.delete(shoppingCartItems);
  await db.delete(shoppingCart);
  await db.delete(wishListItems);
  await db.delete(wishList);
  await db.delete(books);
  await db.delete(authors);
  await db.delete(creditCards);
  await db.delete(users);
}
