const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.error('❌ Error: MONGO_URI is missing from your environment variables.');
      process.exit(1);
    }

    // Modern Mongoose versions (6+) don't need useNewUrlParser or useUnifiedTopology.
    // We include timeouts to ensure the app doesn't hang if the network is blocked.
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, 
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Specific hint for the SSL Alert 80 / IP Whitelist issue
    if (error.message.includes('80') || error.message.includes('SSL')) {
      console.error('👉 ACTION REQUIRED: Your IP is likely not whitelisted in MongoDB Atlas.');
      console.error('Go to Network Access in Atlas and add 0.0.0.0/0 to allow Render to connect.');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;