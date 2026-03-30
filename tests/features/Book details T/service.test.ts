import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import app from './routes';
import { bookDetailsService } from './service';

describe('Book Details Routes', () => {
  const originalCreateBook = bookDetailsService.createBook;
  const originalGetBookByIsbn = bookDetailsService.getBookByIsbn;
  const originalCreateAuthor = bookDetailsService.createAuthor;
  const originalGetBooksByAuthorId = bookDetailsService.getBooksByAuthorId;

  beforeEach(() => {
    bookDetailsService.createBook = mock(async () => ({
      id: 'book_1',
      isbn: '9780134685991',
      name: 'Effective Java',
      description: 'A practical guide to Java programming.',
      price: 49.99,
      authorId: 'author_1',
      genre: 'Programming',
      publisher: 'Addison-Wesley',
      yearPublished: 2018,
      copiesSold: 1000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    bookDetailsService.getBookByIsbn = mock(async (isbn: string) => ({
      id: 'book_1',
      isbn,
      name: 'Effective Java',
      description: 'A practical guide to Java programming.',
      price: 49.99,
      authorId: 'author_1',
      genre: 'Programming',
      publisher: 'Addison-Wesley',
      yearPublished: 2018,
      copiesSold: 1000000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    bookDetailsService.createAuthor = mock(async () => ({
      id: 'author_1',
      firstName: 'Joshua',
      lastName: 'Bloch',
      biography: 'Author and software engineer.',
      publisher: 'Addison-Wesley',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    bookDetailsService.getBooksByAuthorId = mock(async () => [
      {
        id: 'book_1',
        isbn: '9780134685991',
        name: 'Effective Java',
        description: 'A practical guide to Java programming.',
        price: 49.99,
        authorId: 'author_1',
        genre: 'Programming',
        publisher: 'Addison-Wesley',
        yearPublished: 2018,
        copiesSold: 1000000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'book_2',
        isbn: '9780321356680',
        name: 'Java Concurrency in Practice',
        description: 'Concurrency concepts in Java.',
        price: 54.99,
        authorId: 'author_1',
        genre: 'Programming',
        publisher: 'Addison-Wesley',
        yearPublished: 2006,
        copiesSold: 500000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  });

  afterEach(() => {
    bookDetailsService.createBook = originalCreateBook;
    bookDetailsService.getBookByIsbn = originalGetBookByIsbn;
    bookDetailsService.createAuthor = originalCreateAuthor;
    bookDetailsService.getBooksByAuthorId = originalGetBooksByAuthorId;
  });

  describe('POST /books', () => {
    it('should create a book and return 201', async () => {
      const res = await app.request('/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isbn: '9780134685991',
          name: 'Effective Java',
          description: 'A practical guide to Java programming.',
          price: 49.99,
          authorId: 'author_1',
          genre: 'Programming',
          publisher: 'Addison-Wesley',
          yearPublished: 2018,
          copiesSold: 1000000,
        }),
      });

      expect(res.status).toBe(201);
      expect(bookDetailsService.createBook).toHaveBeenCalled();
    });

    it('should return 400 if service throws an error', async () => {
      bookDetailsService.createBook = mock(async () => {
        throw new Error('Failed to create book');
      });

      const res = await app.request('/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isbn: '9780134685991',
          name: 'Effective Java',
          description: 'A practical guide to Java programming.',
          price: 49.99,
          authorId: 'author_1',
          genre: 'Programming',
          publisher: 'Addison-Wesley',
          yearPublished: 2018,
          copiesSold: 1000000,
        }),
      });

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        message: 'Failed to create book',
      });
    });
  });

  describe('GET /books/:isbn', () => {
    it('should return a book by ISBN', async () => {
      const res = await app.request('/books/9780134685991');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty('isbn', '9780134685991');
      expect(data).toHaveProperty('name', 'Effective Java');
      expect(bookDetailsService.getBookByIsbn).toHaveBeenCalledWith(
        '9780134685991'
      );
    });

    it('should return 404 if book is not found', async () => {
      bookDetailsService.getBookByIsbn = mock(async () => null);

      const res = await app.request('/books/0000000000000');

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({
        message: 'Book not found',
      });
    });
  });

  describe('POST /authors', () => {
    it('should create an author and return 201', async () => {
      const res = await app.request('/authors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Joshua',
          lastName: 'Bloch',
          biography: 'Author and software engineer.',
          publisher: 'Addison-Wesley',
        }),
      });

      expect(res.status).toBe(201);
      expect(bookDetailsService.createAuthor).toHaveBeenCalled();
    });

    it('should return 400 if service throws an error', async () => {
      bookDetailsService.createAuthor = mock(async () => {
        throw new Error('Failed to create author');
      });

      const res = await app.request('/authors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Joshua',
          lastName: 'Bloch',
          biography: 'Author and software engineer.',
          publisher: 'Addison-Wesley',
        }),
      });

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        message: 'Failed to create author',
      });
    });
  });

  describe('GET /authors/:authorId/books', () => {
    it('should return books for an author', async () => {
      const res = await app.request('/authors/author_1/books');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
      expect(data[0]).toHaveProperty('authorId', 'author_1');
      expect(bookDetailsService.getBooksByAuthorId).toHaveBeenCalledWith(
        'author_1'
      );
    });

    it('should return 400 if service throws an error', async () => {
      bookDetailsService.getBooksByAuthorId = mock(async () => {
        throw new Error('Failed to fetch books');
      });

      const res = await app.request('/authors/author_1/books');

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        message: 'Failed to fetch books',
      });
    });
  });
});