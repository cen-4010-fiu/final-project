/**
 * Database Seeding
 *
 * Populates database with initial data for development and testing.
 * Run with: bun run db:seed
 */

import { db } from './client';
import { users } from './schema';

/** Hash password using same config as service */
async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
}

async function seed() {
  console.log('Seeding...');

  const defaultPassword = await hashPassword('password123');

  await db.insert(users).values([
    {
      username: 'jsmith',
      password: defaultPassword,
      name: 'John Smith',
      email: 'john.smith@example.com',
      homeAddress: '123 Main St, Miami, FL 33101',
    },
    {
      username: 'agarcia',
      password: defaultPassword,
      name: 'Ana Garcia',
      email: 'ana.garcia@example.com',
      homeAddress: '456 Oak Ave, Orlando, FL 32801',
    },
    {
      username: 'mwilson',
      password: defaultPassword,
      name: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      homeAddress: '789 Palm Blvd, Tampa, FL 33601',
    },
    {
      username: 'slee',
      password: defaultPassword,
      name: 'Sarah Lee',
      email: 'sarah.lee@example.com',
      homeAddress: '321 Pine Rd, Jacksonville, FL 32099',
    },
    {
      username: 'dchen',
      password: defaultPassword,
      name: 'David Chen',
      email: 'david.chen@example.com',
      homeAddress: '654 Maple Dr, Gainesville, FL 32601',
    },
  ]);

  console.log('Seeded users');
  console.log('Default password for all users: password123');
  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
