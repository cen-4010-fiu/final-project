/**
* Book API Tests

* Integration tests for Book Details endpoints (Feature 4).
* Tests run against a real database (reset before each test).
*/

import { beforeEach, describe, expect, it } from 'bun:test';
import { createApp } from '@/app';
import { db } from '@/shared/db/client';
import { authors, books } from '@/shared/db/schema';

const app = createApp();

/** Author response shape */
interface AuthorResponse {
  id: string;
  firstName: string;
  lastName: string;
  biography: string | null;
  publisher: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Book response shape */
interface BookResponse {
  isbn: string;
  name: string;
  description: string | null;
  price: string;
  authorId: string;
  genre: string | null;
  publisher: string | null;
  yearPublished: number | null;
  copiesSold: number;
  createdAt: string;
  updatedAt: string;
}

/** Error response shape */
interface ErrorResponse {
  error: string;
}

/** Helper to create an author via API */
async function createAuthor(data: {
  firstName: string;
  lastName: string;
  biography?: string;
  publisher?: string;
}) {
  return app.request('/api/books/authors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/** Helper to create a book via API */
async function createBook(data: {
  isbn: string;
  name: string;
  price: string;
  authorId: string;
  description?: string;
  genre?: string;
  publisher?: string;
  yearPublished?: number;
  copiesSold?: number;
}) {
  return app.request('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/** Reset tables before each test */
beforeEach(async () => {
  await db.delete(books);
  await db.delete(authors);
});

// POST /api/books/authors
describe('POST /api/books/authors', () => {
  it('creates author with all fields', async () => {
    const res = await createAuthor({
      firstName: 'George',
      lastName: 'Orwell',
      biography: 'English novelist and essayist.',
      publisher: 'Secker & Warburg',
    });

    expect(res.status).toBe(201);

    const body = (await res.json()) as AuthorResponse;
    expect(body.firstName).toBe('George');
    expect(body.lastName).toBe('Orwell');
    expect(body.biography).toBe('English novelist and essayist.');
    expect(body.publisher).toBe('Secker & Warburg');
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
  });

  it('creates author with required fields only', async () => {
    const res = await createAuthor({
      firstName: 'Jane',
      lastName: 'Austen',
    });

    expect(res.status).toBe(201);

    const body = (await res.json()) as AuthorResponse;
    expect(body.firstName).toBe('Jane');
    expect(body.lastName).toBe('Austen');
    expect(body.biography).toBeNull();
    expect(body.publisher).toBeNull();
  });

  it('rejects missing firstName', async () => {
    const res = await app.request('/api/books/authors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastName: 'Orwell' }),
    });

    expect(res.status).toBe(400);
  });

  it('rejects missing lastName', async () => {
    const res = await app.request('/api/books/authors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'George' }),
    });

    expect(res.status).toBe(400);
  });

  it('rejects empty firstName', async () => {
    const res = await createAuthor({
      firstName: '',
      lastName: 'Orwell',
    });

    expect(res.status).toBe(400);
  });
});

// POST /api/books
describe('POST /api/books', () => {
  it('creates book with all fields', async () => {
    const authorRes = await createAuthor({
      firstName: 'George',
      lastName: 'Orwell',
    });
    const author = (await authorRes.json()) as AuthorResponse;

    const res = await createBook({
      isbn: '9780451524935',
      name: '1984',
      price: '12.99',
      authorId: author.id,
      description: 'A dystopian novel.',
      genre: 'Dystopian',
      publisher: 'Secker & Warburg',
      yearPublished: 1949,
      copiesSold: 30000000,
    });

    expect(res.status).toBe(201);

    const body = (await res.json()) as BookResponse;
    expect(body.isbn).toBe('9780451524935');
    expect(body.name).toBe('1984');
    expect(body.price).toBe('12.99');
    expect(body.authorId).toBe(author.id);
    expect(body.description).toBe('A dystopian novel.');
    expect(body.genre).toBe('Dystopian');
    expect(body.publisher).toBe('Secker & Warburg');
    expect(body.yearPublished).toBe(1949);
    expect(body.copiesSold).toBe(30000000);
  });

  it('creates book with required fields only', async () => {
    const authorRes = await createAuthor({
      firstName: 'Jane',
      lastName: 'Austen',
    });
    const author = (await authorRes.json()) as AuthorResponse;

    const res = await createBook({
      isbn: '9780141439518',
      name: 'Pride and Prejudice',
      price: '9.99',
      authorId: author.id,
    });

    expect(res.status).toBe(201);

    const body = (await res.json()) as BookResponse;
    expect(body.isbn).toBe('9780141439518');
    expect(body.name).toBe('Pride and Prejudice');
    expect(body.description).toBeNull();
    expect(body.genre).toBeNull();
  });

  it('rejects duplicate ISBN', async () => {
    const authorRes = await createAuthor({
      firstName: 'George',
      lastName: 'Orwell',
    });
    const author = (await authorRes.json()) as AuthorResponse;

    await createBook({
      isbn: '9780451524935',
      name: '1984',
      price: '12.99',
      authorId: author.id,
    });

    const res = await createBook({
      isbn: '9780451524935',
      name: 'Duplicate Book',
      price: '5.99',
      authorId: author.id,
    });

    expect(res.status).toBe(400);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('A book with that ISBN already exists');
  });

  it('rejects non-existent authorId', async () => {
    const res = await createBook({
      isbn: '9780451524935',
      name: '1984',
      price: '12.99',
      authorId: '00000000-0000-0000-0000-000000000000',
    });

    expect(res.status).toBe(400);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('Author not found');
  });

  it('rejects invalid price format', async () => {
    const authorRes = await createAuthor({
      firstName: 'George',
      lastName: 'Orwell',
    });
    const author = (await authorRes.json()) as AuthorResponse;

    const res = await createBook({
      isbn: '9780451524935',
      name: '1984',
      price: 'not-a-price',
      authorId: author.id,
    });

    expect(res.status).toBe(400);
  });

  it('rejects ISBN shorter than 10 characters', async () => {
    const authorRes = await createAuthor({
      firstName: 'George',
      lastName: 'Orwell',
    });
    const author = (await authorRes.json()) as AuthorResponse;

    const res = await createBook({
      isbn: '123',
      name: '1984',
      price: '12.99',
      authorId: author.id,
    });

    expect(res.status).toBe(400);
  });
});

// GET /api/books/:isbn
describe('GET /api/books/:isbn', () => {
  it('returns existing book', async () => {
    const authorRes = await createAuthor({
      firstName: 'George',
      lastName: 'Orwell',
    });
    const author = (await authorRes.json()) as AuthorResponse;

    await createBook({
      isbn: '9780451524935',
      name: '1984',
      price: '12.99',
      authorId: author.id,
    });

    const res = await app.request('/api/books/9780451524935');

    expect(res.status).toBe(200);

    const body = (await res.json()) as BookResponse;
    expect(body.isbn).toBe('9780451524935');
    expect(body.name).toBe('1984');
    expect(body.authorId).toBe(author.id);
  });

  it('returns 404 for non-existent ISBN', async () => {
    const res = await app.request('/api/books/0000000000');

    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('Book not found');
  });
});

// GET /api/books/authors/:authorId/books
describe('GET /api/books/authors/:authorId/books', () => {
  it('returns list of books for an author', async () => {
    const authorRes = await createAuthor({
      firstName: 'George',
      lastName: 'Orwell',
    });
    const author = (await authorRes.json()) as AuthorResponse;

    await createBook({
      isbn: '9780451524935',
      name: '1984',
      price: '12.99',
      authorId: author.id,
    });
    await createBook({
      isbn: '9780141036144',
      name: 'Animal Farm',
      price: '8.99',
      authorId: author.id,
    });

    const res = await app.request(`/api/books/authors/${author.id}/books`);

    expect(res.status).toBe(200);

    const body = (await res.json()) as BookResponse[];
    expect(body).toHaveLength(2);
    expect(body.some((b) => b.isbn === '9780451524935')).toBe(true);
    expect(body.some((b) => b.isbn === '9780141036144')).toBe(true);
  });

  it('returns empty array for author with no books', async () => {
    const authorRes = await createAuthor({
      firstName: 'Jane',
      lastName: 'Austen',
    });
    const author = (await authorRes.json()) as AuthorResponse;

    const res = await app.request(`/api/books/authors/${author.id}/books`);

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual([]);
  });

  it('returns 404 for non-existent author', async () => {
    const res = await app.request(
      '/api/books/authors/00000000-0000-0000-0000-000000000000/books'
    );

    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('Author not found');
  });

  it('only returns books belonging to the specified author', async () => {
    const authorRes1 = await createAuthor({
      firstName: 'George',
      lastName: 'Orwell',
    });
    const author1 = (await authorRes1.json()) as AuthorResponse;

    const authorRes2 = await createAuthor({
      firstName: 'Jane',
      lastName: 'Austen',
    });
    const author2 = (await authorRes2.json()) as AuthorResponse;

    await createBook({
      isbn: '9780451524935',
      name: '1984',
      price: '12.99',
      authorId: author1.id,
    });
    await createBook({
      isbn: '9780141439518',
      name: 'Pride and Prejudice',
      price: '9.99',
      authorId: author2.id,
    });

    const res = await app.request(`/api/books/authors/${author1.id}/books`);
    const body = (await res.json()) as BookResponse[];

    expect(body).toHaveLength(1);
    expect(body[0]?.isbn).toBe('9780451524935');
  });
});
