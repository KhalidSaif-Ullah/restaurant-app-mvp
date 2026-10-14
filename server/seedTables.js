
require('dotenv').config();

const mongoose = require('mongoose');
const Table = require('./models/Table');

const tables = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 4 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 6 },
  { tableNumber: 6, capacity: 8 },
];

async function seedTables() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from .env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    for (const tableData of tables) {
      await Table.findOneAndUpdate(
        { tableNumber: tableData.tableNumber },
        {
          $setOnInsert: {
            ...tableData,
            status: 'Available',
          },
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    console.log('Six restaurant tables verified or seeded.');
  } catch (error) {
    console.error('Table seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedTables();
