
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Order must contain at least one item',
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.menuItem || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          message: 'Each item needs a valid menuItem ID and quantity',
        });
      }

      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem || !menuItem.available) {
        return res.status(400).json({
          message: 'A menu item is unavailable or does not exist',
        });
      }

      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });

      totalAmount += menuItem.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user.id,
      items: validatedItems,
      totalAmount,
      deliveryAddress: deliveryAddress || '',
    });

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const filter =
      req.user.role === 'Manager' ? {} : { user: req.user.id };

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      'Pending',
      'Confirmed',
      'Preparing',
      'Ready',
      'Delivered',
      'Cancelled',
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (
      req.user.role !== 'Manager' &&
      order.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role !== 'Manager' && status !== 'Cancelled') {
      return res.status(403).json({
        message: 'Customers can only cancel orders',
      });
    }

    order.status = status;
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};