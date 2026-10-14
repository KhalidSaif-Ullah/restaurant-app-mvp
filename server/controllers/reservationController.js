
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

exports.createReservation = async (req, res) => {
  try {
    const { date, time, guests, notes, tableId } = req.body;
    const guestCount = Number(guests);

    if (
      !date ||
      !time ||
      !Number.isInteger(guestCount) ||
      guestCount < 1
    ) {
      return res.status(400).json({
        message: 'Date, time, and valid guest count are required',
      });
    }

    const reservationDate = new Date(date);

    if (Number.isNaN(reservationDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid reservation date',
      });
    }

    const startOfDay = new Date(reservationDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const findConflict = (id) =>
      Reservation.exists({
        table: id,
        date: { $gte: startOfDay, $lt: endOfDay },
        time,
        status: { $in: ['Pending', 'Confirmed'] },
      });

    let table;

    if (tableId) {
      if (!mongoose.Types.ObjectId.isValid(tableId)) {
        return res.status(400).json({
          message: 'Invalid table ID',
        });
      }

      table = await Table.findById(tableId);

      if (!table) {
        return res.status(404).json({
          message: 'Table not found',
        });
      }

      if (table.capacity < guestCount) {
        return res.status(400).json({
          message: 'Table capacity is insufficient for this party',
        });
      }

      if (table.status === 'Unavailable') {
        return res.status(409).json({
          message: 'This table is unavailable',
        });
      }

      if (await findConflict(table._id)) {
        return res.status(409).json({
          message: 'This table is already reserved for that date and time',
        });
      }
    } else {
      const candidateTables = await Table.find({
        capacity: { $gte: guestCount },
        status: { $ne: 'Unavailable' },
      }).sort({ capacity: 1, tableNumber: 1 });

      for (const candidate of candidateTables) {
        if (!(await findConflict(candidate._id))) {
          table = candidate;
          break;
        }
      }

      if (!table) {
        return res.status(409).json({
          message: 'No suitable table is available for that date and time',
        });
      }
    }

    const reservation = await Reservation.create({
      user: req.user.id,
      table: table._id,
      date: reservationDate,
      time,
      guests: guestCount,
      notes: notes || '',
    });

    await reservation.populate('table');

    return res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getReservations = async (req, res) => {
  try {
    const filter =
      req.user.role === 'Manager' ? {} : { user: req.user.id };

    const reservations = await Reservation.find(filter)
      .populate('user', 'name email')
      .populate('table')
      .sort({ createdAt: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid reservation status',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid reservation ID',
      });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found',
      });
    }

    if (
      req.user.role !== 'Manager' &&
      reservation.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    if (req.user.role !== 'Manager' && status !== 'Cancelled') {
      return res.status(403).json({
        message: 'Customers can only cancel reservations',
      });
    }

    reservation.status = status;
    await reservation.save();

    await reservation.populate('table');

    return res.status(200).json({
      message: 'Reservation status updated successfully',
      reservation,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
