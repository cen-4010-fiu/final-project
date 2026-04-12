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

import { describe, expect, it } from 'bun:test';
import { createApp } from '@/app';
import { ShoppingCartService } from '@/features/shoppingCart/service';
import { db } from '@/shared/db';
import type { CreateShoppingCartItemType } from '@/shared/schemas/shoppingCart';
const app = createApp();

interface ErrorResponse {
  error: string;
}

async function addItem(data: {
  id: string;
  shoppingCartId: string;
  bookIsbn: string;
  price?: number;
}) {
  return await app.request('/api/shopping-cart/cart/items', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
}
async function addInvalidItem(data: {
  id: string;
  shoppingCartId: string;
  price?: number;
}) {
  return await app.request('/api/shopping-cart/cart/items', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
}


async function getCartItems(shoppingCartId: string) {
  return await app.request(`/api/shopping-cart/cart/items?shoppingCartId=${shoppingCartId}`, {
    method: 'GET',
    body: JSON.stringify({ shoppingCartId }),
    headers: { 'Content-Type': 'application/json' },
  });
}

async function removeItem(shoppingCartId: string, itemId: string) {
  return await app.request(
    `/api/shopping-cart/cart/items/${itemId}?cartId=${shoppingCartId}`,
    {
      method: 'DELETE',
      //body: JSON.stringify({ shoppingCartId, itemId }),
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

async function calculateSubtotal(shoppingCartId: string) {
  return await app.request(
    `/api/shopping-cart/cart/subtotal?shoppingCartId=${shoppingCartId}`,
    {
      method: 'GET',
      body: JSON.stringify({ shoppingCartId }),
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

describe('Shopping Cart API', () => {
  it('should add an item to the cart successfully', async () => {
    const newItem = {
      id: '1',
      shoppingCartId: 'cart123',
      bookIsbn: '978-3-16-148410-0',
      price: 10.00,
    };
    const response = await addItem(newItem);
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          shoppingCartId: 'cart123',
          bookIsbn: '978-3-16-148410-0',
        }),
      ])
    );
  });

  it('should return 400 for invalid input', async () => {
    const response = await app.request('/api/shopping-cart/cart/items', {
      method: 'POST',
      body: JSON.stringify({ id: '2' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(400);
  });

  it('should return 500 for server errors', async () => {
    // Simulate a server error by mocking the database operation to throw an error
    const originalInsert = db.insert;
    db.insert = () => {
      throw new Error('Database error');
    };
    const newItem = {
      id: '3',
      shoppingCartId: 'cart123',
      bookIsbn: '978-3-16-148410-0',
      price: 10.00,
    };
    const response = await addItem(newItem);
    expect(response.status).toBe(500);
    const responseData = JSON.parse(await response.text()) as ErrorResponse;
    expect(responseData.error).toBe('Internal server error');
    // Restore the original database insert function
    db.insert = originalInsert;
  });
});
describe('Shopping Cart Service', () => {
  const service = new ShoppingCartService();
  it('should add an item to the cart and return the updated cart items', async () => {
    const newItem = {
      shoppingCartId: 'cart123',
      bookIsbn: '978-3-16-148410-0',
    };
    const cartItems = await service.addItemToCart(
      Object.assign({}, newItem) as unknown as CreateShoppingCartItemType
    );
    expect(Array.isArray(cartItems)).toBe(true);
    expect(cartItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          shoppingCartId: 'cart123',
          bookIsbn: '978-3-16-148410-0',
        }),
      ])
    );
  });

  it('should retrieve the list of items in the cart', async () => {
    const cartItems = await service.getCartItems('cart123');
    expect(Array.isArray(cartItems)).toBe(true);
    expect(cartItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          shoppingCartId: 'cart123',
          bookIsbn: '978-3-16-148410-0',
        }),
      ])
    );
  });

  it('should remove an item from the cart and return the updated cart items', async () => {
    const cartItemsBefore = await service.getCartItems('cart123');
    if (!cartItemsBefore[0]) {
      throw new Error('No items in cart');
    }
    const itemIdToRemove = cartItemsBefore[0].shoppingCartId.toString();
    const updatedCartItems = await service.removeItemFromCart(
      'cart123',
      itemIdToRemove
    );
    expect(Array.isArray(updatedCartItems)).toBe(true);
    expect(updatedCartItems).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: itemIdToRemove,
        }),
      ])
    );
  });

  it('should calculate the subtotal of the items in the cart', async () => {
    const subtotal = await service.calculateCartSubtotal('cart123');
    expect(typeof subtotal).toBe('number');
    expect(subtotal).toBeGreaterThanOrEqual(0);
  });
});
 
