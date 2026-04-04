/**
 * Ratings API Tests
 *
 * Integration tests for Book Rating endpoints.
 * Tests run against a real database (reset before each test).
 */
import { beforeEach, describe, expect, it } from 'bun:test';
import { createApp } from '@/app';
import { db } from '@/shared/db/client';
import {
  authors,
  bookRatings,
  books,
  purchases,
  users,
} from '@/shared/db/schema';

const app = createApp();

/** Average rating response shape */
interface AverageRatingResponse {
  isbn: string;
  averageRating: number | null;
}

/** Error response shape */
interface ErrorResponse {
  error: string;
}

/** Insert a user directly into the database. Returns the user id. */
async function seedUser(
  overrides: Partial<{ id: string; username: string }> = {}
): Promise<string> {
  const id = overrides.id ?? crypto.randomUUID();
  await db.insert(users).values({
    id,
    username: overrides.username ?? `user-${id.slice(0, 8)}`,
    password: 'hashed-placeholder',
  });
  return id;
}

/** Insert an author directly into the database. Returns the author id. */
async function seedAuthor(
  overrides: Partial<{ id: string }> = {}
): Promise<string> {
  const id = overrides.id ?? crypto.randomUUID();
  await db.insert(authors).values({
    id,
    firstName: 'Test',
    lastName: 'Author',
  });
  return id;
}

/** Insert a book directly into the database. Returns the isbn. */
async function seedBook(
  authorId: string,
  overrides: Partial<{ isbn: string }> = {}
): Promise<string> {
  const isbn = overrides.isbn ?? '978-0-13-468599-1';
  await db.insert(books).values({
    isbn,
    name: 'Test Book',
    price: '19.99',
    authorId,
  });
  return isbn;
}

/** Insert a purchase record directly into the database. */
async function seedPurchase(userId: string, isbn: string): Promise<void> {
  await db.insert(purchases).values({ userId, isbn });
}

/** Create a rating via the API */
async function createRating(data: {
  userId: string;
  isbn: string;
  rating: number;
}) {
  return app.request('/api/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/** Reset tables before each test */
beforeEach(async () => {
  await db.delete(bookRatings);
  await db.delete(purchases);
  await db.delete(books);
  await db.delete(authors);
  await db.delete(users);
});

// POST /api/ratings
describe('POST /api/ratings', () => {
  it('creates a rating successfully', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);

    const res = await createRating({ userId, isbn, rating: 3 });

    expect(res.status).toBe(201);
  });

  it('rejects duplicate rating for same user and book', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);

    await createRating({ userId, isbn, rating: 4 });
    const res = await createRating({ userId, isbn, rating: 5 });

    expect(res.status).toBe(400);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('User has already rated this book');
  });

  it('returns 404 when book does not exist', async () => {
    const userId = await seedUser();

    const res = await createRating({
      userId,
      isbn: '0000000000',
      rating: 3,
    });

    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('Book not found');
  });

  it('returns 404 when user does not exist', async () => {
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);

    const res = await createRating({
      userId: crypto.randomUUID(),
      isbn,
      rating: 3,
    });

    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('User not found');
  });

  it('returns 403 when user has not purchased the book', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);

    const res = await createRating({ userId, isbn, rating: 3 });

    expect(res.status).toBe(403);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('User has not purchased this book');
  });

  it('rejects rating below minimum', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);

    const res = await createRating({ userId, isbn, rating: 0 });

    expect(res.status).toBe(400);
  });

  it('rejects rating above maximum', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);

    const res = await createRating({ userId, isbn, rating: 6 });

    expect(res.status).toBe(400);
  });

  it('allows different users to rate the same book', async () => {
    const userId1 = await seedUser({ username: 'user-one' });
    const userId2 = await seedUser({ username: 'user-two' });
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId1, isbn);
    await seedPurchase(userId2, isbn);

    const res1 = await createRating({ userId: userId1, isbn, rating: 4 });
    const res2 = await createRating({ userId: userId2, isbn, rating: 5 });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
  });
});

// GET /api/ratings/:isbn
describe('GET /api/ratings/:isbn', () => {
  it('returns null average for book with no ratings', async () => {
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);

    const res = await app.request(`/api/ratings/${isbn}`);

    expect(res.status).toBe(200);

    const body = (await res.json()) as AverageRatingResponse;
    expect(body.isbn).toBe(isbn);
    expect(body.averageRating).toBeNull();
  });

  it('returns correct average for single rating', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);
    await createRating({ userId, isbn, rating: 4 });

    const res = await app.request(`/api/ratings/${isbn}`);

    expect(res.status).toBe(200);

    const body = (await res.json()) as AverageRatingResponse;
    expect(body.averageRating).toBe(4);
  });

  it('returns correct average for multiple ratings', async () => {
    const userId1 = await seedUser({ username: 'avg-user-1' });
    const userId2 = await seedUser({ username: 'avg-user-2' });
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId1, isbn);
    await seedPurchase(userId2, isbn);
    await createRating({ userId: userId1, isbn, rating: 4 });
    await createRating({ userId: userId2, isbn, rating: 5 });

    const res = await app.request(`/api/ratings/${isbn}`);

    expect(res.status).toBe(200);

    const body = (await res.json()) as AverageRatingResponse;
    expect(body.averageRating).toBe(4.5);
  });

  it('returns 404 for non-existent book', async () => {
    const res = await app.request('/api/ratings/9999999999');

    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('Book not found');
  });
});
