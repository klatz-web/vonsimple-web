const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      user,
      orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod,
      paymentDetails
    } = req.body;

    // Validate required fields
    if (!user || !orderItems || orderItems.length === 0 || !shippingAddress || !totalPrice || !paymentMethod) {
      return res.status(400).json({
        message: 'Missing required fields: user, orderItems, shippingAddress, totalPrice, paymentMethod'
      });
    }

    // Validate payment method
    if (!['GCash', 'COD'].includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Invalid payment method. Must be either GCash or COD'
      });
    }

    // Validate GCash reference number if payment method is GCash
    if (paymentMethod === 'GCash' && (!paymentDetails || !paymentDetails.referenceNumber)) {
      return res.status(400).json({
        message: 'Reference number is required for GCash payments'
      });
    }

    // Calculate total price from order items to prevent manipulation
    const calculatedTotal = orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Verify the provided total price matches calculated total
    if (Math.abs(calculatedTotal - totalPrice) > 0.01) {
      return res.status(400).json({
        message: 'Total price mismatch. Please check your order items.'
      });
    }

    // Create new order
    const order = new Order({
      user,
      orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod,
      paymentDetails: paymentDetails || {}
    });

    const createdOrder = await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order: createdOrder
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      message: 'Server error while creating order',
      error: error.message
    });
  }
});

// @route   GET /api/orders/mine
// @desc    Get all orders for authenticated user
// @access  Private
router.get('/mine', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      message: 'Server error while fetching user orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      message: 'Server error while fetching order',
      error: error.message
    });
  }
});

// @route   GET /api/orders/user/:userId
// @desc    Get all orders for a user
// @access  Private
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      message: 'Server error while fetching user orders',
      error: error.message
    });
  }
});

module.exports = router;