describe('Shopping Cart API - Get Items', () => {
  it('should retrieve items in the cart successfully', async () => {
    const cartId = 'cart123';
    // First, add an item to the cart
    await addItem({
      id: '1',
      shoppingCartId: 'cart123',
      bookIsbn: '978-3-16-148410-0',
      price: 10.00,
    });
    // Now, retrieve the items in the cart
    const response = await getCartItems('cart123');
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          shoppingCartId: 'cart123',
          bookIsbn: '978-3-16-148410-0',
        }),
      ])
    );
  });
  // Additional test cases for retrieving items with an empty cart or invalid cartId would go here
});
 
describe('Shopping Cart API - Remove Item', () => {
  it('should remove an item from the cart successfully', async () => {
    const shoppingCartId = 'cart123';
    const itemId = '1';
    // First, add an item to the cart
    await addItem({
      id: itemId,
      shoppingCartId: shoppingCartId,
      bookIsbn: '978-3-16-148410-0',
      price: 10.00,
    });
    // Now, remove the item from the cart
    const response = await removeItem(shoppingCartId, itemId);
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: itemId,
        }),
      ])
    );
  });
  // Additional test cases for removing items with an invalid cartId or itemId would go here
});

describe('Shopping Cart API - Calculate Subtotal', () => {
  it('should calculate the subtotal of the items in the cart successfully', async () => {
    const cartId = 'cart123';
    const oldResponse = await calculateSubtotal(cartId);
    const oldResponseJson = JSON.parse(await oldResponse.text());
    const oldSubtotal = oldResponseJson.subtotal;
    // First, add items to the cart
    await addItem({
      id: '1',
      shoppingCartId: 'cart123',
      bookIsbn: '978-3-16-148410-0',
      price: 10.00,
    });
    // Now, calculate the new subtotal
    const response = await calculateSubtotal(cartId);
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(typeof responseData).toBe('object');
    expect(typeof responseData.subtotal).toBe('number');
    const actualDifference = responseData.subtotal - oldSubtotal;
    const expectedDifference = 10;
    expect(actualDifference).toBe(expectedDifference);
  });
  // Additional test cases for calculating subtotal with an empty cart or invalid cartId would go here
});

describe('Shopping Cart API - Error Handling', () => {
  it('should return 400 for invalid input', async () => {
    const response = await app.request('/api/shopping-cart/cart/items', {
      method: 'POST',
      body: JSON.stringify({ id: '2' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(400);
});
  
  it('should return 500 for server errors when adding an item', async () => {
    // Simulate a server error by mocking the database operation to throw an error
    const originalInsert = db.insert;
    db.insert = () => {
      throw new Error('Database error');
    };
    const newItem = {
      id: '4',
      shoppingCartId: 'cart123',
      bookIsbn: '978-3-16-148410-0',
      price: 10.00,
    };
    const response = await addItem(newItem);
    expect(response.status).toBe(500);
    const responseData = JSON.parse(await response.text()) as ErrorResponse;
    expect(responseData.error).toBe('Internal server error');
    // Restore the original database insert function
    db.insert = originalInsert;
  });
});
