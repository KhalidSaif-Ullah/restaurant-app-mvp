
const express = require('express');
const router = express.Router();

const {
  createReservation,
  getReservations,
  updateReservationStatus,
} = require('../controllers/reservationController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createReservation);
router.get('/', authMiddleware, getReservations);
router.patch('/:id/status', authMiddleware, updateReservationStatus);

module.exports = router;