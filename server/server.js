
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

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

app.get('/api/test-db', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected',
      });
    }

    await mongoose.connection.db.admin().ping();

    return res.status(200).json({
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

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from the server .env file');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log('MongoDB connected:', mongoose.connection.name);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Restaurant API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
