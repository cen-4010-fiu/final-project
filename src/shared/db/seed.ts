/**
 * Database Seeding
 *
 * Populates database with initial data for development and testing.
 * Run with: bun run db:seed
 */

import { db } from './client';
import {
  authors,
  books,
  creditCards,
  shoppingCart,
  shoppingCartItems,
  users,
} from './schema';

/** Hash password using same config as service */
async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
}

/** Hash sensitive card data */
async function hashCardData(data: string): Promise<string> {
  return Bun.password.hash(data, { algorithm: 'bcrypt', cost: 10 });
}

async function seed() {
  console.log('Seeding...');

  const defaultPassword = await hashPassword('password123');

  // Insert users and capture their IDs for foreign key references
  const insertedUsers = await db
    .insert(users)
    .values([
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
    ])
    .onConflictDoNothing()
    .returning({ id: users.id, username: users.username });
  console.log('Seeded users:', insertedUsers.map((u) => u.username).join(', '));

  // Create a map for easy lookup
  const allUsers =
    insertedUsers.length > 0
      ? insertedUsers
      : await db.select({ id: users.id, username: users.username }).from(users);

  // Create a map for easy lookup
  const userMap = new Map(allUsers.map((u) => [u.username, u.id]));

  // Seed credit cards for some users
  const cardData = [
    {
      username: 'jsmith',
      cardNumber: '4532015112830366',
      expiryDate: '12/28',
      cvv: '123',
      cardholderName: 'John Smith',
    },
    {
      username: 'jsmith',
      cardNumber: '5555555555554444',
      expiryDate: '09/27',
      cvv: '456',
      cardholderName: 'John Smith',
    },
    {
      username: 'agarcia',
      cardNumber: '4111111111111111',
      expiryDate: '03/29',
      cvv: '789',
      cardholderName: 'Ana Garcia',
    },
    {
      username: 'mwilson',
      cardNumber: '6011111111111117',
      expiryDate: '11/26',
      cvv: '321',
      cardholderName: 'Mike Wilson',
    },
  ];

  for (const card of cardData) {
    const userId = userMap.get(card.username);
    if (!userId) continue;

    await db
      .insert(creditCards)
      .values({
        userId,
        cardholderName: card.cardholderName,
        lastFour: card.cardNumber.slice(-4),
        cardNumberHash: await hashCardData(card.cardNumber),
        expiryDate: card.expiryDate,
        cvvHash: await hashCardData(card.cvv),
      })
      .onConflictDoNothing();
  }

  console.log(`Seeded ${cardData.length} credit cards`);
  console.log('Default password for all users: password123');
  console.log('Credit card test data:');
  console.log(
    '  jsmith: 4532015112830366 (Visa), 5555555555554444 (Mastercard)'
  );
  console.log('  agarcia: 4111111111111111 (Visa)');
  console.log('  mwilson: 6011111111111117 (Discover)');
  console.log('Done!');

  const insertedAuthors = await db
    .insert(authors)
    .values([
      {
        firstName: 'George',
        lastName: 'Orwell',
        biography: 'English novelist and essayist.',
        publisher: 'Secker & Warburg',
      },
      {
        firstName: 'Harper',
        lastName: 'Lee',
        biography: 'American novelist known for To Kill a Mockingbird.',
        publisher: 'J. B. Lippincott & Co.',
      },
      {
        firstName: 'F. Scott',
        lastName: 'Fitzgerald',
        biography: 'American novelist of the Jazz Age.',
        publisher: "Charles Scribner's Sons",
      },
    ])
    .onConflictDoNothing()
    .returning({ id: authors.id, lastName: authors.lastName });

  const allAuthors =
    insertedAuthors.length > 0
      ? insertedAuthors
      : await db
          .select({ id: authors.id, lastName: authors.lastName })
          .from(authors);

  await db
    .insert(books)
    .values([
      {
        isbn: '978-3-16-148410-0',
        name: '1984',
        description: 'A dystopian novel set in a totalitarian society.',
        price: '10.00',
        authorId: allAuthors[0]!.id,
        genre: 'Dystopian',
        publisher: 'Secker & Warburg',
        yearPublished: 1949,
        copiesSold: 500000,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(shoppingCart)
    .values([
      { id: 'cart123', userId: userMap.get('jsmith')! },
      { id: 'cart456', userId: userMap.get('agarcia')! },
    ])
    .onConflictDoNothing();

  await db
    .insert(shoppingCartItems)
    .values([
      { shoppingCartId: 'cart123', bookIsbn: '978-3-16-148410-0' },
      { shoppingCartId: 'cart123', bookIsbn: '978-3-16-148410-0' },
      { shoppingCartId: 'cart456', bookIsbn: '978-3-16-148410-0' },
    ])
    .onConflictDoNothing();

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
