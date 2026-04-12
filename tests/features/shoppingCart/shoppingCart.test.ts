/**
 * Shopping Cart API Tests
 *
 * This test suite covers the API endpoints for managing the shopping cart, including adding items to the cart, removing items from the cart, retrieving the list of items in the cart, and calculating the subtotal of the items in the cart.
 * The tests are designed to validate the functionality of each endpoint, ensuring that they handle various scenarios correctly, such as successful operations, invalid input handling, and error handling for server issues.
 * The tests are structured to provide comprehensive coverage of the shopping cart API and should be run regularly to catch any regressions or issues that may arise during development.
 *
 * The tests are implemented using a testing framework (e.g., Jest, Mocha) and may utilize tools like Supertest for making HTTP requests to the API endpoints. Each test case should assert the expected outcomes based on the input provided, and any necessary setup or teardown operations should be included to maintain test isolation and reliability.
 * The test suite should be organized in a way that allows for easy maintenance and scalability as the shopping cart feature evolves, and it should be integrated into the continuous integration pipeline to ensure that any issues are detected early in the development process.
 *
 */

import { beforeEach, describe, expect, it } from 'bun:test';
import { createApp } from '@/app';
import { ShoppingCartService } from '@/features/shoppingCart/service';
import { db } from '@/shared/db';
import {
  authors,
  books,
  shoppingCart,
  shoppingCartItems,
  users,
} from '@/shared/db/schema';

const app = createApp();

let testUserId: string;
let testBookId: string;

beforeEach(async () => {
  await db.delete(shoppingCartItems);
  await db.delete(shoppingCart);
  await db.delete(users);
  await db.delete(books);
  await db.delete(authors);

  const defaultPassword = await Bun.password.hash('password123', {
    algorithm: 'bcrypt',
    cost: 10,
  });

  const [jsmith] = await db
    .insert(users)
    .values({
      username: `jsmith-${crypto.randomUUID()}`,
      password: defaultPassword,
      name: 'John Smith',
    })
    .returning({ id: users.id });

  testUserId = jsmith!.id;

  const [orwell] = await db
    .insert(authors)
    .values({
      firstName: 'George',
      lastName: 'Orwell',
      biography: 'Test author',
      publisher: 'Test Pub',
    })
    .returning({ id: authors.id });

  const [book] = await db
    .insert(books)
    .values({
      isbn: `978-3-16-148410-${crypto.randomUUID().slice(0, 4)}`,
      name: '1984',
      price: '10.00',
      authorId: orwell!.id,
      genre: 'Dystopian',
      publisher: 'Test Pub',
      yearPublished: 1949,
      copiesSold: 0,
    })
    .returning({ id: books.id });

  testBookId = book!.id;

  await db.insert(shoppingCart).values({ userId: testUserId });
});

interface ErrorResponse {
  error: string;
}

async function addItem(data: { userId: string; bookId: string }) {
  return await app.request('/api/shopping-cart/cart/items', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getCartItems(userId: string) {
  return await app.request(`/api/shopping-cart/cart/items?userId=${userId}`, {
    method: 'GET',
  });
}

async function removeItem(userId: string, bookId: string) {
  return await app.request(
    `/api/shopping-cart/cart/items?userId=${userId}&bookId=${bookId}`,
    {
      method: 'DELETE',
    }
  );
}

async function calculateSubtotal(userId: string) {
  return await app.request(
    `/api/shopping-cart/cart/subtotal?userId=${userId}`,
    {
      method: 'GET',
    }
  );
}

describe('Shopping Cart API', () => {
  it('should add a book to the cart successfully', async () => {
    const response = await addItem({
      userId: testUserId,
      bookId: testBookId,
    });
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bookId: testBookId,
        }),
      ])
    );
  });

  it('should return 400 for invalid input', async () => {
    const response = await app.request('/api/shopping-cart/cart/items', {
      method: 'POST',
      body: JSON.stringify({ userId: 'invalid' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(400);
  });
});

describe('Shopping Cart Service', () => {
  const service = new ShoppingCartService();

  it('should add a book to the cart and return the updated cart items', async () => {
    const cartItems = await service.addItemToCart(testUserId, testBookId);
    expect(Array.isArray(cartItems)).toBe(true);
    expect(cartItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bookId: testBookId,
        }),
      ])
    );
  });

  it('should retrieve the list of books in the cart', async () => {
    await service.addItemToCart(testUserId, testBookId);
    const cartItems = await service.getCartItems(testUserId);
    expect(Array.isArray(cartItems)).toBe(true);
    expect(cartItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bookId: testBookId,
        }),
      ])
    );
  });

  it('should remove a book from the cart', async () => {
    await service.addItemToCart(testUserId, testBookId);
    const updatedCartItems = await service.removeItemFromCart(
      testUserId,
      testBookId
    );
    expect(Array.isArray(updatedCartItems)).toBe(true);
    expect(updatedCartItems).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bookId: testBookId,
        }),
      ])
    );
  });

  it('should calculate the subtotal of the items in the cart', async () => {
    await service.addItemToCart(testUserId, testBookId);
    const subtotal = await service.getCartSubtotal(testUserId);
    expect(typeof subtotal).toBe('number');
    expect(subtotal).toBe(10);
  });
});

describe('Shopping Cart API - Get Items', () => {
  it('should retrieve books in the cart successfully', async () => {
    await addItem({
      userId: testUserId,
      bookId: testBookId,
    });
    const response = await getCartItems(testUserId);
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bookId: testBookId,
        }),
      ])
    );
  });
});

describe('Shopping Cart API - Remove Item', () => {
  it('should remove a book from the cart successfully', async () => {
    await addItem({
      userId: testUserId,
      bookId: testBookId,
    });
    const response = await removeItem(testUserId, testBookId);
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bookId: testBookId,
        }),
      ])
    );
  });
});

describe('Shopping Cart API - Calculate Subtotal', () => {
  it('should calculate the subtotal of the items in the cart successfully', async () => {
    await addItem({
      userId: testUserId,
      bookId: testBookId,
    });
    const response = await calculateSubtotal(testUserId);
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(typeof responseData).toBe('object');
    expect(responseData.subtotal).toBe(10);
  });
});

describe('Shopping Cart API - Error Handling', () => {
  it('should return 400 for invalid input', async () => {
    const response = await app.request('/api/shopping-cart/cart/items', {
      method: 'POST',
      body: JSON.stringify({ userId: 'invalid' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(400);
  });
});
