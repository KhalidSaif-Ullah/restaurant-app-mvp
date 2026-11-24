
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');

const demoUsers = [
  {
    name: 'Seed Customer',
    email: 'seed.customer@restaurant.local',
    password: 'Customer123!',
    role: 'Customer',
  },
  {
    name: 'Seed Manager',
    email: 'seed.manager@restaurant.local',
    password: 'Manager123!',
    role: 'Manager',
  },
];

// Temporary remote food-image URLs.
// These can later be replaced with permanent hosted image URLs.
const foodImage = (tags) =>
  `https://loremflickr.com/800/600/${tags}`;

const menuItems = [
  // BURGERS
  {
    name: 'Chicken Burger',
    description: 'Juicy grilled chicken fillet served in a toasted bun with fresh lettuce, tomato and creamy sauce.',
    price: 450,
    category: 'Burgers',
    image: foodImage('grilled-chicken-burger'),
  },
  {
    name: 'Beef Burger',
    description: 'Seasoned beef patty with melted cheese, fresh vegetables and house burger sauce.',
    price: 550,
    category: 'Burgers',
    image: foodImage('beef-cheeseburger'),
  },
  {
    name: 'Zinger Burger',
    description: 'Crispy spicy chicken fillet topped with fresh lettuce and creamy mayonnaise in a soft bun.',
    price: 500,
    category: 'Burgers',
    image: foodImage('crispy-chicken-burger'),
  },
  {
    name: 'BBQ Chicken Burger',
    description: 'Grilled chicken fillet coated in smoky BBQ sauce with lettuce and cheese.',
    price: 600,
    category: 'Burgers',
    image: foodImage('bbq-chicken-burger'),
  },

  // PIZZA
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza topped with mozzarella cheese, rich tomato sauce and fresh herbs.',
    price: 900,
    category: 'Pizza',
    image: foodImage('margherita-pizza'),
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Loaded with mozzarella cheese, savoury pepperoni slices and seasoned tomato sauce.',
    price: 1200,
    category: 'Pizza',
    image: foodImage('pepperoni-pizza'),
  },
  {
    name: 'Fajita Pizza',
    description: 'Chicken fajita pieces, capsicum, onions, mozzarella cheese and spicy pizza sauce.',
    price: 1100,
    category: 'Pizza',
    image: foodImage('chicken-fajita-pizza'),
  },
  {
    name: 'Creamy Tikka Pizza',
    description: 'Chicken tikka pieces with creamy sauce, mozzarella cheese and fresh capsicum.',
    price: 1200,
    category: 'Pizza',
    image: foodImage('chicken-tikka-pizza'),
  },

  // RICE
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with spiced chicken, herbs and traditional biryani masala.',
    price: 350,
    category: 'Rice',
    image: foodImage('chicken-biryani'),
  },
  {
    name: 'Beef Pulao',
    description: 'Aromatic rice cooked with tender beef, whole spices and a traditional stock.',
    price: 400,
    category: 'Rice',
    image: foodImage('beef-pulao'),
  },
  {
    name: 'Chicken Fried Rice',
    description: 'Stir-fried rice with chicken, mixed vegetables, egg and light seasoning.',
    price: 450,
    category: 'Rice',
    image: foodImage('chicken-fried-rice'),
  },

  // MAIN COURSE
  {
    name: 'Chicken Karahi',
    description: 'Traditional chicken karahi prepared with tomatoes, green chillies, ginger and fresh coriander.',
    price: 1000,
    category: 'Main Course',
    image: foodImage('chicken-karahi'),
  },
  {
    name: 'Chicken Handi',
    description: 'Tender chicken cooked in a rich creamy tomato gravy with traditional spices.',
    price: 1100,
    category: 'Main Course',
    image: foodImage('chicken-handi'),
  },

  // PASTA
  {
    name: 'Chicken Alfredo',
    description: 'Creamy pasta with grilled chicken, parmesan cheese and a rich Alfredo sauce.',
    price: 750,
    category: 'Pasta',
    image: foodImage('chicken-alfredo-pasta'),
  },
  {
    name: 'Chicken Arrabbiata',
    description: 'Pasta tossed with chicken, garlic, herbs and a flavourful spicy tomato sauce.',
    price: 700,
    category: 'Pasta',
    image: foodImage('chicken-tomato-pasta'),
  },

  // SIDES
  {
    name: 'French Fries',
    description: 'Golden crispy potato fries lightly seasoned and served hot.',
    price: 200,
    category: 'Sides',
    image: foodImage('french-fries'),
  },
  {
    name: 'Chicken Nuggets',
    description: 'Bite-sized crispy chicken pieces served with a dipping sauce.',
    price: 300,
    category: 'Sides',
    image: foodImage('chicken-nuggets'),
  },
  {
    name: 'Garlic Bread',
    description: 'Toasted bread brushed with garlic butter and herbs.',
    price: 250,
    category: 'Sides',
    image: foodImage('garlic-bread'),
  },

  // SALADS
  {
    name: 'Caesar Salad',
    description: 'Fresh lettuce tossed with Caesar dressing, crunchy croutons and parmesan cheese.',
    price: 350,
    category: 'Salads',
    image: foodImage('caesar-salad'),
  },

  // DESSERTS
  {
    name: 'Chocolate Cake',
    description: 'Moist chocolate cake layered with smooth chocolate frosting.',
    price: 250,
    category: 'Desserts',
    image: foodImage('chocolate-cake'),
  },
  {
    name: 'Brownie with Ice Cream',
    description: 'Warm chocolate brownie served with a scoop of creamy vanilla ice cream.',
    price: 350,
    category: 'Desserts',
    image: foodImage('brownie-ice-cream'),
  },

  // DRINKS
  {
    name: 'Fresh Lemonade',
    description: 'Refreshing freshly prepared lemonade with lemon juice and a touch of sweetness.',
    price: 150,
    category: 'Drinks',
    image: foodImage('fresh-lemonade'),
  },
  {
    name: 'Mint Margarita',
    description: 'Chilled mint and lime drink blended with ice for a refreshing taste.',
    price: 220,
    category: 'Drinks',
    image: foodImage('mint-lime-drink'),
  },
  {
    name: 'Chocolate Shake',
    description: 'Thick and creamy milkshake blended with chocolate and milk.',
    price: 300,
    category: 'Drinks',
    image: foodImage('chocolate-milkshake'),
  },
];

