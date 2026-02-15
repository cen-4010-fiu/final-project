/**
 * User API Tests
 *
 * Integration tests for Profile Management endpoints.
 * Tests run against a real database (reset before each test).
 */
import { beforeEach, describe, expect, it } from 'bun:test';
import { eq } from 'drizzle-orm';
import { createApp } from '@/app';
import { db } from '@/shared/db/client';
import { users } from '@/shared/db/schema';

const app = createApp();

/** User response shape (password omitted) */
interface UserResponse {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  homeAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Error response shape */
interface ErrorResponse {
  error: string;
}

/** Helper to create a user via API */
async function createUser(data: {
  username: string;
  password: string;
  name?: string;
  email?: string;
  homeAddress?: string;
}) {
  return app.request('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/** Reset users table before each test */
beforeEach(async () => {
  await db.delete(users);
});

// POST /api/users
describe('POST /api/users', () => {
  it('creates user with all fields', async () => {
    const res = await createUser({
      username: 'user',
      password: 'testpw1234',
      name: 'Test User',
      email: 'test@example.com',
      homeAddress: '123 Main St',
    });

    expect(res.status).toBe(201);

    const body = (await res.json()) as UserResponse;
    expect(body.username).toBe('user');
    expect(body.name).toBe('Test User');
    expect(body.email).toBe('test@example.com');
    expect(body.homeAddress).toBe('123 Main St');
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
    expect('password' in body).toBe(false);
  });

  it('creates user with required fields only', async () => {
    const res = await createUser({
      username: 'user',
      password: 'testpw1234',
    });

    expect(res.status).toBe(201);

    const body = (await res.json()) as UserResponse;
    expect(body.username).toBe('user');
    expect(body.name).toBeNull();
    expect(body.email).toBeNull();
  });

  it('rejects duplicate username', async () => {
    await createUser({ username: 'taken', password: 'testpw1234' });

    const res = await createUser({
      username: 'taken',
      password: 'testpw456',
    });

    expect(res.status).toBe(400);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('Username already taken');
  });

  it('rejects username too short', async () => {
    const res = await createUser({
      username: 'ab',
      password: 'testpw1234',
    });

    expect(res.status).toBe(400);
  });

  it('rejects password too short', async () => {
    const res = await createUser({
      username: 'user',
      password: 'short',
    });

    expect(res.status).toBe(400);
  });

  it('rejects invalid email format', async () => {
    const res = await createUser({
      username: 'user',
      password: 'testpw1234',
      email: 'not-an-email',
    });

    expect(res.status).toBe(400);
  });
});

// GET /api/users/:username
describe('GET /api/users/:username', () => {
  it('returns existing user', async () => {
    await createUser({
      username: 'user',
      password: 'testpw1234',
      name: 'Find Me',
    });

    const res = await app.request('/api/users/user');

    expect(res.status).toBe(200);

    const body = (await res.json()) as UserResponse;
    expect(body.username).toBe('user');
    expect(body.name).toBe('Find Me');
    expect('password' in body).toBe(false);
  });

  it('returns 404 for non-existent user', async () => {
    const res = await app.request('/api/users/user');

    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('User not found');
  });
});

// PATCH /api/users/:username
describe('PATCH /api/users/:username', () => {
  it('updates name', async () => {
    await createUser({
      username: 'user',
      password: 'testpw1234',
      name: 'Old',
    });

    const res = await app.request('/api/users/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New' }),
    });

    expect(res.status).toBe(200);

    const body = (await res.json()) as UserResponse;
    expect(body.name).toBe('New');
  });

  it('updates home address', async () => {
    await createUser({
      username: 'user',
      password: 'testpw1234',
    });

    const res = await app.request('/api/users/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeAddress: '123 Main St' }),
    });

    expect(res.status).toBe(200);

    const body = (await res.json()) as UserResponse;
    expect(body.homeAddress).toBe('123 Main St');
  });

  it('updates password (hashed)', async () => {
    await createUser({
      username: 'user',
      password: 'testpw1234',
    });

    const res = await app.request('/api/users/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'testpw456' }),
    });

    expect(res.status).toBe(200);

    const body = (await res.json()) as UserResponse;
    expect('password' in body).toBe(false);

    // Verify password changed in database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, 'user'))
      .limit(1);

    expect(dbUser).toBeDefined();
    const isValid = await Bun.password.verify('testpw456', dbUser!.password);
    expect(isValid).toBe(true);
  });

  it('returns 404 for non-existent user', async () => {
    const res = await app.request('/api/users/dne', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'DNE' }),
    });

    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.error).toBe('User not found');
  });

  it('ignores email in update payload', async () => {
    await createUser({
      username: 'user',
      password: 'testpw1234',
      email: 'original@example.com',
    });

    const res = await app.request('/api/users/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'changed@example.com' }),
    });

    expect(res.status).toBe(200);

    const body = (await res.json()) as UserResponse;
    expect(body.email).toBe('original@example.com');
  });
});
