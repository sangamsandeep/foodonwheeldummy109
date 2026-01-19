import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MenuItemData {
  name: string;
  description: string; // category
  priceCents: number;
  costCents: number;
  imageUrl?: string;
  sortOrder: number;
}

const restaurantMenuItems: Omit<MenuItemData, 'imageUrl'>[] = [
  // SNACKS
  {
    name: 'Onion Samosa',
    description: 'SNACKS',
    priceCents: 499,
    costCents: 150,
        sortOrder: 1,
  },
  {
    name: 'Aloo Samosa',
    description: 'SNACKS',
    priceCents: 499,
    costCents: 150,
        sortOrder: 2,
  },
  {
    name: 'Chitti Punugulu',
    description: 'SNACKS',
    priceCents: 699,
    costCents: 200,
        sortOrder: 3,
  },
  {
    name: 'Muntha Masala',
    description: 'SNACKS',
    priceCents: 599,
    costCents: 180,
        sortOrder: 4,
  },
  {
    name: 'Bajji Muntha Masala',
    description: 'SNACKS',
    priceCents: 699,
    costCents: 210,
        sortOrder: 5,
  },
  {
    name: 'Cut Mirchi',
    description: 'SNACKS',
    priceCents: 599,
    costCents: 180,
        sortOrder: 6,
  },
  {
    name: 'Mirchi Bajji',
    description: 'SNACKS',
    priceCents: 599,
    costCents: 180,
        sortOrder: 7,
  },
  {
    name: 'Stuffed Mirchi',
    description: 'SNACKS',
    priceCents: 699,
    costCents: 210,
        sortOrder: 8,
  },

  // GRILL
  {
    name: 'Chicken Tikka Kebab (6 pcs)',
    description: 'GRILL',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 10,
  },
  {
    name: 'Paneer Tikka Kebab (6 pcs)',
    description: 'GRILL',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 11,
  },

  // PANI PURI
  {
    name: 'Pani Puri',
    description: 'PANI PURI',
    priceCents: 799,
    costCents: 240,
        sortOrder: 20,
  },
  {
    name: 'Dahi Puri',
    description: 'PANI PURI',
    priceCents: 799,
    costCents: 240,
        sortOrder: 21,
  },
  {
    name: 'Masala Pani Puri',
    description: 'PANI PURI',
    priceCents: 799,
    costCents: 240,
        sortOrder: 22,
  },

  // CHAT
  {
    name: 'Bataani Chat',
    description: 'CHAT',
    priceCents: 799,
    costCents: 240,
        sortOrder: 30,
  },
  {
    name: 'Samosa Chat',
    description: 'CHAT',
    priceCents: 1099,
    costCents: 350,
        sortOrder: 31,
  },
  {
    name: 'Aloo Tikki Chat',
    description: 'CHAT',
    priceCents: 1099,
    costCents: 350,
        sortOrder: 32,
  },

  // VEG APPETIZERS
  {
    name: 'Street Style Veg Manchurian',
    description: 'VEG APPETIZERS',
    priceCents: 1299,
    costCents: 400,
        sortOrder: 40,
  },
  {
    name: 'Street Style Gobi Manchurian',
    description: 'VEG APPETIZERS',
    priceCents: 1299,
    costCents: 400,
        sortOrder: 41,
  },
  {
    name: 'Gobi 65',
    description: 'VEG APPETIZERS',
    priceCents: 1299,
    costCents: 400,
        sortOrder: 42,
  },
  {
    name: 'Chilli Gobi',
    description: 'VEG APPETIZERS',
    priceCents: 1299,
    costCents: 400,
        sortOrder: 43,
  },
  {
    name: 'Paneer 65',
    description: 'VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 44,
  },
  {
    name: 'Paneer 555',
    description: 'VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 45,
  },
  {
    name: 'Paneer Majestic',
    description: 'VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 46,
  },
  {
    name: 'Garlic Paneer',
    description: 'VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 47,
  },
  {
    name: 'Baby Corn 65',
    description: 'VEG APPETIZERS',
    priceCents: 1299,
    costCents: 400,
        sortOrder: 48,
  },
  {
    name: 'Baby Corn Pepper Fry',
    description: 'VEG APPETIZERS',
    priceCents: 1299,
    costCents: 400,
        sortOrder: 49,
  },

  // NON-VEG APPETIZERS
  {
    name: 'Curry Leaf Chicken',
    description: 'NON-VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 50,
  },
  {
    name: 'Chicken Pakodi',
    description: 'NON-VEG APPETIZERS',
    priceCents: 1299,
    costCents: 400,
        sortOrder: 51,
  },
  {
    name: 'Guntur Chicken',
    description: 'NON-VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 52,
  },
  {
    name: 'Jalapeno Chicken',
    description: 'NON-VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 53,
  },
  {
    name: 'Chicken Majestic',
    description: 'NON-VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 54,
  },
  {
    name: 'Chicken 555',
    description: 'NON-VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 55,
  },
  {
    name: 'Hyderabadi Chicken 65',
    description: 'NON-VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 56,
  },
  {
    name: 'Street Style Chilli Chicken',
    description: 'NON-VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 57,
  },
  {
    name: 'Chicken Manchurian',
    description: 'NON-VEG APPETIZERS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 58,
  },

  // GOAT
  {
    name: 'Goat Sukka',
    description: 'GOAT',
    priceCents: 1899,
    costCents: 650,
        sortOrder: 60,
  },

  // TIFFINS (Veg)
  {
    name: 'Mysore Bonda',
    description: 'TIFFINS',
    priceCents: 699,
    costCents: 210,
        sortOrder: 70,
  },
  {
    name: 'Poori with Bhaji',
    description: 'TIFFINS',
    priceCents: 799,
    costCents: 240,
        sortOrder: 71,
  },

  // DOSA
  {
    name: 'Plain Dosa',
    description: 'DOSA',
    priceCents: 799,
    costCents: 240,
        sortOrder: 80,
  },
  {
    name: 'Onion Dosa',
    description: 'DOSA',
    priceCents: 899,
    costCents: 270,
        sortOrder: 81,
  },
  {
    name: 'Cheese Dosa',
    description: 'DOSA',
    priceCents: 899,
    costCents: 270,
        sortOrder: 82,
  },
  {
    name: 'Masala Dosa',
    description: 'DOSA',
    priceCents: 1099,
    costCents: 350,
        sortOrder: 83,
  },
  {
    name: 'Chocolate Dosa',
    description: 'DOSA',
    priceCents: 899,
    costCents: 270,
        sortOrder: 84,
  },
  {
    name: 'Ghee Karam Dosa',
    description: 'DOSA',
    priceCents: 999,
    costCents: 300,
        sortOrder: 85,
  },
  {
    name: 'Chilli Onion Uttapam',
    description: 'DOSA',
    priceCents: 899,
    costCents: 270,
        sortOrder: 86,
  },
  {
    name: 'Nellore Ghee Karam Dosa',
    description: 'DOSA',
    priceCents: 999,
    costCents: 300,
        sortOrder: 87,
  },
  {
    name: 'Double Egg Dosa',
    description: 'DOSA',
    priceCents: 999,
    costCents: 300,
        sortOrder: 88,
  },
  {
    name: 'Gun Powder Masala Dosa',
    description: 'DOSA',
    priceCents: 1099,
    costCents: 350,
        sortOrder: 89,
  },
  {
    name: '70mm Masala Dosa',
    description: 'DOSA',
    priceCents: 1599,
    costCents: 500,
        sortOrder: 90,
  },

  // NON-VEG TIFFINS
  {
    name: 'Chicken Tikka Dosa',
    description: 'NON-VEG TIFFINS',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 91,
  },
  {
    name: 'Dosa with Chicken Curry',
    description: 'NON-VEG TIFFINS',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 92,
  },
  {
    name: 'Poori Chicken Curry',
    description: 'NON-VEG TIFFINS',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 93,
  },
  {
    name: 'Parotha Chicken Curry',
    description: 'NON-VEG TIFFINS',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 94,
  },

  // IDLY
  {
    name: 'Gun Powder Idly',
    description: 'IDLY',
    priceCents: 799,
    costCents: 240,
        sortOrder: 100,
  },
  {
    name: 'Ghee Karam Idly',
    description: 'IDLY',
    priceCents: 799,
    costCents: 240,
        sortOrder: 101,
  },
  {
    name: 'Sambar Idly',
    description: 'IDLY',
    priceCents: 899,
    costCents: 270,
        sortOrder: 102,
  },
  {
    name: 'Plain Idly',
    description: 'IDLY',
    priceCents: 599,
    costCents: 180,
        sortOrder: 103,
  },
  {
    name: 'Ghee Idly',
    description: 'IDLY',
    priceCents: 699,
    costCents: 210,
        sortOrder: 104,
  },

  // RICE
  {
    name: 'Veg Fried Rice',
    description: 'RICE',
    priceCents: 1099,
    costCents: 350,
        sortOrder: 110,
  },
  {
    name: 'Schezwan Veg Fried Rice',
    description: 'RICE',
    priceCents: 1199,
    costCents: 380,
        sortOrder: 111,
  },
  {
    name: 'Paneer Fried Rice',
    description: 'RICE',
    priceCents: 1199,
    costCents: 380,
        sortOrder: 112,
  },
  {
    name: 'Egg Fried Rice',
    description: 'RICE',
    priceCents: 1299,
    costCents: 400,
        sortOrder: 113,
  },
  {
    name: 'Chicken Fried Rice',
    description: 'RICE',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 114,
  },
  {
    name: 'Schezwan Chicken Fried Rice',
    description: 'RICE',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 115,
  },
  {
    name: 'Potlam Chicken Fried Rice',
    description: 'RICE',
    priceCents: 1599,
    costCents: 550,
        sortOrder: 116,
  },

  // NOODLES
  {
    name: 'Veg Noodles',
    description: 'NOODLES',
    priceCents: 1099,
    costCents: 350,
        sortOrder: 120,
  },
  {
    name: 'Egg Noodles',
    description: 'NOODLES',
    priceCents: 1299,
    costCents: 400,
        sortOrder: 121,
  },
  {
    name: 'Paneer Noodles',
    description: 'NOODLES',
    priceCents: 1299,
    costCents: 400,
        sortOrder: 122,
  },
  {
    name: 'Street Style Chicken Noodles',
    description: 'NOODLES',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 123,
  },
  {
    name: 'Schezwan Chicken Noodles',
    description: 'NOODLES',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 124,
  },

  // POT DUM BIRYANIS
  {
    name: 'Veg Dum Pot Biryani',
    description: 'POT DUM BIRYANIS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 130,
  },
  {
    name: 'Chicken Dum Pot Biryani',
    description: 'POT DUM BIRYANIS',
    priceCents: 1599,
    costCents: 550,
        sortOrder: 131,
  },
  {
    name: 'Goat Dum Pot Biryani',
    description: 'POT DUM BIRYANIS',
    priceCents: 1899,
    costCents: 650,
        sortOrder: 132,
  },

  // COOKER PULAV
  {
    name: 'Veg Cooker Pulav',
    description: 'COOKER PULAV',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 140,
  },
  {
    name: 'Jackfruit Cooker Pulav',
    description: 'COOKER PULAV',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 141,
  },
  {
    name: 'Bachelor Chicken Pulav',
    description: 'COOKER PULAV',
    priceCents: 1599,
    costCents: 550,
        sortOrder: 142,
  },
  {
    name: 'Goat Cooker Pulav',
    description: 'COOKER PULAV',
    priceCents: 1899,
    costCents: 650,
        sortOrder: 143,
  },

  // ENTREES
  {
    name: 'Paneer Butter Masala',
    description: 'ENTREES',
    priceCents: 999,
    costCents: 300,
        sortOrder: 150,
  },
  {
    name: 'Paneer Tikka Masala',
    description: 'ENTREES',
    priceCents: 999,
    costCents: 300,
        sortOrder: 151,
  },
  {
    name: 'Butter Chicken',
    description: 'ENTREES',
    priceCents: 999,
    costCents: 300,
        sortOrder: 152,
  },
  {
    name: 'Chicken Tikka Masala',
    description: 'ENTREES',
    priceCents: 999,
    costCents: 300,
        sortOrder: 153,
  },
  {
    name: 'Dhaba Style Chicken Curry',
    description: 'ENTREES',
    priceCents: 999,
    costCents: 300,
        sortOrder: 154,
  },

  // SIDES
  {
    name: 'Rumali Roti',
    description: 'SIDES',
    priceCents: 699,
    costCents: 200,
        sortOrder: 160,
  },
  {
    name: 'Parotha',
    description: 'SIDES',
    priceCents: 399,
    costCents: 100,
        sortOrder: 161,
  },
  {
    name: 'Naan',
    description: 'SIDES',
    priceCents: 499,
    costCents: 150,
        sortOrder: 162,
  },
  {
    name: 'Poori',
    description: 'SIDES',
    priceCents: 499,
    costCents: 150,
        sortOrder: 163,
  },
  {
    name: 'White Rice',
    description: 'SIDES',
    priceCents: 399,
    costCents: 100,
        sortOrder: 164,
  },

  // DESSERTS
  {
    name: 'Apricot Delight',
    description: 'DESSERTS',
    priceCents: 599,
    costCents: 150,
        sortOrder: 170,
  },

  // BIRYANIS
  {
    name: 'Hyderabadi Chicken Dum Biryani',
    description: 'BIRYANIS',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 180,
  },
  {
    name: 'Vijayawada Boneless Biryani',
    description: 'BIRYANIS',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 181,
  },
  {
    name: 'Gongura Chicken Biryani',
    description: 'BIRYANIS',
    priceCents: 1499,
    costCents: 500,
        sortOrder: 182,
  },
  {
    name: 'Gongura Goat Biryani',
    description: 'BIRYANIS',
    priceCents: 1899,
    costCents: 650,
        sortOrder: 183,
  },
  {
    name: 'Jackfruit Biryani',
    description: 'BIRYANIS',
    priceCents: 1399,
    costCents: 450,
        sortOrder: 184,
  },

  // DRINKS
  {
    name: 'Irani Chai',
    description: 'DRINKS',
    priceCents: 149,
    costCents: 30,
        sortOrder: 190,
  },
  {
    name: 'Mango Lassi',
    description: 'DRINKS',
    priceCents: 499,
    costCents: 120,
        sortOrder: 191,
  },
  {
    name: 'Bottled Water',
    description: 'DRINKS',
    priceCents: 99,
    costCents: 20,
        sortOrder: 192,
  },
  {
    name: 'Coke',
    description: 'DRINKS',
    priceCents: 149,
    costCents: 40,
        sortOrder: 193,
  },
  {
    name: 'Bottled Coke',
    description: 'DRINKS',
    priceCents: 299,
    costCents: 80,
        sortOrder: 194,
  },
  {
    name: 'Goli Soda',
    description: 'DRINKS',
    priceCents: 499,
    costCents: 120,
        sortOrder: 195,
  },
];