async function seedData() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from .env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to MongoDB.');

    // Create demo accounts only when they do not already exist.
    for (const account of demoUsers) {
      const existingUser = await User.findOne({
        email: account.email,
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(
          account.password,
          10
        );

        await User.create({
          name: account.name,
          email: account.email,
          password: hashedPassword,
          role: account.role,
        });

        console.log(`Created ${account.role}: ${account.email}`);
      } else {
        console.log(`Existing account preserved: ${account.email}`);
      }
    }

    // Update existing dishes and insert new dishes.
    // Existing MongoDB IDs and availability settings are preserved.
    for (const item of menuItems) {
      await MenuItem.updateOne(
        { name: item.name },
        {
          $set: {
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image,
          },
          $setOnInsert: {
            name: item.name,
            available: true,
          },
        },
        { upsert: true }
      );
    }

    const [
      customerCount,
      managerCount,
      menuCount,
      tableCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'Customer' }),
      User.countDocuments({ role: 'Manager' }),
      MenuItem.countDocuments(),
      mongoose.connection.collection('tables').countDocuments(),
    ]);

    console.log('\nDatabase seed completed.');
    console.log(`Customers: ${customerCount}`);
    console.log(`Managers: ${managerCount}`);
    console.log(`Menu items in database: ${menuCount}`);
    console.log(`Tables: ${tableCount}`);
    console.log(`Menu items in this seed: ${menuItems.length}`);

  } catch (error) {
    console.error('Database seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedData();
