
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const suburbs = [
  { name: 'Sydney CBD', lat: -33.8688, lng: 151.2093 },
  { name: 'Parramatta', lat: -33.8136, lng: 151.0034 },
  { name: 'Chatswood', lat: -33.7968, lng: 151.1832 },
  { name: 'Hurstville', lat: -33.9673, lng: 151.1023 },
  { name: 'Bondi', lat: -33.8915, lng: 151.2767 },
  { name: 'Newtown', lat: -33.8973, lng: 151.1794 },
  { name: 'Manly', lat: -33.8000, lng: 151.2858 },
  { name: 'Cronulla', lat: -33.0570, lng: 151.1520 },
  { name: 'Blacktown', lat: -33.7710, lng: 150.9060 },
  { name: 'Hornsby', lat: -33.7042, lng: 151.1000 },
];

const categories = ['Cleaning', 'Plumbing', 'Gardening', 'Tutoring', 'Electrician', 'Personal Training'];
const firstNames = ['John', 'Jane', 'Peter', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'Chris', 'Laura'];
const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Johnson', 'White', 'Martin', 'Anderson'];

async function main() {
  console.log('Start seeding...');

  // Create Customers
  const customers = [];
  for (let i = 0; i < 5; i++) {
    const customer = await prisma.user.create({
      data: {
        email: `customer${i}@test.com`,
        role: 'CUSTOMER',
        updatedAt: new Date(),
      },
    });
    customers.push(customer);
  }
  console.log(`${customers.length} customers created.`);

  // Create Providers
  for (const suburb of suburbs) {
    const providerUser = await prisma.user.create({
      data: {
        email: `${suburb.name.toLowerCase().replace(/ /g, '')}provider@test.com`,
        role: 'PROVIDER',
        updatedAt: new Date(),
        profile: {
          create: {
            displayName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            bio: `Experienced professional providing top-quality services in ${suburb.name}.`,
            gst: Math.random() > 0.5,
            updatedAt: new Date(),
          },
        },
      },
      include: { profile: true },
    });

    if (providerUser.profile) {
        // Create Listings for each provider
        for (let i = 0; i < 3; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const listing = await prisma.listing.create({
                data: {
                    providerId: providerUser.profile.id,
                    title: `${category} service in ${suburb.name}`,
                    category: category,
                    description: `Professional ${category} services available. Book now for a free quote.`,
                    pricePerHour: Math.floor(Math.random() * 50) + 50, // Price between 50 and 100
                    location: { lat: suburb.lat, lng: suburb.lng, address: suburb.name },
                    updatedAt: new Date(),
                }
            });

            // Create Availability Slots for each listing
            for (let j = 0; j < 8; j++) {
                const startsAt = new Date();
                startsAt.setDate(startsAt.getDate() + Math.floor(Math.random() * 14)); // Random day in next 2 weeks
                startsAt.setHours(Math.floor(Math.random() * 8) + 9); // Random hour between 9am and 5pm
                startsAt.setMinutes(0);
                startsAt.setSeconds(0);
                startsAt.setMilliseconds(0);

                const endsAt = new Date(startsAt);
                endsAt.setHours(startsAt.getHours() + Math.ceil(Math.random() * 3)); // 1-3 hour slots

                await prisma.availabilitySlot.create({
                    data: {
                        listingId: listing.id,
                        startsAt: startsAt,
                        endsAt: endsAt,
                        updatedAt: new Date(),
                    }
                });
            }
        }
    }
  }
  console.log('Providers, listings, and slots created.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
