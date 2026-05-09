const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod,
      paymentDetails
    } = req.body;

    // Use authenticated user ID from middleware
    const user = req.user.id;

    // Validate required fields
    if (!orderItems || orderItems.length === 0 || !shippingAddress || !totalPrice || !paymentMethod) {
      return res.status(400).json({
        message: 'Missing required fields: orderItems, shippingAddress, totalPrice, paymentMethod'
      });
    }

    // Validate payment method
    if (!['GCash', 'COD'].includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Invalid payment method. Must be either GCash or COD'
      });
    }

    // Validate GCash reference number if payment method is GCash
    if (paymentMethod === 'GCash') {
      if (!paymentDetails || !paymentDetails.referenceNumber) {
        return res.status(400).json({
          message: 'Reference number is required for GCash payments'
        });
      }
      
      // Validate 13-digit requirement
      const referenceNumber = paymentDetails.referenceNumber.trim();
      if (!/^\d{13}$/.test(referenceNumber)) {
        return res.status(400).json({
          message: 'GCash reference number must be exactly 13 digits'
        });
      }
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
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch orders' });
  }
});

// Admin route to fetch all orders
router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch all orders' });
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

// @route   PUT /api/orders/:id/status
// @desc    Update order verification status
// @access  Admin
router.put('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { paymentVerificationStatus } = req.body;
    
    if (!paymentVerificationStatus) {
      return res.status(400).json({ message: 'Payment verification status is required' });
    }

    const validStatuses = ['Pending', 'Verified', 'Rejected', 'Delivered'];
    if (!validStatuses.includes(paymentVerificationStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentVerificationStatus = paymentVerificationStatus;
    
    // If verified, mark as paid
    if (paymentVerificationStatus === 'Verified') {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Unable to update order status' });
  }
});

module.exports = router;
