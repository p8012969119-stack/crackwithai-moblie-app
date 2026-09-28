const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using Mongoose.
 * Environment Variable: MONGODB_URI
 */
const connectDB = async (customUri) => {
  try {
    const mongoURI = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/context_engineering_db';
    
    // Set strictQuery option
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    // Note: In development mode, allow server to run even if DB is offline with fallback handling
    return null;
  }
};

/**
 * Gracefully disconnects from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB Connection Closed.');
  } catch (error) {
    console.error('[Database Error] Disconnect error:', error.message);
  }
};

/**
 * Helper to check connection status
 */
const getConnectionStatus = () => {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  return states[mongoose.connection.readyState] || 'Unknown';
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus
};
