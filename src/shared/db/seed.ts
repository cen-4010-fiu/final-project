import { db, todos } from "./index";

// NOTE: We can seed our docker database using `bun run db:seed` from project root

async function seed() {
  console.log("Seeding...");

  // FIXME: Remove todo item code when we start implementing features
  await db.insert(todos).values([
    { title: "Set up project structure", completed: true },
    { title: "Create Prisma schema", completed: true },
    { title: "Implement API routes", completed: false },
    { title: "Write tests", completed: true },
    { title: "Deploy to production", completed: false },
  ]);

  // TODO: Seed with data needed for features

  console.log("Done!");
  process.exit(0);
}

seed().catch(console.error);
