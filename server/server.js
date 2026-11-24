
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let dbConnectionPromise = null;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing');
  }

  if (!dbConnectionPromise) {
    dbConnectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    }).catch((error) => {
      dbConnectionPromise = null;
      throw error;
    });
  }

  await dbConnectionPromise;
  console.log('MongoDB connected:', mongoose.connection.name);
}

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

// Connect to MongoDB before database-backed routes.
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/api/test-db', async (req, res, next) => {
  try {
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      success: true,
      message: 'Backend connected to MongoDB successfully',
      database: mongoose.connection.name,
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Export the Express app for Vercel.
module.exports = app;

// Start a normal HTTP server when running locally.
if (require.main === module) {
  connectToDatabase()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Restaurant API running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    });
}
