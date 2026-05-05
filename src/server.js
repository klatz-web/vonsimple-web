const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orderRoutes');
const Product = require('./models/Product');

// Load environment variables
dotenv.config({ path: require('path').join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serves static files (HTML/CSS/JS) from the project root
app.use(express.static(path.join(__dirname, '../')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running.' });
});

/**
 * Seeding Logic: Adds default products if the collection is empty.
 */
async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count > 0) return;

    const products = [
      { title: 'Gold Earring', category: 'Fashion Jewelry', price: 78.0, image: 'img/products/f1.png', description: 'Shiny gold earrings with modern design.' },
      { title: 'Silver Earrings', category: 'Fashion Jewelry', price: 65.0, image: 'img/products/f2.png', description: 'Elegant silver earrings for every day.' },
      { title: 'Pearl Hoop', category: 'Fashion Jewelry', price: 92.0, image: 'img/products/f3.png', description: 'Classic pearl hoops with premium finish.' },
      { title: 'Diamond Shine', category: 'Fashion Jewelry', price: 120.0, image: 'img/products/f4.png', description: 'Premium earrings with diamond-like shimmer.' },
      { title: 'Minimal Drop', category: 'Men Jewelry', price: 78.0, image: 'img/products/n1.png', description: 'Minimal drop earrings for refined taste.' },
      { title: 'Stud Collection', category: 'Men Jewelry', price: 84.0, image: 'img/products/n2.png', description: 'Simple studs that match every outfit.' },
      { title: 'Elegant Twirl', category: 'Men Jewelry', price: 88.0, image: 'img/products/n3.png', description: 'Elegant twisting design with polished finish.' },
      { title: 'Classic Charm', category: 'Men Jewelry', price: 78.0, image: 'img/products/n4.png', description: 'Classic jewelry with charming details.' }
    ];

    await Product.insertMany(products);
    console.log('🌱 Seeded default products.');
  } catch (err) {
    console.error('Failed to seed products:', err.message);
  }
}

/**
 * Start Sequence: Connect to DB first, then start the Express server.
 */
const startServer = async () => {
  try {
    await connectDB();
    await seedProducts();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('🛑 Server startup aborted due to error.');
    process.exit(1);
  }
};

startServer();