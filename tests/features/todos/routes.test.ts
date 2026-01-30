import { describe, expect, it } from 'bun:test';
import { createApp } from '@/app';
import { db, todos } from '@/shared/db';
import '../../setup';

const app = createApp();

describe('GET /api/todos', () => {
  it('returns empty array', async () => {
    const res = await app.request('/api/todos');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('returns todos', async () => {
    await db.insert(todos).values({ title: 'Test' });

    const res = await app.request('/api/todos');
    const body = (await res.json()) as { title: string }[];

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]?.title).toBe('Test');
  });
});

describe('POST /api/todos', () => {
  it('creates todo', async () => {
    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New todo' }),
    });

    const body = (await res.json()) as { title: string };

    expect(res.status).toBe(201);
    expect(body.title).toBe('New todo');
  });
});

describe('GET /api/todos/:id', () => {
  it('returns 404 for missing', async () => {
    const res = await app.request(
      '/api/todos/00000000-0000-0000-0000-000000000000'
    );
    expect(res.status).toBe(404);
  });
});
