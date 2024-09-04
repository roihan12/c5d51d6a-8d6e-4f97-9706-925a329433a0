import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({}); // use with caution.

  const amountOfUsers = 50;

  const users: Omit<User, 'id'>[] = []; // Exclude `id` to let Prisma handle it

  for (let i = 0; i < amountOfUsers; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();

    // Generate a phone number and convert it to integer
    const phoneNumber = parseInt(faker.phone.number('########'));

    const user: Omit<User, 'id'> = {
      email: faker.internet.email(firstName, lastName),
      firstName,
      lastName,
      phone: phoneNumber,
      position: faker.name.jobTitle(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };

    users.push(user);
  }

  // Wrap the async function call and handle errors
  try {
    await prisma.user.createMany({ data: users });
    console.log('Users added successfully');
  } catch (error) {
    console.error('Error adding users:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
