
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

const menuItems = [
  { name: 'Chicken Burger', description: 'Grilled chicken burger', price: 450, category: 'Burgers' },
  { name: 'Beef Burger', description: 'Classic beef burger', price: 550, category: 'Burgers' },
  { name: 'Zinger Burger', description: 'Crispy chicken burger', price: 500, category: 'Burgers' },
  { name: 'Margherita Pizza', description: 'Cheese and tomato pizza', price: 900, category: 'Pizza' },
  { name: 'Pepperoni Pizza', description: 'Pepperoni and cheese pizza', price: 1200, category: 'Pizza' },
  { name: 'Fajita Pizza', description: 'Chicken fajita pizza', price: 1100, category: 'Pizza' },
  { name: 'Chicken Biryani', description: 'Spiced chicken rice', price: 350, category: 'Rice' },
  { name: 'Beef Pulao', description: 'Beef rice pilaf', price: 400, category: 'Rice' },
  { name: 'Chicken Karahi', description: 'Traditional chicken karahi', price: 1000, category: 'Main Course' },
  { name: 'Chicken Alfredo', description: 'Creamy chicken pasta', price: 750, category: 'Pasta' },
  { name: 'French Fries', description: 'Crispy potato fries', price: 200, category: 'Sides' },
  { name: 'Chicken Nuggets', description: 'Crispy chicken nuggets', price: 300, category: 'Sides' },
  { name: 'Caesar Salad', description: 'Fresh Caesar salad', price: 350, category: 'Salads' },
  { name: 'Chocolate Cake', description: 'Chocolate dessert slice', price: 250, category: 'Desserts' },
  { name: 'Fresh Lemonade', description: 'Fresh lemon drink', price: 150, category: 'Drinks' },
];

async function seedData() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from .env');
    }

    await mongoose.connect(process.env.MONGO_URI);

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

    for (const item of menuItems) {
      await MenuItem.updateOne(
        { name: item.name },
        { $setOnInsert: item },
        { upsert: true }
      );
    }

    const [customerCount, managerCount, menuCount, tableCount] =
      await Promise.all([
        User.countDocuments({ role: 'Customer' }),
        User.countDocuments({ role: 'Manager' }),
        MenuItem.countDocuments(),
        mongoose.connection.collection('tables').countDocuments(),
      ]);

    console.log('\nDatabase seed completed.');
    console.log(`Customers: ${customerCount}`);
    console.log(`Managers: ${managerCount}`);
    console.log(`Menu items: ${menuCount}`);
    console.log(`Tables: ${tableCount}`);
  } catch (error) {
    console.error('Database seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedData();
