import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a test city
  const city = await prisma.city.create({
    data: {
      name: "Shkodër",
      country: "Albania",
      timezone: "Europe/Tirane",
      latitude: 42.0683,
      longitude: 19.5126,
    },
  });

  // Create a test category
  const category = await prisma.category.create({
    data: {
      name: "Plumbing",
      slug: "plumbing",
    },
  });

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: "client@test.com",
      password: "hashed-password",
      role: "CLIENT",
    },
  });

  // Create a test need
  await prisma.need.create({
    data: {
      clientId: user.id,
      title: "Fix leaking sink",
      description: "My kitchen sink is leaking and needs urgent repair",
      categoryId: category.id,
      cityId: city.id,
      budgetAmount: 50.0,
      budgetCurrency: "USD",
      status: "POSTED",
      timeEarliest: new Date(),
    },
  });

  console.log("✅ Seed data inserted");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