async function main() {
  console.log('🌱 Starting restaurant menu seed...');

  // Get or create the Downtown Cafe store
  const store = await prisma.store.findUnique({
    where: { slug: 'downtown-cafe' },
  });

  if (!store) {
    console.error('❌ Store not found. Please run the main seed first.');
    process.exit(1);
  }

  console.log(`📍 Using store: ${store.name}`);

  // Check how many items exist
  const existingCount = await prisma.menuItem.count({
    where: { storeId: store.id },
  });

  if (existingCount > 0) {
    console.log(`⚠️  ${existingCount} menu items exist. Deleting old items...`);
    await prisma.menuItem.deleteMany({
      where: { storeId: store.id },
    });
    console.log(`✅ Deleted all old menu items.`);
  }

  // Create all menu items
  let created = 0;
  for (const item of restaurantMenuItems) {
    await prisma.menuItem.create({
      data: {
        ...item,
        imageUrl: null,
        storeId: store.id,
        isAvailable: true,
      },
    });
    created++;
  }

  console.log(`✅ Created ${created} menu items across all categories`);

  // Group by category for summary
  const categories = [...new Set(restaurantMenuItems.map((i) => i.description))];
  console.log(`\n📂 Categories added:`);
  categories.forEach((cat) => {
    const count = restaurantMenuItems.filter((i) => i.description === cat).length;
    console.log(`   - ${cat}: ${count} items`);
  });

  console.log('\n🎉 Restaurant menu seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



