const express = require('express');
const auth = require('../middleware/auth');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const cart = await CartItem.findOne({ user: req.user.id });
    if (!cart) return res.json({ items: [], total: 0 });

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ items: cart.items, total });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load cart.' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID is required.' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    let cart = await CartItem.findOne({ user: req.user.id });

    if (!cart) {
      cart = await CartItem.create({ user: req.user.id, items: [] });
    }

    const existing = cart.items.find((item) => item.productId.toString() === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        productId: product._id,
        title: product.title,
        category: product.category,
        price: product.price,
        image: product.image,
        quantity: qty,
      });
    }

    await cart.save();
    res.json({ message: 'Product added to cart.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to add item to cart.' });
  }
});

router.put('/update/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);

    const cart = await CartItem.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    const item = cart.items.find((row) => row.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Cart item not found.' });

    item.quantity = quantity;
    await cart.save();

    res.json({ message: 'Cart updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update cart item.' });
  }
});

router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await CartItem.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await cart.save();

    res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to remove item from cart.' });
  }
});

module.exports = router;
