/**
 * Comments API Tests
 *
 * Integration tests for Book Commenting endpoints.
 * Tests run against a real database (reset before each test).
 */
import { beforeEach, describe, expect, it } from 'bun:test';
import { createApp } from '@/app';
import { db } from '@/shared/db/client';
import {
  authors,
  bookComments,
  books,
  purchases,
  users,
} from '@/shared/db/schema';

const app = createApp();

/** Single comment response shape */
interface CommentResponse {
  id: string;
  userId: string;
  isbn: string;
  comment: string;
  createdAt: string;
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

/** Create a comment via the API */
async function createComment(data: {
  userId: string;
  isbn: string;
  comment: string;
}) {
  return app.request('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/** Reset tables before each test */
beforeEach(async () => {
  await db.delete(bookComments);
  await db.delete(purchases);
  await db.delete(books);
  await db.delete(authors);
  await db.delete(users);
});

// POST /api/comments
describe('POST /api/comments', () => {
  it('creates a comment successfully', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);

    const res = await createComment({
      userId,
      isbn,
      comment: 'Great book!',
    });

    expect(res.status).toBe(201);
  });

  it('returns 404 when book does not exist', async () => {
    const userId = await seedUser();

    const res = await createComment({
      userId,
      isbn: '0000000000',
      comment: 'Great book!',
    });

    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('Book not found');
  });

  it('returns 404 when user does not exist', async () => {
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);

    const res = await createComment({
      userId: crypto.randomUUID(),
      isbn,
      comment: 'Great book!',
    });

    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('User not found');
  });

  it('returns 403 when user has not purchased the book', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);

    const res = await createComment({
      userId,
      isbn,
      comment: 'Great book!',
    });

    expect(res.status).toBe(403);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('User has not purchased this book');
  });

  it('allows same user to post multiple comments on same book', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);

    const res1 = await createComment({
      userId,
      isbn,
      comment: 'First comment',
    });
    const res2 = await createComment({
      userId,
      isbn,
      comment: 'Second comment',
    });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
  });

  it('rejects empty comment', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);

    const res = await createComment({ userId, isbn, comment: '' });

    expect(res.status).toBe(400);
  });

  it('rejects comment exceeding 2000 characters', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);

    const res = await createComment({
      userId,
      isbn,
      comment: 'a'.repeat(2001),
    });

    expect(res.status).toBe(400);
  });
});

// GET /api/comments/:isbn
describe('GET /api/comments/:isbn', () => {
  it('returns empty array for book with no comments', async () => {
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);

    const res = await app.request(`/api/comments/${isbn}`);

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual([]);
  });

  it('returns single comment with correct fields', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);
    await createComment({ userId, isbn, comment: 'Nice read' });

    const res = await app.request(`/api/comments/${isbn}`);

    expect(res.status).toBe(200);

    const body = (await res.json()) as CommentResponse[];
    expect(body).toHaveLength(1);
    expect(body[0]?.userId).toBe(userId);
    expect(body[0]?.isbn).toBe(isbn);
    expect(body[0]?.comment).toBe('Nice read');
    expect(body[0]?.id).toBeDefined();
    expect(body[0]?.createdAt).toBeDefined();
  });

  it('returns multiple comments ordered by createdAt asc', async () => {
    const userId = await seedUser();
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId, isbn);

    await createComment({ userId, isbn, comment: 'First' });
    await createComment({ userId, isbn, comment: 'Second' });

    const res = await app.request(`/api/comments/${isbn}`);

    expect(res.status).toBe(200);

    const body = (await res.json()) as CommentResponse[];
    expect(body).toHaveLength(2);
    expect(body[0]?.comment).toBe('First');
    expect(body[1]?.comment).toBe('Second');
  });

  it('returns 404 for non-existent book', async () => {
    const res = await app.request('/api/comments/9999999999');

    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('Book not found');
  });

  it('returns comments from multiple users', async () => {
    const userId1 = await seedUser({ username: 'commenter-1' });
    const userId2 = await seedUser({ username: 'commenter-2' });
    const authorId = await seedAuthor();
    const isbn = await seedBook(authorId);
    await seedPurchase(userId1, isbn);
    await seedPurchase(userId2, isbn);

    await createComment({ userId: userId1, isbn, comment: 'User 1 comment' });
    await createComment({ userId: userId2, isbn, comment: 'User 2 comment' });

    const res = await app.request(`/api/comments/${isbn}`);

    expect(res.status).toBe(200);

    const body = (await res.json()) as CommentResponse[];
    expect(body).toHaveLength(2);

    const userIds = body.map((c) => c.userId);
    expect(userIds).toContain(userId1);
    expect(userIds).toContain(userId2);
  });
});
