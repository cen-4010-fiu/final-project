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

declare const Request: any;

const app = createApp();

interface ErrorResponse {
  error: string;
}

async function addItem(data: {
  id: string;
  cartId: string;
  isbn: string;
  price: string;
  quantity: number;
}) {
  return await app.request(
    new Request('/api/shopping-cart/items', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

async function getCartItems(cartId: string) {
  return await app.request(
    new Request(`/api/shopping-cart/items?cartId=${cartId}`, {
      method: 'GET',
      body: JSON.stringify({ cartId }),
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

async function removeItem(cartId: string, itemId: string) {
  return await app.request(
    new Request(`/api/shopping-cart/items?cartId=${cartId}&itemId=${itemId}`, {
      method: 'DELETE',
      body: JSON.stringify({ cartId, itemId }),
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

async function calculateSubtotal(cartId: string) {
  return await app.request(
    new Request(`/api/shopping-cart/subtotal?cartId=${cartId}`, {
      method: 'GET',
      body: JSON.stringify({ cartId }),
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

describe('Shopping Cart API', () => {
  it('should add an item to the cart successfully', async () => {
    const newItem = {
      id: '1',
      cartId: 'cart123',
      isbn: '978-3-16-148410-0',
      price: '10.00',
      quantity: 2,
    };
    const response = await addItem(newItem);
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cartId: 'cart123',
          isbn: '978-3-16-148410-0',
          quantity: 2,
        }),
      ])
    );
  });

  it('should return 400 for invalid input', async () => {
    const invalidItem = {
      id: '2',
      cartId: 'cart123',
      isbn: '978-3-16-148410-0',
      price: '10.00',
      quantity: 0, // Invalid quantity
    };
    const response = await addItem(invalidItem);
    expect(response.status).toBe(400);
    const responseData = JSON.parse(await response.text()) as ErrorResponse;
    expect(responseData.error).toBe('Invalid request data');
  });

  it('should return 500 for server errors', async () => {
    // Simulate a server error by mocking the database operation to throw an error
    const originalInsert = db.insert;
    db.insert = () => {
      throw new Error('Database error');
    };
    const newItem = {
      id: '3',
      cartId: 'cart123',
      isbn: '978-3-16-148410-0',
      price: '10.00',
      quantity: 2,
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
      cartId: 'cart123',
      isbn: '978-3-16-148410-0',
      quantity: 2,
    };
    const cartItems = await service.addItemToCart(
      Object.assign({}, newItem) as any
    );
    expect(Array.isArray(cartItems)).toBe(true);
    expect(cartItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cartId: 'cart123',
          isbn: '978-3-16-148410-0',
          quantity: 2,
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
          cartId: 'cart123',
          isbn: '978-3-16-148410-0',
          quantity: 2,
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
      cartId,
      isbn: '978-3-16-148410-0',
      price: '10.00',
      quantity: 2,
    });
    // Now, retrieve the items in the cart
    const response = await getCartItems(cartId);
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cartId,
          isbn: '978-3-16-148410-0',
          quantity: 2,
        }),
      ])
    );
  });
  // Additional test cases for retrieving items with an empty cart or invalid cartId would go here
});

describe('Shopping Cart API - Remove Item', () => {
  it('should remove an item from the cart successfully', async () => {
    const cartId = 'cart123';
    const itemId = '1';
    // First, add an item to the cart
    await addItem({
      id: itemId,
      cartId,
      isbn: '978-3-16-148410-0',
      price: '10.00',
      quantity: 2,
    });
    // Now, remove the item from the cart
    const response = await removeItem(cartId, itemId);
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
    // First, add items to the cart
    await addItem({
      id: '1',
      cartId,
      isbn: '978-3-16-148410-0',
      price: '10.00',
      quantity: 2,
    });
    await addItem({
      id: '2',
      cartId,
      isbn: '978-1-23-456789-0',
      price: '15.00',
      quantity: 1,
    });
    // Now, calculate the subtotal
    const response = await calculateSubtotal(cartId);
    expect(response.status).toBe(200);
    const responseData = JSON.parse(await response.text());
    expect(typeof responseData).toBe('number');
    expect(responseData).toBe(35.0); // 2 * $10 + 1 * $15 = $35
  });
  // Additional test cases for calculating subtotal with an empty cart or invalid cartId would go here
});

describe('Shopping Cart API - Error Handling', () => {
  it('should return 400 for invalid input when adding an item', async () => {
    const invalidItem = {
      id: '3',
      cartId: 'cart123',
      isbn: '978-3-16-148410-0',
      price: '10.00',
      quantity: 0, // Invalid quantity
    };
    const response = await addItem(invalidItem);
    expect(response.status).toBe(400);
    const responseData = JSON.parse(await response.text()) as ErrorResponse;
    expect(responseData.error).toBe('Invalid request data');
  });

  it('should return 500 for server errors when adding an item', async () => {
    // Simulate a server error by mocking the database operation to throw an error
    const originalInsert = db.insert;
    db.insert = () => {
      throw new Error('Database error');
    };
    const newItem = {
      id: '4',
      cartId: 'cart123',
      isbn: '978-3-16-148410-0',
      price: '10.00',
      quantity: 2,
    };
    const response = await addItem(newItem);
    expect(response.status).toBe(500);
    const responseData = JSON.parse(await response.text()) as ErrorResponse;
    expect(responseData.error).toBe('Internal server error');
    // Restore the original database insert function
    db.insert = originalInsert;
  });
});
