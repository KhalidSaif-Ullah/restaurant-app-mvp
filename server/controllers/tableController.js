
const Table = require('../models/Table');

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, status } = req.body;

    if (
      !Number.isInteger(Number(tableNumber)) ||
      Number(tableNumber) < 1 ||
      !Number.isInteger(Number(capacity)) ||
      Number(capacity) < 1
    ) {
      return res.status(400).json({
        message: 'Valid table number and capacity are required',
      });
    }

    const table = await Table.create({
      tableNumber: Number(tableNumber),
      capacity: Number(capacity),
      ...(status !== undefined ? { status } : {}),
    });

    res.status(201).json({
      message: 'Table created successfully',
      table,
    });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      message:
        error.code === 11000
          ? 'Table number already exists'
          : error.message,
    });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const { tableNumber, capacity, status } = req.body;
    const updates = {};

    if (tableNumber !== undefined) {
      if (
        !Number.isInteger(Number(tableNumber)) ||
        Number(tableNumber) < 1
      ) {
        return res.status(400).json({
          message: 'Invalid table number',
        });
      }
      updates.tableNumber = Number(tableNumber);
    }

    if (capacity !== undefined) {
      if (
        !Number.isInteger(Number(capacity)) ||
        Number(capacity) < 1
      ) {
        return res.status(400).json({
          message: 'Invalid table capacity',
        });
      }
      updates.capacity = Number(capacity);
    }

    if (status !== undefined) {
      if (!['Available', 'Occupied', 'Unavailable'].includes(status)) {
        return res.status(400).json({
          message: 'Invalid table status',
        });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'At least one valid field is required',
      });
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.status(200).json({
      message: 'Table updated successfully',
      table,
    });
  } catch (error) {
    res.status(
      error.code === 11000 ? 409 : error.name === 'CastError' ? 400 : 400
    ).json({
      message:
        error.code === 11000
          ? 'Table number already exists'
          : error.message,
    });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.status(200).json({
      message: 'Table deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
