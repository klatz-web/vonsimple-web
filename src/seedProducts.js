const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

const products = [
  // Featured Products - Fashion-Jewelry
  {
    title: 'Aethel Snowpearl',
    category: 'Fashion-Jewelry',
    price: 109,
    image: 'img/products/f1.png',
    description: 'Elegant snow pearl earrings with modern design'
  },
  {
    title: 'Evelyn Pearl',
    category: 'Fashion-Jewelry',
    price: 106,
    image: 'img/products/f2.png',
    description: 'Classic pearl earrings for everyday elegance'
  },
  {
    title: 'Heidiao',
    category: 'Fashion-Jewelry',
    price: 99,
    image: 'img/products/f3.png',
    description: 'Stylish fashion jewelry for modern women'
  },
  {
    title: 'Lea & Co.',
    category: 'Fashion-Jewelry',
    price: 99,
    image: 'img/products/f4.png',
    description: 'Premium fashion jewelry collection'
  },
  {
    title: 'Aurelia',
    category: 'Fashion-Jewelry',
    price: 99,
    image: 'img/products/f5.png',
    description: 'Beautiful earrings inspired by golden dawn'
  },
  {
    title: 'Aethel & Co.',
    category: 'Fashion-Jewelry',
    price: 109,
    image: 'img/products/f6.png',
    description: 'Premium fashion jewelry with contemporary design'
  },
  {
    title: 'Chrystalis & Co.',
    category: 'Fashion-Jewelry',
    price: 99,
    image: 'img/products/f7.png',
    description: 'Crystal-inspired jewelry collection'
  },
  {
    title: 'Aurelia',
    category: 'Fashion-Jewelry',
    price: 69,
    image: 'img/products/f8.png',
    description: 'Affordable fashion jewelry for everyday wear'
  },
  // New Arrivals - Men-Jewelry
  {
    title: 'Arctic Halo Studs',
    category: 'Men-Jewelry',
    price: 149,
    image: 'img/products/n1.png',
    description: 'Arctic-inspired stud earrings for men'
  },
  {
    title: 'Lucid Stud',
    category: 'Men-Jewelry',
    price: 119,
    image: 'img/products/n2.png',
    description: 'Clear and elegant stud earrings'
  },
  {
    title: 'Aura Heart Studs',
    category: 'Men-Jewelry',
    price: 149,
    image: 'img/products/n3.png',
    description: 'Heart-shaped stud earrings with aura design'
  },
  {
    title: 'Tundra Spark Squares',
    category: 'Men-Jewelry',
    price: 189,
    image: 'img/products/n4.png',
    description: 'Square stud earrings inspired by tundra'
  },
  {
    title: 'Lumina Star Studs',
    category: 'Men-Jewelry',
    price: 119,
    image: 'img/products/n5.png',
    description: 'Star-shaped stud earrings with luminous design'
  },
  {
    title: 'Gold Earring',
    category: 'Men-Jewelry',
    price: 119,
    image: 'img/products/n6.png',
    description: 'Classic gold earring for men'
  },
  {
    title: 'Gold Earring',
    category: 'Men-Jewelry',
    price: 98,
    image: 'img/products/n7.png',
    description: 'Elegant gold earring for men'
  },
  {
    title: 'Gold Earring',
    category: 'Men-Jewelry',
    price: 98,
    image: 'img/products/n8.png',
    description: 'Premium gold earring for men'
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log('Products seeded successfully');

    console.log('Total products:', products.length);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedProducts();
