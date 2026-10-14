
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

exports.getAllMenuItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category.trim()) {
      filter.category = {
        $regex: `^${category.trim()}$`,
        $options: 'i',
      };
    }

    if (search && search.trim()) {
      filter.name = {
        $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i',
      };
    }

    const items = await MenuItem.find(filter);
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMenuItemById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid menu item ID',
      });
    }

    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: 'Menu item not found',
      });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    return res.status(201).json(item);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid menu item ID',
      });
    }

    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        message: 'Menu item not found',
      });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid menu item ID',
      });
    }

    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: 'Menu item not found',
      });
    }

    return res.status(200).json({
      message: 'Menu item deleted successfully',
      item,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
