const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB, getConnectionStatus } = require('./config/db');
const { processContextPipeline, getContextHistory } = require('./controllers/contextController');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Context Engineering & Data Analysis Engine',
    database: getConnectionStatus(),
    timestamp: new Date().toISOString()
  });
});

// Primary Pipeline Routes
app.post('/api/context/analyze', processContextPipeline);
app.get('/api/context/history', getContextHistory);

// Catch-all route to serve Dashboard UI
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error Handler]:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
===============================================================
🚀 JS Context Engineering & Data Analysis Engine
===============================================================
🌐 Server running on: http://localhost:${PORT}
🔌 Endpoint POST:      http://localhost:${PORT}/api/context/analyze
🔌 Endpoint GET:       http://localhost:${PORT}/api/context/history
💻 Dashboard UI:       http://localhost:${PORT}/
===============================================================
  `);
});

// Graceful process termination
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
});
